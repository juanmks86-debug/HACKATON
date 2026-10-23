/**
 * Portal Municipio. Hoy muestra las métricas simples (que ya eran estáticas en el HTML)
 * y deja los gráficos para la Fase 3, cuando se porte Chart.js.
 */
export default function MunicipioView({ eventos }) {
  const tarjetas = [
    ["Eventos de muestra", eventos.length],
    ["Visualizaciones simuladas", eventos.reduce((total, evento) => total + evento.views, 0).toLocaleString("es-AR")],
    ["Categorías", new Set(eventos.map((evento) => evento.category)).size],
    ["ML conectado", "No"],
  ];

  return (
    <section id="view-municipio" className="space-y-6">
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Vista demostrativa · Municipio</span>
          <h2 className="text-3xl font-extrabold mt-1">Panel municipal</h2>
          <p className="text-sm text-gray-600 mt-2">Indicadores ilustrativos. No provienen de GA4 ni de Supabase.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tarjetas.map(([etiqueta, valor]) => (
          <div key={etiqueta} className="bg-white p-5 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">{etiqueta}</p>
            <p className="text-3xl font-extrabold mt-2">{valor}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-bold mb-2">Gráficos y predicciones — Fase 3</h3>
        <p className="text-sm text-gray-600">
          Los gráficos de interés por categoría y de vistas por evento usaban Chart.js desde un CDN. En la Fase 3 se
          portan como componentes (<code>CategoryChart</code> y <code>ViewsChart</code>) con la librería instalada por npm.
        </p>
      </div>

      <div className="bg-amber-50 text-amber-900 border border-amber-200 rounded-lg p-3 text-xs">
        Esta vista no concede permisos ni consulta información privada. El acceso municipal real requiere una cuenta
        autorizada y autorización de rol en la API .NET 10.
      </div>
    </section>
  );
}
