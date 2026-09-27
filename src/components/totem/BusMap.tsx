import { useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { busStatus, TOTEM_STOP, type Line } from "@/lib/buses";

mapboxgl.accessToken =
  "pk.eyJ1IjoibWFudXV1MjAwOCIsImEiOiJjbXVrOHNyOTYwdjhiMndxMzVnMnJlOHM2In0.7UdKx37dPYUEr1yrj12gBA";

export default function BusMap({ line }: { line: Line }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!el.current) return;
    const st = busStatus(line);
    const map = new mapboxgl.Map({
      container: el.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: TOTEM_STOP,
      zoom: 12.5,
    });
    const stopEl = document.createElement("div");
    stopEl.className = "totem-stop-marker";
    new mapboxgl.Marker({ element: stopEl }).setLngLat(TOTEM_STOP).addTo(map);
    const busEl = document.createElement("div");
    busEl.className = "totem-bus-marker";
    busEl.textContent = "🚌";
    const bus = new mapboxgl.Marker({ element: busEl }).setLngLat(st.position).addTo(map);

    map.on("load", () => {
      map.addSource("route", {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: st.route } },
      });
      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        paint: { "line-color": "#1d5fd6", "line-width": 6, "line-opacity": 0.8 },
        layout: { "line-cap": "round", "line-join": "round" },
      });
      const b = new mapboxgl.LngLatBounds();
      st.route.forEach((p) => b.extend(p));
      map.fitBounds(b, { padding: 60, duration: 0 });
    });

    const iv = setInterval(() => bus.setLngLat(busStatus(line).position), 5000);
    return () => {
      clearInterval(iv);
      map.remove();
    };
  }, [line]);

  return <div ref={el} className="h-full w-full" />;
}
