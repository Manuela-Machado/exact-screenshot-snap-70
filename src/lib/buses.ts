import { TOTEM_LOCATION } from "@/config/totem";
import { LINES, type Line, type Trip } from "./schedule";
import { geocodePlace, haversine, type LngLat } from "./geo";
import { osrm, type Route } from "./routing";

export { LINES };
export type { Line, Trip, LngLat };

export const TOTEM: LngLat = [TOTEM_LOCATION.lng, TOTEM_LOCATION.lat];

export const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function dayType(d = new Date()) {
  const w = d.getDay();
  return w === 0 ? "Domingo" : w === 6 ? "Sábado" : "Dia útil";
}
export const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};
const nowMin = (d: Date) => d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
export const fmtEta = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}` : `${m} min`);

export const isCentro = (s: string) => norm(s) === "centro";

/** Nome do ponto de partida a partir de `sentido_origem`. */
export function originName(dir: string, line: Line) {
  const d = dir.trim();
  if (/^em dire/i.test(d) || /^volta$/i.test(d)) return line.name;
  if (/^ida$/i.test(d)) return "Centro";
  const m = d.match(/^Sa(?:í|i)(?:da|ndo)\s+d[aoe]s?\s+(.+)$/i);
  return m ? m[1]!.trim() : d;
}

export const itineraryNames = (via: string) =>
  via.split(/\s+via\s+|\/|–|\s-\s/i).map((s) => s.trim()).filter(Boolean);

export const variantKey = (t: Trip) => `${t.dir}|${t.via}`;

export type Stop = { name: string; coord: LngLat; totem?: boolean };
export type VariantGeo = { stops: Stop[]; totemIdx: number; originCentro: boolean; known: number };

const geoMem = new Map<string, Promise<VariantGeo>>();
const routeMem = new Map<string, Promise<Route | null>>();
const durMem = new Map<string, number>();
const k = (line: Line, t: Trip) => `${line.code}#${variantKey(t)}`;

export function variantGeo(line: Line, trip: Trip): Promise<VariantGeo> {
  const key = k(line, trip);
  const hit = geoMem.get(key);
  if (hit) return hit;
  const job = (async () => {
    const origin = originName(trip.dir, line);
    const names = [origin, ...itineraryNames(trip.via).filter((x) => norm(x) !== norm(origin))];
    if (/^em dire/i.test(trip.dir) && !names.some(isCentro)) names.push("Centro");
    const coords = await Promise.all(names.map(geocodePlace));
    const stops: Stop[] = [];
    names.forEach((name, i) => {
      const c = coords[i];
      if (!c || haversine(c, TOTEM) > 30000) return;
      const prev = stops[stops.length - 1];
      if (prev && haversine(prev.coord, c) < 150) return;
      stops.push({ name, coord: c });
    });
    const known = stops.length;
    const t: Stop = { name: "Você está aqui", coord: TOTEM, totem: true };
    let idx = 0;
    if (isCentro(origin) && stops.length && isCentro(stops[0]!.name)) idx = 1;
    else {
      let best = Infinity;
      for (let i = 0; i <= stops.length; i++) {
        const a = stops[i - 1]?.coord, b = stops[i]?.coord;
        const cost = (a ? haversine(a, TOTEM) : 0) + (b ? haversine(TOTEM, b) : 0) - (a && b ? haversine(a, b) : 0);
        if (cost < best) { best = cost; idx = i; }
      }
    }
    stops.splice(idx, 0, t);
    return { stops, totemIdx: idx, originCentro: isCentro(origin), known };
  })();
  geoMem.set(key, job);
  return job;
}

export function variantRoute(line: Line, trip: Trip) {
  const key = k(line, trip);
  let job = routeMem.get(key);
  if (!job) {
    job = variantGeo(line, trip).then((g) => osrm(g.stops.map((s) => s.coord)));
    job.then((r) => { if (!r) routeMem.delete(key); });
    routeMem.set(key, job);
  }
  return job;
}

/** Minutos estimados da origem até o totem (duração × 1,3). */
export function estMinToTotem(g: VariantGeo, legs?: number[] | null) {
  let min: number;
  if (!g.known) min = g.originCentro ? 5 : 20;
  else if (legs && legs.length === g.stops.length - 1) min = (legs.slice(0, g.totemIdx).reduce((a, b) => a + b, 0) / 60) * 1.3;
  else {
    let d = 0;
    for (let i = 0; i < g.totemIdx; i++) d += haversine(g.stops[i]!.coord, g.stops[i + 1]!.coord);
    min = ((d * 1.35) / (22000 / 60)) * 1.3; // ~22 km/h, fator de ruas
  }
  if (g.originCentro) min = Math.min(10, Math.max(3, min));
  return Math.max(1, Math.round(min));
}

