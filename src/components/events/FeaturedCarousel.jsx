import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { formateadorDia, formateadorHora } from "../../lib/format.js";

const MAXIMO = 5;

/** Carrusel de actividades destacadas: las 5 primeras de la agenda. */
export default function FeaturedCarousel({ eventos }) {
  const [indice, setIndice] = useState(0);
  const destacados = eventos.slice(0, MAXIMO);

  // Si la lista se acorta (filtros o API), el índice no debe quedar fuera de rango.
  useEffect(() => {
    setIndice((actual) => Math.min(actual, Math.max(0, destacados.length - 1)));
  }, [destacados.length]);

  if (!destacados.length) return null;

  const mover = (paso) => setIndice((actual) => (actual + paso + destacados.length) % destacados.length);

  return (
    <section id="featured-carousel" aria-label="Actividades culturales destacadas" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-bold text-gray-900 flex gap-2 items-center">
          <Sparkles className="w-5 h-5 text-amber-500" aria-hidden="true" /> {MAXIMO} actividades destacadas
        </h3>
        <div className="flex gap-2">
          <button type="button" onClick={() => mover(-1)} aria-label="Actividad anterior" className="bg-white shadow rounded-full p-2">
            <ChevronLeft aria-hidden="true" />
          </button>
          <button type="button" onClick={() => mover(1)} aria-label="Siguiente actividad" className="bg-white shadow rounded-full p-2">
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        id="carousel-container"
        className="relative overflow-hidden rounded-2xl shadow-lg bg-white h-72 md:h-80"
        aria-live="polite"
      >
        {destacados.map((evento, i) => (
          <article
            key={evento.id}
            className={`carousel-item absolute inset-0 ${i === indice ? "active" : ""}`}
            aria-hidden={i !== indice}
          >
            {evento.image ? (
              <img src={evento.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-amber-600 to-blue-800" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent p-6 md:p-8 flex flex-col justify-end text-white">
              <span className="rounded-full bg-white/20 backdrop-blur-sm py-1 px-3 font-semibold text-xs w-fit mb-2">
                {formateadorDia.format(new Date(evento.startAt))} · {formateadorHora.format(new Date(evento.startAt))} hs
              </span>
              <h4 className="text-2xl md:text-3xl font-black">{evento.title}</h4>
              <p className="text-sm text-white/90 mt-2">{evento.place}</p>
            </div>
          </article>
        ))}
      </div>

      <p className="text-xs text-gray-500">
        Imágenes ilustrativas creadas para JujuyTech. Consultá los detalles y condiciones en la publicación original.
      </p>
    </section>
  );
}
