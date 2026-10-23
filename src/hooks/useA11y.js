import { useCallback, useEffect, useState } from "react";

const MENSAJE_BIENVENIDA =
  "Bienvenidos a JujuyTech. Elegí un evento para consultar su recomendación inteligente.";

/**
 * Accesibilidad: tamaño de letra, alto contraste, lectura por voz e idioma.
 * Mismo comportamiento que el HTML original (el idioma distinto de español todavía no está traducido).
 */
export function useA11y() {
  const [desplazamiento, setDesplazamiento] = useState(0);
  const [contraste, setContraste] = useState(false);
  const [nocturno, setNocturno] = useState(() => {
    try {
      return window.localStorage.getItem("jt_night_mode") === "true";
    } catch {
      return false;
    }
  });
  const [voz, setVoz] = useState(false);
  const [idioma, setIdioma] = useState("es");

  useEffect(() => {
    document.documentElement.style.fontSize = 16 + desplazamiento * 2 + "px";
  }, [desplazamiento]);

  useEffect(() => {
    document.documentElement.classList.toggle("night-mode", nocturno);
    try {
      window.localStorage.setItem("jt_night_mode", String(nocturno));
    } catch {
      // El tema sigue funcionando aunque el navegador bloquee localStorage.
    }
  }, [nocturno]);

  /** delta: -1 achica, 0 vuelve al tamaño normal, 1 agranda. Rango: -2 a 4. */
  const cambiarTamano = useCallback((delta) => {
    setDesplazamiento((actual) => (delta === 0 ? 0 : Math.max(-2, Math.min(4, actual + delta))));
  }, []);

  const alternarContraste = useCallback(() => setContraste((valor) => !valor), []);
  const alternarNocturno = useCallback(() => setNocturno((valor) => !valor), []);

  const alternarVoz = useCallback(() => {
    const nuevo = !voz;
    setVoz(nuevo);
    if (!("speechSynthesis" in window)) return;
    if (!nuevo) {
      window.speechSynthesis.cancel();
      return;
    }
    const mensaje = new SpeechSynthesisUtterance(MENSAJE_BIENVENIDA);
    mensaje.lang = "es-AR";
    window.speechSynthesis.speak(mensaje);
  }, [voz]);

  const cambiarIdioma = useCallback((nuevo) => {
    if (nuevo !== "es") {
      window.alert("Esta traducción aún no está implementada. El contenido continúa en español.");
      setIdioma("es");
      return;
    }
    setIdioma(nuevo);
  }, []);

  return { desplazamiento, cambiarTamano, contraste, alternarContraste, nocturno, alternarNocturno, voz, alternarVoz, idioma, cambiarIdioma };
}
