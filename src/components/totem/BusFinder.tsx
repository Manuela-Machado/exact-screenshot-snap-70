import { lazy, Suspense, useEffect, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { MapPin, Clock, Delete, Search } from "lucide-react";
import { LINES, busStatus, searchLines, upcoming, type Line } from "@/lib/buses";

const BusMap = lazy(() => import("./BusMap"));
const KEYS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

export function BusFinder() {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Line | null>(null);
  const [, tick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => tick((x) => x + 1), 15000);
    return () => clearInterval(i);
  }, []);

  if (sel) {
    const st = busStatus(sel);
    const next = upcoming(sel);
    return (
      <div className="grid h-full min-h-0 grid-rows-[auto_auto_1fr] gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-primary">Linha {sel.code}</div>
            <h2 className="font-display text-3xl font-bold">{sel.name}</h2>
          </div>
          <button onClick={() => setSel(null)} className="rounded-lg bg-secondary px-5 py-3 text-lg font-semibold text-secondary-foreground">
            Trocar linha
          </button>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 rounded-xl bg-primary p-4 text-primary-foreground">
            <div className="text-sm opacity-80">Chega nesta parada em</div>
            <div className="font-display text-4xl font-bold">
              {st.etaMin != null ? (st.etaMin >= 60 ? `${Math.floor(st.etaMin / 60)}h${String(st.etaMin % 60).padStart(2, "0")}` : `${st.etaMin} min`) : "Sem viagens hoje"}
            </div>
            <div className="mt-1 text-xs opacity-80">Posição estimada (simulação)</div>
          </div>
          <div className="flex-1 rounded-xl border bg-card p-4">
            <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4" /> Próximas saídas</div>
            <div className="flex flex-wrap gap-2">
              {next.length ? next.map((t, i) => (
                <span key={i} className="rounded-lg bg-accent px-3 py-1 text-lg font-bold text-accent-foreground">{t.time}</span>
              )) : <span className="text-muted-foreground">Nenhuma hoje</span>}
            </div>
          </div>
        </div>
        <div className="min-h-0 overflow-hidden rounded-xl border">
          <ClientOnly fallback={<div className="h-full animate-pulse bg-muted" />}>
            <Suspense fallback={<div className="h-full animate-pulse bg-muted" />}>
              <BusMap line={sel} />
            </Suspense>
          </ClientOnly>
        </div>
      </div>
    );
  }

  const results = searchLines(q);
  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_1fr] gap-4">
      <h2 className="font-display text-3xl font-bold">Onde está meu ônibus?</h2>
      <div className="grid min-h-0 grid-cols-[1.05fr_0.95fr] gap-5">
        <div className="flex min-h-0 flex-col gap-4">
          <select
            className="rounded-lg border-2 border-input bg-card px-4 py-3 text-xl"
            value=""
            onChange={(e) => setSel(LINES.find((l) => l.code === e.target.value) ?? null)}
          >
            <option value="">Selecione uma linha da lista…</option>
            {LINES.map((l) => <option key={l.code} value={l.code}>{l.code} — {l.name}</option>)}
          </select>
          <div className="flex min-h-16 items-center gap-3 rounded-lg border-2 border-primary bg-card px-4 py-3 text-lg">
            <Search className="h-6 w-6 shrink-0 text-primary" />
            <span className={q ? "" : "text-muted-foreground"}>{q || "Digite a linha ou o bairro"}</span>
          </div>
          <div className="space-y-2">
            {KEYS.map((row) => (
              <div key={row} className="flex justify-center gap-2">
                {row.split("").map((k) => (
                  <button key={k} onClick={() => setQ(q + k)} className="h-12 min-w-0 flex-1 rounded-lg bg-secondary text-lg font-bold text-secondary-foreground active:bg-primary active:text-primary-foreground">{k}</button>
                ))}
              </div>
            ))}
            <div className="grid grid-cols-[2fr_0.75fr_1fr] gap-2">
              <button onClick={() => setQ(q + " ")} className="h-12 rounded-lg bg-secondary text-base font-semibold">Espaço</button>
              <button onClick={() => setQ(q.slice(0, -1))} aria-label="Apagar" className="flex h-12 items-center justify-center rounded-lg bg-secondary"><Delete /></button>
              <button onClick={() => setQ("")} className="h-12 rounded-lg bg-secondary text-base font-semibold">Limpar</button>
            </div>
          </div>
        </div>
        <div className="grid min-h-0 auto-rows-fr gap-1 overflow-hidden pr-1">
          {results.map((l) => (
            <button key={l.code} onClick={() => setSel(l)} className="flex min-h-0 w-full items-center gap-3 rounded-lg border bg-card px-3 py-1 text-left active:bg-accent">
              <span className="min-w-16 rounded-md bg-primary px-3 py-1.5 text-center font-display text-base font-bold text-primary-foreground">{l.code}</span>
              <span className="flex-1 text-base font-semibold leading-tight">{l.name}</span>
              <MapPin className="shrink-0 text-primary" />
            </button>
          ))}
          {!results.length && <p className="text-center text-lg text-muted-foreground">Nenhuma linha encontrada.</p>}
        </div>
      </div>
    </div>
  );
}
