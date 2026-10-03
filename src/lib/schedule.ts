import Papa from "papaparse";
import raw from "@/data/sogil_gravatai_linhas_horarios.csv?raw";

/** `time` é o horário de SAÍDA do ponto de origem (`dir`), nunca a chegada no totem. */
export type Trip = { dir: string; day: string; time: string; variant: string; via: string; plan: string };
export type Line = { code: string; name: string; trips: Trip[] };

type Row = Partial<Record<"linha_codigo" | "linha_nome" | "sentido_origem" | "dia_tipo" | "plano_operacional" | "horario" | "variante_num" | "variante_itinerario", string>>;

const parsed = Papa.parse<Row>(raw.replace(/^\uFEFF/, ""), {
  delimiter: ";",
  header: true,
  skipEmptyLines: true,
  transformHeader: (h) => h.replace(/^\uFEFF/, "").trim(),
});

const padTime = (t: string) => {
  const [h = "0", m = "0"] = t.trim().split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
};

const map = new Map<string, Line>();
for (const r of parsed.data) {
  const code = r.linha_codigo?.trim();
  if (!code || !r.horario) continue;
  let l = map.get(code);
  if (!l) {
    l = { code, name: (r.linha_nome ?? code).trim(), trips: [] };
    map.set(code, l);
  }
  l.trips.push({
    dir: (r.sentido_origem ?? "").trim(),
    day: (r.dia_tipo ?? "").trim(),
    time: padTime(r.horario),
    variant: (r.variante_num ?? "").trim(),
    via: (r.variante_itinerario ?? "").trim(),
    plan: (r.plano_operacional ?? "").trim(),
  });
}

export const LINES: Line[] = [...map.values()].sort((a, b) => a.code.localeCompare(b.code));
