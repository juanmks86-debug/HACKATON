import { useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
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

const CHIP = "bg-slate-950/30 hover:bg-slate-950/50 backdrop-blur-md px-3 py-1.5 rounded-full text-xs md:text-sm font-medium border border-white/30 text-white";

export default function ComunidadView({ eventos, mensaje, modoNocturno = false }) {
  const [periodo, setPeriodo] = useState("all");
  const [consulta, setConsulta] = useState("");
  const [seleccionado, setSeleccionado] = useState(null);
  const visibles = useMemo(() => filtrarEventos(eventos, periodo, consulta), [eventos, periodo, consulta]);
  const irAlMapa = () => document.getElementById("mapa-eventos")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <section id="top" className="space-y-8">
      <section className="relative isolate overflow-hidden rounded-3xl bg-slate-900 shadow-xl" aria-labelledby="hero-title">
        <img src="/assets/hero-hornocal.jfif" alt="Serranía del Hornocal, Jujuy" className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-orange-800/95 via-orange-700/75 to-red-700/35" />
        <div className="relative max-w-3xl p-7 text-white md:p-12">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-orange-100">JujuyTech · Cultura y comunidad</p>
          <h2 id="hero-title" className="text-3xl font-extrabold leading-tight md:text-5xl">Descubrí eventos en Jujuy</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-orange-50 md:text-base">Explorá actividades culturales, ferias y talleres. Los eventos de esta versión son ejemplos, no una agenda actualizada.</p>
          <a href="#mapa-eventos" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-slate-900 shadow-lg transition hover:bg-orange-50"><MapPin className="h-5 w-5 text-red-600" aria-hidden="true" />Explorar mapa 3D de eventos →</a>
          <div className="mt-7 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-bold uppercase tracking-wider text-orange-50">Filtrar por horario:</span>
            {PERIODOS.map((valor) => <button key={valor} type="button" onClick={() => setPeriodo(valor)} aria-pressed={periodo === valor} className={`${CHIP} ${periodo === valor ? "ring-2 ring-white" : ""}`}>{ETIQUETA_PERIODO[valor]}</button>)}
          </div>
        </div>
      </section>

      <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 md:flex-row md:items-center">
        <div><h3 className="font-bold text-emerald-950">📣 Novedades de eventos en WhatsApp</h3><p className="mt-1 text-sm text-emerald-900">Próximamente podrás seguir el canal de difusión de JujuyTech. La publicación automática todavía requiere definir un procedimiento compatible.</p></div>
        <span className="shrink-0 rounded-full border border-emerald-400 px-3 py-1 text-xs font-semibold text-emerald-800">Próximamente</span>
      </div>

      <div id="events-data-status" role="status" aria-live="polite" className={TONO[mensaje.tono] || TONO.ambar}>{mensaje.texto}</div>
      <FeaturedCarousel eventos={eventos} />

      <section id="mapa-eventos" className="scroll-mt-24 space-y-4" aria-labelledby="map-section-title">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><span className="mb-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">📍 Mapa interactivo de Jujuy</span><h3 id="map-section-title" className="text-2xl font-extrabold text-gray-900">Explorá eventos en el mapa 3D</h3><p className="mt-1 text-sm text-gray-600">Elegí un evento desde el panel o tocá un marcador para conocer su ubicación.</p></div><a className="text-sm font-semibold text-emerald-800 underline underline-offset-2" href="https://www.openstreetmap.org/#map=14/-24.1858/-65.2995" target="_blank" rel="noopener noreferrer">Abrir OpenStreetMap ↗</a></div>
        <MapEvents eventos={visibles} onAsistir={setSeleccionado} modoNocturno={modoNocturno} />
      </section>

      <section aria-labelledby="agenda-title" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h3 id="agenda-title" className="text-xl font-extrabold text-gray-900">Agenda de actividades</h3><p className="mt-1 text-sm text-gray-600">Deslizá las tarjetas o usá las flechas para recorrer la programación.</p></div></div>
        <div className="flex gap-2 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"><Search className="h-5 w-5 self-center text-gray-400" aria-hidden="true" /><input type="text" value={consulta} onChange={(e) => setConsulta(e.target.value)} placeholder="Buscar por evento, barrio, taller o rubro..." className="w-full text-sm focus:outline-none" aria-label="Buscar eventos" /></div>
        <p className="text-xs text-gray-500">Las sugerencias mostradas son consejos prácticos basados en la programación publicada, no predicciones de Machine Learning.</p>
        <EventList eventos={visibles} onAsistir={setSeleccionado} onUbicacion={irAlMapa} />
      </section>

      <AttendanceModal evento={seleccionado} onCerrar={() => setSeleccionado(null)} />
    </section>
  );
}
