const { Pool } = require('pg');

// Konfiguration der PostgreSQL-Verbindung
const pool = new Pool({
    user: 'your_db_user',
    host: 'localhost',
    database: 'recycling',
    password: 'your_password',
    port: 5432,
});

module.exports = pool;
