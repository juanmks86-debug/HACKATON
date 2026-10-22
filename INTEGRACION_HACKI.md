# JujuyTech V8.3 — Hacki integrado

## Qué se hizo
- El widget original `Hacki-main/public/widget.js` y sus avatares, FAQ y eventos se integraron en `frontend/hacki/`.
- El widget aparece solo luego de iniciar sesión con un perfil `community` o `business` validado por Supabase.
- En `#/acceso`, cuando se cierra sesión y para `municipality`, permanece oculto.
- No se eliminaron otras funciones de JujuyTech V8.2 (mapa, calendario, asistencias, login).
- Chat local: FAQ y eventos del archivo recibido. **Sus datos podrían estar desactualizados; no reemplazan la cartelera de Supabase.**
- Modo IA de Hacki: NO queda operativo con servidor estático `python -m http.server`. Se necesita desplegar el backend serverless incluido en `chatbot_hacki_original/api/`, configurar `IA_KEY` en el servidor y publicar un endpoint `/api/chat` accesible desde el dominio de JujuyTech. Si está en otro dominio, editar `data-api` y `ALLOWED_ORIGINS` del servidor.
- Los secretos no se deben poner en HTML, JavaScript público ni Git.

## Prueba local
Dentro de `frontend/`, ejecutar `python -m http.server 5500` y abrir `http://localhost:5500`. La autenticación de Google requiere configuración de OAuth en Supabase/Google, tal como la V8.2. Para probar el chat, iniciar sesión en Comunidad o Red Empresarial y pulsar la burbuja Hacki. Preguntas existentes en FAQ se responden localmente; respuestas abiertas necesitan la API de IA desplegada.

## Nota seguridad
La visibilidad en frontend no reemplaza controles de API: el backend de IA debe validar sesión y aplicar cuotas si se publica exclusivamente para usuarios autenticados. El `api/chat.js` original usa límites por IP, pero no implementa validación del JWT de Supabase. No se habilitó como endpoint privado de producción.
