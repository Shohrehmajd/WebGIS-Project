const recyclingModel = require('../models/recyclingModel');

// Hol alle Recyclingstationen
exports.getAllStations = async (req, res) => {
    try {
        const stations = await recyclingModel.getAllStations();
        res.json(stations);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Datenbankfehler' });
    }
};

// Neue Recyclingstation hinzufügen
exports.addStation = async (req, res) => {
    const { name, material, geom } = req.body;
    try {
        const newStation = await recyclingModel.addStation(name, material, geom);
        res.json(newStation);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Datenbankfehler' });
    }
};

// Recyclingstation löschen
exports.deleteStation = async (req, res) => {
    const { id } = req.params;
    try {
        await recyclingModel.deleteStation(id);
        res.json({ message: 'Station gelöscht' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Datenbankfehler' });
    }
};
