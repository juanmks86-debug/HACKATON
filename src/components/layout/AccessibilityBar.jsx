import { Accessibility, Eye, Volume2, Moon, Sun } from "lucide-react";

/** Barra de accesibilidad: lectura por voz, tamaño de letra, alto contraste e idioma. */
export default function AccessibilityBar({ a11y }) {
  return (
    <div className="bg-jujuy-dark text-white px-4 py-2 text-xs md:text-sm flex flex-wrap justify-between items-center shadow-md z-50">
      <div className="flex items-center space-x-2">
        <span className="font-bold tracking-wide flex items-center gap-1">
          <Accessibility className="w-4 h-4 text-amber-400" aria-hidden="true" /> Accesibilidad Universal:
        </span>
        <button
          type="button"
          onClick={a11y.alternarVoz}
          className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded flex items-center gap-1 transition"
          aria-pressed={a11y.voz}
        >
          <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Lectura de Voz ({a11y.voz ? "ON" : "OFF"})</span>
        </button>
      </div>

      <div className="flex items-center space-x-3 mt-1 sm:mt-0">
        <div className="flex items-center bg-gray-700 rounded px-1" role="group" aria-label="Tamaño de letra">
          <button type="button" onClick={() => a11y.cambiarTamano(-1)} className="px-2 py-0.5 hover:bg-gray-600 rounded font-bold" title="Reducir letra">
            A-
          </button>
          <button type="button" onClick={() => a11y.cambiarTamano(0)} className="px-2 py-0.5 hover:bg-gray-600 rounded font-bold" title="Tamaño normal">
            A
          </button>
          <button type="button" onClick={() => a11y.cambiarTamano(1)} className="px-2 py-0.5 hover:bg-gray-600 rounded font-bold" title="Aumentar letra">
            A+
          </button>
        </div>

        <button
          type="button"
          onClick={a11y.alternarContraste}
          aria-pressed={a11y.contraste}
          className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold px-2 py-1 rounded flex items-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" aria-hidden="true" /> Alto Contraste
        </button>

        <button
          type="button"
          onClick={a11y.alternarNocturno}
          aria-pressed={a11y.nocturno}
          className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-2 py-1 rounded flex items-center gap-1"
        >
          {a11y.nocturno ? <Sun className="w-3.5 h-3.5" aria-hidden="true" /> : <Moon className="w-3.5 h-3.5" aria-hidden="true" />}
          <span>{a11y.nocturno ? "Modo claro" : "Modo nocturno"}</span>
        </button>

        <select
          id="lang-selector"
          aria-label="Idioma"
          value={a11y.idioma}
          onChange={(e) => a11y.cambiarIdioma(e.target.value)}
          className="bg-gray-700 text-white rounded px-2 py-1 text-xs border border-gray-600 focus:outline-none"
        >
          <option value="es">Español</option>
          <option value="en">English</option>
          <option value="qu">Runasimi (Quechua)</option>
        </select>
      </div>
    </div>
  );
}
