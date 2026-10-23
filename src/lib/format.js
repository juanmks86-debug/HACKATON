// Utilidades puras de fechas y de normalización de eventos.
// Portadas del HTML original (index.html, bloques <script>), sin cambios de comportamiento.
// Son puras a propósito: se pueden testear con `npm test` sin navegador.
import { ZONA_HORARIA } from "../config.js";

export const PERIODOS = ["all", "Manana", "Tarde", "Noche"];

export const ETIQUETA_PERIODO = {
  all: "Todos",
  Manana: "🌅 Mañana",
  Tarde: "☀️ Tarde",
  Noche: "🌙 Noche",
};

export const formateadorDia = new Intl.DateTimeFormat("es-AR", {
  timeZone: ZONA_HORARIA,
  weekday: "short",
  day: "2-digit",
  month: "short",
});

export const formateadorHora = new Intl.DateTimeFormat("es-AR", {
  timeZone: ZONA_HORARIA,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const formateadorHora24 = new Intl.DateTimeFormat("en-GB", {
  timeZone: ZONA_HORARIA,
  hour: "2-digit",
  hourCycle: "h23",
});

const formateadorLargo = new Intl.DateTimeFormat("es-AR", {
  timeZone: ZONA_HORARIA,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Manana | Tarde | Noche, según la hora local de Jujuy. */
export function periodoDe(iso) {
  const hora = Number(formateadorHora24.format(new Date(iso)));
  return hora < 12 ? "Manana" : hora < 20 ? "Tarde" : "Noche";
}

/** Finalizado | Hoy / próximo | Próximo. `ahora` es inyectable para poder testear. */
export function estadoDe(evento, ahora = Date.now()) {
  const arranque = new Date(evento.startAt).getTime();
  if (arranque < ahora) return "Finalizado";
  return arranque <= ahora + 24 * 60 * 60 * 1000 ? "Hoy / próximo" : "Próximo";
}

export function formatearFecha(iso) {
  return formateadorLargo.format(new Date(iso)) + " h (Jujuy)";
}

/**
 * Normaliza un evento, venga de Supabase (camelCase/PascalCase) o de la vista previa local.
 * Misma lógica que decorateEvent() del HTML original.
 */
export function decorateEvent(evento) {
  // Se aceptan camelCase (lo que devuelve la API .NET) y PascalCase (datos crudos de Supabase).
  const arranque = evento.startsAtUtc || evento.startAt || evento.StartsAtUtc || evento.StartAt;
  return {
    ...evento,
    period: periodoDe(arranque),
    bus: evento.bus || "Sin información oficial",
    price: evento.admissionInfo || "No informado",
    views: 0,
    insight: evento.visitorTip || evento.VisitorTip || evento.insight || "",
    description: evento.description || "",
    image: (evento.imageUrl || evento.ImageUrl || evento.image || "").replace(/^\/assets\//, "assets/"),
    place: evento.location || evento.Location || evento.place || "",
    startAt: arranque,
    latitude: evento.latitude ?? evento.Latitude ?? null,
    longitude: evento.longitude ?? evento.Longitude ?? null,
    geoSource: evento.geoSource ?? evento.GeoSource ?? null,
  };
}

const textoBuscable = (evento) =>
  [evento.title, evento.category, evento.place, evento.description, evento.organizer, evento.admissionInfo]
    .join(" ")
    .toLocaleLowerCase("es");

/** Filtra por franja horaria y por texto libre (título, categoría, lugar, descripción, organizador). */
export function filtrarEventos(eventos, periodo = "all", consulta = "") {
  const q = String(consulta).trim().toLocaleLowerCase("es");
  return eventos.filter((evento) => {
    const pasaPeriodo = periodo === "all" || evento.period === periodo;
    return pasaPeriodo && textoBuscable(evento).includes(q);
  });
}
