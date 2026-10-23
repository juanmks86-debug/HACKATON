import { useState } from "react";

const PUERTAS = [
  { rol: "community", emoji: "👥", texto: "Comunidad" },
  { rol: "business", emoji: "🏪", texto: "Red Empresarial" },
  { rol: "municipality", emoji: "🏛️", texto: "Municipio / Admin" },
];

const TITULO = {
  login: "¡Bienvenido de nuevo!",
  register: "Crear cuenta JujuyTech",
  reset: "Recuperar contraseña",
};

const LEYENDA = {
  login: "Elegí un portal para entrar sin cuenta o iniciá sesión para acceder con tu perfil.",
  register: "Registrate con tu correo y elegí tu comunidad.",
  reset: "Te enviaremos un enlace para restablecer tu contraseña.",
};

const NOTA_ROL = {
  community: "Accedé para descubrir eventos y participar.",
  business: "Accedé para crear propuestas y conectar con emprendedores.",
  municipality: "Acceso exclusivo para cuentas municipales autorizadas. No se puede registrar desde esta pantalla.",
};

const TEXTO_BOTON = { login: "Iniciar sesión", register: "Registrarme", reset: "Enviar enlace" };

/**
 * Pantalla de acceso. Tocar un portal entra como invitado (así lo hacía el HTML original
 * y así se puede mostrar la demo sin credenciales); el formulario de abajo permite entrar
 * con una cuenta real o crear una.
 */
export default function AuthScreen({ auth, portalInicial = "community" }) {
  const [portal, setPortal] = useState(portalInicial);
  const [modo, setModo] = useState("login");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");

  const { aviso, ocupado, authDisponible } = auth;
  const deshabilitado = !authDisponible || ocupado;

  const elegirPortal = (rol) => {
    setPortal(rol);
    if (rol === "municipality" && modo === "register") setModo("login");
    auth.entrarComoInvitado(rol);
  };

  const cambiarModo = (nuevo) => {
    setModo(nuevo);
    if (nuevo === "register" && portal === "municipality") setPortal("community");
    auth.limpiarAviso();
  };

  const enviar = (evento) => {
    evento.preventDefault();
    const correo = email.trim();
    if (modo === "reset") return auth.recuperarContrasena(correo);
    if (modo === "register") return auth.registrar(correo, contrasena, portal);
    return auth.iniciarSesion(correo, contrasena, portal);
  };

  return (
    <section id="jt-auth-screen" aria-labelledby="jt-login-heading">
      <div className="jt-auth-art">
        <div className="jt-brand-symbol" aria-hidden="true">
          ✳
        </div>
        <div>
          <h1>
            Hola,
            <br />
            JujuyTech 👋
          </h1>
          <p>
            Difusión, comunidad y compromiso.
            <br />
            Conectamos vecinos, emprendedores y municipio con la agenda de Jujuy.
          </p>
        </div>
        <footer style={{ color: "#bdc5ff", fontSize: 13 }}>JujuyTech · Una plataforma para nuestra comunidad</footer>
      </div>

      <div className="jt-auth-panel">
        <div className="jt-auth-inner">
          <div className="jt-auth-wordmark">
            Jujuy<span style={{ color: "#5046f4" }}>Tech</span>
          </div>
          <h2 id="jt-login-heading">{TITULO[modo]}</h2>
          <p className="jt-auth-muted">{LEYENDA[modo]}</p>

          <div role="group" aria-label="Tipo de acceso" className="jt-role-grid">
            {PUERTAS.map(({ rol, emoji, texto }) => (
              <button
                key={rol}
                className="jt-role-option"
                type="button"
                aria-pressed={portal === rol}
                onClick={() => elegirPortal(rol)}
              >
                <b aria-hidden="true">{emoji}</b>
                {texto}
              </button>
            ))}
          </div>

          <p className="jt-auth-muted" style={{ marginBottom: 10 }}>
            {NOTA_ROL[portal]}
          </p>
          <p className="jt-auth-muted" style={{ marginTop: 0 }}>
            O ingresá con tu cuenta para usar funciones personalizadas:
          </p>

          <form onSubmit={enviar}>
            <label htmlFor="jt-auth-email" style={{ fontSize: 12, fontWeight: 750 }}>
              Correo electrónico
            </label>
            <input
              className="jt-field"
              id="jt-auth-email"
              autoComplete="email"
              type="email"
              required
              placeholder="tuemail@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {modo !== "reset" && (
              <>
                <label htmlFor="jt-auth-password" style={{ fontSize: 12, fontWeight: 750 }}>
                  Contraseña
                </label>
                <input
                  className="jt-field"
                  id="jt-auth-password"
                  autoComplete={modo === "register" ? "new-password" : "current-password"}
                  type="password"
                  required
                  minLength={6}
                  placeholder="Tu contraseña"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                />
              </>
            )}

            <button className="jt-auth-button" type="submit" disabled={deshabilitado}>
              {ocupado ? "Conectando..." : TEXTO_BOTON[modo]}
            </button>
          </form>

          {modo !== "reset" && (
            <button className="jt-google-button" type="button" disabled={deshabilitado} onClick={() => auth.ingresarConGoogle(portal)}>
              <span className="jt-google-g" aria-hidden="true">
                G
              </span>
              Continuar con Google
            </button>
          )}

          <div className="jt-auth-links">
            <button type="button" onClick={() => cambiarModo(modo === "login" ? "register" : "login")}>
              {modo === "login" ? "Crear una cuenta" : "Volver al acceso"}
            </button>
            <button type="button" onClick={() => cambiarModo("reset")}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <p className="jt-auth-feedback" data-status={aviso.ok ? "ok" : "error"} role="status" aria-live="polite">
            {aviso.texto}
          </p>

          <p style={{ fontSize: 11, color: "#6b7280" }}>
            Los perfiles municipales deben ser autorizados previamente por un administrador de la plataforma.
          </p>
        </div>
      </div>
    </section>
  );
}
