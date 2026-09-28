import linesData from "@/data/lines.json";

export type Trip = { dir: string; day: string; time: string; via: string };
export type Line = { code: string; name: string; trips: Trip[] };
export const LINES = linesData as Line[];

// Parada do totem (Centro de Gravataí)
export const TOTEM_STOP: [number, number] = [-50.9919, -29.9441];
const TRIP_MIN = 50;

function seed(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return () => ((h = (h * 1103515245 + 12345) >>> 0) / 2 ** 32);
}

/** Traçado aproximado (simulado) da linha passando pela parada do totem. */
export function routeFor(code: string): [number, number][] {
  const r = seed(code);
  const ang = r() * Math.PI * 2;
  const len = 0.05 + r() * 0.04;
  const pts: [number, number][] = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10 - 0.5;
    const wob = Math.sin(i * 1.3 + r() * 2) * 0.004;
    pts.push([
      TOTEM_STOP[0] + Math.cos(ang) * len * t - Math.sin(ang) * wob,
      TOTEM_STOP[1] + Math.sin(ang) * len * t + Math.cos(ang) * wob,
    ]);
  }
  return pts;
}

export function dayType(d = new Date()) {
  const w = d.getDay();
  return w === 0 ? "Domingo" : w === 6 ? "Sábado" : "Dia útil";
}

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

export function upcoming(line: Line, now = new Date(), n = 5) {
  const cur = now.getHours() * 60 + now.getMinutes();
  return line.trips
    .filter((t) => t.day === dayType(now) && toMin(t.time) >= cur)
    .sort((a, b) => toMin(a.time) - toMin(b.time))
    .slice(0, n);
}

function along(route: [number, number][], p: number): [number, number] {
  const f = Math.min(Math.max(p, 0), 1) * (route.length - 1);
  const i = Math.min(Math.floor(f), route.length - 2);
  const k = f - i;
  const a = route[i]!, b = route[i + 1]!;
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
}

/** Posição simulada do ônibus. Única função a trocar por uma fonte real. */
export function busStatus(line: Line, now = new Date()) {
  const route = routeFor(line.code);
  const cur = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const today = line.trips.filter((t) => t.day === dayType(now));
  const running = today
    .map((t) => ({ t, p: (cur - toMin(t.time)) / TRIP_MIN }))
    .filter((x) => x.p >= 0 && x.p < 0.5)
    .sort((a, b) => b.p - a.p)[0];
  if (running) {
    return {
      position: along(route, running.p),
      etaMin: Math.max(1, Math.round((0.5 - running.p) * TRIP_MIN)),
      trip: running.t,
      route,
    };
  }
  const next = upcoming(line, now, 1)[0];
  return {
    position: route[0]!,
    etaMin: next ? Math.round(toMin(next.time) - cur + TRIP_MIN / 2) : null,
    trip: next ?? null,
    route,
  };
}

export const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function searchLines(q: string) {
  const n = norm(q.trim());
  if (!n) return LINES;
  return LINES.filter(
    (l) =>
      norm(l.code).includes(n) ||
      norm(l.name).includes(n) ||
      l.trips.some((t) => norm(t.via).includes(n)),
  );
}
