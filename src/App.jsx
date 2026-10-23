import { useEffect, useState } from "react";
import { AUTH_PATH, ROLE_PATHS } from "./config.js";
import { useA11y } from "./hooks/useA11y.js";
import { useAuth } from "./hooks/useAuth.js";
import { useEvents } from "./hooks/useEvents.js";
import AccessibilityBar from "./components/layout/AccessibilityBar.jsx";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import AuthScreen from "./components/auth/AuthScreen.jsx";
import ComunidadView from "./components/community/ComunidadView.jsx";
import EmpresarialView from "./components/business/EmpresarialView.jsx";
import MunicipioView from "./components/municipio/MunicipioView.jsx";
import HackiWidget from "./components/hacki/HackiWidget.jsx";

export default function App() {
  const auth = useAuth();
  const a11y = useA11y();
  const { eventos, mensaje } = useEvents();

  // Portal elegido como invitado, para que "Iniciar sesión" vuelva con el mismo seleccionado.
  const [portalInicial, setPortalInicial] = useState("community");

  // URL canónica según el estado. Equivale al guard por hashchange del HTML, pero sin bucles.
  useEffect(() => {
    if (auth.estado === "iniciando") return;
    const ruta = auth.estado === "anonimo" ? AUTH_PATH : ROLE_PATHS[auth.rol] || AUTH_PATH;
    const objetivo = "#" + ruta;
    if (window.location.hash !== objetivo) {
      window.history.replaceState(null, "", window.location.pathname + objetivo);
    }
  }, [auth.estado, auth.rol]);

  if (auth.estado === "iniciando") {
    return <div className="min-h-screen flex items-center justify-center text-gray-600 text-sm">Cargando JujuyTech…</div>;
  }

  if (auth.estado === "anonimo") {
    return <AuthScreen auth={auth} portalInicial={portalInicial} />;
  }

  const vista = auth.rol === "municipality" ? "municipio" : auth.rol;
  const email = auth.esInvitado
    ? auth.rol === "municipality"
      ? "Vista demostrativa · sin acceso a datos privados"
      : "Exploración pública"
    : auth.sesion?.user?.email || "";

  const pedirLogin = () => {
    setPortalInicial(auth.rol || "community");
    auth.salir();
  };

  return (
    <div id="body-app" className={`min-h-screen flex flex-col ${a11y.contraste ? "high-contrast" : ""}`}>
      <AccessibilityBar a11y={a11y} />
      <Header
        auth={auth}
        email={email}
        onPedirLogin={pedirLogin}
        onIrArriba={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {vista === "community" && <ComunidadView eventos={eventos} mensaje={mensaje} modoNocturno={a11y.nocturno} />}
        {vista === "business" && <EmpresarialView />}
        {vista === "municipio" && <MunicipioView eventos={eventos} />}
      </main>
      <Footer />
      {(vista === "community" || vista === "business") && <HackiWidget />}
    </div>
  );
}
