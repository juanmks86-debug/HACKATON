import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EventCard from "./EventCard.jsx";

const INTERVALO_MS = 5000;

function obtenerCantidadPorPagina() {
  if (typeof window === "undefined") return 1;
  if (window.innerWidth >= 1280) return 3;
  if (window.innerWidth >= 768) return 2;
  return 1;
}

/** Agenda en carrusel: una tarjeta en móvil y grupos en pantallas grandes. */
export default function EventList({ eventos, onAsistir, onUbicacion }) {
  const [pagina, setPagina] = useState(0);
  const [porPagina, setPorPagina] = useState(obtenerCantidadPorPagina);
  const inicioTouch = useRef(null);

  useEffect(() => {
    const actualizar = () => setPorPagina(obtenerCantidadPorPagina());
    window.addEventListener("resize", actualizar);
    return () => window.removeEventListener("resize", actualizar);
  }, []);

  const paginas = useMemo(() => {
    const resultado = [];
    for (let i = 0; i < eventos.length; i += porPagina) resultado.push(eventos.slice(i, i + porPagina));
    return resultado;
  }, [eventos, porPagina]);

  useEffect(() => {
    setPagina((actual) => Math.min(actual, Math.max(0, paginas.length - 1)));
  }, [paginas.length]);

  useEffect(() => {
    if (paginas.length < 2) return undefined;
    const timer = window.setInterval(() => setPagina((actual) => (actual + 1) % paginas.length), INTERVALO_MS);
    return () => window.clearInterval(timer);
  }, [paginas.length, pagina]);

  if (!eventos.length) return <p className="text-sm text-gray-600">No hay eventos publicados que coincidan con los filtros.</p>;

  const mover = (paso) => setPagina((actual) => (actual + paso + paginas.length) % paginas.length);
  const tocarInicio = (event) => { inicioTouch.current = event.changedTouches[0].clientX; };
  const tocarFin = (event) => {
    if (inicioTouch.current == null) return;
    const diferencia = event.changedTouches[0].clientX - inicioTouch.current;
    if (Math.abs(diferencia) > 45) mover(diferencia < 0 ? 1 : -1);
    inicioTouch.current = null;
  };

  return (
    <div className="space-y-4" onTouchStart={tocarInicio} onTouchEnd={tocarFin}>
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginas[pagina].map((evento) => <EventCard key={evento.id ?? evento.title} evento={evento} onAsistir={onAsistir} onUbicacion={onUbicacion} />)}
        </div>
        {paginas.length > 1 && <>
          <button type="button" onClick={() => mover(-1)} aria-label="Página anterior de actividades" className="absolute -left-3 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg border border-gray-200 hover:bg-amber-50"><ChevronLeft /></button>
          <button type="button" onClick={() => mover(1)} aria-label="Página siguiente de actividades" className="absolute -right-3 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg border border-gray-200 hover:bg-amber-50"><ChevronRight /></button>
        </>}
      </div>
      {paginas.length > 1 && <div className="flex justify-center gap-2" aria-label="Páginas de la agenda">
        {paginas.map((grupo, i) => <button key={grupo[0]?.id ?? i} type="button" onClick={() => setPagina(i)} aria-label={`Mostrar página ${i + 1}`} aria-current={i === pagina ? "true" : undefined} className={`h-2.5 rounded-full transition-all ${i === pagina ? "w-7 bg-emerald-700" : "w-2.5 bg-gray-300 hover:bg-gray-400"}`} />)}
      </div>}
      {paginas.length > 1 && <p className="text-center text-xs text-gray-500">La agenda avanza automáticamente cada 5 segundos. También podés deslizarla en el celular.</p>}
    </div>
  );
}
