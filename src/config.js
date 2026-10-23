// Configuración pública del frontend. Las variables VITE_* terminan en el bundle;
// nunca incluir service_role, contraseñas ni secretos privados aquí.
const env = import.meta.env ?? {};
const globales = typeof window === "undefined" ? {} : window;

export const SUPABASE_URL = env.VITE_SUPABASE_URL || globales.JUJUYTECH_SUPABASE_URL || "https://xthoqiflylgazscokhws.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY || globales.JUJUYTECH_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_hLykGuoaA-J3NNPWkl5qsw_wGRdGzdK";
export const API_BASE_URL = String(env.VITE_API_BASE_URL || globales.JUJUY_API_BASE_URL || "").replace(/\/$/, "");

export const ROLES = ["community", "business", "municipality"];
export const ROLE_LABELS = {
  community: "Comunidad",
  business: "Red Empresarial",
  municipality: "Municipio / Admin",
};
export const ROLE_PATHS = {
  community: "/comunidad",
  business: "/empresarios",
  municipality: "/municipio",
};
export const AUTH_PATH = "/acceso";
export const ZONA_HORARIA = "America/Argentina/Jujuy";
