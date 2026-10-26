import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../../config.js";
import faq from "../../data/hacki/faq.json";

const avatar = "/assets/hacki/active.png";

export default function HackiWidget() {
  const [abierto, setAbierto] = useState(false);
  const [consulta, setConsulta] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const sugerencias = useMemo(() => faq.slice(0, 4), []);

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

  return (
    <div className="fixed bottom-5 right-5 z-[80]">
      {abierto && (
        <section className="w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-indigo-200 bg-white shadow-2xl overflow-hidden mb-3" aria-label="Chat de Hacki">
          <header className="bg-indigo-700 text-white p-3 flex items-center gap-2">
            <img src={avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
            <div><strong>Hacki</strong><p className="text-xs text-indigo-100">Ayuda sobre eventos y emprendimientos</p></div>
            <button type="button" className="ml-auto text-xl" onClick={() => setAbierto(false)} aria-label="Cerrar Hacki">×</button>
          </header>
          <div className="max-h-64 overflow-y-auto p-3 space-y-2 text-sm">
            {!mensajes.length && <p className="text-gray-600">Elegí una pregunta o escribí tu consulta.</p>}
            {mensajes.map((mensaje, index) => <p key={`${mensaje.tipo}-${index}`} className={`rounded-lg p-2 ${mensaje.tipo === "user" ? "bg-indigo-50 text-indigo-900 ml-6" : "bg-gray-100 text-gray-800 mr-4"}`}>{mensaje.texto}</p>)}
            <div className="flex flex-wrap gap-1">{sugerencias.map((item) => <button key={item.id} type="button" className="text-left text-xs rounded-full border border-indigo-200 px-2 py-1 text-indigo-700" onClick={() => responder(item.pregunta)}>{item.pregunta}</button>)}</div>
          </div>
          <form className="border-t p-2 flex gap-2" onSubmit={(event) => { event.preventDefault(); responder(consulta); }}>
            <input value={consulta} onChange={(event) => setConsulta(event.target.value)} className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm" placeholder="Escribí una pregunta" aria-label="Pregunta para Hacki" />
            <button type="submit" className="rounded-lg bg-indigo-700 px-3 py-2 text-white text-sm font-semibold">Enviar</button>
          </form>
        </section>
      )}
      <button type="button" onClick={() => setAbierto((valor) => !valor)} className="ml-auto flex items-center gap-2 rounded-full bg-indigo-700 text-white px-3 py-2 shadow-lg hover:bg-indigo-800" aria-expanded={abierto}>
        <img src={avatar} alt="" className="w-9 h-9 rounded-full object-cover" /><span className="font-bold">Hacki</span>
      </button>
    </div>
  );
}
