import { useEffect, useState } from "react";

const ADS = [
  { tag: "Utilidade pública", title: "Vacinação contra a gripe", text: "Procure a unidade de saúde mais próxima. Leve seu documento e cartão SUS.", cls: "bg-success text-success-foreground" },
  { tag: "Comércio local", title: "Padaria Pão da Parada", text: "Café + pão na chapa por R$ 9,90 até as 10h. A 50 metros daqui!", cls: "bg-warning text-warning-foreground" },
  { tag: "Mobilidade", title: "Respeite o assento preferencial", text: "Idosos, gestantes e pessoas com deficiência têm prioridade.", cls: "bg-primary text-primary-foreground" },
  { tag: "Evento", title: "Feira do Produtor no Centro", text: "Todo sábado, das 7h às 13h, na Praça Central de Gravataí.", cls: "bg-ad text-ad-foreground" },
];

export function AdBanner() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % ADS.length), 8000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="relative h-full overflow-hidden">
      {ADS.map((a, k) => (
        <div key={a.title} className={`absolute inset-0 flex flex-col justify-center px-14 transition-opacity duration-1000 ${a.cls} ${k === i ? "opacity-100" : "opacity-0"}`}>
          <span className="mb-5 w-fit rounded-full bg-background/20 px-6 py-3 text-xl font-bold uppercase tracking-widest">{a.tag}</span>
          <h3 className="font-display text-7xl font-bold leading-tight">{a.title}</h3>
          <p className="mt-5 max-w-5xl text-3xl font-medium leading-snug opacity-95">{a.text}</p>
        </div>
      ))}
      <div className="absolute bottom-7 left-14 flex gap-3">
        {ADS.map((_, k) => <span key={k} className={`h-2 rounded-full bg-background/70 transition-all ${k === i ? "w-10" : "w-2 opacity-50"}`} />)}
      </div>
      <span className="absolute right-7 top-6 text-sm uppercase tracking-widest opacity-60">Publicidade</span>
    </div>
  );
}
