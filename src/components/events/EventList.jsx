import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CalendarDays, ChevronDown, Clock3, MapPin, Ticket } from "lucide-react";
import { estadoDe, formateadorDia, formateadorHora } from "../../lib/format.js";

const INTERVALO_MS = 4500;

function AgendaTickerCard({ evento, onAbrir }) {
  const estado = estadoDe(evento);
  const ingreso = evento.admissionInfo || "Condiciones por confirmar";
  const lugarCorto = evento.place?.split(",").slice(0, 2).join(" · ") || "Ubicación por confirmar";

  return <article className="group relative flex h-36 w-full cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg focus-within:ring-2 focus-within:ring-orange-500 md:h-40" onClick={() => onAbrir(evento)}>
    <div className="relative h-full w-28 shrink-0 overflow-hidden bg-slate-800 md:w-32">
      {evento.image ? <img src={evento.image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="h-full w-full bg-gradient-to-br from-orange-400 to-violet-800" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <span className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-extrabold text-white shadow ${estado === "Finalizado" ? "bg-slate-700/90" : "bg-orange-600/90"}`}>{estado === "Hoy / próximo" ? "Hoy" : estado}</span>
    </div>
    <div className="min-w-0 flex-1 p-3 md:p-4">
      <div className="flex items-start justify-between gap-2"><span className="truncate text-[10px] font-extrabold uppercase tracking-wide text-orange-700">{evento.category || "Cultura"}</span><button type="button" onClick={(e) => { e.stopPropagation(); onAbrir(evento); }} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-bold text-white transition hover:bg-orange-600">Ver detalles <ArrowUpRight className="h-3 w-3" /></button></div>
      <h4 className="mt-1 line-clamp-1 text-sm font-extrabold leading-tight text-slate-900 md:text-base">{evento.title}</h4>
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-600"><span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5 text-orange-600" />{formateadorDia.format(new Date(evento.startAt))}</span><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5 text-blue-700" />{formateadorHora.format(new Date(evento.startAt))} hs</span></div>
      <p className="mt-1 line-clamp-1 text-[11px] text-slate-600"><MapPin className="mr-1 inline h-3.5 w-3.5 text-rose-600" />{lugarCorto}</p>
      <p className="mt-1 line-clamp-1 text-[10px] font-semibold text-amber-800"><Ticket className="mr-1 inline h-3.5 w-3.5" />{ingreso}</p>
    </div>
  </article>;
}

/** Marquesina vertical: dos tarjetas visibles, avance ascendente y bucle infinito. */
export default function EventList({ eventos, onAsistir }) {
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [transicion, setTransicion] = useState(true);
  const elementos = useMemo(() => [...eventos, ...eventos], [eventos]);

  useEffect(() => {
    setIndice(0);
    setTransicion(false);
    requestAnimationFrame(() => setTransicion(true));
  }, [eventos]);

  useEffect(() => {
    if (eventos.length < 2 || pausado) return undefined;
    const timer = window.setInterval(() => setIndice((actual) => actual + 1), INTERVALO_MS);
    return () => window.clearInterval(timer);
  }, [eventos.length, pausado, indice]);

  const alTerminar = () => {
    if (indice < eventos.length) return;
    setTransicion(false);
    setIndice(0);
    requestAnimationFrame(() => setTransicion(true));
  };

  if (!eventos.length) return <p className="text-sm text-gray-600">No hay eventos publicados que coincidan con los filtros.</p>;

  return <div className="space-y-3" onMouseEnter={() => setPausado(true)} onMouseLeave={() => setPausado(false)} onFocus={() => setPausado(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setPausado(false); }}>
    <div className="agenda-ticker relative mx-auto max-w-4xl overflow-hidden rounded-2xl bg-slate-100/60 p-2">
      <div className={`space-y-4 ${transicion ? "transition-transform duration-700 ease-in-out" : "transition-none"}`} style={{ transform: `translate3d(0, calc(-1 * ${indice} * var(--agenda-step)), 0)` }} onTransitionEnd={alTerminar}>
        {elementos.map((evento, posicion) => <AgendaTickerCard key={`${evento.id ?? evento.title}-${posicion}`} evento={evento} onAbrir={onAsistir} />)}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-slate-100/90 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-slate-100/90 to-transparent" />
    </div>
    <div className="flex items-center justify-center gap-2 text-xs text-gray-500"><ChevronDown className={`h-4 w-4 ${pausado ? "text-orange-500" : "animate-bounce"}`} /><span>{pausado ? "Pausado para leer" : "Sube automáticamente cada 4,5 segundos"}</span><ChevronDown className={`h-4 w-4 ${pausado ? "text-orange-500" : "animate-bounce"}`} /></div>
    <p className="text-center text-xs text-gray-500">Se muestran exactamente 2 actividades. Hacé clic en una tarjeta para ver todos sus detalles.</p>
  </div>;
}
