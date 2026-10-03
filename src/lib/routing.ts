import type { LngLat } from "./geo";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export type Route = { geometry: LngLat[]; legs: number[]; durationS?: number; distanceM?: number };
const KEY = "ontime-route-v1";
const mem = new Map<string, Route>();
let loaded = false;

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const o = JSON.parse(localStorage.getItem(KEY) || "{}") as Record<string, Route>;
    for (const [k, v] of Object.entries(o)) mem.set(k, v);
  } catch { /* ignore */ }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(mem))); } catch { /* cheio */ }
}

/** Traçado por ruas reais (OSRM). Retorna null em caso de falha. */
export async function osrm(points: LngLat[]): Promise<Route | null> {
  if (points.length < 2) return null;
  load();
  const key = points.map((p) => `${p[0].toFixed(5)},${p[1].toFixed(5)}`).join(";");
  const hit = mem.get(key);
  if (hit) return hit;
  try {
    const bytes = new TextEncoder().encode(key);
    const digest = await crypto.subtle.digest("SHA-1", bytes);
    const cacheKey = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
    const cached = await supabase.from("route_cache").select("geometry,duration_s,distance_m").eq("cache_key", cacheKey).maybeSingle();
    const geo = cached.data?.geometry as { type?: string; coordinates?: LngLat[] } | null;
    const cachedRow = cached.data;
    if (cachedRow && geo?.type === "LineString" && geo.coordinates?.length) {
      const route: Route = { geometry: geo.coordinates, legs: [], durationS: cachedRow.duration_s, distanceM: cachedRow.distance_m };
      mem.set(key, route); save(); return route;
    }
    const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${key}?overview=full&geometries=geojson`);
    if (!r.ok) return null;
    const j = await r.json();
    if (j.code !== "Ok" || !j.routes?.[0]) return null;
    const route: Route = {
      geometry: j.routes[0].geometry.coordinates,
      legs: j.routes[0].legs.map((l: { duration: number }) => l.duration),
      durationS: Math.round(j.routes[0].duration),
      distanceM: Math.round(j.routes[0].distance),
    };
    mem.set(key, route);
    save();
    void supabase.from("route_cache").insert({ cache_key: cacheKey, geometry: { type: "LineString", coordinates: route.geometry } as Json, duration_s: route.durationS ?? 0, distance_m: route.distanceM ?? 0 }).then(() => undefined);
    return route;
  } catch {
    return null;
  }
}
