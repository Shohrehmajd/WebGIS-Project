const pool = require('../config/db'); // Datenbankverbindung

// Alle Recyclingstationen abrufen
exports.getAllStations = async () => {
    const result = await pool.query('SELECT * FROM recycling_stations');
    return result.rows;
};

// Neue Recyclingstation hinzufügen
exports.addStation = async (name, material, geom) => {
    const result = await pool.query(
        'INSERT INTO recycling_stations (name, material, geom) VALUES ($1, $2, ST_SetSRID(ST_GeomFromGeoJSON($3), 4326)) RETURNING *',
        [name, material, geom]
    );
    return result.rows[0];
};

// Recyclingstation löschen
exports.deleteStation = async (id) => {
    await pool.query('DELETE FROM recycling_stations WHERE id = $1', [id]);
};
