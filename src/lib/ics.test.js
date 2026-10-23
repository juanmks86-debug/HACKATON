import { test } from "node:test";
import assert from "node:assert/strict";
import { aIcsUtc, construirIcs, escaparIcs, plegarLinea, urlGoogleCalendar } from "./ics.js";

const evento = {
  id: 4,
  title: "Taller de coplas — Elsa Tapia",
  startAt: "2026-10-27T17:00:00-03:00",
  description: "Taller de coplas, con cupo limitado.",
  place: "Casa de las Letras, Belgrano 1327",
  durationMinutes: null,
  isDemo: false,
};

test("aIcsUtc produce el formato de RFC 5545", () => {
  assert.equal(aIcsUtc(new Date("2026-10-27T17:00:00-03:00")), "20261027T200000Z");
});

test("escaparIcs neutraliza comas, punto y coma, barras y saltos de línea", () => {
  assert.equal(escaparIcs("Casa de las Letras, Belgrano 1327"), "Casa de las Letras\\, Belgrano 1327");
  assert.equal(escaparIcs("a;b"), "a\\;b");
  assert.equal(escaparIcs("linea1\nlinea2"), "linea1\\nlinea2");
  assert.equal(escaparIcs("C:\\ruta"), "C:\\\\ruta");
});

test("plegarLinea nunca supera 75 octetos y las continuaciones empiezan con espacio", () => {
  const larga = "x".repeat(200);
  const plegada = plegarLinea(larga);
  const lineas = plegada.split("\r\n");
  assert.ok(lineas.length > 1);
  for (const linea of lineas) {
    assert.ok(new TextEncoder().encode(linea).length <= 75, "línea demasiado larga");
  }
  for (let i = 1; i < lineas.length; i++) assert.ok(lineas[i].startsWith(" "));
  // Con acentos (2 octetos) también debe respetar el límite.
  assert.ok(plegarLinea("á".repeat(100)).split("\r\n").every((l) => new TextEncoder().encode(l).length <= 75));
});

test("construirIcs arma un VCALENDAR válido con alarma de 24 horas", () => {
  // Se compara sobre el contenido desplegado: plegarLinea puede cortar cualquier línea larga.
  const ics = construirIcs(evento, new Date("2026-10-01T12:00:00Z")).replace(/\r\n /g, "");
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n"));
  assert.ok(ics.endsWith("END:VCALENDAR\r\n"));
  assert.match(ics, /DTSTAMP:20261001T120000Z/);
  assert.match(ics, /DTSTART:20261027T200000Z/);
  assert.match(ics, /TRIGGER:-PT24H/);
  assert.match(ics, /UID:evento-4@jujuytech/);
  assert.match(ics, /STATUS:CONFIRMED/);
  assert.match(ics, /coplas\\, con cupo limitado/);
  // Sin durationMinutes no debe inventar DTEND.
  assert.doesNotMatch(ics, /DTEND/);
});

test("un evento demo se marca como DEMO y TENTATIVE", () => {
  const ics = construirIcs({ ...evento, isDemo: true }, new Date("2026-10-01T12:00:00Z"));
  assert.match(ics, /SUMMARY:\[DEMO\]/);
  assert.match(ics, /STATUS:TENTATIVE/);
  assert.match(ics, /FICTICIO/);
});

test("urlGoogleCalendar arma el enlace con fechas y ubicación", () => {
  const url = urlGoogleCalendar({ ...evento, isDemo: true });
  assert.ok(url.startsWith("https://calendar.google.com/calendar/render?"));
  const parametros = new URL(url).searchParams;
  assert.equal(parametros.get("action"), "TEMPLATE");
  assert.equal(parametros.get("dates"), "20261027T200000Z/20261027T210000Z");
  assert.ok(parametros.get("text").startsWith("[DEMO] "));
  assert.match(parametros.get("location"), /Casa de las Letras/);
  assert.match(parametros.get("details"), /1 hora/);
});
