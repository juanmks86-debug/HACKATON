import { useMemo } from "react";

const COLORES = ["#f59e0b", "#f97316", "#8b5cf6", "#06b6d4", "#10b981"];

function BarChart({ datos }) {
  const maximo = Math.max(...datos.map((dato) => dato.valor), 1);
  return (
    <div className="overflow-x-auto">
      <svg viewBox="0 0 720 300" role="img" aria-label="Clics simulados por evento" className="min-w-[620px] w-full h-auto">
        <line x1="58" y1="238" x2="700" y2="238" stroke="currentColor" opacity=".25" />
        {datos.map((dato, indice) => {
          const x = 78 + indice * 123;
          const alto = (dato.valor / maximo) * 175;
          return <g key={dato.nombre}><rect x={x} y={238 - alto} width="72" height={alto} rx="10" fill={COLORES[indice]} opacity=".9" /><text x={x + 36} y={225 - alto} textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor">{dato.valor}</text><text x={x + 36} y="263" textAnchor="end" transform={`rotate(-28 ${x + 36} 263)`} fontSize="11" fill="currentColor">{dato.nombre}</text></g>;
        })}
        <text x="60" y="22" fontSize="12" fill="currentColor" opacity=".7">Interacciones / clics simulados</text>
      </svg>
    </div>
  );
}

