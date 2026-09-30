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
      <div className="grid h-full min-h-0 grid-rows-[auto_auto_1fr] gap-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-bold uppercase tracking-wide text-primary">Linha {sel.code}</div>
            <h2 className="font-display text-5xl font-bold leading-tight">{sel.name}</h2>
          </div>
          <button onClick={() => setSel(null)} className="rounded-xl bg-secondary px-8 py-5 text-2xl font-bold text-secondary-foreground">
            Trocar linha
          </button>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 rounded-2xl bg-primary p-7 text-primary-foreground">
            <div className="text-2xl font-semibold opacity-90">Chega nesta parada em</div>
            <div className="font-display text-6xl font-bold">
              {st.etaMin != null ? (st.etaMin >= 60 ? `${Math.floor(st.etaMin / 60)}h${String(st.etaMin % 60).padStart(2, "0")}` : `${st.etaMin} min`) : "Sem viagens hoje"}
            </div>
            <div className="mt-2 text-lg opacity-90">Posição estimada (simulação)</div>
          </div>
          <div className="flex-1 rounded-2xl border-2 bg-card p-7">
            <div className="mb-3 flex items-center gap-3 text-2xl font-semibold text-muted-foreground"><Clock className="h-7 w-7" /> Próximas saídas</div>
            <div className="flex flex-wrap gap-3">
              {next.length ? next.map((t, i) => (
                <span key={i} className="rounded-lg bg-accent px-4 py-2 text-2xl font-bold text-accent-foreground">{t.time}</span>
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
    <div className="grid h-full min-h-0 grid-rows-[auto_1fr] gap-6">
      <h2 className="font-display text-5xl font-bold">Onde está meu ônibus?</h2>
      <div className="grid min-h-0 grid-cols-[0.9fr_1.1fr] gap-6">
        <div className="flex min-h-0 flex-col gap-5">
          <select
            className="rounded-xl border-2 border-input bg-card px-5 py-5 text-2xl font-semibold"
            value=""
            onChange={(e) => setSel(LINES.find((l) => l.code === e.target.value) ?? null)}
          >
            <option value="">Selecione uma linha da lista…</option>
            {LINES.map((l) => <option key={l.code} value={l.code}>{l.code} — {l.name}</option>)}
          </select>
          <div className="flex min-h-24 items-center gap-4 rounded-xl border-2 border-primary bg-card px-5 py-4 text-2xl">
            <Search className="h-8 w-8 shrink-0 text-primary" />
            <span className={q ? "" : "text-muted-foreground"}>{q || "Digite a linha ou o bairro"}</span>
          </div>
          <div className="space-y-2">
            {KEYS.map((row) => (
              <div key={row} className="flex justify-center gap-2">
                {row.split("").map((k) => (
                  <button key={k} onClick={() => setQ(q + k)} className="h-20 min-w-0 flex-1 rounded-xl bg-secondary text-2xl font-bold text-secondary-foreground active:bg-primary active:text-primary-foreground">{k}</button>
                ))}
              </div>
            ))}
            <div className="grid grid-cols-[2fr_0.75fr_1fr] gap-2">
              <button onClick={() => setQ(q + " ")} className="h-20 rounded-xl bg-secondary text-xl font-bold">Espaço</button>
              <button onClick={() => setQ(q.slice(0, -1))} aria-label="Apagar" className="flex h-20 items-center justify-center rounded-xl bg-secondary"><Delete className="h-8 w-8" /></button>
              <button onClick={() => setQ("")} className="h-20 rounded-xl bg-secondary text-xl font-bold">Limpar</button>
            </div>
          </div>
        </div>
        <div className="grid min-h-0 grid-cols-2 auto-rows-fr gap-2 overflow-hidden pr-1">
          {results.map((l) => (
            <button key={l.code} onClick={() => setSel(l)} className="flex min-h-0 w-full items-center gap-3 rounded-xl border-2 bg-card px-4 py-2 text-left active:bg-accent">
              <span className="min-w-20 rounded-lg bg-primary px-3 py-2 text-center font-display text-xl font-bold text-primary-foreground">{l.code}</span>
              <span className="flex-1 text-xl font-bold leading-tight">{l.name}</span>
            </button>
          ))}
          {!results.length && <p className="text-center text-lg text-muted-foreground">Nenhuma linha encontrada.</p>}
        </div>
      </div>
    </div>
  );
}
