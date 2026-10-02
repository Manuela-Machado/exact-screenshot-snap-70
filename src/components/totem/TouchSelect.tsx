import { useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { norm } from "@/lib/buses";
import { Keyboard } from "./Keyboard";

export type Opt = { value: string; label: string };

/** Seleção para toque: abre uma lista em tela cheia (sobre a área de interface). */
export function TouchSelect({
  label, value, options, onChange, placeholder = "Selecione…", searchable = false, title,
}: {
  label?: string; value: string; options: Opt[]; onChange: (v: string) => void;
  placeholder?: string; searchable?: boolean; title?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const cur = options.find((o) => o.value === value);
  const list = q ? options.filter((o) => norm(o.label).includes(norm(q))) : options;

  return (
    <div className="min-w-0">
      {label && <span className="mb-2 block text-3xl font-bold">{label}</span>}
      <button
        type="button"
        onClick={() => { setQ(""); setOpen(true); }}
        className="flex min-h-24 w-full items-center justify-between gap-4 rounded-xl border-2 border-input bg-card px-6 py-3 text-left text-3xl font-semibold active:border-primary"
      >
        <span className={`min-w-0 truncate ${cur ? "" : "text-muted-foreground"}`}>{cur?.label ?? placeholder}</span>
        <ChevronDown className="h-10 w-10 shrink-0 text-primary" />
      </button>
      {open && (
        <div className="absolute inset-0 z-50 flex flex-col gap-4 bg-background p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-display text-5xl font-bold">{title ?? label ?? placeholder}</h3>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fechar" className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"><X className="h-12 w-12" /></button>
          </div>
          {searchable && (
            <>
              <div className="flex min-h-24 items-center gap-4 rounded-xl border-2 border-primary bg-card px-6 text-3xl">
                <Search className="h-9 w-9 shrink-0 text-primary" />
                <span className={q ? "" : "text-muted-foreground"}>{q || "Filtrar por código ou nome"}</span>
              </div>
              <Keyboard value={q} onChange={setQ} keyClass="h-20 text-3xl" />
            </>
          )}
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            {list.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`flex min-h-24 w-full items-center rounded-xl border-2 px-6 py-3 text-left text-3xl font-semibold active:bg-accent ${o.value === value ? "border-primary bg-accent" : "bg-card"}`}
              >
                {o.label}
              </button>
            ))}
            {!list.length && <p className="py-8 text-center text-3xl text-muted-foreground">Nada encontrado.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
