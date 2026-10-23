import { useState } from "react";
import { Palette, Store, Wrench } from "lucide-react";

const TARJETAS = [
  {
    Icono: Store,
    color: "bg-amber-100 text-amber-600",
    titulo: "Ferias Gastronómicas",
    texto: "Conectá con proveedores local y participá en food-trucks.",
  },
  {
    Icono: Wrench,
    color: "bg-blue-100 text-blue-600",
    titulo: "Talleres y Oficios",
    texto: "Sumate a capacitaciones de la Municipalidad para PyMEs.",
  },
  {
    Icono: Palette,
    color: "bg-purple-100 text-purple-600",
    titulo: "Artesanías y cultura",
    texto: "Vinculá tu emprendimiento con ferias y actividades locales.",
  },
];

/** Portal Red Empresarial. El formulario sigue siendo demostrativo (no guarda nada). */
export default function EmpresarialView() {
  const [aviso, setAviso] = useState("");

  return (
    <section id="view-business" className="space-y-8">
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <span className="bg-emerald-500/20 text-emerald-400 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            Red B2B Empresarial
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold mt-2">¿Te interesa impulsar tu negocio?</h2>
          <p className="text-slate-300 text-sm mt-1">
            Creá tu evento comercial o unite a ferias locales con otros emprendedores de Jujuy.
          </p>
        </div>
        <button
          type="button"
          onClick={() => document.getElementById("b2b-form")?.scrollIntoView({ behavior: "smooth" })}
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3 rounded-xl shadow transition whitespace-nowrap"
        >
          + Crear Evento Comercial
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TARJETAS.map(({ Icono, color, titulo, texto }) => (
          <div key={titulo} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
            <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center mx-auto mb-3`}>
              <Icono className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-lg text-gray-900">{titulo}</h3>
            <p className="text-xs text-gray-500 mt-1">{texto}</p>
          </div>
        ))}
      </div>

      <div id="b2b-form" className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h3 className="text-xl font-bold">Proponer un evento comercial</h3>
        <p className="text-sm text-gray-500">
          Formulario demostrativo. La creación real requerirá iniciar sesión como organizador y conectar Supabase.
        </p>
        <form
          className="grid md:grid-cols-2 gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setAviso("Formulario validado localmente. No se guardaron datos ni se envió la propuesta.");
          }}
        >
          <label className="text-sm font-semibold">
            Nombre del evento
            <input required name="nombre" maxLength={100} className="mt-1 w-full rounded-lg border border-gray-300 p-3" placeholder="Ej.: Feria de emprendedores" />
          </label>
          <label className="text-sm font-semibold">
            Barrio / ubicación
            <input required name="ubicacion" maxLength={120} className="mt-1 w-full rounded-lg border border-gray-300 p-3" placeholder="Ej.: Centro" />
          </label>
          <label className="text-sm font-semibold">
            Fecha
            <input required type="date" name="fecha" className="mt-1 w-full rounded-lg border border-gray-300 p-3" />
          </label>
          <label className="text-sm font-semibold">
            Categoría
            <select name="categoria" className="mt-1 w-full rounded-lg border border-gray-300 p-3">
              <option>Gastronomía</option>
              <option>Feria</option>
              <option>Capacitación</option>
              <option>Cultura</option>
            </select>
          </label>
          <button type="submit" className="md:col-span-2 bg-emerald-600 text-white font-bold rounded-lg px-4 py-3">
            Validar propuesta (demo)
          </button>
        </form>
        <p aria-live="polite" className="text-sm">
          {aviso}
        </p>
      </div>
    </section>
  );
}
