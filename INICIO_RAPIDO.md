# JujuyTech V8.2 — Registro e inicio de sesión

## Error de la captura
Abrir `index.html` con doble clic genera una URL `file://`. Supabase Auth y Google OAuth requieren que el sitio tenga un origen HTTP(S) y un redirect autorizado. En esta versión el formulario informa el bloqueo y deja deshabilitados los botones cuando se abre como archivo.

## Iniciar correctamente

Windows: ejecutá `INICIAR_WINDOWS.bat` o desde una terminal situada en `frontend`: `py -m http.server 5500`.

Linux/Mac: ejecutá `./INICIAR_LINUX_MAC.sh` o desde `frontend`: `python3 -m http.server 5500`.

Después abrí **http://localhost:5500**. No uses `file:///...`. Necesitás conexión a Internet.

## Registro por correo

1. Elegí Comunidad o Red Empresarial y pulsá Crear una cuenta.
2. Completá correo y contraseña de al menos seis caracteres y pulsá Registrarme.
3. Si Supabase exige confirmación de correo, recibís un enlace de validación antes de ingresar. Comprobá Spam y que `http://localhost:5500/**` esté configurado en Authentication → URL Configuration.
4. Verificá la cuenta en Supabase Authentication → Users.

## Google

**No basta con incluir código frontend**: configurá credenciales OAuth de Google.

1. Google Cloud → Google Auth Platform → Clients → aplicación web. Origen: `http://localhost:5500`. URI de redirección autorizada: `https://xthoqiflylgazscokhws.supabase.co/auth/v1/callback`.
2. En Supabase → Authentication → Sign In / Providers → Google: activá Google y guardá *Client ID* y *Client Secret*. No pongas el secreto en el HTML.
3. Supabase → Authentication → URL Configuration: Site URL `http://localhost:5500` para pruebas, y URL adicional `http://localhost:5500/**`.
4. Si Google OAuth está en estado de prueba, agregá tu cuenta en **Test users** de Google Auth Platform.
5. Desde http://localhost:5500 usá el botón Continuar con Google.

El backend de recordatorios Gmail y los permisos JWT de API siguen pendientes de pruebas completas/despliegue. Los roles municipales son cerrados por defecto.
