import { ArrowUpRight, Instagram, Linkedin, Youtube, MessageCircle, Mail, MapPin, Clock3 } from "lucide-react";
import { useState } from "react";

const explorar = [["Agenda completa", "#agenda-title"], ["Actividades destacadas", "#featured-carousel"], ["Mapa 3D", "#mapa-eventos"], ["Inicio", "#top"]];
const organizadores = [["Publicar evento", "mailto:contacto@jujuytech.ar?subject=Quiero%20publicar%20un%20evento"], ["Colaborar", "mailto:contacto@jujuytech.ar?subject=Quiero%20colaborar"]];
const redes = [[Instagram, "Instagram", "https://instagram.com"], [Linkedin, "LinkedIn", "https://linkedin.com"], [Youtube, "YouTube", "https://youtube.com"], [MessageCircle, "WhatsApp", "https://wa.me/5493880000000"]];
const categorias = ["Arte", "Música", "Literatura", "Taller", "Tecnología", "Gastronomía", "Gratis"];

function irACategoria(event, categoria) {
  event.preventDefault();
  window.dispatchEvent(new CustomEvent("agenda-filter", { detail: categoria }));
  window.location.hash = "agenda-title";
  document.getElementById("agenda-title")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const suscribir = (event) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setMensaje("Ingresá un correo válido."); return; }
    setMensaje("¡Listo! Te enviaremos la agenda semanal.");
    setEmail("");
  };
  const abrirHacki = (event) => { event.preventDefault(); window.dispatchEvent(new Event("hacki-open")); };

  return <footer className="site-footer">
    <div className="site-footer__inner">
      <div className="footer-top-band"><a className="footer-cta" href="mailto:contacto@jujuytech.ar?subject=Quiero%20publicar%20un%20evento"><span><strong>¿Tenés un evento? Publicalo aquí</strong><small>Gratis para organizaciones locales</small></span><ArrowUpRight aria-hidden="true" /></a><form className="footer-newsletter" onSubmit={suscribir}><div><strong>Recibí la agenda de la semana</strong><span>Eventos culturales y tecnológicos de Jujuy.</span></div><div className="footer-newsletter__form"><label className="sr-only" htmlFor="newsletter-email">Correo electrónico</label><input id="newsletter-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@email.com" aria-describedby="newsletter-message" /><button type="submit">Suscribirme</button></div>{mensaje && <p id="newsletter-message" className={mensaje.startsWith("Ingresá") ? "footer-form-error" : "footer-form-success"} role="status">{mensaje}</p>}</form></div>

      <div className="footer-columns"><section className="footer-brand"><a href="#top" className="footer-brand__logo" aria-label="Volver al inicio"><span>J</span><strong>Jujuy<span>Tech</span></strong></a><p className="footer-tagline">Difusión, comunidad y compromiso</p><p>Plataforma de conexión cultural y tecnológica en San Salvador de Jujuy.</p><div className="footer-socials">{redes.map(([Icono, texto, href]) => <a key={texto} href={href} target="_blank" rel="noreferrer" aria-label={texto}><Icono aria-hidden="true" /></a>)}</div></section><FooterColumn title="Explorar" links={explorar} /><FooterColumn title="Organizadores" links={organizadores} /><section className="footer-column"><h2>Ayuda</h2><ul><li><a href="#hacki" onClick={abrirHacki}>Preguntas frecuentes</a></li><li><a href="#hacki" onClick={abrirHacki}>Hablar con Hacki</a></li><li><a href="mailto:contacto@jujuytech.ar?subject=Reportar%20un%20problema">Reportar un problema</a></li></ul></section><section className="footer-column"><h2>Contacto</h2><ul><li><a href="mailto:contacto@jujuytech.ar"><Mail aria-hidden="true" />contacto@jujuytech.ar</a></li><li><span><MapPin aria-hidden="true" />Culturarte, San Salvador de Jujuy</span></li><li><span><Clock3 aria-hidden="true" />Lun a vie · 9:00 a 17:00</span></li></ul></section></div>

      <div className="footer-categories"><h2>Explorá por categoría</h2><div>{categorias.map((categoria) => <a key={categoria} href="#agenda-title" onClick={(event) => irACategoria(event, categoria)}>{categoria}</a>)}</div></div>
      <div className="footer-allies"><h2>Con el apoyo de</h2><div><span>ALIADO 01</span><span>ALIADO 02</span><span>ALIADO 03</span><span>ALIADO 04</span></div></div>
      <div className="footer-legal"><span>© 2026 JujuyTech. Todos los derechos reservados.</span><div><a href="#terminos">Términos y condiciones</a><a href="#privacidad">Política de privacidad</a><a href="#cookies">Cookies</a><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Volver arriba ↑</button></div></div>
    </div>
  </footer>;
}

function FooterColumn({ title, links }) { return <section className="footer-column"><h2>{title}</h2><ul>{links.map(([texto, href]) => <li key={texto}><a href={href}>{texto}</a></li>)}</ul></section>; }
