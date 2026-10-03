import { AlertTriangle } from "lucide-react";

const GROUPS = [
  { title: "Linhas Comuns Metropolitanas (Intermunicipais)", items: [
    ["Gravataí - Porto Alegre", "13,65"], ["Gravataí - Canoas", "11,90"], ["Gravataí - Glorinha", "9,30"],
    ["Gravataí - Ponte", "7,95"], ["Gravataí - Distrito Industrial de Cachoeirinha", "9,65"],
  ] },
  { title: "Linhas Executivas Metropolitanas (Intermunicipais)", items: [
    ["Gravataí - Iguatemi", "11,90"], ["Gravataí - Porto Alegre (via Cachoeirinha)", "23,40"],
    ["Gravataí - Porto Alegre (via Freeway)", "23,40"], ["Gravataí - Cachoeirinha (micro-ônibus)", "11,95"],
    ["Gravataí - Praia de Belas (via Cachoeirinha)", "23,40"], ["Gravataí - Praia de Belas (via Freeway)", "23,40"],
  ] },
  { title: "Transversais Metropolitanas", items: [["Linhas TMs", "9,35"]] },
];

export function Fares() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <h2 className="font-display text-6xl font-bold">Alterações e tarifas</h2>
      <div className="flex items-center justify-between rounded-2xl bg-primary px-10 py-6 text-primary-foreground">
        <div className="text-4xl font-semibold">Tarifa municipal</div>
        <div className="font-display text-8xl font-bold leading-none">R$ 8,50</div>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-[1fr_auto] gap-4">
        {GROUPS.map((g) => (
          <section key={g.title} className="flex min-h-0 flex-col rounded-2xl border-2 bg-card p-6 last:col-span-2">
            <h3 className="mb-3 font-display text-4xl font-bold leading-tight text-primary">{g.title}</h3>
            <div className="flex flex-1 flex-col justify-around">
              {g.items.map(([n, p]) => (
                <div key={n} className="flex justify-between gap-4 border-b py-3 text-3xl font-medium leading-tight last:border-0">
                  <span>{n}</span><span className="whitespace-nowrap font-bold">R$ {p}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <section className="rounded-2xl border-2 border-warning bg-warning/10 p-6">
        <h3 className="mb-2 flex items-center gap-3 font-display text-4xl font-bold"><AlertTriangle className="h-10 w-10 text-warning" /> Avisos recentes</h3>
        <p className="text-3xl leading-snug">Ajuste de frequência nas linhas municipais de Gravataí. Alguns horários foram alterados — consulte os próximos horários na aba "Onde está meu ônibus?".</p>
        <p className="mt-2 text-2xl text-muted-foreground">Fonte: SOGIL — sogil.com.br/alteracoes-operacionais</p>
      </section>
    </div>
  );
}
