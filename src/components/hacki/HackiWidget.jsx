import { AlertCircle, ArrowRight, CalendarDays, Headphones, Loader2, MapPin, Mic, Plane, RefreshCw, Send, Volume2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { API_BASE_URL } from "../../config.js";
import faq from "../../data/hacki/faq.json";

const avatar = "/assets/hacki/active.png";
const SALUDO = "¡Hola! Soy Hacki, el asistente de JujuyTech. Te ayudo a encontrar eventos y resolver dudas sobre la agenda.";
const SALUDO_INICIO = "Hola soy Hacki, ¿Qué hacemos hoy?";
const AVISO = "Respuestas orientativas. Eventos de ejemplo.";
const GUARDRAIL = "Todavía no puedo gestionar inscripciones ni recordatorios desde el chat. Puedo orientarte sobre la agenda y compartirte los detalles del evento.";
const EVENTOS_DEMO = [
  { id: "demo-coplas", title: "Taller de coplas — Elsa Tapia", place: "Casa de las Letras", startAt: "2026-10-27T17:00:00" },
  { id: "demo-autores", title: "Encuentro de Jujeños Autores", place: "Casa de las Letras", startAt: "2026-10-28T18:00:00" },
];

function fechaCorta(fecha) {
  const valor = new Date(fecha);
  return { mes: new Intl.DateTimeFormat("es-AR", { month: "short" }).format(valor).replace(".", "").toUpperCase(), dia: new Intl.DateTimeFormat("es-AR", { day: "2-digit" }).format(valor), hora: new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false }).format(valor) };
}

