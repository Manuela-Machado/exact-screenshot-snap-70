import { supabase } from "@/integrations/supabase/client";
import { TOTEM_LOCATION } from "@/config/totem";
import { LINES as LOCAL_LINES, type Line } from "./schedule";

export const TOTEM_ID = "gravatai-parada-1";

export const LOCAL_FARE_GROUPS = [
  { title: "Linhas Comuns Metropolitanas (Intermunicipais)", items: [["Gravataí - Porto Alegre", "13,65"], ["Gravataí - Canoas", "11,90"], ["Gravataí - Glorinha", "9,30"], ["Gravataí - Ponte", "7,95"], ["Gravataí - Distrito Industrial de Cachoeirinha", "9,65"]] },
  { title: "Linhas Executivas Metropolitanas (Intermunicipais)", items: [["Gravataí - Iguatemi", "11,90"], ["Gravataí - Porto Alegre (via Cachoeirinha)", "23,40"], ["Gravataí - Porto Alegre (via Freeway)", "23,40"], ["Gravataí - Cachoeirinha (micro-ônibus)", "11,95"], ["Gravataí - Praia de Belas (via Cachoeirinha)", "23,40"], ["Gravataí - Praia de Belas (via Freeway)", "23,40"]] },
  { title: "Transversais Metropolitanas", items: [["Linhas TMs", "9,35"]] },
] as { title: string; items: string[][] }[];

export const LOCAL_NOTICE = {
  texto: "Ajuste de frequência nas linhas municipais de Gravataí. Alguns horários foram alterados — consulte os próximos horários na aba \"Onde está meu ônibus?\".",
  fonte: "SOGIL — sogil.com.br/alteracoes-operacionais",
};

export const LOCAL_FEEDBACK = [
  { id: "elogio", nome: "Elogio", messages: ["Motorista muito educado", "Ônibus limpo e confortável", "Chegou no horário", "Viagem tranquila e segura"] },
  { id: "atraso", nome: "Atraso", messages: ["Ônibus atrasou mais de 15 minutos", "Ônibus não passou", "Horário diferente do informado"] },
  { id: "superlotacao", nome: "Superlotação", messages: ["Ônibus muito cheio", "Não consegui embarcar", "Faltam ônibus neste horário"] },
  { id: "limpeza", nome: "Limpeza", messages: ["Ônibus sujo", "Bancos danificados", "Ar-condicionado/ventilação com problema"] },
  { id: "seguranca", nome: "Segurança", messages: ["Direção perigosa", "Motorista não parou na parada", "Me senti inseguro(a) no ônibus"] },
  { id: "acessibilidade", nome: "Acessibilidade", messages: ["Elevador não funciona", "Falta de espaço para cadeira de rodas", "Assento preferencial ocupado"] },
  { id: "outro", nome: "Outro", messages: ["Sugestão de melhoria", "Informação incorreta no totem", "Outro problema"] },
];

export type Catalog = {
  lines: Line[];
  fareGroups: typeof LOCAL_FARE_GROUPS;
  municipalFare: string;
  notice: typeof LOCAL_NOTICE;
  feedback: typeof LOCAL_FEEDBACK;
  totem: typeof TOTEM_LOCATION;
};

export const LOCAL_CATALOG: Catalog = {
  lines: LOCAL_LINES,
  fareGroups: LOCAL_FARE_GROUPS,
  municipalFare: "8,50",
  notice: LOCAL_NOTICE,
  feedback: LOCAL_FEEDBACK,
  totem: TOTEM_LOCATION,
};

const fail = (error: unknown) => { if (error) throw error; };

export async function loadCatalog(): Promise<Catalog> {
  try {
    const [lineRes, scheduleA, scheduleB, groupsRes, faresRes, settingRes, noticeRes, catRes, msgRes, totemRes] = await Promise.all([
      supabase.from("bus_lines").select("codigo,nome").eq("ativo", true).order("codigo"),
      supabase.from("bus_schedules").select("linha_codigo,sentido_origem,dia_tipo,plano_operacional,horario,variante_num,variante_itinerario").range(0, 499),
      supabase.from("bus_schedules").select("linha_codigo,sentido_origem,dia_tipo,plano_operacional,horario,variante_num,variante_itinerario").range(500, 999),
      supabase.from("fare_groups").select("id,nome,ordem").order("ordem"),
      supabase.from("fares").select("group_id,descricao,valor,ordem").order("ordem"),
      supabase.from("app_settings").select("valor").eq("chave", "tarifa_municipal").maybeSingle(),
      supabase.from("notices").select("texto,fonte").eq("ativo", true).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("feedback_categories").select("id,nome,ordem").order("ordem"),
      supabase.from("feedback_messages").select("category_id,texto,ordem").order("ordem"),
      supabase.from("totems").select("nome,endereco,lat,lng").eq("id", TOTEM_ID).eq("ativo", true).maybeSingle(),
    ]);
    [lineRes, scheduleA, scheduleB, groupsRes, faresRes, settingRes, noticeRes, catRes, msgRes, totemRes].forEach((r) => fail(r.error));
    const schedules = [...(scheduleA.data ?? []), ...(scheduleB.data ?? [])];
    if (!lineRes.data?.length || schedules.length !== 696) throw new Error("Incomplete schedule catalog");
    const lines: Line[] = lineRes.data.map((line) => ({
      code: line.codigo,
      name: line.nome,
      trips: schedules.filter((s) => s.linha_codigo === line.codigo).map((s) => ({
        dir: s.sentido_origem, day: s.dia_tipo, time: s.horario.slice(0, 5), variant: String(s.variante_num), via: s.variante_itinerario, plan: s.plano_operacional,
      })),
    }));
    const fareGroups = (groupsRes.data ?? []).map((g) => ({
      title: g.nome,
      items: (faresRes.data ?? []).filter((f) => f.group_id === g.id).map((f) => [f.descricao, Number(f.valor).toFixed(2).replace(".", ",")]),
    }));
    const feedback = (catRes.data ?? []).map((c) => ({ id: c.id, nome: c.nome, messages: (msgRes.data ?? []).filter((m) => m.category_id === c.id).map((m) => m.texto) }));
    const t = totemRes.data;
    return {
      lines,
      fareGroups: fareGroups.length ? fareGroups : LOCAL_FARE_GROUPS,
      municipalFare: settingRes.data?.valor ? Number(settingRes.data.valor).toFixed(2).replace(".", ",") : "8,50",
      notice: noticeRes.data ? { texto: noticeRes.data.texto, fonte: noticeRes.data.fonte ?? "" } : LOCAL_NOTICE,
      feedback: feedback.length ? feedback : LOCAL_FEEDBACK,
      totem: t ? { name: t.nome, address: t.endereco, lat: t.lat, lng: t.lng } : TOTEM_LOCATION,
    };
  } catch {
    return LOCAL_CATALOG;
  }
}

export function logSearch(values: { tipo: "linha" | "destino"; termo?: string; linha_codigo?: string; resultados?: number }) {
  void supabase.from("search_logs").insert({ totem_id: TOTEM_ID, ...values }).then(() => undefined);
}

export async function submitFeedback(values: { nota: number; categoria_id: string; linha_codigo: string | null; dia_semana: string | null; horario: string | null; mensagem: string }) {
  const { error } = await supabase.from("feedbacks").insert({ totem_id: TOTEM_ID, ...values });
  if (error) throw error;
}