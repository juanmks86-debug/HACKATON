import EventCard from "./EventCard.jsx";

/** Grilla de tarjetas. Muestra el aviso de vacío que ya existía en el HTML. */
export default function EventList({ eventos, onAsistir, onUbicacion }) {
  if (!eventos.length) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <p className="text-sm text-gray-600 col-span-full">No hay eventos publicados que coincidan con los filtros.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {eventos.map((evento) => (
        <EventCard key={evento.id} evento={evento} onAsistir={onAsistir} onUbicacion={onUbicacion} />
      ))}
    </div>
  );
}
