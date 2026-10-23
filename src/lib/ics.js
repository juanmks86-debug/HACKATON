// Generación de calendarios .ics y enlace a Google Calendar.
// Portado del HTML original. Todo es puro salvo descargarIcs (que usa el DOM y vive acá por cercanía).

/** 20261027T200000Z */
export function aIcsUtc(fecha) {
  return fecha.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function escaparIcs(valor) {
  return String(valor).replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

/** Pliega líneas a 75 octetos UTF-8 respetando los code points (como pide RFC 5545). */
export function plegarLinea(linea) {
  let resultado = "";
  let octetos = 0;
  for (const caracter of linea) {
    const tamano = new TextEncoder().encode(caracter).length;
    if (octetos + tamano > 75) {
      resultado += "\r\n ";
      octetos = 1;
    }
    resultado += caracter;
    octetos += tamano;
  }
  return resultado;
}

/** Arma el contenido .ics de un evento, con alarma 24 h antes. */
export function construirIcs(evento, ahora = new Date()) {
  const inicio = new Date(evento.startAt);
  const tieneDuracion = Number.isFinite(evento.durationMinutes) && evento.durationMinutes > 0;
  const fin = tieneDuracion ? new Date(inicio.getTime() + evento.durationMinutes * 60000) : null;
  const esDemo = evento.isDemo !== false;
  const descripcion =
    (esDemo
      ? "Evento FICTICIO de demostración de JujuyTech. No corresponde a una actividad confirmada.\n"
      : "Evento publicado en JujuyTech.\n") + (evento.description || "");

  const lineas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//JujuyTech//Calendario//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:evento-" + evento.id + "@jujuytech",
    "DTSTAMP:" + aIcsUtc(ahora),
    "DTSTART:" + aIcsUtc(inicio),
    ...(fin ? ["DTEND:" + aIcsUtc(fin)] : []),
    "SUMMARY:" + escaparIcs((esDemo ? "[DEMO] " : "") + evento.title),
    "DESCRIPTION:" + escaparIcs(descripcion),
    "LOCATION:" + escaparIcs(evento.place + ", Argentina"),
    "STATUS:" + (esDemo ? "TENTATIVE" : "CONFIRMED"),
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:" + escaparIcs("Faltan 24 horas para el evento: " + evento.title),
    "TRIGGER:-PT24H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lineas.map(plegarLinea).join("\r\n") + "\r\n";
}

/** URL de Google Calendar con los datos del evento. Duración propuesta: 1 h si no se conoce. */
export function urlGoogleCalendar(evento) {
  const inicio = new Date(evento.startAt);
  const tieneDuracion = Number.isFinite(evento.durationMinutes) && evento.durationMinutes > 0;
  const fin = new Date(inicio.getTime() + (tieneDuracion ? evento.durationMinutes : 60) * 60000);
  const esDemo = evento.isDemo !== false;
  const parametros = new URLSearchParams({
    action: "TEMPLATE",
    text: (esDemo ? "[DEMO] " : "") + evento.title,
    dates: aIcsUtc(inicio) + "/" + aIcsUtc(fin),
    details:
      (esDemo ? "Evento FICTICIO de demostración. " : "") +
      (!tieneDuracion ? "Hora de finalización no informada: se propone 1 hora editable en Google Calendar. " : "") +
      "Configurá manualmente el aviso de 24 horas.",
    location: evento.place + ", Argentina",
  });
  return "https://calendar.google.com/calendar/render?" + parametros.toString();
}

/** Descarga el .ics en el navegador. Devuelve el nombre del archivo. */
export function descargarIcs(evento) {
  const url = URL.createObjectURL(new Blob([construirIcs(evento)], { type: "text/calendar;charset=utf-8" }));
  const enlace = document.createElement("a");
  const nombre = "jujuytech-evento-" + evento.id + ".ics";
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return nombre;
}
