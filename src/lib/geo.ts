import { TOTEM_LOCATION } from "@/config/totem";
import { supabase } from "@/integrations/supabase/client";

export type LngLat = [number, number];
/** [oeste, sul, leste, norte] ao redor de Gravataí/RS */
export const GRAVATAI_BBOX = [-51.12, -30.03, -50.8, -29.85] as const;
const CENTRO: LngLat = [-50.9919, -29.9441];

const inBox = ([lng, lat]: LngLat) =>
  lng >= GRAVATAI_BBOX[0] && lng <= GRAVATAI_BBOX[2] && lat >= GRAVATAI_BBOX[1] && lat <= GRAVATAI_BBOX[3];

export function haversine(a: LngLat, b: LngLat) {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (b[1] - a[1]) * r, dLng = (b[0] - a[0]) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * r) * Math.cos(b[1] * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const photon = (q: string, limit: number) => {
  const [w, s, e, n] = GRAVATAI_BBOX;
  return `https://photon.komoot.io/api/?q=${encodeURIComponent(`${q}, Gravataí, RS`)}&limit=${limit}&bbox=${w},${s},${e},${n}&lat=${TOTEM_LOCATION.lat}&lon=${TOTEM_LOCATION.lng}`;
};

type Feature = { geometry: { coordinates: LngLat }; properties: Partial<Record<"name" | "street" | "housenumber" | "district" | "city", string>> };

export type Suggestion = { id: string; label: string; detail: string; coord: LngLat };

export async function suggest(q: string, signal?: AbortSignal): Promise<Suggestion[]> {
  const r = await fetch(photon(q, 10), { signal: signal ?? null });
  if (!r.ok) throw new Error("geo");
  const j = (await r.json()) as { features: Feature[] };
  const seen = new Set<string>();
  const out: Suggestion[] = [];
  for (const f of j.features) {
    const p = f.properties, c = f.geometry.coordinates;
    if (!inBox(c)) continue;
    const street = p.street ? `${p.street}${p.housenumber ? `, ${p.housenumber}` : ""}` : "";
    const label = p.name || street;
    if (!label) continue;
    const detail = [p.name ? street : "", p.district, p.city].filter(Boolean).join(" · ");
    const id = `${label}|${detail}`;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({ id, label, detail, coord: c });
    if (out.length >= 5) break;
  }
  return out;
}

// ---- Geocodificação de bairros/pontos do itinerário (com cache) ----
const KEY = "ontime-geo-v1";
let cache: Record<string, LngLat | null> | null = null;
const load = () => {
  if (cache) return cache;
  try { cache = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { cache = {}; }
  return cache!;
};
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch { /* cheio */ } };

let active = 0;
const waiters: (() => void)[] = [];
async function limited<T>(fn: () => Promise<T>) {
  if (active >= 3) await new Promise<void>((r) => waiters.push(r));
  active++;
  try { return await fn(); } finally { active--; waiters.shift()?.(); }
}

const pending = new Map<string, Promise<LngLat | null>>();
const n = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function geocodePlace(name: string): Promise<LngLat | null> {
  const k = n(name);
  if (k === "centro" || k === "centro de gravatai") return Promise.resolve(CENTRO);
  const c = load();
  if (k in c) return Promise.resolve(c[k] ?? null);
  const p = pending.get(k);
  if (p) return p;
  const job = limited(async () => {
    try {
      const remote = await supabase.from("geocode_cache").select("lat,lng").eq("query", k).maybeSingle();
      if (remote.data) {
        const hit: LngLat = [remote.data.lng, remote.data.lat];
        load()[k] = hit; save(); return hit;
      }
      const r = await fetch(photon(name, 1));
      if (!r.ok) return null;
      const j = (await r.json()) as { features: Feature[] };
      const f = j.features.find((x) => inBox(x.geometry.coordinates));
      const v = f ? f.geometry.coordinates : null;
      load()[k] = v;
      save();
      if (v) void supabase.from("geocode_cache").insert({ query: k, display_name: name, lat: v[1], lng: v[0] }).then(() => undefined);
      return v;
    } catch {
      return null; // erro de rede: não guarda no cache
    } finally {
      pending.delete(k);
    }
  });
  pending.set(k, job);
  return job;
}
