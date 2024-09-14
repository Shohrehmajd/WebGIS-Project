const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const recyclingRoutes = require('./routes/recyclingRoutes'); // Importiere die Routen
const app = express();

// Middleware
app.use(cors()); // Erlaubt Cross-Origin-Requests
app.use(bodyParser.json()); // Erlaubt das Parsen von JSON-Daten

// API-Routen
app.use('/api/recyclingstations', recyclingRoutes); // Verwende die Recyclingstationen-API

// Starte den Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
