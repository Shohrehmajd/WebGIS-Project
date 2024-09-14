function sendGeometryToServer(geometryData) {
    fetch('http://127.0.0.1:5000/api/geometries', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ geometry: geometryData })  // Sende die Geometrie im JSON-Format
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Fehler beim Speichern der Geometrie.');
        }
        return response.json();
    })
    .then(data => {
        console.log('Geometrie erfolgreich gespeichert:', data.message);
        alert('Geometrie erfolgreich gespeichert!');
    })
    .catch(error => {
        console.error('Fehler beim Speichern der Geometrie:', error);
        alert('Fehler beim Speichern der Geometrie: ' + error.message);
    });
}


// Funktion zum Abrufen aller Geometrien (GET)
function fetchGeometriesFromServer() {
    fetch('http://127.0.0.1:5000/api/geometries')
    .then(response => {
        if (!response.ok) {
            throw new Error('Fehler beim Abrufen der Geometrien.');
        }
        return response.json();
    })
    .then(data => {
        console.log('Alle Geometrien:', data);
        // Hier kannst du die Geometrien auf der Karte anzeigen lassen
    })
    .catch(error => {
        console.error('Fehler beim Abrufen der Geometrien:', error);
        alert('Fehler beim Abrufen der Geometrien: ' + error.message);
    });
}


// Funktion zum Löschen einer Geometrie (DELETE)
function deleteGeometryFromServer(geometryId) {
    fetch('http://127.0.0.1:5000/api/geometries', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ geometry: { id: geometryId } })  // Geometrie-ID im Body
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Fehler beim Löschen der Geometrie.');
        }
        return response.json();
    })
    .then(data => {
        console.log('Geometrie erfolgreich gelöscht:', data.message);
        alert('Geometrie erfolgreich gelöscht!');
    })
    .catch(error => {
        console.error('Fehler beim Löschen der Geometrie:', error);
        alert('Fehler beim Löschen der Geometrie: ' + error.message);
    });
}


