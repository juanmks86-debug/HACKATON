import { ROLE_LABELS } from "../../config.js";

/** Encabezado con marca, portal activo y las acciones de sesión. */
export default function Header({ auth, email, onPedirLogin, onIrArriba }) {
  const { esInvitado } = auth;
  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <button type="button" className="flex items-center space-x-3 text-left" onClick={onIrArriba}>
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-red-500 via-yellow-500 to-green-500 flex items-center justify-center text-white font-black text-xl shadow">
            J
          </div>
          <div>
            <h1 className="font-extrabold text-xl leading-none text-gray-900 tracking-tight">
              Jujuy<span className="text-amber-600">Tech</span>
            </h1>
            <p className="text-xs text-gray-500 font-medium">Difusión, comunidad y compromiso</p>
          </div>
        </button>

        <div className="jt-profilebar">
          <span id="jt-active-portal">
            {ROLE_LABELS[auth.rol]}
            {esInvitado ? " · Invitado" : ""}
          </span>
          <span id="jt-active-email" className="text-gray-500">
            {email}
          </span>
          {esInvitado && (
            <button id="jt-signin-from-guest" type="button" onClick={onPedirLogin}>
              Iniciar sesión
            </button>
          )}
          <button id="jt-logout" type="button" onClick={auth.salir}>
            {esInvitado ? "Volver al inicio" : "Cerrar sesión"}
          </button>
        </div>
      </div>
    </header>
  );
}
