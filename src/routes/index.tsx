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
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="flex h-screen w-full max-w-[min(100vw,56.25vh)] flex-col overflow-hidden bg-background shadow-2xl" style={{ aspectRatio: "9 / 16" }}>
        <div className="flex h-2/3 flex-col">
          <header className="flex items-center justify-between bg-primary px-6 py-4 text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground text-primary"><Bus className="h-7 w-7" /></div>
              <div>
                <div className="font-display text-2xl font-bold leading-none">OnTime</div>
                <div className="text-sm opacity-80">Transporte coletivo de Gravataí</div>
              </div>
            </div>
            <Clock />
          </header>

          {screen !== "home" && screen !== "menu" && (
            <nav className="flex gap-2 border-b px-6 py-3">
              <button onClick={() => setScreen("menu")} className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-lg font-semibold text-secondary-foreground"><ArrowLeft className="h-5 w-5" /> Voltar</button>
              <div className="flex flex-1 justify-end gap-2">
                {menu.map((m) => (
                  <button key={m.id} onClick={() => setScreen(m.id)} className={`rounded-xl px-3 py-2 text-sm font-semibold ${screen === m.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{m.label}</button>
                ))}
              </div>
            </nav>
          )}

          <main className="min-h-0 flex-1 p-6">
            {screen === "home" && (
              <div className="flex h-full flex-col justify-center gap-6">
                <div>
                  <h1 className="font-display text-5xl font-bold leading-tight">Olá! <span className="text-primary">Como usar o totem</span></h1>
                </div>
                <ol className="space-y-3">
                  {STEPS.map((s, i) => (
                    <li key={i} className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary font-display text-2xl font-bold text-primary-foreground">{i + 1}</span>
                      <span className="text-xl">{s}</span>
                    </li>
                  ))}
                </ol>
                <button onClick={() => setScreen("menu")} className="animate-pulse rounded-3xl bg-primary py-6 font-display text-4xl font-bold text-primary-foreground shadow-lg">Iniciar</button>
              </div>
            )}
            {screen === "menu" && (
              <div className="flex h-full flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-3xl font-bold">O que você precisa?</h2>
                  <button onClick={() => setScreen("home")} aria-label="Início" className="rounded-xl bg-secondary p-3"><Home /></button>
                </div>
                {menu.map((m) => (
                  <button key={m.id} onClick={() => setScreen(m.id)} className="flex flex-1 items-center gap-6 rounded-3xl bg-primary px-8 text-left text-primary-foreground shadow-lg active:scale-[0.98]">
                    <m.icon className="h-16 w-16 shrink-0" />
                    <span className="font-display text-3xl font-bold">{m.label}</span>
                  </button>
                ))}
              </div>
            )}
            {screen === "bus" && <BusFinder />}
            {screen === "fares" && <Fares />}
            {screen === "feedback" && <Feedback onDone={() => setScreen("menu")} />}
          </main>
        </div>
        <div className="h-1/3 border-t-4 border-primary">
          <AdBanner />
        </div>
      </div>
    </div>
  );
}
