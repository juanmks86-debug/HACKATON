import { useCallback, useEffect, useState } from "react";
import { apiConfigurada, obtenerEventos } from "../lib/api.js";
import { decorateEvent } from "../lib/format.js";
import eventosPreview from "../data/eventos.json";

const MENSAJE_PREVIEW =
  "Vista previa local de la programación publicada para el 22–28 de octubre. Los datos están cargados también en Supabase, pero esta página aún no consulta la API.";

/**
 * Carga la agenda. Sin API configurada usa la vista previa local y lo dice explícitamente;
 * si la API falla, oculta los registros locales para no confundir una caída con datos reales.
 */
export function useEvents() {
  const [eventos, setEventos] = useState(() => eventosPreview.map(decorateEvent));
  const [mensaje, setMensaje] = useState({ texto: MENSAJE_PREVIEW, tono: "ambar" });
  const [cargando, setCargando] = useState(false);

  const cargar = useCallback(async () => {
    if (!apiConfigurada) {
      setEventos(eventosPreview.map(decorateEvent));
      setMensaje({ texto: MENSAJE_PREVIEW, tono: "ambar" });
      return;
    }
    setCargando(true);
    setMensaje({ texto: "Consultando la agenda desde Supabase a través de la API .NET 10...", tono: "info" });
    try {
      const filas = await obtenerEventos();
      const lista = filas.map((fila) =>
        decorateEvent({
          ...fila,
          isDemo: false,
          durationMinutes: fila.durationMinutes == null ? null : Number(fila.durationMinutes),
        })
      );
      setEventos(lista);
      setMensaje({
        texto: lista.length
          ? `${lista.length} actividad(es) publicada(s) desde Supabase.`
          : "Todavía no hay actividades futuras publicadas en Supabase.",
        tono: "ok",
      });
    } catch {
      setEventos([]);
      setMensaje({
        texto:
          "No fue posible consultar la API. Se ocultan los registros locales para no confundir una falla de conexión con información en tiempo real.",
        tono: "error",
      });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { eventos, mensaje, cargando, recargar: cargar };
}
