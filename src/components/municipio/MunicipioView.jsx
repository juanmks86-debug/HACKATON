import { useMemo } from "react";

const COLORES = ["#f59e0b", "#f97316", "#8b5cf6", "#06b6d4", "#10b981"];

function BarChart({ datos }) {
  const maximo = Math.max(...datos.map((dato) => dato.valor), 1);
  return <div className="overflow-x-auto"><svg viewBox="0 0 720 300" role="img" aria-label="Clics simulados por evento" className="min-w-[620px] w-full h-auto"><line x1="58" y1="238" x2="700" y2="238" stroke="currentColor" opacity=".25" />{datos.map((dato, indice) => { const x = 78 + indice * 123; const alto = (dato.valor / maximo) * 175; return <g key={dato.nombre}><rect x={x} y={238 - alto} width="72" height={alto} rx="10" fill={COLORES[indice]} opacity=".9" /><text x={x + 36} y={225 - alto} textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor">{dato.valor}</text><text x={x + 36} y="263" textAnchor="end" transform={`rotate(-28 ${x + 36} 263)`} fontSize="11" fill="currentColor">{dato.nombre}</text></g>; })}<text x="60" y="22" fontSize="12" fill="currentColor" opacity=".7">Interacciones / clics simulados</text></svg></div>;
}

function ScatterChart({ datos }) {
  const margen = 48;
  const ancho = 660;
  const alto = 300;
  const maximo = Math.max(...datos.map((dato) => Math.max(dato.interes, dato.asistentes)), 100);
  const xPos = (valor) => margen + (valor / maximo) * (ancho - 80);
  const yPos = (valor) => alto - margen - (valor / maximo) * (alto - 80);
  return <div className="overflow-x-auto"><svg viewBox={`0 0 ${ancho} ${alto}`} role="img" aria-label="Dispersión simulada de interés y asistencia con 28 casos" className="min-w-[620px] w-full h-auto"><line x1={margen} y1={alto - margen} x2={ancho - 25} y2={alto - margen} stroke="currentColor" opacity=".3" /><line x1={margen} y1={alto - margen} x2={margen} y2="25" stroke="currentColor" opacity=".3" /><line x1={margen} y1={alto - margen} x2={ancho - 25} y2="25" stroke="#64748b" strokeDasharray="7 6" opacity=".8" />{datos.map((dato, indice) => <g key={`${dato.nombre}-${indice}`}><circle cx={xPos(dato.interes)} cy={yPos(dato.asistentes)} r={indice < 5 ? 7 : 5.5} fill={COLORES[indice % COLORES.length]} stroke="white" strokeWidth="1.5" opacity=".9"><title>{dato.nombre}: {dato.interes} interesados, {dato.asistentes} asistentes estimados</title></circle>{indice < 5 && <text x={xPos(dato.interes) + 10} y={yPos(dato.asistentes) + 4} fontSize="10" fill="currentColor">{dato.nombre}</text>}</g>)}<text x={ancho / 2} y={alto - 8} textAnchor="middle" fontSize="12" fill="currentColor">Interés / comentarios</text><text x="14" y={alto / 2} transform={`rotate(-90 14 ${alto / 2})`} textAnchor="middle" fontSize="12" fill="currentColor">Asistencia estimada</text></svg></div>;
}

function nivelColor(valor) {
  if (valor >= 75) return { color: "#ef4444", etiqueta: "Mucha concurrencia" };
  if (valor >= 45) return { color: "#facc15", etiqueta: "Algunos asistentes" };
  if (valor > 0) return { color: "#22c55e", etiqueta: "Poca concurrencia" };
  return { color: "#14532d", etiqueta: "Sin registros" };
}

function Heatmap({ datos }) {
  return <div className="jt-jujuy-heatmap" role="img" aria-label="Mapa de calor simulado de cuatro ciudades de Jujuy"><svg viewBox="0 0 760 360" className="h-auto w-full" aria-hidden="true"><defs><linearGradient id="jujuy-territorio" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#153f47" /><stop offset="1" stopColor="#0f2535" /></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="5" /></filter></defs><path d="M252 18 390 36 468 104 602 136 692 226 602 304 478 336 362 318 246 345 164 276 82 250 110 168 182 122Z" fill="url(#jujuy-territorio)" stroke="#94a3b8" strokeWidth="3" opacity=".95" /><path d="M132 236 254 190 364 232 486 182 620 240" fill="none" stroke="#bae6fd66" strokeWidth="12" /><path d="M310 64 344 130 324 212 388 292" fill="none" stroke="#bae6fd55" strokeWidth="9" />{datos.map((dato) => { const nivel = nivelColor(dato.valor); return <g key={dato.ciudad}><circle cx={dato.x} cy={dato.y} r="28" fill={nivel.color} opacity=".22" filter="url(#glow)" /><circle cx={dato.x} cy={dato.y} r="17" fill={nivel.color} stroke="#fff" strokeWidth="3" /><text x={dato.x} y={dato.y + 4} textAnchor="middle" fontSize="10" fontWeight="800" fill="#0f172a">{dato.valor}%</text><text x={dato.x + 24} y={dato.y + 4} fontSize="13" fontWeight="700" fill="#f8fafc">{dato.ciudad}</text><title>{dato.ciudad}: {nivel.etiqueta}</title></g>; })}</svg><div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-700 dark:text-slate-200"><span><i className="mr-1 inline-block h-3 w-3 rounded-full bg-red-500" />Mucha concurrencia</span><span><i className="mr-1 inline-block h-3 w-3 rounded-full bg-yellow-400" />Algunos asistentes</span><span><i className="mr-1 inline-block h-3 w-3 rounded-full bg-green-500" />Poca concurrencia</span><span><i className="mr-1 inline-block h-3 w-3 rounded-full bg-green-900" />Sin registros</span></div></div>;
}

export default function MunicipioView({ eventos }) {
  const datos = useMemo(() => {
    const base = eventos.slice(0, 5);
    const nombres = base.length ? base.map((evento) => evento.title.split(" ").slice(0, 2).join(" ")) : ["Evento 1", "Evento 2", "Evento 3", "Evento 4", "Evento 5"];
    const asistencia = Array.from({ length: 28 }, (_, indice) => {
      const interes = 25 + ((indice * 37) % 165);
      const proporcion = 0.28 + ((indice * 23) % 68) / 100;
      return { nombre: nombres[indice % nombres.length], interes, asistentes: Math.max(6, Math.round(interes * proporcion)) };
    });
    return {
      clics: nombres.map((nombre, indice) => ({ nombre, valor: [148, 126, 103, 86, 68][indice] ?? 52 })),
      asistencia,
      calor: [
        { ciudad: "San Salvador", valor: 92, x: 410, y: 150 },
        { ciudad: "Palpalá", valor: 68, x: 500, y: 190 },
        { ciudad: "Perico", valor: 43, x: 300, y: 238 },
        { ciudad: "San Pedro", valor: 18, x: 560, y: 270 },
      ],
    };
  }, [eventos]);
  const totalClics = datos.clics.reduce((total, dato) => total + dato.valor, 0);
  const totalAsistentes = datos.asistencia.reduce((total, dato) => total + dato.asistentes, 0);
  const tarjetas = [["Eventos analizados", eventos.length], ["Clics simulados", totalClics.toLocaleString("es-AR")], ["Casos analizados", datos.asistencia.length], ["Datos reales", "No"]];

  return <section id="view-municipio" className="space-y-6">
    <div><span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Vista demostrativa · Municipio</span><h2 className="mt-1 text-3xl font-extrabold">Panel municipal</h2><p className="mt-2 text-sm text-gray-600">Indicadores ilustrativos para explorar tendencias de la agenda cultural.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{tarjetas.map(([etiqueta, valor]) => <div key={etiqueta} className="rounded-xl border border-gray-200 bg-white p-5"><p className="text-sm text-gray-500">{etiqueta}</p><p className="mt-2 text-3xl font-extrabold">{valor}</p></div>)}</div>
    <div className="grid gap-6 xl:grid-cols-2">
      <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="mb-4"><h3 className="font-bold">Eventos más clickeados</h3><p className="mt-1 text-xs text-gray-600">Barras inclinadas por título · interacción simulada</p></div><BarChart datos={datos.clics} /></article>
      <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="mb-4"><h3 className="font-bold">Regresión: interés vs. asistencia</h3><p className="mt-1 text-xs text-gray-600">28 casos simulados. Cerca de la recta: mayor proximidad entre interés y asistencia. Lejos: interés todavía no convertido.</p></div><ScatterChart datos={datos.asistencia} /><div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600"><span>— Recta de referencia</span><span>● Cada punto = un caso/evento analizado</span><span>{totalAsistentes} asistentes estimados acumulados</span></div></article>
      <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-2"><div className="mb-4"><h3 className="font-bold">Mapa de calor territorial · 4 ciudades de Jujuy</h3><p className="mt-1 text-xs text-gray-600">La intensidad representa la concurrencia relativa simulada de los eventos analizados.</p></div><Heatmap datos={datos.calor} /><div className="mt-3 grid gap-2 text-xs text-gray-600 sm:grid-cols-4"><span><strong className="text-red-600">San Salvador</strong> · mucha</span><span><strong className="text-yellow-600">Palpalá</strong> · algunos</span><span><strong className="text-green-600">Perico</strong> · poca</span><span><strong className="text-green-900">San Pedro</strong> · baja</span></div></article>
    </div>
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">Estos tres gráficos son demostrativos: no provienen de GA4, Supabase ni un modelo ML real. Antes de producción deben conectarse a eventos, comentarios, asistencias validadas y coordenadas autorizadas.</div>
  </section>;
}
