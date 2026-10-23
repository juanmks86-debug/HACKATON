import { API_BASE_URL } from "../config.js";

// Sin VITE_API_BASE_URL la app funciona con la vista previa local.
export const apiConfigurada = Boolean(API_BASE_URL);

/** Eventos publicados y futuros. El backend ya filtra por Published / IsDemo / fecha. */
export async function obtenerEventos() {
  const respuesta = await fetch(API_BASE_URL + "/api/events", { headers: { Accept: "application/json" } });
  if (!respuesta.ok) throw new Error("HTTP " + respuesta.status);
  const filas = await respuesta.json();
  if (!Array.isArray(filas)) throw new Error("Respuesta no válida");
  return filas;
}

export async function registrarAsistencia({ eventId, email, reminderConsent, newsConsent = false }) {
  if (!apiConfigurada) throw new Error("La API de recordatorios todavía no está configurada.");
  const respuesta = await fetch(`${API_BASE_URL}/api/attendances`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ eventId, email, reminderConsent, newsConsent }),
  });
  const data = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(data.message || `No se pudo registrar la asistencia (HTTP ${respuesta.status}).`);
  return data;
}
