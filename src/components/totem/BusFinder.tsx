import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { Clock, MapPin, Search, Footprints, Bus } from "lucide-react";
import {
  LINES, busPosition, departures, findOptions, fmtEta, nextArrival, originName, resolveVariant, variantKey,
  type Line, type LngLat, type Option, type VariantGeo,
} from "@/lib/buses";
import { suggest, type Suggestion } from "@/lib/geo";
import type { Route } from "@/lib/routing";
import { TouchSelect } from "./TouchSelect";
import { Keyboard } from "./Keyboard";
import { logSearch } from "@/lib/ontime-data";

const BusMap = lazy(() => import("./BusMap"));

type View =
  | { kind: "line"; line: Line }
  | { kind: "option"; opt: Option; dest: Suggestion };

export function BusFinder() {
  const [mode, setMode] = useState<"line" | "dest">("line");
  const [view, setView] = useState<View | null>(null);
  if (view) return <LineResult view={view} onBack={() => setView(null)} />;

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_auto_1fr] gap-4">
      <h2 className="font-display text-6xl font-bold">Onde está meu ônibus?</h2>
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-secondary p-2">
        {([["line", "Escolher a linha"], ["dest", "Buscar o destino"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setMode(id)} className={`min-h-24 rounded-xl text-4xl font-bold ${mode === id ? "bg-primary text-primary-foreground shadow" : "text-secondary-foreground"}`}>{label}</button>
        ))}
      </div>
      {mode === "line" ? (
        <div className="flex min-h-0 flex-col gap-6">
          <TouchSelect
            value=""
            title="Escolha a linha"
            placeholder="Toque para escolher a linha…"
            searchable
            options={LINES.map((l) => ({ value: l.code, label: `${l.code} – ${l.name}` }))}
            onChange={(v) => { const l = LINES.find((x) => x.code === v); if (l) { logSearch({ tipo: "linha", termo: `${l.code} – ${l.name}`, linha_codigo: l.code, resultados: 1 }); setView({ kind: "line", line: l }); } }}
          />
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-muted-foreground">
            <Bus className="h-40 w-40 opacity-30" />
          </div>
        </div>
      ) : (
        <DestSearch onPick={(opt, dest) => setView({ kind: "option", opt, dest })} />
      )}
    </div>
  );
}

function DestSearch({ onPick }: { onPick: (o: Option, d: Suggestion) => void }) {
  const [q, setQ] = useState("");
  const [sug, setSug] = useState<Suggestion[]>([]);
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const [chosen, setChosen] = useState<Suggestion | null>(null);
  const [opts, setOpts] = useState<Option[] | null>(null);

  useEffect(() => {
    if (chosen) return;
    setErr(false);
    if (q.trim().length < 3) { setSug([]); return; }
    const ac = new AbortController();
    const t = setTimeout(() => {
      setBusy(true);
      suggest(q.trim(), ac.signal)
        .then(setSug)
        .catch((e) => { if (e.name !== "AbortError") setErr(true); })
        .finally(() => setBusy(false));
    }, 500);
    return () => { clearTimeout(t); ac.abort(); };
  }, [q, chosen]);

  const type = (v: string) => { setQ(v); setChosen(null); setOpts(null); };
  const pick = (s: Suggestion) => {
    setChosen(s); setOpts(null); setBusy(true); setErr(false);
    findOptions(s.coord).then((found) => { setOpts(found); logSearch({ tipo: "destino", termo: s.label.slice(0, 120), resultados: found.length }); }).catch(() => setErr(true)).finally(() => setBusy(false));
  };

  return (
    <div className="grid min-h-0 grid-rows-[auto_1fr_auto] gap-4">
      <div className="flex min-h-24 items-center gap-4 rounded-xl border-2 border-primary bg-card px-6 text-4xl">
        <Search className="h-10 w-10 shrink-0 text-primary" />
        <span className={`min-w-0 truncate ${q ? "" : "text-muted-foreground"}`}>{chosen?.label ?? (q || "Digite o endereço ou local")}</span>
      </div>
      <div className="min-h-0 space-y-3 overflow-hidden">
        {err && <Msg>Não foi possível buscar agora. Tente novamente.</Msg>}
        {busy && <Msg>{chosen ? "Calculando as melhores linhas…" : "Buscando…"}</Msg>}
        {!chosen && !busy && !err && sug.map((s) => (
          <button key={s.id} onClick={() => pick(s)} className="flex min-h-24 w-full items-center gap-4 rounded-xl border-2 bg-card px-6 py-3 text-left active:bg-accent">
            <MapPin className="h-9 w-9 shrink-0 text-primary" />
            <span className="min-w-0"><span className="block truncate text-3xl font-bold">{s.label}</span>{s.detail && <span className="block truncate text-2xl text-muted-foreground">{s.detail}</span>}</span>
          </button>
        ))}
        {!chosen && !busy && !err && q.trim().length >= 3 && !sug.length && <Msg>Nenhum local encontrado em Gravataí.</Msg>}
        {chosen && opts && !opts.length && <Msg>Nenhuma linha passa perto desse destino. Tente outro endereço ou escolha uma linha.</Msg>}
        {chosen && opts?.map((o, i) => (
          <button key={o.line.code} onClick={() => onPick(o, chosen)} className={`grid w-full grid-cols-[auto_1fr] items-center gap-5 rounded-2xl border-2 bg-card px-6 py-4 text-left active:bg-accent ${i === 0 ? "border-primary" : ""}`}>
            <span className="min-w-28 rounded-xl bg-primary px-4 py-4 text-center font-display text-4xl font-bold text-primary-foreground">{o.line.code}</span>
            <span className="min-w-0">
              <span className="flex items-center gap-3">
                <span className="truncate text-3xl font-bold">{o.line.name}</span>
                {i === 0 && <span className="shrink-0 rounded-full bg-success px-4 py-1 text-xl font-bold text-success-foreground">Melhor opção</span>}
              </span>
              <span className="mt-1 block text-2xl font-semibold text-primary">Chega aqui em ~{fmtEta(o.eta)}</span>
              <span className="block truncate text-2xl">Desça em: <b>{o.alight.name}</b></span>
              <span className="block text-2xl text-muted-foreground">Depois caminhe ~{o.walkM} m até o destino</span>
            </span>
          </button>
        ))}
      </div>
      <Keyboard value={q} onChange={type} keyClass="h-20 text-3xl" />
    </div>
  );
}

