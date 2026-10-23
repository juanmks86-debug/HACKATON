import { test } from "node:test";
import assert from "node:assert/strict";
import { decorateEvent, estadoDe, filtrarEventos, periodoDe } from "./format.js";

const eventoBase = {
  id: 1,
  title: "Taller de coplas",
  startAt: "2026-10-27T17:00:00-03:00",
  description: "Taller de coplas en Casa de las Letras.",
  category: "Literatura y tradición",
  admissionInfo: "Arancelado",
  place: "Casa de las Letras, Belgrano 1327",
  image: "/assets/taller-coplas-elsa-tapia.webp",
  organizer: "Casa de las Letras",
};

test("periodoDe clasifica mañana, tarde y noche en horario de Jujuy", () => {
  assert.equal(periodoDe("2026-10-27T09:30:00-03:00"), "Manana");
  assert.equal(periodoDe("2026-10-27T17:00:00-03:00"), "Tarde");
  assert.equal(periodoDe("2026-10-27T21:30:00-03:00"), "Noche");
  // 23:30 UTC del 27 son las 20:30 en Jujuy: debe ser Noche, no Tarde.
  assert.equal(periodoDe("2026-10-27T23:30:00Z"), "Noche");
});

test("estadoDe distingue finalizado, próximo y hoy", () => {
  const ahora = new Date("2026-10-27T00:00:00-03:00").getTime();
  assert.equal(estadoDe({ startAt: "2026-10-20T18:00:00-03:00" }, ahora), "Finalizado");
  assert.equal(estadoDe({ startAt: "2026-10-27T17:00:00-03:00" }, ahora), "Hoy / próximo");
  assert.equal(estadoDe({ startAt: "2026-11-05T17:00:00-03:00" }, ahora), "Próximo");
});

test("decorateEvent normaliza una fila de la API .NET (camelCase)", () => {
  const fila = {
    id: 7,
    title: "Feria Xibi Xibi",
    startsAtUtc: "2026-11-01T18:00:00Z",
    location: "Parque Lineal",
    imageUrl: "/assets/feria-xibi-xibi.webp",
    visitorTip: "Llevá agua.",
    category: "Feria",
    admissionInfo: "Gratuito",
    latitude: -24.19,
    longitude: -65.29,
    geoSource: "manual",
  };
  const evento = decorateEvent(fila);
  assert.equal(evento.startAt, "2026-11-01T18:00:00Z");
  assert.equal(evento.place, "Parque Lineal");
  assert.equal(evento.image, "assets/feria-xibi-xibi.webp");
  assert.equal(evento.insight, "Llevá agua.");
  assert.equal(evento.price, "Gratuito");
  assert.equal(evento.latitude, -24.19);
  assert.equal(evento.geoSource, "manual");
  assert.equal(evento.period, "Tarde"); // 15:00 en Jujuy
});

test("decorateEvent tolera lat/long y geo en PascalCase", () => {
  const evento = decorateEvent({
    id: 8,
    title: "Evento del mapa",
    startAt: "2026-11-02T10:00:00-03:00",
    Latitude: -24.18,
    Longitude: -65.3,
    GeoSource: "osm",
  });
  assert.equal(evento.latitude, -24.18);
  assert.equal(evento.longitude, -65.3);
  assert.equal(evento.geoSource, "osm");
});

test("decorateEvent completa los campos que faltan sin romper", () => {
  const evento = decorateEvent({ id: 2, title: "Sin datos", startAt: "2026-10-27T17:00:00-03:00" });
  assert.equal(evento.place, "");
  assert.equal(evento.description, "");
  assert.equal(evento.bus, "Sin información oficial");
  assert.equal(evento.price, "No informado");
  assert.equal(evento.image, "");
  assert.equal(evento.latitude, null);
});

test("filtrarEventos respeta franja horaria y búsqueda", () => {
  const eventos = [
    decorateEvent(eventoBase),
    decorateEvent({
      ...eventoBase,
      id: 2,
      title: "Gala Sinfónica",
      startAt: "2026-10-28T21:00:00-03:00",
      category: "Cultura",
      place: "Teatro Mitre",
      organizer: "Teatro Mitre",
      description: "Concierto sinfónico de música andina.",
    }),
  ];
  assert.equal(filtrarEventos(eventos, "all", "").length, 2);
  assert.equal(filtrarEventos(eventos, "Tarde", "").length, 1);
  assert.equal(filtrarEventos(eventos, "Noche", "").length, 1);
  assert.equal(filtrarEventos(eventos, "all", "gala").length, 1);
  assert.equal(filtrarEventos(eventos, "all", "CASA DE LAS LETRAS").length, 1);
  assert.equal(filtrarEventos(eventos, "Noche", "coplas").length, 0);
  assert.equal(filtrarEventos(eventos, "all", "  ").length, 2);
});
