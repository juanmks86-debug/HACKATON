# JujuyTech V8 — Login y perfiles

## Cambios
- Pantalla de bienvenida de doble panel inspirada en la referencia visual.
- Ingreso con email/contraseña, registro de cuenta, Google OAuth y recuperación de contraseña, todos conectados con **Supabase Auth**.
- Inicio de sesión obligatorio antes de mostrar cualquier vista.
- Tres portales de ruta hash: `#/comunidad`, `#/empresarios`, `#/municipio`.
- Rol de cada usuario validado en `public.user_profiles` mediante Supabase RLS. No se confía en la opción seleccionada ni en metadatos editables para municipio.
- Se conserva el mapa 3D V7.3, los eventos con imágenes, el calendario y el modal de recordatorio por email.
- Los indicadores municipales **siguen siendo una demostración**; no están autorizados ni respaldados por API administrativa real.

## Preparación para funcionar
1. Ya se aplicó en Supabase la migración `jujuytech_auth_portal_profiles`.
2. En el dashboard Supabase, revisá **Authentication → Providers → Email** y **Google**; habilitá Google registrando Client ID y Client Secret propios en Google Cloud y proporcionando la URI de callback indicada por Supabase. No se pueden configurar esos datos desde el HTML.
3. **Authentication → URL Configuration**: establecé el Site URL de la aplicación e incluí la URL de desarrollo (por ejemplo `http://localhost:5500/**`) en las redirect URLs autorizadas.
4. Ejecutá: `cd frontend && python3 -m http.server 5500` y abrí `http://localhost:5500`.
5. El archivo HTML standalone incluye imágenes, pero para OAuth Google **no** sirve abrirlo como `file://`. Debe alojarse mediante `http://localhost` o HTTPS.
6. La clave pública publishable incluida en frontend es pública por diseño. Nunca pongas `service_role`, contraseña PostgreSQL o credenciales OAuth en el navegador.

## Roles
- Cuenta nueva al registrarse como Comunidad: `community`.
- Cuenta nueva al registrarse como Red Empresarial: `business`.
- Cuenta municipal: **sólo un operador con permisos SQL administrativos** puede promover el perfil, después de que su usuario se registre:

```sql
update public.user_profiles
set role = 'municipality'
where user_id = '<UUID_DE_UN_USUARIO_AUTORIZADO>';
```

Nunca se permite seleccionar Admin para autoconcederse acceso. Google retorna a la ruta solicitada; el perfil persistido tiene prioridad.

## Limitación de seguridad relevante
La separación de vistas en un HTML de navegador es una **barrera de navegación y presentación**, no autorización de datos confidenciales en el servidor. El dashboard actual muestra indicadores simulados. Antes de usar datos municipales privados habrá que implementar autenticación JWT y autorización de rol en la API .NET 10, además de control de acceso en base de datos.

## Emails de asistencia
Las dos opciones anteriores se preservan: `.ics` con alarma -PT24H y formulario de email que requiere una API .NET 10 desplegada, el proceso de envío y credenciales Gmail protegidas. Este paso **no activa** el envío automático de correos.


## V8.1 — Registro con Google

Ver [GOOGLE_OAUTH_CONFIGURACION.md](GOOGLE_OAUTH_CONFIGURACION.md). El flujo OAuth está preparado, pero activar Google requiere credenciales de Google Cloud y habilitar el proveedor en el panel de Supabase.


## Integración Hacki (V8.3)
Ver `INTEGRACION_HACKI.md` para funcionalidades, despliegue de IA y límites actuales.
