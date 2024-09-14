CREATE TABLE recycling_stations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    material VARCHAR(100),
    geom GEOMETRY(Point, 4326)
);

-- Beispiel für das Einfügen einer Recyclingstation
INSERT INTO recycling_stations (name, material, geom)
VALUES ('Recyclinghof Harburg', 'Glas', ST_SetSRID(ST_MakePoint(10.006, 53.464), 4326));
