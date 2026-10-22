-- BORRADOR, NO PUBLICAR SIN CONFIRMAR FECHAS Y LUGARES.
-- Los seis eventos de index2.html son ejemplos no verificados.
-- No usar fechas ficticias para llenar StartsAtUtc (NOT NULL).
-- Complete starts_at_utc para cada evento y cambie cada NULL por fecha verificable.
-- Este script no inserta ninguna fila mientras no haya fechas verificadas.

WITH candidatos(title,category,location,description,starts_at_utc,latitude,longitude,source_key) AS (
  VALUES
    ('Feria de Emprendedores - Xibi Xibi', 'Feria', 'Parque Lineal Xibi Xibi (Pte. Gorriti), San Salvador de Jujuy', 'Stands de diseño jujeño, plantas ornamentales, artesanías y música en vivo a orillas del río.', NULL::timestamptz, -24.1915::numeric, -65.297::numeric, 'mapa-demo-1'),
    ('Paseo de las Luces & Salón de la Bandera', 'Cultura', 'Plaza Belgrano - Casa de Gobierno, San Salvador de Jujuy', 'Visita histórica a las esculturas de Lola Mora y la Bandera Nacional donada por el Gral. Belgrano.', NULL::timestamptz, -24.1856::numeric, -65.3035::numeric, 'mapa-demo-2'),
    ('Jujuy Tech & Startups Meetup', 'Networking', 'Club de Emprendedores (Parque San Martín), San Salvador de Jujuy', 'Charlas de programación, inteligencia artificial, startups e inversión con networking libre.', NULL::timestamptz, -24.18383396143092::numeric, -65.31433895153002::numeric, 'mapa-demo-3'),
    ('Taller de Marketing Digital e IA', 'Capacitación', 'CPV Barrio Chijra, San Salvador de Jujuy', 'Herramientas gratuitas para comerciantes locales: creación de contenido y automatización.', NULL::timestamptz, -24.175888930962845::numeric, -65.29683966865461::numeric, 'mapa-demo-4'),
    ('Gala Sinfónica en Teatro Mitre', 'Cultura', 'Teatro Mitre (Alvear 1009), San Salvador de Jujuy', 'Concierto especial de obras clásicas y música folclórica andina sinfónica.', NULL::timestamptz, -24.18417125038207::numeric, -65.30730979878935::numeric, 'mapa-demo-5'),
    ('Patio Gastronómico de la Estación', 'Feria', 'Vieja Estación (CC Manuel Belgrano), San Salvador de Jujuy', 'Foodtrucks regionales, humitas, tamales, gastronomía y espectáculos.', NULL::timestamptz, -24.18321215473975::numeric, -65.29865498018445::numeric, 'mapa-demo-6')
)
INSERT INTO public.events ("Title","Category","Location","Description","StartsAtUtc","Latitude","Longitude","GeoSource","SourceKey","DurationMinutes","Published","IsDemo")
SELECT title,category,location,description,starts_at_utc,latitude,longitude,
       'index2.html, coordenadas propuestas sin verificar',source_key,NULL,FALSE,TRUE
FROM candidatos WHERE starts_at_utc IS NOT NULL
ON CONFLICT ("SourceKey") WHERE "SourceKey" IS NOT NULL DO NOTHING;
