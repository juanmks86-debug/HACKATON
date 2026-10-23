import { Instagram, Linkedin, Youtube, MessageCircle, Mail, MapPin, ArrowUpRight } from "lucide-react";

const enlaces = [
  ["Actividades destacadas", "#featured-carousel"],
  ["Agenda completa", "#agenda-title"],
  ["Mapa 3D", "#mapa-eventos"],
  ["FAQ / Ayuda", "#hacki"],
  ["Colaborar", "mailto:contacto@jujuytech.ar?subject=Quiero%20colaborar"],
];

const redes = [
  [Instagram, "Instagram", "https://instagram.com"],
  [Linkedin, "LinkedIn", "https://linkedin.com"],
  [Youtube, "YouTube", "https://youtube.com"],
  [MessageCircle, "Discord / WhatsApp", "https://wa.me/5493880000000"],
];

export default function Footer() {
  return (
    <footer className="mt-12 bg-slate-800 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <a href="#top" className="flex items-center gap-3" aria-label="Volver al inicio de JujuyTech">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-2xl font-black text-slate-900">J</span>
              <span className="text-xl font-extrabold">JujuyTech</span>
            </a>
            <p className="mt-4 font-semibold text-amber-200">Difusión, comunidad y compromiso</p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-300">Plataforma de conexión cultural y tecnológica en San Salvador de Jujuy.</p>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Enlaces rápidos</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {enlaces.map(([texto, href]) => <li key={texto}><a className="hover:text-amber-200 hover:underline" href={href}>{texto}</a></li>)}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Comunidad</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {redes.map(([Icono, texto, href]) => <li key={texto}><a className="inline-flex items-center gap-2 hover:text-amber-200" href={href} target="_blank" rel="noreferrer"><Icono className="h-4 w-4" aria-hidden="true" />{texto}</a></li>)}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Contacto y legal</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <a className="flex items-center gap-2 hover:text-amber-200" href="mailto:contacto@jujuytech.ar"><Mail className="h-4 w-4" />contacto@jujuytech.ar</a>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />Culturarte, San Salvador de Jujuy</p>
              <a href="mailto:contacto@jujuytech.ar?subject=Quiero%20publicar%20un%20evento" className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-3 font-bold text-slate-900 transition hover:bg-amber-300">¿Tenés un evento? Publicalo aquí <ArrowUpRight className="h-4 w-4" /></a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-700 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 JujuyTech. Todos los derechos reservados.</p>
          <div className="flex gap-4"><a href="#terminos" className="hover:text-white">Términos y Condiciones</a><a href="#privacidad" className="hover:text-white">Política de Privacidad</a></div>
        </div>
      </div>
    </footer>
  );
}
