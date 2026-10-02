import type { LngLat } from "./geo";

export type Route = { geometry: LngLat[]; legs: number[] };
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
    const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${key}?overview=full&geometries=geojson`);
    if (!r.ok) return null;
    const j = await r.json();
    if (j.code !== "Ok" || !j.routes?.[0]) return null;
    const route: Route = {
      geometry: j.routes[0].geometry.coordinates,
      legs: j.routes[0].legs.map((l: { duration: number }) => l.duration),
    };
    mem.set(key, route);
    save();
    return route;
  } catch {
    return null;
  }
}
