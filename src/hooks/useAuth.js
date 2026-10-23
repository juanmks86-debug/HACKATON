import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { ROLE_LABELS, ROLES } from "../config.js";

const CLAVE_ROL_PENDIENTE = "jt_v8_requested_role";

/** La autenticación necesita un origen http(s): desde file:// no funciona. */
export const puedeAutenticar = () =>
  typeof window !== "undefined" && /^https?:$/.test(window.location.protocol);

const urlRetorno = () => window.location.origin + window.location.pathname + "#/acceso";

/**
 * Estado de acceso de la app.
 *
 * estado: "iniciando" | "anonimo" | "invitado" | "autenticado"
 * - anonimo:     pantalla de acceso.
 * - invitado:    entró sin cuenta (Comunidad / Red Empresarial / Municipio demo).
 * - autenticado: sesión de Supabase con perfil verificado en user_profiles.
 *
 * El rol NUNCA sale de user_metadata: se lee de la tabla y lo protege RLS.
 */
export function useAuth() {
  const [estado, setEstado] = useState("iniciando");
  const [rol, setRol] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [sesion, setSesion] = useState(null);
  const [aviso, setAviso] = useState({ texto: "", ok: false });
  const [ocupado, setOcupado] = useState(false);
  const [authDisponible, setAuthDisponible] = useState(true);
  const invitado = useRef(null);

  const informar = useCallback((texto, ok = false) => setAviso({ texto, ok }), []);
  const limpiarAviso = useCallback(() => setAviso({ texto: "", ok: false }), []);

  const irAAnonimo = useCallback((texto = "") => {
    invitado.current = null;
    setSesion(null);
    setPerfil(null);
    setRol(null);
    setEstado("anonimo");
    if (texto) setAviso({ texto, ok: false });
  }, []);

  const buscarPerfil = useCallback(async (usuario) => {
    if (!usuario) return null;
    const { data, error } = await supabase
      .from("user_profiles")
      .select("role,display_name,user_id")
      .eq("user_id", usuario.id)
      .single();
    if (error) throw new Error("No se pudo verificar el perfil de acceso. " + error.message);
    if (!ROLES.includes(data.role)) throw new Error("Perfil no autorizado.");
    return data;
  }, []);

  const activarSesion = useCallback(async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    if (!session) {
      irAAnonimo();
      return null;
    }
    setSesion(session);
    let datosPerfil = await buscarPerfil(session.user);

    // Si la persona eligió "Red Empresarial" antes del OAuth, se intenta el pase a business.
    // La política RLS solo permite esta actualización durante el alta inicial (30 minutos).
    const pendiente = sessionStorage.getItem(CLAVE_ROL_PENDIENTE);
    if (pendiente === "business" && datosPerfil.role === "community") {
      const { data, error: errorSubida } = await supabase
        .from("user_profiles")
        .update({ role: "business" })
        .eq("user_id", session.user.id)
        .select("role")
        .single();
      if (!errorSubida && data?.role === "business") datosPerfil = { ...datosPerfil, role: "business" };
      else informar("Tu cuenta tiene un perfil Comunidad. Para cambiarlo, solicitá autorización.");
    }
    sessionStorage.removeItem(CLAVE_ROL_PENDIENTE);

    invitado.current = null;
    setPerfil(datosPerfil);
    setRol(datosPerfil.role);
    setEstado("autenticado");
    return datosPerfil;
  }, [buscarPerfil, informar, irAAnonimo]);

  // Arranque: file://, errores de OAuth que vuelven en la URL y sesión ya existente.
  useEffect(() => {
    (async () => {
      if (!puedeAutenticar()) {
        setAuthDisponible(false);
        irAAnonimo(
          "Para registrarte o ingresar con Google, abrí JujuyTech desde http://localhost:5173. No funciona desde file:// porque la autenticación exige una dirección web."
        );
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const errorOAuth = params.get("error_description") || params.get("error");
      if (errorOAuth) {
        informar("Google no completó el acceso: " + errorOAuth);
        // Limpiamos los parámetros sin perder el hash del portal.
        window.history.replaceState(null, "", window.location.pathname + window.location.hash);
      }
      try {
        await activarSesion();
      } catch (e) {
        irAAnonimo(e.message);
      }
    })();
  }, [activarSesion, informar, irAAnonimo]);

  // Cambios de sesión (login en otra pestaña, refresh del token, logout).
  useEffect(() => {
    if (!authDisponible) return undefined;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((evento) => {
      if (evento === "SIGNED_OUT") {
        irAAnonimo();
        return;
      }
      if (evento === "SIGNED_IN" || evento === "TOKEN_REFRESHED") {
        // No llamamos a Supabase dentro del callback sincrónico de Auth.
        Promise.resolve().then(() => activarSesion().catch((e) => irAAnonimo(e.message)));
      }
    });
    return () => subscription.unsubscribe();
  }, [authDisponible, activarSesion, irAAnonimo]);

  const entrarComoInvitado = useCallback((rolElegido) => {
    invitado.current = rolElegido;
    setSesion(null);
    setPerfil(null);
    setRol(rolElegido);
    setEstado("invitado");
    setAviso({ texto: "", ok: false });
  }, []);

  const iniciarSesion = useCallback(
    async (email, contrasena, portal) => {
      if (!authDisponible) {
        informar("No es posible iniciar sesión desde file://. Abrí http://localhost:5173 y volvé a intentarlo.");
        return;
      }
      if (ocupado) return;
      setOcupado(true);
      informar("Conectando con Supabase...");
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password: contrasena });
        if (error) throw error;
        const datosPerfil = await activarSesion();
        if (datosPerfil && datosPerfil.role !== portal) {
          informar("Ingresaste con tu perfil autorizado: " + ROLE_LABELS[datosPerfil.role] + ".", true);
        }
      } catch (e) {
        const mensaje = String(e.message || "No se pudo iniciar sesión.");
        informar(
          mensaje.includes("Email not confirmed")
            ? "Tenés que confirmar tu correo antes de ingresar. Revisá la bandeja de entrada y Spam."
            : mensaje
        );
      } finally {
        setOcupado(false);
      }
    },
    [activarSesion, authDisponible, informar, ocupado]
  );

  const registrar = useCallback(
    async (email, contrasena, portal) => {
      if (portal === "municipality") {
        informar("El registro municipal requiere invitación de un administrador.");
        return;
      }
      if (!authDisponible) {
        informar("No es posible registrar la cuenta desde file://. Abrí http://localhost:5173 y volvé a intentarlo.");
        return;
      }
      if (ocupado) return;
      setOcupado(true);
      informar("Conectando con Supabase...");
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: contrasena,
          // El trigger de Supabase usa este metadato para crear el perfil inicial.
          options: { data: { portal }, emailRedirectTo: urlRetorno() },
        });
        if (error) throw error;
        if (!data.session) {
          informar(
            "Registro solicitado. Revisá tu correo y confirmá la cuenta antes de ingresar. Si no llega el email, revisá Spam.",
            true
          );
          return;
        }
        await activarSesion();
      } catch (e) {
        informar(String(e.message || "No se pudo crear la cuenta."));
      } finally {
        setOcupado(false);
      }
    },
    [activarSesion, authDisponible, informar, ocupado]
  );

  const recuperarContrasena = useCallback(
    async (email) => {
      if (!authDisponible) {
        informar("Abrí JujuyTech desde http://localhost:5173 para recuperar tu contraseña.");
        return;
      }
      if (ocupado) return;
      setOcupado(true);
      informar("Conectando con Supabase...");
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: urlRetorno() });
        if (error) throw error;
        informar("Si la cuenta existe, recibirás un email de recuperación.", true);
      } catch (e) {
        informar(String(e.message || "No se pudo enviar el email de recuperación."));
      } finally {
        setOcupado(false);
      }
    },
    [authDisponible, informar, ocupado]
  );

  const ingresarConGoogle = useCallback(
    async (portal) => {
      if (!authDisponible) {
        informar("Google requiere abrir JujuyTech desde http://localhost:5173 o un sitio HTTPS, no desde file://.");
        return;
      }
      if (portal === "municipality") {
        informar("Google solo permite el ingreso al municipio si tu usuario ya tiene ese rol autorizado.", true);
        return;
      }
      if (ocupado) return;
      // El portal pedido se conserva solo durante el retorno OAuth; la base decide los permisos.
      if (portal === "business") sessionStorage.setItem(CLAVE_ROL_PENDIENTE, "business");
      else sessionStorage.removeItem(CLAVE_ROL_PENDIENTE);
      setOcupado(true);
      informar("Redirigiendo a Google...", true);
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: urlRetorno(), queryParams: { prompt: "select_account" } },
        });
        if (error) throw error;
      } catch (e) {
        sessionStorage.removeItem(CLAVE_ROL_PENDIENTE);
        informar("No se pudo iniciar el registro con Google: " + (e.message || String(e)));
      } finally {
        setOcupado(false);
      }
    },
    [authDisponible, informar, ocupado]
  );

  const salir = useCallback(async () => {
    if (invitado.current) {
      irAAnonimo();
      return;
    }
    try {
      await supabase.auth.signOut();
    } catch {
      /* si falla el logout remoto, igual limpiamos el estado local */
    }
    irAAnonimo("Sesión cerrada.");
  }, [irAAnonimo]);

  return {
    estado,
    rol,
    perfil,
    sesion,
    aviso,
    ocupado,
    authDisponible,
    esInvitado: estado === "invitado",
    entrarComoInvitado,
    iniciarSesion,
    registrar,
    recuperarContrasena,
    ingresarConGoogle,
    salir,
    informar,
    limpiarAviso,
  };
}
