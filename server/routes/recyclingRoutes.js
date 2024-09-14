const express = require('express');
const router = express.Router();
const recyclingController = require('../controllers/recyclingController');

// Routen-Definitionen
router.get('/', recyclingController.getAllStations);       // GET: Alle Recyclingstationen
router.post('/', recyclingController.addStation);          // POST: Neue Station hinzufügen
router.delete('/:id', recyclingController.deleteStation);  // DELETE: Station löschen

module.exports = router;
