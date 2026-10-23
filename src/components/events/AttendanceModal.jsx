import { useEffect, useRef, useState } from "react";
import { descargarIcs, urlGoogleCalendar } from "../../lib/ics.js";
import { formatearFecha } from "../../lib/format.js";
import { apiConfigurada, registrarAsistencia } from "../../lib/api.js";

/**
 * Modal "Quiero asistir".
 * La Opción 1 (calendario .ics / Google Calendar) funciona sin backend; la Opción 2
 * (recordatorio por email) depende de la API .NET y se conecta en la Fase 2.
 */
export default function AttendanceModal({ evento, onCerrar }) {
  const [aviso, setAviso] = useState({ texto: "", tono: "" });
  const [email, setEmail] = useState("");
  const [consentimiento, setConsentimiento] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const botonDescarga = useRef(null);

  useEffect(() => {
    if (!evento) return undefined;
    const alPresionar = (e) => {
      if (e.key === "Escape") onCerrar();
    };
    document.addEventListener("keydown", alPresionar);
    botonDescarga.current?.focus();
    setAviso({ texto: "", tono: "" });
    setEmail("");
    setConsentimiento(true);
    setEnviando(false);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [evento, onCerrar]);

  if (!evento) return null;

  const demasiadoTarde = new Date(evento.startAt).getTime() <= Date.now() + 24 * 60 * 60 * 1000;
  const esDemo = evento.isDemo !== false;

  const descargar = () => {
    const nombre = descargarIcs(evento);
    setAviso({
      texto:
        `Archivo ${nombre} descargado. Importalo en tu calendario y verificá la alerta de 24 horas.` +
        (esDemo ? " La fecha es ficticia." : ""),
      tono: "ok",
    });
  };

  const abrirGoogle = () => {
    window.open(urlGoogleCalendar(evento), "_blank", "noopener,noreferrer");
    setAviso({
      texto:
        "Se abrió Google Calendar. Configurá allí el recordatorio de 24 horas." +
        (!(Number.isFinite(evento.durationMinutes) && evento.durationMinutes > 0)
          ? " Como no conocemos la hora de fin, revisá la duración propuesta de 1 hora."
          : ""),
      tono: "ok",
    });
  };

  const registrar = async (e) => {
    e.preventDefault();
    if (!evento.id || esDemo) {
      setAviso({ texto: "La agenda de prueba no se registra en la base real. Podés usar el calendario.", tono: "warn" });
      return;
    }
    setEnviando(true);
    try {
      const data = await registrarAsistencia({ eventId: evento.id, email, reminderConsent: consentimiento });
      setAviso({ texto: data.message || "Asistencia registrada correctamente.", tono: "ok" });
    } catch (error) {
      setAviso({ texto: error.message, tono: "warn" });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="attendance-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div className="w-full max-w-lg max-h-[93vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide font-bold text-emerald-700">JujuyTech · Eventos</p>
            <h2 id="attendance-title" className="text-2xl font-bold mt-1">
              Quiero asistir
            </h2>
          </div>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="rounded-lg p-2 hover:bg-gray-100">
            ✕
          </button>
        </div>

        <p className="font-semibold mt-3">{evento.title}</p>

        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-950 mt-3 space-y-1">
          <p className="font-semibold">🗓 {formatearFecha(evento.startAt)}</p>
          <p>📍 {evento.place}</p>
        </div>

        <div className="mt-4 space-y-3 text-sm text-gray-700">
          <div>
            <p className="font-bold text-gray-900">Descripción</p>
            <p className="mt-1 leading-6">{evento.description || "La actividad no tiene una descripción ampliada publicada todavía."}</p>
          </div>
          {evento.insight && <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-indigo-950"><p className="font-bold text-indigo-800">✦ Dato útil antes de asistir</p><p className="mt-1 text-xs leading-5">{evento.insight}</p></div>}
          <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs sm:grid-cols-2"><p><strong>Organiza:</strong> {evento.organizer || "Por confirmar"}</p><p><strong>Entrada:</strong> {evento.admissionInfo || "Condiciones por confirmar"}</p></div>
          <div className="flex flex-wrap gap-3 text-xs font-semibold"><a href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(evento.place || "San Salvador de Jujuy")}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline underline-offset-2">Ver ubicación en mapa ↗</a>{evento.sourceUrl && <a href={evento.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-700 underline underline-offset-2">Ver publicación de origen ↗</a>}</div>
        </div>

        {esDemo && (
          <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
            <strong>Agenda de prueba:</strong> los eventos de ejemplo no tienen fechas confirmadas; solo las actividades
            con fecha ofrecen calendario y solicitud de email.
          </p>
        )}

        <div className="mt-4 space-y-2">
          <p className="font-bold text-gray-900">
            Opción 1: recibir un aviso desde tu calendario{" "}
            <span className="text-xs font-semibold text-green-700">(funciona ahora)</span>
          </p>
          <p className="text-xs text-gray-600">
            La descarga incluye una alarma 24 horas antes. La aparición de la notificación depende de que tu aplicación
            de calendario importe y respete las alertas del archivo.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              ref={botonDescarga}
              type="button"
              onClick={descargar}
              className="px-4 py-2.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold"
            >
              📅 Descargar calendario (.ics)
            </button>
            <button
              type="button"
              onClick={abrirGoogle}
              className="px-4 py-2.5 rounded-lg border border-indigo-300 hover:bg-indigo-50 text-indigo-800 text-sm font-semibold"
            >
              Abrir en Google Calendar ↗
            </button>
          </div>
        </div>

        {demasiadoTarde && (
          <p role="status" className="rounded-lg bg-amber-50 text-amber-950 border border-amber-200 p-3 mt-4 text-sm">
            Ya no faltan 24 horas para la actividad: no se puede programar un correo anticipado. Podés guardar los datos
            en tu calendario.
          </p>
        )}

        <div className="mt-5 pt-4 border-t border-gray-200">
          <p className="font-bold text-gray-900">
            Opción 2: recibir un email 24 horas antes{" "}
            <span className="text-xs font-semibold text-emerald-700">{apiConfigurada ? "(API conectada)" : "(configuración pendiente)"}</span>
          </p>
          <form className="mt-3 space-y-2" onSubmit={registrar}>
            <label className="block text-sm font-semibold" htmlFor="attendance-email">Email para el recordatorio</label>
            <input id="attendance-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="usuario@ejemplo.com" />
            <label className="flex items-start gap-2 text-xs text-gray-600"><input type="checkbox" checked={consentimiento} onChange={(e) => setConsentimiento(e.target.checked)} className="mt-0.5" />Acepto recibir un recordatorio por email 24 horas antes.</label>
            <button type="submit" disabled={enviando || !apiConfigurada} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{enviando ? "Registrando…" : "Registrar asistencia"}</button>
            {!apiConfigurada && <p className="text-xs text-amber-800">Definí <code>VITE_API_BASE_URL</code> para activar esta opción.</p>}
          </form>
        </div>

        <p role="status" aria-live="polite" className={`text-sm mt-3 ${aviso.tono === "ok" ? "text-indigo-800" : "text-amber-800"}`}>
          {aviso.texto}
        </p>
      </div>
    </div>
  );
}
