# JujuyTech Web

Aplicación oficial React + Vite de JujuyTech. La versión anterior basada en HTML quedó conservada en `legacy/frontend-html` como respaldo.

## Ejecutar

Desde la raíz del repositorio:

```bash
cd apps/jujuytech-web
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

Otros comandos:

```bash
npm test
npm run build
npm run preview
```

## Configuración

Copiá `.env.example` como `.env` cuando necesites conectar servicios:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Las variables `VITE_*` son públicas y terminan en el bundle del navegador. Nunca agregues `service_role`, contraseñas, secretos SMTP ni claves privadas.

## Estructura

```text
src/
├── App.jsx
├── components/
│   ├── auth/              login, registro, OAuth y recuperación
│   ├── business/          portal Red Empresarial
│   ├── community/         portal Comunidad
│   ├── events/            tarjetas, mapa, carrusel y asistencia
│   ├── hacki/             widget conversacional React
│   ├── layout/            cabecera, pie y accesibilidad
│   └── municipio/         portal municipal demostrativo
├── data/                  agenda local y datos FAQ de Hacki
├── hooks/                 autenticación, eventos y accesibilidad
└── lib/                   API, Supabase, formatos y calendarios
```

## Migración completada

- Autenticación Supabase por email, registro, recuperación y Google OAuth.
- Portales por rol: Comunidad, Red Empresarial y Municipio.
- Agenda local y carga desde `GET /api/events`.
- Búsqueda, filtros, carrusel y tarjetas de eventos.
- Mapa MapLibre con panel, marcadores y selección de eventos cuando existen coordenadas.
- Modal de calendario `.ics`, Google Calendar y registro real mediante `POST /api/attendances` cuando la API está configurada.
- Hacki convertido a componente React, con FAQ local y soporte opcional para `/api/chat`.
- Accesibilidad, alto contraste y diseño responsive.
- Tests de utilidades puras mediante `node --test`.

## Límites actuales

El dashboard municipal continúa siendo demostrativo. La autorización real de datos municipales debe implementarse en el backend mediante JWT, roles y políticas de base de datos. La API de Hacki debe validar la sesión y aplicar cuotas antes de publicarse.