export function durFor(line: Line, trip: Trip) {
  return durMem.get(k(line, trip)) ?? (isCentro(originName(trip.dir, line)) ? 5 : 20);
}

export async function resolveVariant(line: Line, trip: Trip) {
  const geo = await variantGeo(line, trip);
  const route = await variantRoute(line, trip);
  durMem.set(k(line, trip), estMinToTotem(geo, route?.legs));
  return { geo, route };
}

export type Arrival = { trip: Trip; eta: number; dur: number; laterDay: boolean };

/** Próxima saída cuja chegada estimada no totem ainda não passou. */
export function nextArrival(line: Line, trips: Trip[], now = new Date()): Arrival | null {
  const cur = nowMin(now);
  for (let off = 0; off <= 7; off++) {
    const d = new Date(now);
    d.setDate(d.getDate() + off);
    const cands = trips
      .filter((t) => t.day === dayType(d))
      .map((t) => ({ t, dur: durFor(line, t), arr: off * 1440 + toMin(t.time) + durFor(line, t) }))
      .filter((x) => x.arr >= cur)
      .sort((a, b) => a.arr - b.arr);
    if (cands[0]) return { trip: cands[0].t, dur: cands[0].dur, eta: Math.max(1, Math.round(cands[0].arr - cur)), laterDay: off > 0 };
  }
  return null;
}

const WEEK = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
/** Próximos horários de SAÍDA da origem. */
export function departures(trips: Trip[], now = new Date(), n = 4) {
  const cur = now.getHours() * 60 + now.getMinutes();
  for (let off = 0; off <= 7; off++) {
    const d = new Date(now);
    d.setDate(d.getDate() + off);
    const list = [...new Set(trips.filter((t) => t.day === dayType(d) && (off > 0 || toMin(t.time) >= cur)).map((t) => t.time))]
      .sort((a, b) => toMin(a) - toMin(b))
      .slice(0, n);
    if (list.length) return { label: off === 0 ? "Hoje" : off === 1 ? "Amanhã" : WEEK[d.getDay()]!, times: list };
  }
  return { label: "", times: [] as string[] };
}

/** Posição simulada do ônibus sobre o traçado, de acordo com a chegada estimada. */
export function busPosition(geometry: LngLat[], a: Arrival | null): LngLat | null {
  if (!geometry.length || !a) return null;
  let gi = 0, best = Infinity;
  geometry.forEach((p, i) => { const d = haversine(p, TOTEM); if (d < best) { best = d; gi = i; } });
  const p = a.laterDay ? 0 : Math.min(1, Math.max(0, 1 - a.eta / a.dur));
  const f = p * gi;
  const i = Math.min(Math.floor(f), Math.max(0, gi - 1));
  const x = f - i, A = geometry[i]!, B = geometry[Math.min(i + 1, geometry.length - 1)]!;
  return [A[0] + (B[0] - A[0]) * x, A[1] + (B[1] - A[1]) * x];
}

export type Option = { line: Line; trips: Trip[]; alight: Stop; walkM: number; eta: number; score: number };

/** Linhas que passam a até ~800 m do destino, depois do totem, ordenadas por espera + caminhada. */
export async function findOptions(dest: LngLat, now = new Date()): Promise<Option[]> {
  const today = dayType(now);
  const groups: { line: Line; trips: Trip[] }[] = [];
  for (const line of LINES) {
    const g = new Map<string, Trip[]>();
    for (const t of line.trips) if (t.day === today) g.set(variantKey(t), [...(g.get(variantKey(t)) ?? []), t]);
    for (const trips of g.values()) groups.push({ line, trips });
  }
  const res = await Promise.all(
    groups.map(async ({ line, trips }) => {
      const geo = await variantGeo(line, trips[0]!);
      const after = geo.stops.slice(geo.totemIdx + 1);
      let alight: Stop | null = null, walk = Infinity;
      for (const s of after) { const d = haversine(s.coord, dest); if (d < walk) { walk = d; alight = s; } }
      if (!alight || walk > 800) return null;
      const dur = durMem.get(k(line, trips[0]!)) ?? estMinToTotem(geo, null);
      const cur = nowMin(now);
      const arr = trips.map((t) => toMin(t.time) + dur).filter((x) => x >= cur).sort((a, b) => a - b)[0];
      if (arr == null) return null;
      const eta = Math.max(1, Math.round(arr - cur));
      return { line, trips, alight, walkM: Math.round(walk / 10) * 10, eta, score: eta + walk / 80 } as Option;
    }),
  );
  const best = new Map<string, Option>();
  for (const o of res) if (o && (!best.has(o.line.code) || best.get(o.line.code)!.score > o.score)) best.set(o.line.code, o);
  return [...best.values()].sort((a, b) => a.score - b.score).slice(0, 3);
}
