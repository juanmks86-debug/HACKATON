import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { formateadorDia, formateadorHora } from "../../lib/format.js";

const MAXIMO = 5;
const INTERVALO_MS = 4500;

/** Carrusel de actividades destacadas con autoplay, bucle y navegación accesible. */
export default function FeaturedCarousel({ eventos }) {
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);
  const destacados = eventos.slice(0, MAXIMO);

  useEffect(() => {
    setIndice((actual) => Math.min(actual, Math.max(0, destacados.length - 1)));
  }, [destacados.length]);

  useEffect(() => {
    if (pausado || destacados.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setIndice((actual) => (actual + 1) % destacados.length);
    }, INTERVALO_MS);
    return () => window.clearInterval(timer);
  }, [destacados.length, indice, pausado]);

  if (!destacados.length) return null;

  const mover = (paso) => setIndice((actual) => (actual + paso + destacados.length) % destacados.length);

  return (
    <section id="featured-carousel" aria-label="Actividades culturales destacadas" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-bold text-gray-900 flex gap-2 items-center">
          <Sparkles className="w-5 h-5 text-amber-500" aria-hidden="true" /> Actividades destacadas
        </h3>
        <div className="flex gap-2">
          <button type="button" onClick={() => mover(-1)} aria-label="Actividad anterior" className="bg-white shadow rounded-full p-2 hover:bg-amber-50 focus-visible:ring-2 focus-visible:ring-amber-500">
            <ChevronLeft aria-hidden="true" />
          </button>
          <button type="button" onClick={() => mover(1)} aria-label="Siguiente actividad" className="bg-white shadow rounded-full p-2 hover:bg-amber-50 focus-visible:ring-2 focus-visible:ring-amber-500">
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        id="carousel-container"
        className="relative overflow-hidden rounded-2xl shadow-lg bg-white h-72 md:h-80"
        aria-live="polite"
        onMouseEnter={() => setPausado(true)}
        onMouseLeave={() => setPausado(false)}
        onFocus={() => setPausado(true)}
        onBlur={() => setPausado(false)}
      >
        {destacados.map((evento, i) => (
          <article
            key={evento.id ?? evento.title}
            className={`absolute inset-0 transition-opacity duration-500 ${i === indice ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            aria-hidden={i !== indice}
          >
            {evento.image ? <img src={evento.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-linear-to-br from-amber-600 to-blue-800" />}
            <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent p-6 md:p-8 flex flex-col justify-end text-white">
              <span className="rounded-full bg-white/20 backdrop-blur-sm py-1 px-3 font-semibold text-xs w-fit mb-2">
                {formateadorDia.format(new Date(evento.startAt))} · {formateadorHora.format(new Date(evento.startAt))} hs
              </span>
              <h4 className="text-2xl md:text-3xl font-black">{evento.title}</h4>
              <p className="text-sm text-white/90 mt-2">📍 {evento.place}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="flex justify-center gap-2" aria-label="Seleccionar actividad destacada">
        {destacados.map((evento, i) => (
          <button key={evento.id ?? evento.title} type="button" onClick={() => setIndice(i)} aria-label={`Mostrar ${evento.title}`} aria-current={i === indice ? "true" : undefined} className={`h-2.5 rounded-full transition-all ${i === indice ? "w-7 bg-orange-600" : "w-2.5 bg-gray-300 hover:bg-gray-400"}`} />
        ))}
      </div>

      <p className="text-xs text-gray-500">Pasa automáticamente cada 4,5 segundos. Pausá el cursor sobre el banner para leerlo.</p>
    </section>
  );
}
