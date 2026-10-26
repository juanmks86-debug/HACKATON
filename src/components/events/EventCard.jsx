import { CalendarDays, Clock3, MapPin, Ticket } from "lucide-react";
import { estadoDe, formateadorDia, formateadorHora } from "../../lib/format.js";

function etiquetaEstado(estado) {
  if (estado === "Hoy / próximo") return "Hoy";
  if (estado === "Finalizado") return "Finalizado";
  return "Próximo";
}

/** Tarjeta horizontal de un evento. Conserva los callbacks existentes. */
export default function EventCard({ evento, onAsistir, onUbicacion }) {
  const estado = estadoDe(evento);
  const finalizado = estado === "Finalizado";
  const ingreso = evento.admissionInfo || "Condiciones por confirmar";
  const lugarCorto = evento.place?.split(",").slice(0, 2).join(" · ") || "Ubicación por confirmar";

  return <article className={`agenda-card ${finalizado ? "agenda-card--finished" : ""}`}>
    <div className="agenda-card__media">
      {evento.image ? <img loading="lazy" src={evento.image} alt={`Ilustración temática de ${evento.title}`} /> : <div className="agenda-card__placeholder">JujuyTech</div>}
      <div className="agenda-card__media-overlay" />
      <span className={`agenda-card__badge agenda-card__badge--${finalizado ? "finished" : estado === "Hoy / próximo" ? "today" : "next"}`}>{etiquetaEstado(estado)}</span>
    </div>
    <div className="agenda-card__body">
      <p className="agenda-card__category">{evento.category || "Cultura"}</p>
      <h4 className="agenda-card__title">{evento.title}</h4>
      <div className="agenda-card__meta"><span><CalendarDays aria-hidden="true" />{formateadorDia.format(new Date(evento.startAt))}</span><span><Clock3 aria-hidden="true" />{formateadorHora.format(new Date(evento.startAt))} hs</span></div>
      <p className="agenda-card__place"><MapPin aria-hidden="true" />{lugarCorto}</p>
      <p className="agenda-card__price"><Ticket aria-hidden="true" />{ingreso}</p>
      <div className="agenda-card__actions">
        <button type="button" className="agenda-card__details" onClick={() => onAsistir(evento)}>Ver detalles <span aria-hidden="true">↗</span></button>
        <button type="button" className="agenda-card__location" onClick={() => onUbicacion?.(evento)}>Mapa</button>
      </div>
    </div>
  </article>;
}
