import { useEffect, useState } from "react";
import { Star, CheckCircle2, Phone, Mail } from "lucide-react";
import { LINES } from "@/lib/buses";
import { TouchSelect } from "./TouchSelect";

const NONE = "Não sei / Nenhuma";
const CATS: Record<string, string[]> = {
  Elogio: ["Motorista muito educado", "Ônibus limpo e confortável", "Chegou no horário", "Viagem tranquila e segura"],
  Atraso: ["Ônibus atrasou mais de 15 minutos", "Ônibus não passou", "Horário diferente do informado"],
  Superlotação: ["Ônibus muito cheio", "Não consegui embarcar", "Faltam ônibus neste horário"],
  Limpeza: ["Ônibus sujo", "Bancos danificados", "Ar-condicionado/ventilação com problema"],
  Segurança: ["Direção perigosa", "Motorista não parou na parada", "Me senti inseguro(a) no ônibus"],
  Acessibilidade: ["Elevador não funciona", "Falta de espaço para cadeira de rodas", "Assento preferencial ocupado"],
  Outro: ["Sugestão de melhoria", "Informação incorreta no totem", "Outro problema"],
};
const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const dayToType = (d: string) => (d === "Sábado" ? "Sábado" : d === "Domingo" ? "Domingo" : "Dia útil");
const opts = (a: string[]) => a.map((v) => ({ value: v, label: v }));

export function Feedback({ onDone, onHome }: { onDone: () => void; onHome: () => void }) {
  const [stars, setStars] = useState(0);
  const [cat, setCat] = useState("");
  const [line, setLine] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!sent) return;
    const t = setTimeout(onHome, 8000);
    return () => clearTimeout(t);
  }, [sent, onHome]);

  const lineObj = LINES.find((l) => `${l.code} – ${l.name}` === line);
  const times = lineObj
    ? [...new Set(lineObj.trips.filter((t) => !day || day === NONE || t.day === dayToType(day)).map((t) => t.time))].sort()
    : [];

  if (sent)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
        <CheckCircle2 className="h-40 w-40 text-success" />
        <h2 className="font-display text-7xl font-bold">Obrigado pelo seu feedback!</h2>
        <p className="text-4xl text-muted-foreground">Sua opinião ajuda a melhorar o transporte de Gravataí.</p>
        <button onClick={onDone} className="mt-4 min-h-28 rounded-2xl bg-primary px-14 text-4xl font-bold text-primary-foreground">Voltar ao menu</button>
      </div>
    );

  const ok = stars > 0 && cat && line && day && time && msg;
  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_1fr_auto] gap-6 font-feedback-body">
      <h2 className="font-feedback-display text-6xl font-bold">Feedback</h2>

      <div className="grid min-h-0 grid-rows-[auto_1fr] gap-7">
        <section className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-8 border-b-2 border-border pb-7">
          <div className="min-w-0">
            <span className="font-feedback-display block text-4xl font-bold">Como foi sua experiência?</span>
            <span className="mt-2 block text-2xl font-semibold text-muted-foreground">Toque nas estrelas para avaliar</span>
          </div>
          <div className="flex shrink-0 gap-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setStars(n)} aria-label={`${n} estrelas`} className="p-2">
              <Star className={`h-24 w-24 ${n <= stars ? "fill-warning text-warning" : "text-muted-foreground"}`} />
            </button>
          ))}
          </div>
        </section>

        <section className="grid min-h-0 grid-cols-2 grid-rows-3 content-stretch gap-x-7 gap-y-6">
          <div className="flex min-h-0 flex-col justify-center">
            <TouchSelect label="Tipo de feedback" value={cat} onChange={(v) => { setCat(v); setMsg(""); }} options={opts(Object.keys(CATS))} />
          </div>
          <div className="flex min-h-0 flex-col justify-center">
            <TouchSelect label="Linha" value={line} searchable onChange={(v) => { setLine(v); setTime(""); }} options={opts([NONE, ...LINES.map((l) => `${l.code} – ${l.name}`)])} />
          </div>
          <div className="flex min-h-0 flex-col justify-center">
            <TouchSelect label="Dia da semana" value={day} onChange={(v) => { setDay(v); setTime(""); }} options={opts([NONE, ...DAYS])} />
          </div>
          <div className="flex min-h-0 flex-col justify-center">
            <TouchSelect label="Horário" value={time} onChange={setTime} options={opts([NONE, ...times])} />
          </div>
          <div className="col-span-2 flex min-h-0 flex-col justify-center">
            <TouchSelect label="Mensagem" value={msg} onChange={setMsg} placeholder={cat ? "Selecione…" : "Escolha primeiro o tipo de feedback"} options={opts((cat && CATS[cat]) || [])} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-stretch gap-5 border-t-2 border-border pt-6">
        <button disabled={!ok} onClick={() => setSent(true)} className="min-h-32 rounded-xl bg-primary px-8 font-feedback-display text-4xl font-bold text-primary-foreground disabled:opacity-40">
          Enviar feedback
        </button>
        <div className="flex min-w-[390px] flex-col justify-center rounded-xl bg-secondary px-9 py-5 text-3xl text-secondary-foreground">
          <p className="font-bold">Fale com a SOGIL</p>
          <p className="mt-1 flex items-center gap-3"><Phone className="h-7 w-7" /> (51) 3484-8000</p>
          <p className="flex items-center gap-3"><Mail className="h-7 w-7" /> sac@sogil.com.br</p>
        </div>
      </div>
    </div>
  );
}
