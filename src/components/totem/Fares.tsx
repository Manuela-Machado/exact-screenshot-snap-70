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
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto pr-1">
      <h2 className="font-display text-3xl font-bold">Alterações e tarifas</h2>
      <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
        <div className="text-lg opacity-90">Tarifa municipal</div>
        <div className="font-display text-5xl font-bold">R$ 8,50</div>
      </div>
      <div className="grid grid-cols-2 items-start gap-4">
      {GROUPS.map((g) => (
        <section key={g.title} className="rounded-xl border bg-card p-4 last:col-span-2">
          <h3 className="mb-2 font-display text-xl font-bold text-primary">{g.title}</h3>
          {g.items.map(([n, p]) => (
            <div key={n} className="flex justify-between gap-4 border-b py-2 text-lg last:border-0">
              <span>{n}</span><span className="font-bold whitespace-nowrap">R$ {p}</span>
            </div>
          ))}
        </section>
      ))}
      </div>
      <section className="rounded-xl border-2 border-warning bg-warning/10 p-4">
        <h3 className="mb-2 flex items-center gap-2 font-display text-xl font-bold"><AlertTriangle className="text-warning" /> Avisos recentes</h3>
        <p className="text-lg">Ajuste de frequência nas linhas municipais de Gravataí. Alguns horários foram alterados — consulte os próximos horários na aba "Onde está meu ônibus?".</p>
        <p className="mt-2 text-sm text-muted-foreground">Fonte: SOGIL — sogil.com.br/alteracoes-operacionais</p>
      </section>
    </div>
  );
}
