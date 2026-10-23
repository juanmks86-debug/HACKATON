import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const JUJUY = [-65.297, -24.185];
const ESTILO = "https://tiles.openfreemap.org/styles/liberty";

function agregarEdificios3d(mapa) {
  const estilo = mapa.getStyle();
  const capas = estilo.layers || [];
  const yaExiste = capas.some((capa) => capa.id === "jujuy-buildings-3d");
  if (yaExiste) return;

  const sourceId = Object.keys(estilo.sources || {}).find((id) => id.toLowerCase().includes("openmaptiles"));
  if (!sourceId) return false;

  const antesDe = capas.find((capa) => capa.type === "symbol" && capa.layout?.["text-field"])?.id;
  mapa.addLayer(
    {
      id: "jujuy-buildings-3d",
      type: "fill-extrusion",
      source: sourceId,
      "source-layer": "building",
      minzoom: 11.5,
      paint: {
        "fill-extrusion-color": ["interpolate", ["linear"], ["zoom"], 14, "#cbd5e1", 16, "#94a3b8"],
        "fill-extrusion-height": ["coalesce", ["get", "render_height"], ["get", "height"], 8],
        "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], ["get", "min_height"], 0],
        "fill-extrusion-opacity": 0.86,
      },
    },
    antesDe,
  );
  return true;
}

export default function MapEvents({ eventos, onAsistir, modoNocturno = false }) {
  const mapNode = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [mapaError, setMapaError] = useState(false);
  const [modeloLocalVisible, setModeloLocalVisible] = useState(true);
  const geolocalizados = useMemo(
    () => eventos.filter((evento) => Number.isFinite(Number(evento.longitude)) && Number.isFinite(Number(evento.latitude))),
    [eventos]
  );

  useEffect(() => {
    if (!mapNode.current || mapRef.current) return undefined;
    const mapa = new maplibregl.Map({
      container: mapNode.current,
      style: ESTILO,
      center: JUJUY,
      zoom: 13.5,
      pitch: 48,
      bearing: -12,
      maxPitch: 70,
    });
    mapa.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    mapa.addControl(new maplibregl.FullscreenControl(), "top-right");
    mapa.on("error", () => setMapaError(true));
    mapa.on("load", () => {
      try {
        if (!agregarEdificios3d(mapa)) setMapaError(true);
      } catch {
        setMapaError(true);
      }
    });
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
        mapa.flyTo({ center: [Number(evento.longitude), Number(evento.latitude)], zoom: 15, pitch: 55, duration: 800 });
      });
      return new maplibregl.Marker({ element: node })
        .setLngLat([Number(evento.longitude), Number(evento.latitude)])
        .addTo(mapa);
    });
    if (geolocalizados.length > 1) {
      const bounds = new maplibregl.LngLatBounds();
      geolocalizados.forEach((evento) => bounds.extend([Number(evento.longitude), Number(evento.latitude)]));
      mapa.fitBounds(bounds, { padding: 80, maxZoom: 15, pitch: 45, duration: 800 });
    }
  }, [geolocalizados]);

  return (
    <div className={`jt-map-shell ${modoNocturno ? "jt-map-night" : ""}`}>
      <div ref={mapNode} id="event-map" aria-label="Mapa 3D de eventos de Jujuy" />
      {modeloLocalVisible && <div className={`jt-city-fallback jt-city-fallback-overlay ${mapaError ? "jt-city-fallback-error" : ""}`} aria-label="Estructura 3D demostrativa de San Salvador de Jujuy">
        <div className="jt-city-fallback-title"><strong>Estructura 3D de la ciudad</strong><span>Vista local de respaldo</span></div>
        <div className="jt-city-ground">
          {[42, 72, 112, 152, 196, 238, 284, 330, 378, 424, 472, 520, 570, 620].map((x, indice) => <span key={x} className="jt-city-building" style={{ left: `${x}px`, height: `${54 + (indice % 5) * 22}px`, width: `${28 + (indice % 3) * 12}px`, animationDelay: `${indice * 35}ms` }}><i /></span>)}
          <span className="jt-city-road road-one" /><span className="jt-city-road road-two" /><span className="jt-city-park">Culturarte</span>
        </div>
        <p className="jt-city-fallback-note">Modelo urbano visible sobre el mapa. Ocultalo para explorar las calles y los marcadores reales.</p>
      </div>}
      <button type="button" className="jt-map-tool jt-city-toggle" onClick={() => setModeloLocalVisible((valor) => !valor)}>{modeloLocalVisible ? "Ocultar ciudad 3D" : "Mostrar ciudad 3D"}</button>
      <aside className="jt-map-sidebar p-3" aria-label="Eventos ubicados en el mapa">
        <div className="flex items-center justify-between gap-2 mb-2">
          <strong className="text-white text-sm">Agenda en el mapa 3D</strong>
          <span className="text-xs text-slate-300">{geolocalizados.length} ubicados</span>
        </div>
        <div className="overflow-y-auto space-y-2">
          {eventos.map((evento) => (
            <button type="button" key={evento.id ?? evento.title} className="jt-map-card" aria-pressed={seleccionado?.id === evento.id} onClick={() => {
              setSeleccionado(evento);
              if (Number.isFinite(Number(evento.longitude)) && Number.isFinite(Number(evento.latitude))) mapRef.current?.flyTo({ center: [Number(evento.longitude), Number(evento.latitude)], zoom: 15, pitch: 55 });
            }}>
              {evento.image && <img className="jt-map-image" src={evento.image} alt="" />}
              <span className="jt-map-card-content"><strong>{evento.title}</strong><small>{evento.place}</small>{evento.isDemo !== false && <span className="jt-map-demo">Vista previa</span>}</span>
            </button>
          ))}
          {!eventos.length && <p className="text-xs text-slate-300 p-2">No hay eventos para mostrar.</p>}
        </div>
      </aside>
      {seleccionado && <div className="jt-map-popup absolute z-20 right-4 bottom-4">
        <button type="button" className="absolute right-2 top-1 text-xl" onClick={() => setSeleccionado(null)} aria-label="Cerrar">×</button>
        {seleccionado.image && <img src={seleccionado.image} alt="" />}
        <p className="jt-map-popup-title">{seleccionado.title}</p><p>{seleccionado.place}</p>
        <button type="button" className="jt-map-popup-button" onClick={() => onAsistir(seleccionado)}>Ver asistencia y calendario</button>
      </div>}
      <p className="jt-map-status">Mapa 3D con edificios extruidos. Girá la vista con Ctrl + arrastre o con los controles.</p>
    </div>
  );
}
