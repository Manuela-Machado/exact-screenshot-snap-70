import { useState } from "react";
import { Star, CheckCircle2, Phone, Mail } from "lucide-react";
import { LINES } from "@/lib/buses";

const NONE = "Nenhum(a)/Não sei";
const CATS: Record<string, string[]> = {
  Elogio: ["Motorista muito educado", "Ônibus limpo e confortável", "Chegou no horário", "Viagem tranquila e segura"],
  Superlotação: ["Ônibus muito cheio", "Não consegui embarcar", "Faltam ônibus neste horário"],
  Atraso: ["Ônibus atrasou mais de 15 minutos", "Ônibus não passou", "Horário diferente do informado"],
  "Limpeza e conservação": ["Ônibus sujo", "Bancos danificados", "Ar-condicionado/ventilação com problema"],
  Atendimento: ["Motorista não parou na parada", "Tratamento desrespeitoso", "Direção perigosa"],
  Acessibilidade: ["Elevador não funciona", "Falta de espaço para cadeira de rodas", "Assento preferencial ocupado"],
};
const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const dayToType = (d: string) => (d === "Sábado" ? "Sábado" : d === "Domingo" ? "Domingo" : "Dia útil");

function Field({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-2 block text-2xl font-bold">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border-2 border-input bg-card px-5 py-5 text-2xl">
        <option value="">Selecione…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

export function Feedback({ onDone }: { onDone: () => void }) {
  const [stars, setStars] = useState(0);
  const [cat, setCat] = useState("");
  const [line, setLine] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  const lineObj = LINES.find((l) => `${l.code} — ${l.name}` === line);
  const times = lineObj
    ? [...new Set(lineObj.trips.filter((t) => !day || day === NONE || t.day === dayToType(day)).map((t) => t.time))].sort()
    : [];

  if (sent)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <CheckCircle2 className="h-24 w-24 text-success" />
        <h2 className="font-display text-6xl font-bold">Obrigado pelo seu feedback!</h2>
        <p className="text-3xl text-muted-foreground">Sua opinião ajuda a melhorar o transporte de Gravataí.</p>
        <button onClick={onDone} className="mt-4 rounded-2xl bg-primary px-12 py-6 text-3xl font-bold text-primary-foreground">Voltar ao menu</button>
      </div>
    );

  const ok = stars > 0 && cat && line && day && time && msg;
  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_auto_1fr_auto] gap-5">
      <h2 className="font-display text-5xl font-bold">Feedback</h2>
      <div>
        <span className="mb-2 block text-2xl font-bold">Como foi sua experiência?</span>
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setStars(n)} aria-label={`${n} estrelas`}>
              <Star className={`h-20 w-20 ${n <= stars ? "fill-warning text-warning" : "text-muted-foreground"}`} />
            </button>
          ))}
        </div>
      </div>
      <div className="grid min-h-0 grid-cols-2 content-start gap-5">
        <Field label="Tipo de feedback" value={cat} onChange={(v) => { setCat(v); setMsg(""); }} options={Object.keys(CATS)} />
        <Field label="Linha" value={line} onChange={(v) => { setLine(v); setTime(""); }} options={[NONE, ...LINES.map((l) => `${l.code} — ${l.name}`)]} />
        <Field label="Dia da semana" value={day} onChange={(v) => { setDay(v); setTime(""); }} options={[NONE, ...DAYS]} />
        <Field label="Horário" value={time} onChange={setTime} options={[NONE, ...times]} />
        <div className="col-span-2"><Field label="Mensagem" value={msg} onChange={setMsg} options={(cat && CATS[cat]) || []} /></div>
      </div>
      <div className="grid grid-cols-[1fr_auto] items-stretch gap-4">
        <button disabled={!ok} onClick={() => setSent(true)} className="rounded-xl bg-primary px-8 py-5 text-2xl font-bold text-primary-foreground disabled:opacity-40">
          Enviar feedback
        </button>
        <div className="rounded-xl bg-muted px-7 py-4 text-xl">
          <p className="font-bold">Fale com a SOGIL</p>
          <p className="mt-1 flex items-center gap-2"><Phone className="h-5 w-5" /> (51) 3484-8000</p>
          <p className="flex items-center gap-2"><Mail className="h-5 w-5" /> sac@sogil.com.br</p>
        </div>
      </div>
    </div>
  );
}
