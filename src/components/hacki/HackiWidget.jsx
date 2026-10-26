import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Volume2, X } from "lucide-react";
import { API_BASE_URL } from "../../config.js";
import faq from "../../data/hacki/faq.json";

const avatar = "/assets/hacki/active.png";
const MENSAJE_BIENVENIDA = "¡Bienvenido! Soy Hacki, estoy para ayudarte.";

export default function HackiWidget() {
  const [abierto, setAbierto] = useState(false);
  const [consulta, setConsulta] = useState("");
  const [mensajes, setMensajes] = useState([{ tipo: "bot", texto: MENSAJE_BIENVENIDA }]);
  const saludoConfirmado = useRef(false);
  const sugerencias = useMemo(() => faq.slice(0, 4), []);

  const reproducirBienvenida = useCallback(() => {
    if (!("speechSynthesis" in window) || saludoConfirmado.current) return;
    window.speechSynthesis.cancel();
    const voz = new SpeechSynthesisUtterance(MENSAJE_BIENVENIDA);
    voz.lang = "es-AR";
    voz.rate = 0.95;
    voz.pitch = 1.05;
    voz.onend = () => { saludoConfirmado.current = true; };
    window.speechSynthesis.speak(voz);
  }, []);

  useEffect(() => {
    const temporizador = window.setTimeout(reproducirBienvenida, 350);
    const primerGesto = () => reproducirBienvenida();
    window.addEventListener("pointerdown", primerGesto, { once: true });
    window.addEventListener("keydown", primerGesto, { once: true });
    return () => {
      window.clearTimeout(temporizador);
      window.removeEventListener("pointerdown", primerGesto);
      window.removeEventListener("keydown", primerGesto);
    };
  }, [reproducirBienvenida]);

  useEffect(() => {
    const abrirDesdeFooter = () => setAbierto(true);
    window.addEventListener("hacki-open", abrirDesdeFooter);
    return () => window.removeEventListener("hacki-open", abrirDesdeFooter);
  }, []);

  const responder = async (texto) => {
    const pregunta = String(texto).trim();
    if (!pregunta) return;
    const coincidencia = faq.find((item) => `${item.pregunta} ${item.respuesta}`.toLocaleLowerCase("es").includes(pregunta.toLocaleLowerCase("es")));
    const respuestaLocal = coincidencia?.respuesta || "No encontré esa respuesta en la ayuda local. Consultá la agenda publicada o probá con otra pregunta.";
    setMensajes((actuales) => [...actuales, { tipo: "user", texto: pregunta }, { tipo: "bot", texto: respuestaLocal }]);
    setConsulta("");
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: pregunta }) });
        if (res.ok) {
          const data = await res.json();
          if (data?.reply) setMensajes((actuales) => [...actuales, { tipo: "bot", texto: data.reply }]);
        }
      } catch {
        // La respuesta local queda disponible si el servicio de IA no está desplegado.
      }
    }
  };

  return <div className="hacki-widget-shell">
    {abierto && <section className="hacki-dialog" aria-label="Chat de Hacki">
      <header className="hacki-dialog__header"><img src={avatar} alt="Avatar de Hacki" /><div><strong>Hacki</strong><p>Ayuda sobre eventos y emprendimientos</p></div><button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar Hacki"><X /></button></header>
      <div className="hacki-dialog__messages">
        {mensajes.map((mensaje, index) => <p key={`${mensaje.tipo}-${index}`} className={mensaje.tipo === "user" ? "hacki-message hacki-message--user" : "hacki-message"}>{mensaje.texto}</p>)}
        <div className="hacki-dialog__suggestions">{sugerencias.map((item) => <button key={item.id} type="button" onClick={() => responder(item.pregunta)}>{item.pregunta}</button>)}</div>
      </div>
      <form className="hacki-dialog__form" onSubmit={(event) => { event.preventDefault(); responder(consulta); }}><label className="sr-only" htmlFor="hacki-question">Pregunta para Hacki</label><input id="hacki-question" value={consulta} onChange={(event) => setConsulta(event.target.value)} placeholder="Escribí una pregunta" /><button type="submit">Enviar</button></form>
    </section>}
    <div className="hacki-widget-actions"><button type="button" className="hacki-speak-button" onClick={reproducirBienvenida} aria-label="Escuchar bienvenida de Hacki"><Volume2 /></button><button type="button" className="hacki-launcher" onClick={() => setAbierto((valor) => !valor)} aria-expanded={abierto} aria-label={abierto ? "Cerrar chat de Hacki" : "Abrir chat de Hacki"}><img src={avatar} alt="" /><span>Hacki</span></button></div>
  </div>;
}
