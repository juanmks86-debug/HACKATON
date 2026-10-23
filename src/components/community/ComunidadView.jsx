import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import EventList from "../events/EventList.jsx";
import FeaturedCarousel from "../events/FeaturedCarousel.jsx";
import AttendanceModal from "../events/AttendanceModal.jsx";
import MapEvents from "../events/MapEvents.jsx";
import { ETIQUETA_PERIODO, PERIODOS, filtrarEventos } from "../../lib/format.js";

const TONO = {
  ambar: "rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-950",
  info: "rounded-xl bg-blue-50 border border-blue-200 p-3 text-sm text-blue-900",
  ok: "rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-900",
  error: "rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-900",
};

const CHIP = "bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-full text-xs md:text-sm font-medium border border-white/30 text-white";

/** Portal Comunidad: hero con filtros, destacados, mapa (Fase 2) y agenda con búsqueda. */
export default function ComunidadView({ eventos, mensaje }) {
  const [periodo, setPeriodo] = useState("all");
  const [consulta, setConsulta] = useState("");
  const [seleccionado, setSeleccionado] = useState(null);

  const visibles = useMemo(() => filtrarEventos(eventos, periodo, consulta), [eventos, periodo, consulta]);

  const irAlMapa = () => document.getElementById("mapa-eventos")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <section id="view-community" className="space-y-8">
      {/* Gancho y filtro horario */}
      <div className="bg-linear-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 md:p-8 text-white shadow-xl">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-2">Descubrí eventos en Jujuy</h2>
          <p className="text-amber-100 text-sm md:text-base mb-6">
            Explorá actividades culturales, ferias y talleres. Los eventos de esta versión son ejemplos, no una agenda
            actualizada.
          </p>

          <a
            href="#mapa-eventos"
            className="inline-flex items-center rounded-lg bg-white px-4 py-2.5 text-sm font-extrabold text-orange-800 shadow hover:bg-orange-50 mb-5"
          >
            📍 Explorar mapa 3D de eventos →
          </a>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs uppercase font-bold tracking-wider self-center mr-2">Filtrar por horario:</span>
            {PERIODOS.map((valor) => (
              <button
                key={valor}
                type="button"
                onClick={() => setPeriodo(valor)}
                aria-pressed={periodo === valor}
                className={`${CHIP} ${periodo === valor ? "ring-2 ring-white" : ""}`}
              >
                {ETIQUETA_PERIODO[valor]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Novedades por WhatsApp */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-emerald-950">📣 Novedades de eventos en WhatsApp</h3>
          <p className="text-sm text-emerald-900 mt-1">
            Próximamente podrás seguir el canal de difusión de JujuyTech. La publicación automática en Canales no está
            disponible en la API oficial de WhatsApp: esta integración requiere definir un procedimiento de publicación
            compatible.
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-emerald-400 text-emerald-800 font-semibold text-xs px-3 py-1">
          Próximamente
        </span>
      </div>

      {/* Estado de los datos */}
      <div id="events-data-status" role="status" aria-live="polite" className={TONO[mensaje.tono] || TONO.ambar}>
        {mensaje.texto}
      </div>

      <FeaturedCarousel eventos={eventos} />

      {/* Mapa interactivo React */}
      <section id="mapa-eventos" className="space-y-4 scroll-mt-24" aria-labelledby="map-section-title">
        <div className="flex flex-wrap justify-between items-end gap-3">
          <div>
            <span className="inline-flex px-3 py-1 mb-2 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
              📍 Mapa interactivo de Jujuy
            </span>
            <h3 id="map-section-title" className="text-2xl font-extrabold text-gray-900">
              Explorá eventos en el mapa 3D
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Elegí un evento desde el panel o tocá un marcador para conocer su ubicación. Los ejemplos sin fechas
              confirmadas están identificados.
            </p>
          </div>
          <a
            className="text-sm font-semibold text-emerald-800 underline underline-offset-2"
            href="https://www.openstreetmap.org/#map=14/-24.1858/-65.2995"
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir OpenStreetMap ↗
          </a>
        </div>

        <MapEvents eventos={visibles} onAsistir={setSeleccionado} />
      </section>

      {/* Agenda */}
      <section aria-labelledby="agenda-title" className="space-y-4">
        <h3 id="agenda-title" className="text-xl font-extrabold text-gray-900">
          Agenda de actividades
        </h3>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-2">
          <Search className="w-5 h-5 text-gray-400 self-center" aria-hidden="true" />
          <input
            type="text"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            placeholder="Buscar por evento, barrio, taller o rubro..."
            className="w-full focus:outline-none text-sm"
            aria-label="Buscar eventos"
          />
        </div>
        <p className="text-xs text-gray-500">
          Las sugerencias mostradas son consejos prácticos basados en la programación publicada, no predicciones de
          Machine Learning.
        </p>
        <EventList eventos={visibles} onAsistir={setSeleccionado} onUbicacion={irAlMapa} />
      </section>

      <AttendanceModal evento={seleccionado} onCerrar={() => setSeleccionado(null)} />
    </section>
  );
}
