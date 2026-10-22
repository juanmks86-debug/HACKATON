# JujuyTech V8.4 — Acceso opcional

- Tocando las tarjetas **Comunidad**, **Red Empresarial** o **Municipio/Admin** de la bienvenida se entra sin cuenta.
- El portal Municipio sin iniciar sesión es **únicamente una demostración**; no se conceden privilegios ni datos privados.
- El encabezado muestra **Iniciar sesión** para entrar con Supabase mediante correo o Google.
- **Volver al inicio** cierra la vista como invitado.
- Los permisos auténticos se siguen verificando usando `user_profiles`.
- Hacki aparece para visitantes de Comunidad y Red Empresarial, no en Municipio.
- No se modificaron las bases de datos ni el backend.
- Para autenticación real seguir usando `http://localhost:5500` y configurar Google OAuth.
