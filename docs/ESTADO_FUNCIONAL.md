# Funcionalidades — implementado versus pendiente

| Módulo | Implementación en código | Conexión real / producción |
|---|---|---|
| Comunidad — tarjetas de eventos | Sí: categoría, foto temática, fecha, lugar, descripción, condición de entrada | Con API configurada consulta `GET /api/events`; sin configurar muestra vista previa local |
| Carrusel Top 5 | Sí en frontend | Vista previa o alimentado por API, no ranking real |
| Búsqueda y filtros | Sí en frontend (horario y texto) | Sólo sobre eventos cargados en pantalla |
| Mapa / transporte | Mapa ilustrativo | Sin geolocalización ni líneas de colectivo verificadas |
| Modal «Asistir» | Sí, registro de correo y consentimiento | Requiere API configurada, backend corriendo y conexión a Supabase |
| Descargar `.ics` | Sí (alarma `TRIGGER:-PT24H`) | El cliente de calendario determina notificaciones reales |
| Google Calendar | Abre formulario desde web | Confirmar manualmente alerta de 24 h |
| Recordatorio Gmail 24 h | Servicio SMTP / dispatcher en backend base | No configurado ni desplegado, requiere contraseña de **aplicación** u OAuth + scheduler |
| Red Empresarial | Diseño/formulario demostrativo | No guarda propuestas ni autentica organizadores |
| Municipio / Analítica | Panel ilustrativo, separado de navegación pública | Sin autenticación ni autorización real; métricas simuladas |
| Predicciones ML | Comentarios informativos por evento | NO existe modelo predictivo entrenado ni métricas de confianza |
| Google Analytics 4 | Planificado | No integrado |
| WhatsApp individual | Planteado como opción futura | No conectado; la API oficial tiene políticas y costos |
| Canal WhatsApp | Idea y propuesta manual | Publicación automática no implementada |
| Supabase Auth | Planeado | No integrado al sitio |
| Supabase Storage | Planeado para imágenes | No integrado |

**Nota:** las tarjetas V6 usan textos etiquetados como datos útiles; no son predicciones verificadas. El registro de asistencia es intención de asistir, no control de presencia real.