const Msg = ({ children }: { children: React.ReactNode }) => (
  <p className="rounded-xl bg-muted px-6 py-6 text-center text-3xl font-semibold text-muted-foreground">{children}</p>
);

function LineResult({ view, onBack }: { view: View; onBack: () => void }) {
  const line = view.kind === "line" ? view.line : view.opt.line;
  const dirs = useMemo(() => [...new Set(line.trips.map((t) => t.dir))], [line]);
  const [dir, setDir] = useState(view.kind === "line" ? dirs[0]! : view.opt.trips[0]!.dir);
  const trips = view.kind === "line" ? line.trips.filter((t) => t.dir === dir) : view.opt.trips;
  const [, tick] = useState(0);
  const [data, setData] = useState<{ geo: VariantGeo; route: Route | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { const i = setInterval(() => tick((x) => x + 1), 30000); return () => clearInterval(i); }, []);

  useEffect(() => {
    let alive = true;
    const reps = [...new Map(trips.map((t) => [variantKey(t), t])).values()];
    Promise.all(reps.map((t) => resolveVariant(line, t))).then(() => alive && tick((x) => x + 1));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line, dir]);

  const now = new Date();
  const next = nextArrival(line, trips, now);
  const deps = departures(trips, now);
  const nk = next ? variantKey(next.trip) : "";

  useEffect(() => {
    if (!next) { setLoading(false); return; }
    let alive = true;
    setLoading(true);
    resolveVariant(line, next.trip).then((d) => alive && setData(d)).finally(() => alive && setLoading(false));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line, nk]);

  const geom = data?.route?.geometry ?? null;
  const stops = data?.geo.stops ?? [];
  const bus = geom ? busPosition(geom, next) : null;
  const first = stops[0]?.coord ?? null, last = stops[stops.length - 1]?.coord ?? null;

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_auto_auto_1fr] gap-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <div className="text-3xl font-bold uppercase tracking-wide text-primary">Linha {line.code}</div>
          <h2 className="truncate font-display text-6xl font-bold leading-tight">{line.name}</h2>
        </div>
        <button onClick={onBack} className="min-h-24 rounded-xl bg-secondary px-10 text-3xl font-bold text-secondary-foreground">Trocar linha</button>
      </div>

      {view.kind === "line" && dirs.length > 1 ? (
        <div className="flex gap-3">
          {dirs.map((d) => (
            <button key={d} onClick={() => setDir(d)} className={`min-h-20 flex-1 rounded-xl px-4 text-2xl font-bold ${d === dir ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{d}</button>
          ))}
        </div>
      ) : view.kind === "option" ? (
        <div className="flex items-center gap-4 rounded-xl bg-accent px-6 py-4 text-3xl text-accent-foreground">
          <Footprints className="h-10 w-10 shrink-0" />
          <span className="min-w-0 truncate">Desça em <b>{view.opt.alight.name}</b> e caminhe ~{view.opt.walkM} m até <b>{view.dest.label}</b></span>
        </div>
      ) : <div />}

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-primary p-7 text-primary-foreground">
          <div className="text-3xl font-semibold opacity-90">Chega nesta parada em</div>
          <div className="font-display text-7xl font-bold">{next ? `~${fmtEta(next.eta)}` : "Sem viagens"}</div>
          <div className="mt-2 text-2xl opacity-90">Posição estimada (simulação)</div>
        </div>
        <div className="rounded-2xl border-2 bg-card p-7">
          <div className="mb-1 flex items-center gap-3 text-3xl font-bold"><Clock className="h-9 w-9 text-primary" /> Próximas saídas {deps.label && deps.label !== "Hoje" && <span className="rounded-full bg-warning px-3 py-1 text-xl text-warning-foreground">{deps.label}</span>}</div>
          <div className="mb-3 truncate text-2xl text-muted-foreground">Saem de: {originName(trips[0]?.dir ?? dir, line)}</div>
          <div className="flex flex-wrap gap-3">
            {deps.times.length ? deps.times.map((t) => (
              <span key={t} className="rounded-xl bg-accent px-5 py-3 text-3xl font-bold text-accent-foreground">{t}</span>
            )) : <span className="text-2xl text-muted-foreground">Nenhuma</span>}
          </div>
        </div>
      </div>

      <div className="min-h-0 overflow-hidden rounded-2xl border-2">
        <ClientOnly fallback={<div className="h-full animate-pulse bg-muted" />}>
          <Suspense fallback={<div className="h-full animate-pulse bg-muted" />}>
            <BusMap
              geometry={geom}
              start={first}
              end={last}
              bus={bus}
              dest={view.kind === "option" ? (view.dest.coord as LngLat) : null}
              alight={view.kind === "option" ? view.opt.alight.coord : null}
              loading={loading}
              failed={!loading && !geom}
            />
          </Suspense>
        </ClientOnly>
      </div>
    </div>
  );
}