export default function HackiWidget({ eventos = [] }) {
  const [abierto, setAbierto] = useState(false);
  const [consulta, setConsulta] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [grabando, setGrabando] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [inicioEscuchado, setInicioEscuchado] = useState(false);
  const recognitionRef = useRef(null);
  const listaRef = useRef(null);
  const sugerencias = useMemo(() => faq.slice(0, 3), []);
  const recomendados = useMemo(() => {
    const fuente = eventos.filter((evento) => new Date(evento.startAt).getTime() >= Date.now()).sort((a, b) => new Date(a.startAt) - new Date(b.startAt)).slice(0, 2);
    return fuente.length >= 2 ? fuente : EVENTOS_DEMO;
  }, [eventos]);

  const hablar = useCallback((texto) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const voz = new SpeechSynthesisUtterance(texto);
    voz.lang = "es-AR";
    voz.rate = 0.95;
    voz.pitch = 1.05;
    window.speechSynthesis.speak(voz);
  }, []);

  const reiniciar = () => {
    window.speechSynthesis?.cancel();
    setMensajes([]);
    setConsulta("");
    setProcesando(false);
    setInicioEscuchado(true);
    hablar(SALUDO_INICIO);
  };

  const abrirChat = () => {
    setAbierto(true);
    if (!inicioEscuchado && !mensajes.length) {
      setInicioEscuchado(true);
      hablar(SALUDO_INICIO);
    }
  };

  useEffect(() => {
    const abrirDesdeFooter = () => setAbierto(true);
    window.addEventListener("hacki-open", abrirDesdeFooter);
    return () => window.removeEventListener("hacki-open", abrirDesdeFooter);
  }, []);

  useEffect(() => {
    if (listaRef.current) listaRef.current.scrollTop = listaRef.current.scrollHeight;
  }, [mensajes, procesando]);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const responder = async (texto) => {
    const pregunta = String(texto).trim();
    if (!pregunta || procesando) return;
    const normalizada = pregunta.toLocaleLowerCase("es");
    setConsulta("");
    setMensajes((actuales) => [...actuales, { tipo: "user", texto: pregunta }]);
    if (/inscrib|inscripción|recordatorio|recordar|agendá|agenda esto/.test(normalizada)) {
      setMensajes((actuales) => [...actuales, { tipo: "bot", texto: GUARDRAIL }]);
      return;
    }
    setProcesando(true);
    await new Promise((resolver) => window.setTimeout(resolver, 450));
    const coincidencia = faq.find((item) => `${item.pregunta} ${item.respuesta}`.toLocaleLowerCase("es").includes(normalizada));
    const respuestaLocal = coincidencia?.respuesta || "No encontré eventos específicos con esa búsqueda. Estos son los próximos:";
    setMensajes((actuales) => [...actuales, { tipo: "bot", texto: respuestaLocal, mostrarEventos: !coincidencia }]);
    setProcesando(false);
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: pregunta }) });
        if (res.ok) {
          const data = await res.json();
          if (data?.reply) setMensajes((actuales) => [...actuales, { tipo: "bot", texto: data.reply }]);
        }
      } catch {
        // El fallback local permanece disponible si el servicio no responde.
      }
    }
  };

  const escuchar = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setConsulta("La entrada por voz no está disponible en este navegador."); return; }
    if (grabando) { recognitionRef.current?.stop(); setGrabando(false); return; }
    const reconocimiento = new SpeechRecognition();
    recognitionRef.current = reconocimiento;
    reconocimiento.lang = "es-AR";
    reconocimiento.interimResults = false;
    reconocimiento.onstart = () => setGrabando(true);
    reconocimiento.onresult = (event) => setConsulta(event.results[0][0].transcript);
    reconocimiento.onerror = () => setGrabando(false);
    reconocimiento.onend = () => setGrabando(false);
    reconocimiento.start();
  };

  return <div className="hacki-v2-shell">
    {abierto && <section className="hacki-v2-dialog" aria-label="Chat de Hacki">
      <header className="hacki-v2-header"><div className="hacki-v2-identity"><span className="hacki-v2-avatar"><img src={avatar} alt="" /><i aria-label="Hacki activo" /></span><span><strong>Hacki</strong><small>Asistente de eventos</small></span></div><div className="hacki-v2-controls"><button type="button" onClick={() => hablar(SALUDO)} aria-label="Escuchar saludo de Hacki" title="Escuchar saludo"><Volume2 /></button><button type="button" onClick={reiniciar} aria-label="Reiniciar conversación" title="Reiniciar conversación"><RefreshCw /></button><button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar Hacki" title="Cerrar"><X /></button></div></header>
      <div className="hacki-v2-messages" ref={listaRef}>
        {!mensajes.length && <><div className="hacki-v2-bubble hacki-v2-bot"><p>{SALUDO_INICIO}</p><small className="hacki-v2-welcome-detail">{SALUDO}</small></div><p className="hacki-v2-disclaimer"><AlertCircle />{AVISO}</p></>}
        {mensajes.map((mensaje, index) => <div key={`${mensaje.tipo}-${index}`} className={`hacki-v2-bubble ${mensaje.tipo === "user" ? "hacki-v2-user" : "hacki-v2-bot"}`}><p>{mensaje.texto}</p>{mensaje.mostrarEventos && <div className="hacki-v2-events">{recomendados.map((evento) => <EventSuggestion key={evento.id ?? evento.title} evento={evento} onClick={() => setConsulta(evento.title)} />)}</div>}</div>)}
        {procesando && <div className="hacki-v2-typing" aria-live="polite"><Loader2 /> Hacki está escribiendo<span>···</span></div>}
      </div>
      <div className="hacki-v2-suggestions">{["Ver agenda completa", "Eventos gratuitos", "Cómo me inscribo"].map((texto) => <button key={texto} type="button" onClick={() => texto === "Ver agenda completa" ? window.location.hash = "agenda-title" : responder(texto)}>{texto}</button>)}</div>
      <a className="hacki-v2-human" href="mailto:contacto@jujuytech.ar?subject=Ayuda%20con%20JujuyTech"><Headphones />¿No era lo que buscabas? <strong>Hablar con una persona</strong></a>
      <form className="hacki-v2-form" onSubmit={(event) => { event.preventDefault(); responder(consulta); }}><label className="sr-only" htmlFor="hacki-question">Escribí tu pregunta</label><input id="hacki-question" value={consulta} onChange={(event) => setConsulta(event.target.value)} placeholder="Escribí tu pregunta..." /><button type="button" className={grabando ? "is-recording" : ""} onClick={escuchar} aria-label={grabando ? "Detener micrófono" : "Usar micrófono"} title="Usar micrófono"><Mic /></button><button type="submit" className="hacki-v2-send" aria-label="Enviar pregunta" title="Enviar"><Send /></button></form><p className="hacki-v2-footnote">No escribas datos personales en el chat.</p>
    </section>}
    <button type="button" className="hacki-v2-launcher" onClick={() => abierto ? setAbierto(false) : abrirChat()} aria-expanded={abierto} aria-label={abierto ? "Cerrar chat de Hacki" : "Abrir chat de Hacki"}><span className="hacki-v2-launcher-avatar"><img src={avatar} alt="" /><i /></span><strong>Hacki</strong></button>
  </div>;
}

function EventSuggestion({ evento, onClick }) {
  const fecha = fechaCorta(evento.startAt);
  return <button type="button" className="hacki-v2-event" onClick={onClick}><span className="hacki-v2-event-date"><b>{fecha.mes}</b><strong>{fecha.dia}</strong></span><span><b>{evento.title}</b><small><MapPin />{evento.place} · {fecha.hora} hs</small></span><ArrowRight /></button>;
}
