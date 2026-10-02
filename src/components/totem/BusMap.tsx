import { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { TOTEM, type LngLat } from "@/lib/buses";

mapboxgl.accessToken =
  "pk.eyJ1IjoibWFudXV1MjAwOCIsImEiOiJjbXVrOHNyOTYwdjhiMndxMzVnMnJlOHM2In0.7UdKx37dPYUEr1yrj12gBA";

type Props = {
  geometry: LngLat[] | null;
  start: LngLat | null;
  end: LngLat | null;
  bus: LngLat | null;
  dest?: LngLat | null;
  alight?: LngLat | null;
  failed: boolean;
  loading: boolean;
};

const mk = (cls: string, html = "") => {
  const e = document.createElement("div");
  e.className = cls;
  e.innerHTML = html;
  return e;
};

export default function BusMap({ geometry, start, end, bus, dest, alight, failed, loading }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const busRef = useRef<mapboxgl.Marker | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!el.current) return;
    const map = new mapboxgl.Map({ container: el.current, style: "mapbox://styles/mapbox/streets-v12", center: TOTEM, zoom: 13 });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    new mapboxgl.Marker({ element: mk("totem-here", '<span class="totem-here-dot"></span><span class="totem-here-label">Você está aqui</span>'), anchor: "bottom" })
      .setLngLat(TOTEM).addTo(map);
    map.on("load", () => {
      map.addSource("route", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({ id: "route", type: "line", source: "route", paint: { "line-color": "#1d5fd6", "line-width": 6, "line-opacity": 0.9 }, layout: { "line-cap": "round", "line-join": "round" } });
      map.resize();
      setReady(true);
    });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    (map.getSource("route") as mapboxgl.GeoJSONSource).setData(
      geometry ? { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: geometry } } : { type: "FeatureCollection", features: [] },
    );
    markers.current.forEach((m) => m.remove());
    markers.current = [];
    const add = (p: LngLat | null | undefined, cls: string, html = "") => {
      if (p) markers.current.push(new mapboxgl.Marker({ element: mk(cls, html) }).setLngLat(p).addTo(map));
    };
    add(start, "totem-pt totem-pt-start", "Início");
    add(end, "totem-pt totem-pt-end", "Fim");
    add(alight, "totem-pt totem-pt-alight", "Desça aqui");
    add(dest, "totem-pt totem-pt-dest", "Destino");
    const b = new mapboxgl.LngLatBounds(TOTEM, TOTEM);
    (geometry ?? []).forEach((p) => b.extend(p));
    [start, end, dest, alight].forEach((p) => p && b.extend(p));
    map.resize();
    map.fitBounds(b, { padding: 90, duration: 0, maxZoom: 15 });
  }, [ready, geometry, start, end, dest, alight]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    if (!bus) { busRef.current?.remove(); busRef.current = null; return; }
    if (!busRef.current) busRef.current = new mapboxgl.Marker({ element: mk("totem-bus-marker", "🚌") }).setLngLat(bus).addTo(map);
    else busRef.current.setLngLat(bus);
  }, [ready, bus]);

  return (
    <div className="relative h-full w-full">
      <div ref={el} className="h-full w-full" />
      {(loading || failed) && (
        <div className="pointer-events-none absolute left-4 top-4 rounded-lg bg-card/95 px-5 py-3 text-2xl font-semibold text-muted-foreground shadow">
          {loading ? "Carregando traçado…" : "Traçado pelas ruas indisponível agora."}
        </div>
      )}
    </div>
  );
}
