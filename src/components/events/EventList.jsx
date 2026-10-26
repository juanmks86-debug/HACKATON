import { useEffect, useMemo, useState } from "react";
import EventCard from "./EventCard.jsx";
import { estadoDe } from "../../lib/format.js";

const FILTROS = ["Todos", "Hoy", "Esta semana", "Gratis", "Arte", "Música", "Taller"];

function coincideFiltro(evento, filtro) {
  if (filtro === "Todos") return true;
  const estado = estadoDe(evento);
  const texto = [evento.title, evento.category, evento.description, evento.admissionInfo].join(" ").toLocaleLowerCase("es");
  if (filtro === "Hoy") return estado === "Hoy / próximo";
  if (filtro === "Esta semana") {
    const fecha = new Date(evento.startAt).getTime();
    const ahora = Date.now();
    return fecha >= ahora - 24 * 60 * 60 * 1000 && fecha <= ahora + 7 * 24 * 60 * 60 * 1000;
  }
  if (filtro === "Gratis") return /gratis|gratuito|gratuita/.test(texto);
  if (filtro === "Arte") return /arte|artes|creativ/.test(texto);
  if (filtro === "Música") return /música|musica|sinfon|canto|copla/.test(texto);
  if (filtro === "Taller") return /taller/.test(texto);
  return true;
}

function ordenar(a, b) {
  const estadoA = estadoDe(a);
  const estadoB = estadoDe(b);
  const peso = { "Hoy / próximo": 0, Próximo: 1, Finalizado: 2 };
  return (peso[estadoA] - peso[estadoB]) || (new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
}

/** Agenda responsive: filtros funcionales y grilla de tarjetas horizontales. */
export default function EventList({ eventos, onAsistir, onUbicacion }) {
  const [filtro, setFiltro] = useState("Todos");
  useEffect(() => {
    const cambiarDesdeFooter = (event) => {
      if (FILTROS.includes(event.detail)) setFiltro(event.detail);
    };
    window.addEventListener("agenda-filter", cambiarDesdeFooter);
    return () => window.removeEventListener("agenda-filter", cambiarDesdeFooter);
  }, []);
  const filtrados = useMemo(() => eventos.filter((evento) => coincideFiltro(evento, filtro)).sort(ordenar), [eventos, filtro]);
  const activos = filtrados.filter((evento) => estadoDe(evento) !== "Finalizado");
  const finalizados = filtrados.filter((evento) => estadoDe(evento) === "Finalizado");

  if (!eventos.length) return <p className="text-sm text-gray-600">No hay eventos publicados que coincidan con los filtros.</p>;

  return <div className="agenda-content">
    <div className="agenda-filters" role="group" aria-label="Filtros rápidos de agenda">
      <div className="agenda-chips">{FILTROS.map((opcion) => <button key={opcion} type="button" className={`agenda-chip ${filtro === opcion ? "agenda-chip--active" : ""}`} aria-pressed={filtro === opcion} onClick={() => setFiltro(opcion)}>{opcion}</button>)}</div>
      <span className="agenda-count" aria-live="polite">{filtrados.length} {filtrados.length === 1 ? "actividad" : "actividades"}</span>
    </div>

    {activos.length > 0 ? <div className="agenda-grid">{activos.map((evento) => <EventCard key={evento.id ?? evento.title} evento={evento} onAsistir={onAsistir} onUbicacion={onUbicacion} />)}</div> : <p className="agenda-empty">No hay actividades activas para este filtro.</p>}
    {finalizados.length > 0 && <section className="agenda-finished" aria-labelledby="finalizados-title"><div className="agenda-finished__heading"><span id="finalizados-title">Finalizados</span><span>{finalizados.length}</span></div><div className="agenda-grid">{finalizados.map((evento) => <EventCard key={evento.id ?? evento.title} evento={evento} onAsistir={onAsistir} onUbicacion={onUbicacion} />)}</div></section>}
  </div>;
}
