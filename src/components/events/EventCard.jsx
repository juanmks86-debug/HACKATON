import { estadoDe, formateadorDia, formateadorHora } from "../../lib/format.js";

/** Tarjeta de un evento de la agenda. */
export default function EventCard({ evento, onAsistir, onUbicacion }) {
  const estado = estadoDe(evento);
  const finalizado = estado === "Finalizado";
  const ingreso = evento.admissionInfo || "Condiciones por confirmar";

  return (
    <article className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden flex flex-col">
      {evento.image ? (
        <img
          loading="lazy"
          src={evento.image}
          alt={`Ilustración temática de ${evento.title}`}
          className="h-48 w-full object-cover"
        />
      ) : (
        <div className="h-48 bg-linear-to-br from-orange-300 to-violet-700 flex justify-center items-center text-white font-semibold">
          JujuyTech
        </div>
      )}

      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-900">
            {evento.category || "Cultura"}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              finalizado ? "bg-slate-100 text-slate-700" : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {estado}
          </span>
        </div>

        <div className="rounded-lg border border-slate-200 p-3 bg-slate-50 flex justify-between gap-2 items-center">
          <span className="text-sm font-bold text-slate-900">📆 {formateadorDia.format(new Date(evento.startAt))}</span>
          <span className="text-sm font-bold text-blue-900">🕒 {formateadorHora.format(new Date(evento.startAt))} hs</span>
        </div>

        <h4 className="text-lg font-extrabold text-gray-950 leading-tight">{evento.title}</h4>
        <p className="text-sm text-gray-600">📍 {evento.place}</p>
        <p className="text-sm text-gray-700">{evento.description}</p>
        <p className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-950">
          <strong>Entrada / requisito:</strong> {ingreso}
        </p>

        {evento.insight && (
          <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3 space-y-1">
            <p className="text-xs font-bold text-indigo-800">✦ Dato útil antes de asistir</p>
            <p className="text-xs text-indigo-950">{evento.insight}</p>
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
          {evento.sourceUrl ? (
            <a
              href={evento.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-700 underline underline-offset-2"
            >
              Ver publicación de origen ↗
            </a>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onAsistir(evento)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-lg px-4 py-2"
            >
              {finalizado ? "Consultar actividad" : "✓ Asistir / Calendario"}
            </button>
            <button type="button" onClick={() => onUbicacion(evento)} className="text-sm font-semibold text-blue-700 hover:underline">
              Ubicación →
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
