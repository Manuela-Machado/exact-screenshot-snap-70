import { AlertTriangle } from "lucide-react";

export function Fares({ groups, municipalFare, notice }: { groups: { title: string; items: string[][] }[]; municipalFare: string; notice: { texto: string; fonte: string } }) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <h2 className="font-display text-6xl font-bold">Alterações e tarifas</h2>
      <div className="flex items-center justify-between rounded-2xl bg-primary px-10 py-6 text-primary-foreground">
        <div className="text-4xl font-semibold">Tarifa municipal</div>
        <div className="font-display text-8xl font-bold leading-none">R$ {municipalFare}</div>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-[1fr_auto] gap-4">
        {groups.map((g) => (
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
        <p className="text-3xl leading-snug">{notice.texto}</p>
        <p className="mt-2 text-2xl text-muted-foreground">Fonte: {notice.fonte}</p>
      </section>
    </div>
  );
}
