import { Accessibility, Eye, Moon, Sun, Volume2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/** Panel desplegable de accesibilidad conservando todos los controles existentes. */
export default function AccessibilityBar({ a11y }) {
  const [abierto, setAbierto] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const cerrar = (event) => {
      if (event.key === "Escape") setAbierto(false);
      if (event.type === "mousedown" && panelRef.current && !panelRef.current.contains(event.target)) setAbierto(false);
    };
    document.addEventListener("keydown", cerrar);
    document.addEventListener("mousedown", cerrar);
    return () => { document.removeEventListener("keydown", cerrar); document.removeEventListener("mousedown", cerrar); };
  }, []);

  return <div className="accessibility-control" ref={panelRef}>
    <button type="button" className="header-icon-button" aria-label="Accesibilidad" aria-expanded={abierto} onClick={() => setAbierto((valor) => !valor)}><Accessibility aria-hidden="true" /></button>
    {abierto && <section className="accessibility-panel" aria-label="Opciones de accesibilidad">
      <div className="accessibility-panel__heading"><strong>Accesibilidad</strong><button type="button" className="accessibility-panel__close" onClick={() => setAbierto(false)} aria-label="Cerrar accesibilidad"><X /></button></div>
      <button type="button" className="accessibility-panel__row" onClick={a11y.alternarVoz} aria-pressed={a11y.voz}><span><Volume2 aria-hidden="true" /> Lectura de voz</span><b>{a11y.voz ? "ON" : "OFF"}</b></button>
      <div className="accessibility-panel__row"><span>Tamaño de texto</span><div className="accessibility-size"><button type="button" onClick={() => a11y.cambiarTamano(-1)} aria-label="Reducir texto">A-</button><button type="button" onClick={() => a11y.cambiarTamano(0)} aria-label="Tamaño normal">A</button><button type="button" onClick={() => a11y.cambiarTamano(1)} aria-label="Aumentar texto">A+</button></div></div>
      <button type="button" className="accessibility-panel__row" onClick={a11y.alternarContraste} aria-pressed={a11y.contraste}><span><Eye aria-hidden="true" /> Alto contraste</span><b>{a11y.contraste ? "ON" : "OFF"}</b></button>
      <button type="button" className="accessibility-panel__row" onClick={a11y.alternarNocturno} aria-pressed={a11y.nocturno}><span>{a11y.nocturno ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />} {a11y.nocturno ? "Modo claro" : "Modo nocturno"}</span><b>{a11y.nocturno ? "ON" : "OFF"}</b></button>
      <label className="accessibility-panel__language">Idioma<select id="lang-selector" aria-label="Idioma" value={a11y.idioma} onChange={(event) => a11y.cambiarIdioma(event.target.value)}><option value="es">Español</option><option value="en">English</option><option value="qu">Runasimi</option></select></label>
    </section>}
  </div>;
}
