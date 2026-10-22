# Registro con Google — JujuyTech V8.1

## Implementación incluida

El frontend ahora llama a `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo, queryParams: { prompt: 'select_account' } } })` para **ingreso y alta de cuentas** con Google.

- Comunidad: las nuevas cuentas reciben el perfil `community`.
- Red Empresarial: cuando se selecciona antes de Google, el navegador recuerda esa selección durante la vuelta de OAuth y solicita el perfil `business`. El cambio está condicionado por la política RLS para una cuenta recién creada; una cuenta existente no puede autoconcederse permisos elevados.
- Municipio/Admin: no existe alta pública. Solo accede un usuario autorizado previamente en `public.user_profiles`.
- En cada acceso el rol se consulta en Supabase, no se concede desde el navegador.
- Google puede asociar su identidad a una cuenta existente según la configuración de Supabase Auth. No se fuerza un alta duplicada.

## Configuración manual obligatoria (no está activada aún)

1. Abrí https://console.cloud.google.com/auth/overview y configurá **Google Auth Platform** (Branding, Audience/usuarios de prueba, Data Access). Usá los scopes `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`. Para pruebas en estado Testing, añadí los emails de prueba.
2. Creá **Client ID de tipo Aplicación web** en https://console.cloud.google.com/auth/clients. En **JavaScript origins** agregá `http://localhost:5500` y el dominio HTTPS donde se desplegará JujuyTech.
3. En **Authorized redirect URIs de Google**, registrá *exactamente*: `https://xthoqiflylgazscokhws.supabase.co/auth/v1/callback`.
4. Copiá **Client ID** y **Client Secret** al proveedor Google en https://supabase.com/dashboard/project/xthoqiflylgazscokhws/auth/providers . Nunca pongas el *Client Secret* en archivos del frontend o chats.
5. En Supabase **Authentication → URL Configuration**: agregá `http://localhost:5500/**` en Redirect URLs. Configurá Site URL conforme al despliegue (por ejemplo `http://localhost:5500` para desarrollo). Agregá también las URL HTTPS productivas.
6. Levantá el frontend con `cd frontend && python3 -m http.server 5500`. Abrí `http://localhost:5500`, elegí **Comunidad** o **Red Empresarial** y pulsá **Continuar con Google**. Debería redirigir a Google, regresar al sitio y abrir `#/comunidad` o `#/empresarios`.
7. Comprobá en Supabase **Authentication → Users** que se creó la cuenta, y verificá `public.user_profiles` para confirmar rol. Para probar Google con una segunda cuenta, cerrá sesión primero.

## Seguridad y límites

- El código de Google OAuth está implementado, pero no se puede completar una autenticación real hasta habilitar el proveedor con credenciales propias y redirects correctos. No se ha ensayado una autenticación real con usuario Google.
- La clave `sb_publishable_...` es pública. Nunca exponer service_role ni el Client Secret.
- Las rutas del frontend **no** sustituyen la autorización JWT de la API .NET y permisos de base de datos para información municipal sensible.
- Los recordatorios de email no se activan con esta implementación.

Más información: https://supabase.com/docs/guides/auth/social-sign-in/auth-google
