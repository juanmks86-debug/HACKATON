import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const JUJUY = [-65.297, -24.185];
const ESTILO = "https://demotiles.maplibre.org/style.json";

export default function MapEvents({ eventos, onAsistir }) {
  const mapNode = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const geolocalizados = useMemo(
    () => eventos.filter((evento) => Number.isFinite(Number(evento.longitude)) && Number.isFinite(Number(evento.latitude))),
    [eventos]
  );

  useEffect(() => {
    if (!mapNode.current || mapRef.current) return undefined;
    const mapa = new maplibregl.Map({ container: mapNode.current, style: ESTILO, center: JUJUY, zoom: 12 });
    mapa.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = mapa;
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      mapa.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const mapa = mapRef.current;
    if (!mapa) return;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = geolocalizados.map((evento) => {
      const node = document.createElement("button");
      node.type = "button";
      node.className = "jt-map-pin";
      node.setAttribute("aria-label", `Ver ${evento.title}`);
      node.innerHTML = '<span class="jt-map-pin-dot"></span>';
      node.addEventListener("click", () => {
        setSeleccionado(evento);
        mapa.flyTo({ center: [Number(evento.longitude), Number(evento.latitude)], zoom: 14 });
      });
      return new maplibregl.Marker({ element: node })
        .setLngLat([Number(evento.longitude), Number(evento.latitude)])
        .addTo(mapa);
    });
    if (geolocalizados.length > 1) {
      const bounds = new maplibregl.LngLatBounds();
      geolocalizados.forEach((evento) => bounds.extend([Number(evento.longitude), Number(evento.latitude)]));
      mapa.fitBounds(bounds, { padding: 80, maxZoom: 14 });
    }
  }, [geolocalizados]);

  return (
    <div className="jt-map-shell">
      <div ref={mapNode} id="event-map" aria-label="Mapa de eventos de Jujuy" />
      <aside className="jt-map-sidebar p-3" aria-label="Eventos ubicados en el mapa">
        <div className="flex items-center justify-between gap-2 mb-2">
          <strong className="text-white text-sm">Agenda en el mapa</strong>
          <span className="text-xs text-slate-300">{geolocalizados.length} ubicados</span>
        </div>
        <div className="overflow-y-auto space-y-2">
          {eventos.map((evento) => (
            <button
              type="button"
              key={evento.id ?? evento.title}
              className="jt-map-card"
              aria-pressed={seleccionado?.id === evento.id}
              onClick={() => {
                setSeleccionado(evento);
                if (Number.isFinite(Number(evento.longitude)) && Number.isFinite(Number(evento.latitude))) {
                  mapRef.current?.flyTo({ center: [Number(evento.longitude), Number(evento.latitude)], zoom: 14 });
                }
              }}
            >
              {evento.image && <img className="jt-map-image" src={evento.image} alt="" />}
              <span className="jt-map-card-content">
                <strong>{evento.title}</strong>
                <small>{evento.place}</small>
                {evento.isDemo !== false && <span className="jt-map-demo">Vista previa</span>}
              </span>
            </button>
          ))}
          {!eventos.length && <p className="text-xs text-slate-300 p-2">No hay eventos para mostrar.</p>}
        </div>
      </aside>
      {seleccionado && (
        <div className="jt-map-popup absolute z-20 right-4 bottom-4">
          <button type="button" className="absolute right-2 top-1 text-xl" onClick={() => setSeleccionado(null)} aria-label="Cerrar">×</button>
          {seleccionado.image && <img src={seleccionado.image} alt="" />}
          <p className="jt-map-popup-title">{seleccionado.title}</p>
          <p>{seleccionado.place}</p>
          <button type="button" className="jt-map-popup-button" onClick={() => onAsistir(seleccionado)}>Ver asistencia y calendario</button>
        </div>
      )}
      <p className="jt-map-status">Los marcadores dependen de coordenadas verificadas; los demás eventos quedan disponibles en la agenda.</p>
    </div>
  );
}
