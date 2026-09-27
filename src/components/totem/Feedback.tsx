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
      <span className="mb-1 block text-lg font-semibold">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border-2 border-input bg-card px-4 py-3 text-lg">
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
        <h2 className="font-display text-4xl font-bold">Obrigado pelo seu feedback!</h2>
        <p className="text-xl text-muted-foreground">Sua opinião ajuda a melhorar o transporte de Gravataí.</p>
        <button onClick={onDone} className="mt-4 rounded-2xl bg-primary px-10 py-4 text-xl font-bold text-primary-foreground">Voltar ao menu</button>
      </div>
    );

  const ok = stars > 0 && cat && line && day && time && msg;
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto">
      <h2 className="font-display text-3xl font-bold">Feedback</h2>
      <div>
        <span className="mb-1 block text-lg font-semibold">Como foi sua experiência?</span>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setStars(n)} aria-label={`${n} estrelas`}>
              <Star className={`h-14 w-14 ${n <= stars ? "fill-warning text-warning" : "text-muted-foreground"}`} />
            </button>
          ))}
        </div>
      </div>
      <Field label="Tipo de feedback" value={cat} onChange={(v) => { setCat(v); setMsg(""); }} options={Object.keys(CATS)} />
      <Field label="Linha" value={line} onChange={(v) => { setLine(v); setTime(""); }} options={[NONE, ...LINES.map((l) => `${l.code} — ${l.name}`)]} />
      <Field label="Dia da semana" value={day} onChange={(v) => { setDay(v); setTime(""); }} options={[NONE, ...DAYS]} />
      <Field label="Horário" value={time} onChange={setTime} options={[NONE, ...times]} />
      <Field label="Mensagem" value={msg} onChange={setMsg} options={cat ? CATS[cat] : []} />
      <button disabled={!ok} onClick={() => setSent(true)} className="rounded-2xl bg-primary py-4 text-xl font-bold text-primary-foreground disabled:opacity-40">
        Enviar feedback
      </button>
      <div className="rounded-xl bg-muted p-4 text-base">
        <p className="font-semibold">Não encontrou sua opção? Fale com a SOGIL:</p>
        <p className="mt-1 flex items-center gap-2"><Phone className="h-4 w-4" /> (51) 3484-8000</p>
        <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> sac@sogil.com.br</p>
      </div>
    </div>
  );
}
