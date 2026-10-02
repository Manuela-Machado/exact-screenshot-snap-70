import { Delete } from "lucide-react";

const ROWS = ["1234567890", "QWERTYUIOP", "ASDFGHJKLÇ", "ZXCVBNM"];

export function Keyboard({ value, onChange, keyClass = "h-20 text-3xl" }: { value: string; onChange: (v: string) => void; keyClass?: string }) {
  const key = `${keyClass} rounded-xl bg-secondary font-bold text-secondary-foreground active:bg-primary active:text-primary-foreground`;
  return (
    <div className="space-y-2">
      {ROWS.map((row) => (
        <div key={row} className="flex justify-center gap-2">
          {row.split("").map((k) => (
            <button key={k} type="button" onClick={() => onChange(value + k)} className={`${key} min-w-0 flex-1`}>{k}</button>
          ))}
        </div>
      ))}
      <div className="grid grid-cols-[2fr_1fr_1fr] gap-2">
        <button type="button" onClick={() => onChange(value + " ")} className={key}>Espaço</button>
        <button type="button" onClick={() => onChange(value.slice(0, -1))} className={`${key} flex items-center justify-center gap-2`}><Delete className="h-8 w-8" /> Apagar</button>
        <button type="button" onClick={() => onChange("")} className={key}>Limpar</button>
      </div>
    </div>
  );
}
