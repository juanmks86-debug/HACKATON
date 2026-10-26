import { Globe2, Menu, X } from "lucide-react";
import { useState } from "react";
import { ROLE_LABELS } from "../../config.js";
import AccessibilityBar from "./AccessibilityBar.jsx";

export default function Header({ auth, email, onPedirLogin, onIrArriba, a11y }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { esInvitado } = auth;
  const enlaces = [["Agenda", "#agenda-title"], ["Mapa 3D", "#mapa-eventos"], ["Comunidad", "#top"], ["Ayuda", "#hacki"]];
  const usuario = esInvitado ? "Invitado" : email || ROLE_LABELS[auth.rol] || "Mi cuenta";
  const cerrarMenu = () => setMenuAbierto(false);

  return <header className="site-header">
    <div className="site-header__inner">
      <a href="#top" className="brand-lockup" onClick={onIrArriba} aria-label="Ir al inicio de JujuyTech"><span className="brand-lockup__mark">J</span><span><strong>Jujuy<span>Tech</span></strong><small>Difusión, comunidad y compromiso</small></span></a>
      <button type="button" className="header-menu-button" onClick={() => setMenuAbierto((valor) => !valor)} aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuAbierto}>{menuAbierto ? <X /> : <Menu />}</button>
      <nav className={`site-nav ${menuAbierto ? "site-nav--open" : ""}`} aria-label="Navegación principal">{enlaces.map(([texto, href]) => <a key={texto} href={href} onClick={cerrarMenu}>{texto}</a>)}</nav>
      <div className="site-header__actions"><span className="header-language"><Globe2 aria-hidden="true" /> ES</span><AccessibilityBar a11y={a11y} /><span className="header-user" title={ROLE_LABELS[auth.rol] || "Usuario"}>{usuario}</span>{esInvitado ? <button type="button" className="header-login" onClick={onPedirLogin}>Iniciar sesión</button> : <button type="button" className="header-logout" onClick={auth.salir}>Cerrar sesión</button>}</div>
    </div>
  </header>;
}
