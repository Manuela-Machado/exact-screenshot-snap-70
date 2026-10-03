import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bus, Receipt, MessageSquareHeart, ArrowLeft, Home } from "lucide-react";
import { AdBanner } from "@/components/totem/AdBanner";
import { BusFinder } from "@/components/totem/BusFinder";
import { Fares } from "@/components/totem/Fares";
import { Feedback } from "@/components/totem/Feedback";
import { loadCatalog, LOCAL_CATALOG } from "@/lib/ontime-data";
import { LINES } from "@/lib/schedule";
import { TOTEM_LOCATION } from "@/config/totem";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OnTime Gravataí — Totem da Parada" },
      { name: "description", content: "Consulte onde está seu ônibus, tarifas e envie feedback sobre o transporte coletivo de Gravataí." },
      { property: "og:title", content: "OnTime Gravataí — Totem da Parada" },
      { property: "og:description", content: "Ônibus em tempo real, tarifas e feedback do transporte coletivo de Gravataí." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Totem,
});

type Screen = "home" | "menu" | "bus" | "fares" | "feedback";
const STEPS = [
  "Escolha a opção “Onde está meu ônibus?” para consultar as linhas disponíveis.",
  "Veja a rota em tempo real no mapa.",
  "Acesse “Alterações e tarifas” para consultar preços e horários.",
  "Use a aba “Feedbacks” para compartilhar sua experiência.",
];

function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(t);
  }, []);
  if (!now) return <span className="w-20" />;
  return (
    <div className="text-right">
      <div className="font-display text-5xl font-bold leading-none">{now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
      <div className="mt-2 text-xl font-semibold opacity-90">{now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</div>
    </div>
  );
}

function Totem() {
  const [screen, setScreen] = useState<Screen>("home");
  const [scale, setScale] = useState(1);
  const { data: catalog = LOCAL_CATALOG } = useQuery({ queryKey: ["ontime-catalog"], queryFn: loadCatalog, staleTime: 5 * 60_000, refetchInterval: 5 * 60_000 });

  useEffect(() => {
    LINES.splice(0, LINES.length, ...catalog.lines);
    Object.assign(TOTEM_LOCATION, catalog.totem);
  }, [catalog]);

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / 1440, window.innerHeight / 2304));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const goHome = useCallback(() => setScreen("home"), []);
  useEffect(() => {
    if (screen === "home") return;
    let t = setTimeout(goHome, 60000);
    const reset = () => { clearTimeout(t); t = setTimeout(goHome, 60000); };
    window.addEventListener("pointerdown", reset);
    return () => { clearTimeout(t); window.removeEventListener("pointerdown", reset); };
  }, [screen, goHome]);

  const menu = [
    { id: "bus" as const, label: "Onde está meu ônibus?", icon: Bus },
    { id: "fares" as const, label: "Alterações e tarifas", icon: Receipt },
    { id: "feedback" as const, label: "Feedback", icon: MessageSquareHeart },
  ];

  return (
    <div className="flex h-screen w-screen justify-center overflow-hidden bg-muted">
      <div style={{ width: 1440 * scale, height: 2304 * scale }}>
      <div
        className="grid h-[2304px] w-[1440px] grid-rows-[3fr_1fr] overflow-hidden bg-background shadow-2xl"
        style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        <div className="relative flex min-h-0 flex-col">
          <header className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-10 bg-primary px-12 py-8 text-primary-foreground">
            <div className="flex min-w-0 items-center gap-6">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground text-primary"><Bus className="h-14 w-14" /></div>
              <div>
                <div className="font-display text-5xl font-bold leading-none">OnTime</div>
                <div className="mt-3 text-2xl font-semibold opacity-90">Transporte coletivo de Gravataí</div>
              </div>
            </div>
            <Clock />
          </header>

          {screen !== "home" && screen !== "menu" && (
            <nav className="grid shrink-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-b px-4 py-3">
              <button onClick={() => setScreen("menu")} className="flex min-h-24 shrink-0 items-center gap-3 rounded-xl bg-secondary px-7 text-3xl font-bold text-secondary-foreground"><ArrowLeft className="h-9 w-9" /> Voltar</button>
              <div className="grid min-w-0 grid-cols-3 gap-3">
                {menu.map((m) => (
                  <button key={m.id} onClick={() => setScreen(m.id)} className={`min-h-24 rounded-xl px-3 text-2xl font-bold leading-tight ${screen === m.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{m.label}</button>
                ))}
              </div>
            </nav>
          )}

          <main className={`min-h-0 flex-1 overflow-hidden ${screen === "home" ? "p-10" : "p-4"}`}>
            {screen === "home" && (
              <div className="grid h-full min-h-0 grid-rows-[auto_1fr_auto] gap-8 py-2">
                <h1 className="font-display text-7xl font-bold leading-[1.15]">Olá! <span className="block text-primary">Como usar o totem?</span></h1>
                <ol className="grid min-h-0 grid-rows-4 gap-5">
                  {STEPS.map((s, i) => (
                    <li key={i} className="flex min-h-0 items-center gap-8 rounded-2xl border-2 bg-card px-10 py-6">
                      <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-primary font-display text-5xl font-bold text-primary-foreground">{i + 1}</span>
                      <span className="text-4xl font-semibold leading-snug">{s}</span>
                    </li>
                  ))}
                </ol>
                <button onClick={() => setScreen("menu")} className="rounded-2xl bg-primary py-9 font-display text-5xl font-bold text-primary-foreground shadow-sm active:scale-[0.99]">Iniciar</button>
              </div>
            )}
            {screen === "menu" && (
              <div className="grid h-full min-h-0 grid-rows-[auto_1fr] gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-7xl font-bold leading-tight">O que você precisa?</h2>
                  <button onClick={() => setScreen("home")} aria-label="Início" className="flex h-28 w-28 items-center justify-center rounded-2xl border-2 bg-card text-primary"><Home className="h-14 w-14" /></button>
                </div>
                <div className="grid min-h-0 grid-rows-[45fr_55fr] gap-4">
                  {[menu.slice(0, 1), menu.slice(1)].map((row, ri) => (
                    <div key={ri} className={`grid min-h-0 gap-4 ${ri ? "grid-cols-2" : ""}`}>
                      {row.map((m) => (
                        <button key={m.id} onClick={() => setScreen(m.id)} className="flex min-h-0 flex-col items-center justify-center gap-8 rounded-3xl border-2 border-border bg-card px-8 text-center transition-colors active:border-primary active:bg-accent">
                          <span className={`flex shrink-0 items-center justify-center rounded-3xl bg-secondary text-primary ${ri ? "h-40 w-40" : "h-52 w-52"}`}><m.icon className={ri ? "h-24 w-24" : "h-32 w-32"} /></span>
                          <span className={`font-display font-bold leading-tight text-foreground ${ri ? "text-6xl" : "text-7xl"}`}>{m.label}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {screen === "bus" && <BusFinder />}
            {screen === "fares" && <Fares groups={catalog.fareGroups} municipalFare={catalog.municipalFare} notice={catalog.notice} />}
            {screen === "feedback" && <Feedback categories={catalog.feedback} onDone={() => setScreen("menu")} onHome={goHome} />}
          </main>
        </div>
        <div className="min-h-0 border-t-4 border-primary">
          <AdBanner />
        </div>
      </div>
      </div>
    </div>
  );
}
