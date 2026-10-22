# Supabase — estado comprobado en esta conversación

- Proyecto indicado: `xthoqiflylgazscokhws` (en el panel figura nombre **JujuyTech**).
- Base: PostgreSQL 17, región `sa-east-1` (São Paulo).
- Conexión a Supabase desde ChatGPT: confirmada al consultar proyectos y tablas.
- Tablas existentes: `public.events`, `public.attendance_reminders`.
- Registros en `events`: **5** correspondientes al ciclo cultural octubre 2026; `attendance_reminders`: **0** cuando se comprobó.
- Migraciones remotas aplicadas (NO volver a ejecutar):
  - `20261022172712` — `initial_events_and_attendance_reminders`
  - `20261022174739` — `cultural_events_details_and_2026_october_seed`
- RLS activo en ambas tablas. No se otorgó SELECT de correos al rol `anon` ni `authenticated`.
- Análisis de seguridad: aviso informativo `rls_enabled_no_policy` en ambas tablas; se dejó a propósito sin acceso directo por Data API. Acceder con una conexión PostgreSQL segura desde el backend.
- `DurationMinutes`: nullable; columnas culturales añadidas: `Description`, `Category`, `AdmissionInfo`, `ImageUrl`, `SourceUrl`, `SourceKey`, `VisitorTip`, `Organizer`.

## Precauciones

- No ejecutar de nuevo el script `001_initial_schema_RENUNCA.sql` ni crear `InitialCreate` con `dotnet ef database update` sobre las mismas tablas.
- Las migraciones remotas de Supabase son la referencia del esquema actual; EF Core se usa como ORM y debe mapearse al esquema existente.
- La tabla `events` tiene rutas de imagen de la forma `/assets/archivo.webp`. Esas imágenes están **en este paquete local**, NO subidas a Supabase Storage ni servidas en un dominio público.
- Las fechas almacenadas son UTC; mostrarlas con huso `America/Argentina/Jujuy`.
- No hay un endpoint administrativo autenticado implementado, ni controles de roles reales para panel municipal.
- No se han incluido cadenas de conexión, contraseñas ni claves privadas.

[Panel del proyecto](https://supabase.com/dashboard/project/xthoqiflylgazscokhws)
