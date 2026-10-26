import { useEffect, useMemo, useState } from "react";
import { MapPin, Moon, Search, Sun, Sunrise, X } from "lucide-react";
import EventList from "../events/EventList.jsx";
import FeaturedCarousel from "../events/FeaturedCarousel.jsx";
import AttendanceModal from "../events/AttendanceModal.jsx";
import MapEvents from "../events/MapEvents.jsx";
import { ETIQUETA_PERIODO, PERIODOS, filtrarEventos } from "../../lib/format.js";

const TONO = { ambar: "rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-950", info: "rounded-xl bg-blue-50 border border-blue-200 p-3 text-sm text-blue-900", ok: "rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-900", error: "rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-900" };
const ICONOS_PERIODO = { all: null, Manana: Sunrise, Tarde: Sun, Noche: Moon };

export default function ComunidadView({ eventos, mensaje, modoNocturno = false }) {
  const [periodo, setPeriodo] = useState("all");
  const [consulta, setConsulta] = useState("");
  const [seleccionado, setSeleccionado] = useState(null);
  const [whatsappVisible, setWhatsappVisible] = useState(() => { try { return window.localStorage.getItem("jt_whatsapp_notice_closed") !== "true"; } catch { return true; } });
  const visibles = useMemo(() => filtrarEventos(eventos, periodo, consulta), [eventos, periodo, consulta]);
  const irAlMapa = () => document.getElementById("mapa-eventos")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const buscar = (event) => { event.preventDefault(); document.getElementById("agenda-title")?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const cerrarWhatsApp = () => { setWhatsappVisible(false); try { window.localStorage.setItem("jt_whatsapp_notice_closed", "true"); } catch { /* continúa aunque no haya storage */ } };

  return <section id="top" className="space-y-6">
    <section className="community-hero" aria-labelledby="hero-title">
      <img src="/assets/hero-hornocal.jfif" alt="Serranía del Hornocal, Jujuy" />
      <div className="community-hero__shade" />
      <span className="community-hero__badge">Versión demo · eventos de ejemplo</span>
      <div className="community-hero__content"><p className="community-hero__eyebrow">JUJUYTECH · CULTURA Y COMUNIDAD</p><h2 id="hero-title">Descubrí eventos en Jujuy</h2><p>Explorá actividades culturales, ferias y talleres de toda la provincia.</p><form className="community-hero__search" onSubmit={buscar}><Search aria-hidden="true" /><label className="sr-only" htmlFor="hero-event-search">Buscar actividades</label><input id="hero-event-search" type="search" value={consulta} onChange={(event) => setConsulta(event.target.value)} placeholder="Buscar eventos, lugares o categorías..." /><button type="submit">Buscar</button></form><a className="community-hero__map-link" href="#mapa-eventos" onClick={irAlMapa}><MapPin aria-hidden="true" /> Explorar mapa 3D de eventos →</a></div>
    </section>

    <div className="community-period-filters" role="group" aria-label="Filtrar por horario">{PERIODOS.map((valor) => { const Icono = ICONOS_PERIODO[valor]; return <button key={valor} type="button" onClick={() => setPeriodo(valor)} aria-pressed={periodo === valor} className={periodo === valor ? "is-active" : ""}>{Icono ? <Icono aria-hidden="true" /> : null}{valor === "all" ? "Todos" : valor === "Manana" ? "Mañana" : valor}</button>; })}</div>

    {whatsappVisible && <div className="whatsapp-notice"><span className="whatsapp-notice__icon">◉</span><span>Canal de WhatsApp con novedades de eventos</span><span className="whatsapp-notice__status">Próximamente</span><button type="button" onClick={cerrarWhatsApp} aria-label="Cerrar aviso de WhatsApp"><X /></button></div>}
    <div id="events-data-status" role="status" aria-live="polite" className={TONO[mensaje.tono] || TONO.ambar}>{mensaje.texto}</div>
    <FeaturedCarousel eventos={eventos} />

    <section id="mapa-eventos" className="scroll-mt-24 space-y-4" aria-labelledby="map-section-title"><div className="flex flex-wrap items-end justify-between gap-3"><div><span className="mb-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">📍 Mapa interactivo de Jujuy</span><h3 id="map-section-title" className="text-2xl font-extrabold text-gray-900">Explorá eventos en el mapa 3D</h3><p className="mt-1 text-sm text-gray-600">Elegí un evento desde el panel o tocá un marcador para conocer su ubicación.</p></div><a className="text-sm font-semibold text-emerald-800 underline underline-offset-2" href="https://www.openstreetmap.org/#map=14/-24.1858/-65.2995" target="_blank" rel="noopener noreferrer">Abrir OpenStreetMap ↗</a></div><MapEvents eventos={visibles} onAsistir={setSeleccionado} modoNocturno={modoNocturno} /></section>

    <section aria-labelledby="agenda-title" className="agenda-container space-y-5"><div><h3 id="agenda-title" className="text-2xl font-extrabold text-gray-900 md:text-3xl">Agenda de actividades</h3><p className="mt-2 text-sm text-gray-600">Encontrá una actividad por nombre, lugar, categoría o tipo de entrada.</p></div><EventList eventos={visibles} onAsistir={setSeleccionado} onUbicacion={irAlMapa} /></section>
    <AttendanceModal evento={seleccionado} onCerrar={() => setSeleccionado(null)} />
  </section>;
}
