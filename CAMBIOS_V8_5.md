# JujuyTech V8.5 · Hacki flotante

- Hacki permanece en la esquina inferior derecha, con avatar original.
- Clic en la burbuja: despliega u oculta el chat; botón × cierra.
- Solo Comunidad y Red Empresarial, con o sin login. No se muestra en acceso ni Municipio/Admin.
- FAQ y respuestas locales conservadas. Las respuestas abiertas de IA requieren desplegar el backend `/api/chat`.
- Servir la carpeta `frontend` mediante `python -m http.server 5500`; visitar `http://localhost:5500`.
- No se modifican Supabase ni la autenticación, el mapa o los recordatorios.

## Corrección del mapa (V8.5.1)
- Se eliminó `maplibregl.supported()` (no existe en MapLibre 3+/4.7.1): lanzaba un error y el mapa nunca arrancaba, con o sin login.
- El mapa ya no se crea mientras el portal está oculto (contenedor 0×0): se inicializa cuando el contenedor es visible y se redimensiona con `ResizeObserver`.
- Se reemplazó por una comprobación de WebGL propia.
