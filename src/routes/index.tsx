import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bus, Receipt, MessageSquareHeart, ArrowLeft, Home } from "lucide-react";
import { AdBanner } from "@/components/totem/AdBanner";
import { BusFinder } from "@/components/totem/BusFinder";
import { Fares } from "@/components/totem/Fares";
import { Feedback } from "@/components/totem/Feedback";

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
      <div className="font-display text-3xl font-bold">{now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
      <div className="text-sm opacity-80">{now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</div>
    </div>
  );
}

function Totem() {
  const [screen, setScreen] = useState<Screen>("home");
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / 1440, window.innerHeight / 2304));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    if (screen === "home") return;
    let t = setTimeout(() => setScreen("home"), 120000);
    const reset = () => { clearTimeout(t); t = setTimeout(() => setScreen("home"), 120000); };
    window.addEventListener("pointerdown", reset);
    return () => { clearTimeout(t); window.removeEventListener("pointerdown", reset); };
  }, [screen]);

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
        <div className="flex min-h-0 flex-col">
          <header className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-8 bg-primary px-10 py-6 text-primary-foreground">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-foreground text-primary"><Bus className="h-8 w-8" /></div>
              <div>
                <div className="font-display text-3xl font-bold leading-none">OnTime</div>
                <div className="mt-1 text-lg opacity-80">Transporte coletivo de Gravataí</div>
              </div>
            </div>
            <Clock />
          </header>

          {screen !== "home" && screen !== "menu" && (
            <nav className="grid shrink-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-6 border-b px-8 py-4">
              <button onClick={() => setScreen("menu")} className="flex shrink-0 items-center gap-2 rounded-lg bg-secondary px-5 py-3 text-xl font-semibold text-secondary-foreground"><ArrowLeft className="h-6 w-6" /> Voltar</button>
              <div className="grid min-w-0 grid-cols-3 gap-3">
                {menu.map((m) => (
                  <button key={m.id} onClick={() => setScreen(m.id)} className={`min-h-12 rounded-lg px-4 py-2 text-base font-semibold leading-tight ${screen === m.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{m.label}</button>
                ))}
              </div>
            </nav>
          )}

          <main className="min-h-0 flex-1 overflow-hidden p-8">
            {screen === "home" && (
              <div className="grid h-full min-h-0 grid-rows-[auto_1fr_auto] gap-7 py-2">
                <h1 className="font-display text-6xl font-bold leading-[1.2]">Olá! <span className="block text-primary">Como usar o totem</span></h1>
                <ol className="grid min-h-0 grid-cols-2 gap-6">
                  {STEPS.map((s, i) => (
                    <li key={i} className="flex min-h-0 items-center gap-6 rounded-xl border bg-card p-7">
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary font-display text-3xl font-bold text-primary-foreground">{i + 1}</span>
                      <span className="text-2xl leading-snug">{s}</span>
                    </li>
                  ))}
                </ol>
                <button onClick={() => setScreen("menu")} className="rounded-xl bg-primary py-7 font-display text-4xl font-bold text-primary-foreground shadow-sm active:scale-[0.99]">Iniciar</button>
              </div>
            )}
            {screen === "menu" && (
              <div className="grid h-full min-h-0 grid-rows-[auto_1fr] gap-7 py-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-5xl font-bold leading-tight">O que você precisa?</h2>
                  <button onClick={() => setScreen("home")} aria-label="Início" className="rounded-lg border bg-card p-4 text-primary"><Home className="h-7 w-7" /></button>
                </div>
                <div className="grid min-h-0 grid-rows-3 gap-4">
                  {menu.map((m) => (
                    <button key={m.id} onClick={() => setScreen(m.id)} className="group flex min-h-0 items-center gap-8 rounded-xl border-2 border-border bg-card px-10 text-left transition-colors active:border-primary active:bg-accent">
                      <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary"><m.icon className="h-11 w-11" /></span>
                      <span className="font-display text-4xl font-semibold text-foreground">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {screen === "bus" && <BusFinder />}
            {screen === "fares" && <Fares />}
            {screen === "feedback" && <Feedback onDone={() => setScreen("menu")} />}
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
