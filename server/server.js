const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors()); // CORS aktivieren
app.use(express.json());

const geometriesFilePath = path.join(__dirname, 'geometries.json');

// Überprüfen, ob die Datei existiert, andernfalls erstellen
if (!fs.existsSync(geometriesFilePath)) {
    fs.writeFileSync(geometriesFilePath, ''); // Leere Datei erstellen
}

// POST-Anfrage zum Speichern von Geometrien
app.post('/api/geometries', (req, res) => {
    const geometry = req.body.geometry;

    if (!geometry) {
        return res.status(400).send('Ungültige Geometrie-Daten.');
    }

    try {
        // Geometrie in der Datei speichern
        fs.appendFileSync(geometriesFilePath, JSON.stringify(geometry) + '\n');
        res.status(200).send('Geometrie erfolgreich gespeichert');
    } catch (error) {
        console.error('Fehler beim Speichern der Geometrie:', error);
        res.status(500).send('Fehler beim Speichern der Geometrie.');
    }
});

// DELETE-Anfrage zum Löschen von Geometrien
app.delete('/api/geometries', (req, res) => {
    const geometryToDelete = req.body.geometry;

    if (!geometryToDelete || !geometryToDelete.id) {
        return res.status(400).send('Ungültige Geometrie-ID.');
    }

    try {
        // Geometrien einlesen und filtern
        let geometries = fs.readFileSync(geometriesFilePath, 'utf-8')
                            .split('\n')
                            .filter(Boolean)
                            .map(line => JSON.parse(line));

        const initialLength = geometries.length;
        geometries = geometries.filter(geo => geo.id !== geometryToDelete.id);

        // Überprüfen, ob die Geometrie gefunden und gelöscht wurde
        if (initialLength === geometries.length) {
            return res.status(404).send('Geometrie nicht gefunden.');
        }

        // Datei überschreiben mit aktualisierten Geometrien
        fs.writeFileSync(geometriesFilePath, geometries.map(geo => JSON.stringify(geo)).join('\n'));
        res.status(200).send('Geometrie erfolgreich gelöscht');
    } catch (error) {
        console.error('Fehler beim Löschen der Geometrie:', error);
        res.status(500).send('Fehler beim Löschen der Geometrie.');
    }
});

// Server starten
app.listen(3000, () => {
    console.log('Server läuft auf http://localhost:3000');
});
