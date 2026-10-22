# JujuyConecta — Starter backend .NET 10 (recordatorios)

Este starter acompaña a `JujuyConecta_prototipo_v4.html`. No está desplegado ni conectado todavía; requiere credenciales; las tablas de eventos y recordatorios ya fueron creadas en Supabase. Las fechas en el HTML son **ficticias**. El proyecto usa Clean Architecture (Domain / Application / Infrastructure / Api), EF Core 10 y Supabase PostgreSQL.

## Primeros pasos

Requiere SDK .NET 10 y acceso a la base PostgreSQL de Supabase.

```bash
# Desde la carpeta de este README
export ConnectionStrings__Supabase='Host=...;Port=5432;Database=postgres;Username=...;Password=...;SSL Mode=Require;'
export Gmail__Address='cuenta@gmail.com'
export Gmail__AppPassword='CONTRASENA_DE_APLICACION' # NUNCA versionar
export Job__Secret='SECRETO_LARGO_ALEATORIO'
dotnet run --project src/JujuyConecta.Api
```

Para generar migraciones EF en este starter es posible que tengas que implementar `IDesignTimeDbContextFactory<JujuyDbContext>` si el entorno de tooling no puede resolver las variables de configuración. No ejecutar `EnsureCreated()` en producción.

### Crear eventos

El backend **no siembra eventos automáticamente**. Cargá eventos validados en `events` mediante tu futura API municipal o una importación segura. Los IDs 1 a 5 del HTML solo funcionan si tenés esos mismos eventos en la base. El frontend muestra fechas inventadas para probar el `.ics`. Antes de activar el envío real, cambiá el frontend para consumir eventos reales desde `GET /api/events` (endpoint aún no implementado) y no mezcles IDs ficticios con producción.

### Registrar recordatorio

`POST /api/attendances`:

```json
{
  "eventId": 123,
  "email": "usuario@ejemplo.com",
  "reminderConsent": true,
  "newsConsent": false
}
```

`201` al registrar; `200` si ya existía; `400` al fallar validación; `404` evento inexistente; `409` si faltan menos de 24 horas. La fecha se guarda en UTC. El `NewsConsent` se conserva de forma independiente, pero este starter **no envía newsletters**.

### Integración con HTML

Con el backend expuesto en HTTPS y CORS configurado, crear un `config.js` que se cargue *antes* del script interno del HTML:

```html
<script>window.JUJUY_API_BASE_URL='https://tu-api.example.com';</script>
```

No definir en JavaScript ninguna clave privada ni credencial de Google/Supabase. Como el HTML se abre como archivo local (`file://`), para conectar la API conviene servir el HTML con un servidor local HTTP (`python -m http.server 5500`).

### Enviar los correos

Con una cuenta Gmail personal que permita **contraseñas de aplicación** (requiere verificación en dos pasos y sujeto a políticas de Google), configurá `Gmail__Address` y `Gmail__AppPassword`. En producción, preferir OAuth 2.0 y una plataforma transaccional con control de rebotes, baja y reputación si aumenta la escala.

El envío se inicia por `POST /internal/jobs/send-reminders` con header `X-Job-Key: <Job__Secret>`. Programá la solicitud cada minuto desde Supabase Cron + pg_net o un servicio equivalente. **Este starter no instala automáticamente el Cron ni expone públicamente una clave.** En Supabase guarda el secreto en Vault o un mecanismo de secretos, no pegues credenciales en SQL versionado.

### Advertencias antes de producción

- Añadir verificación de email (doble opt-in), cancelación de asistencia, privacidad y retención de PII.
- El rate limiting incluido es global por instancia; para servicios públicos implementá protección distribuida/IP, CAPTCHA y monitoreo anti-abuso.
- Mejorar persistencia de trabajos tipo Outbox y supervisión de entregas: SMTP es *al menos una vez*, no exactamente una vez si falla tras enviar y antes de registrar `Sent`.
- Mantener los eventos y fechas sincronizados entre la API y el frontend; recalcular fechas de recordatorios cuando se reprograme un evento.
- Usar autenticación real para los endpoints administrativos. Las consultas del dashboard no están implementadas en este starter.
- Configurar SPF/DKIM/DMARC cuando se utilice un dominio propio, y monitorear límites de Gmail.
- Este starter es base de implementación, no un sistema productivo auditado. 

## Base remota existente
La migración `initial_events_and_attendance_reminders` ya fue aplicada a Supabase; no ejecutar una migración EF InitialCreate que duplique esas tablas. Consulta el README principal de V5.