function ScatterChart({ datos }) {
  const margen = 48;
  const ancho = 660;
  const alto = 300;
  const maximo = Math.max(...datos.map((dato) => Math.max(dato.interes, dato.asistentes)), 100);
  const punto = (valor, eje) => margen + (valor / maximo) * (eje === "x" ? ancho - 80 : alto - 80);
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${ancho} ${alto}`} role="img" aria-label="Dispersión simulada de interés y asistencia" className="min-w-[620px] w-full h-auto">
        <line x1={margen} y1={alto - margen} x2={ancho - 25} y2={alto - margen} stroke="currentColor" opacity=".3" />
        <line x1={margen} y1={alto - margen} x2={margen} y2="25" stroke="currentColor" opacity=".3" />
        <line x1={margen} y1={alto - margen} x2={ancho - 25} y2="25" stroke="#64748b" strokeDasharray="7 6" opacity=".8" />
        {datos.map((dato, indice) => <g key={dato.nombre}><circle cx={punto(dato.interes, "x")} cy={alto - margen - (dato.asistentes / maximo) * (alto - 80)} r="9" fill={COLORES[indice]} stroke="white" strokeWidth="2"><title>{dato.nombre}: {dato.interes} interesados, {dato.asistentes} asistentes estimados</title></circle><text x={punto(dato.interes, "x") + 12} y={alto - margen - (dato.asistentes / maximo) * (alto - 80) + 4} fontSize="10" fill="currentColor">{dato.nombre}</text></g>)}
        <text x={ancho / 2} y={alto - 8} textAnchor="middle" fontSize="12" fill="currentColor">Interés / comentarios</text>
        <text x="14" y={alto / 2} transform={`rotate(-90 14 ${alto / 2})`} textAnchor="middle" fontSize="12" fill="currentColor">Asistencia estimada</text>
      </svg>
    </div>
  );
}

function Heatmap({ datos }) {
  return <div className="grid grid-cols-5 gap-2 rounded-xl bg-slate-950/90 p-4" role="img" aria-label="Mapa de calor simulado por zona">
    {datos.map((dato) => <div key={dato.zona} title={`${dato.zona}: ${dato.valor}% de concurrencia relativa`} className="group relative aspect-square rounded-lg border border-white/10" style={{ background: `hsl(${Math.max(8, 172 - dato.valor * 1.55)} 85% ${Math.max(28, 78 - dato.valor * 0.38)}%)`, opacity: 0.45 + dato.valor / 180 }}><span className="absolute inset-x-0 bottom-1 text-center text-[9px] font-bold text-white opacity-0 transition group-hover:opacity-100">{dato.zona}</span></div>)}
    <div className="col-span-5 flex justify-between text-[10px] text-slate-300"><span>Menor concurrencia</span><span>Mayor concurrencia</span></div>
  </div>;
}

export default function MunicipioView({ eventos }) {
  const datos = useMemo(() => {
    const base = eventos.slice(0, 5);
    return {
      clics: base.map((evento, indice) => ({ nombre: evento.title.split(" ").slice(0, 2).join(" "), valor: [148, 126, 103, 86, 68][indice] ?? 52 })),
      asistencia: base.map((evento, indice) => ({ nombre: evento.title.split(" ").slice(0, 2).join(" "), interes: [148, 126, 103, 86, 68][indice] ?? 52, asistentes: [112, 71, 82, 39, 58][indice] ?? 30 })),
      calor: ["Culturarte", "Centro", "Casa Letras", "Xibi Xibi", "Belgrano", "Chijra", "Alto Comedero", "Malvinas", "San Pedrito", "Terminal", "Catedral", "Gorriti", "Municipalidad", "Campo Verde", "Los Perales"].map((zona, indice) => ({ zona, valor: [92, 86, 78, 62, 57, 43, 38, 31, 27, 52, 74, 69, 88, 35, 48][indice] })),
    };
  }, [eventos]);
  const totalClics = datos.clics.reduce((total, dato) => total + dato.valor, 0);
  const totalAsistentes = datos.asistencia.reduce((total, dato) => total + dato.asistentes, 0);
  const tarjetas = [["Eventos analizados", eventos.length], ["Clics simulados", totalClics.toLocaleString("es-AR")], ["Asistencias estimadas", totalAsistentes], ["Datos reales", "No"]];

  return <section id="view-municipio" className="space-y-6">
    <div><span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Vista demostrativa · Municipio</span><h2 className="mt-1 text-3xl font-extrabold">Panel municipal</h2><p className="mt-2 text-sm text-gray-600">Indicadores ilustrativos para explorar tendencias de la agenda cultural.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{tarjetas.map(([etiqueta, valor]) => <div key={etiqueta} className="rounded-xl border border-gray-200 bg-white p-5"><p className="text-sm text-gray-500">{etiqueta}</p><p className="mt-2 text-3xl font-extrabold">{valor}</p></div>)}</div>

    <div className="grid gap-6 xl:grid-cols-2">
      <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="mb-4"><h3 className="font-bold">Eventos más clickeados</h3><p className="mt-1 text-xs text-gray-600">Barras inclinadas por título · interacción simulada</p></div><BarChart datos={datos.clics} /></article>
      <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="mb-4"><h3 className="font-bold">Interés vs. asistencia</h3><p className="mt-1 text-xs text-gray-600">Cerca de la recta: mayor proximidad entre interés y asistencia. Lejos: interés todavía no convertido.</p></div><ScatterChart datos={datos.asistencia} /><div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600"><span>— Recta de referencia</span><span>● Comentarios/interés</span></div></article>
      <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-2"><div className="mb-4"><h3 className="font-bold">Concurrencia por zona</h3><p className="mt-1 text-xs text-gray-600">Mapa de calor simulado para ubicar dónde se concentra la asistencia relativa.</p></div><Heatmap datos={datos.calor} /><div className="mt-3 grid gap-2 text-xs text-gray-600 sm:grid-cols-3"><span><strong className="text-orange-600">Culturarte</strong> · mayor concentración</span><span><strong className="text-emerald-600">Centro</strong> · actividad alta</span><span><strong className="text-cyan-600">Alto Comedero</strong> · oportunidad de expansión</span></div></article>
    </div>

    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">Estos tres gráficos son demostrativos: no provienen de GA4, Supabase ni un modelo ML real. Antes de producción deben conectarse a eventos, comentarios, asistencias validadas y coordenadas autorizadas.</div>
  </section>;
}
