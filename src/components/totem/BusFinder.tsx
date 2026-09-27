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
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-primary">Linha {sel.code}</div>
            <h2 className="font-display text-3xl font-bold">{sel.name}</h2>
          </div>
          <button onClick={() => setSel(null)} className="rounded-xl bg-secondary px-5 py-3 text-lg font-semibold text-secondary-foreground">
            Trocar linha
          </button>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 rounded-2xl bg-primary p-4 text-primary-foreground">
            <div className="text-sm opacity-80">Chega nesta parada em</div>
            <div className="font-display text-4xl font-bold">
              {st.etaMin != null ? `${st.etaMin} min` : "Sem viagens hoje"}
            </div>
            <div className="mt-1 text-xs opacity-80">Posição estimada (simulação)</div>
          </div>
          <div className="flex-1 rounded-2xl border bg-card p-4">
            <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4" /> Próximas saídas</div>
            <div className="flex flex-wrap gap-2">
              {next.length ? next.map((t, i) => (
                <span key={i} className="rounded-lg bg-accent px-3 py-1 text-lg font-bold text-accent-foreground">{t.time}</span>
              )) : <span className="text-muted-foreground">Nenhuma hoje</span>}
            </div>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border">
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
    <div className="flex h-full flex-col gap-4">
      <h2 className="font-display text-3xl font-bold">Onde está meu ônibus?</h2>
      <select
        className="rounded-xl border-2 border-input bg-card px-4 py-4 text-xl"
        value=""
        onChange={(e) => setSel(LINES.find((l) => l.code === e.target.value) ?? null)}
      >
        <option value="">Selecione uma linha da lista…</option>
        {LINES.map((l) => <option key={l.code} value={l.code}>{l.code} — {l.name}</option>)}
      </select>
      <div className="flex items-center gap-3 rounded-xl border-2 border-primary bg-card px-4 py-4 text-xl">
        <Search className="h-6 w-6 text-primary" />
        <span className={q ? "" : "text-muted-foreground"}>{q || "Ou digite o nome da linha ou bairro de destino"}</span>
      </div>
      <div className="space-y-2">
        {KEYS.map((row) => (
          <div key={row} className="flex justify-center gap-2">
            {row.split("").map((k) => (
              <button key={k} onClick={() => setQ(q + k)} className="h-14 w-14 rounded-xl bg-secondary text-xl font-bold text-secondary-foreground active:bg-primary active:text-primary-foreground">{k}</button>
            ))}
          </div>
        ))}
        <div className="flex justify-center gap-2">
          <button onClick={() => setQ(q + " ")} className="h-14 w-72 rounded-xl bg-secondary text-lg font-semibold">Espaço</button>
          <button onClick={() => setQ(q.slice(0, -1))} aria-label="Apagar" className="flex h-14 w-24 items-center justify-center rounded-xl bg-secondary"><Delete /></button>
          <button onClick={() => setQ("")} className="h-14 w-28 rounded-xl bg-secondary text-lg font-semibold">Limpar</button>
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
        {results.map((l) => (
          <button key={l.code} onClick={() => setSel(l)} className="flex w-full items-center gap-4 rounded-xl border bg-card p-4 text-left active:bg-accent">
            <span className="min-w-16 rounded-lg bg-primary px-3 py-2 text-center font-display text-lg font-bold text-primary-foreground">{l.code}</span>
            <span className="flex-1 text-xl font-semibold">{l.name}</span>
            <MapPin className="text-primary" />
          </button>
        ))}
        {!results.length && <p className="text-center text-lg text-muted-foreground">Nenhuma linha encontrada.</p>}
      </div>
    </div>
  );
}
