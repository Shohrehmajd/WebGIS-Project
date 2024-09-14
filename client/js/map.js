// EPSG:25832 Projektion definieren
proj4.defs("EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs");
ol.proj.proj4.register(proj4);

// Koordinaten für das Zentrum von Hamburg in EPSG:4326 (WGS84)
var hamburgCoordinates = [9.997789, 53.551086];

// Umwandeln von EPSG:4326 nach EPSG:25832
var centerInEPSG25832 = ol.proj.transform(hamburgCoordinates, 'EPSG:4326', 'EPSG:25832');

// OpenStreetMap-Grundkarte
var rasterLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: 'https://{a-c}.tile.openstreetmap.de/{z}/{x}/{y}.png',
        crossOrigin: 'anonymous'
    }),
    opacity: 1
});

// WMS-Layer aus GeoServer definieren
var wmsLayers = [
    { title: 'Alte Glas', layerName: 'alte_glas' },
    { title: 'Alte Papia', layerName: 'alte_papia' },
    { title: 'Arbeitslosenquote', layerName: 'arbeitslosenquote' },
    { title: 'Bevölkerungszahl', layerName: 'bevoelkerungszahl' },
    { title: 'Dichtbevoelkerung', layerName: 'dichtbevoelkerung' },
    { title: 'Einpersonenhaushalte', layerName: 'einpersonenhaushalte' },
    { title: 'Elektro Geraete', layerName: 'elektro_geraete' },
    { title: 'Leicht Verpackung', layerName: 'leicht_verpackung' },
    { title: 'Migrationshintergrund', layerName: 'migrationshintergrund' },
    { title: 'Recyclinghoefe', layerName: 'recyclinghoefe' },
    { title: 'Strassennetz', layerName: 'strassennetz' },
    { title: 'Alleinerziehende', layerName: 'alleinerziehende' }
];

// WMS-Layer erstellen und zur Karte hinzufügen
var wmsLayerGroup = wmsLayers.map(function(layerInfo) {
    return new ol.layer.Tile({
        title: layerInfo.title,
        visible: true,
        source: new ol.source.TileWMS({
            url: 'http://localhost:8080/geoserver/recycling_in_Hamburg/wms',
            params: { 'LAYERS': 'recycling_in_Hamburg:' + layerInfo.layerName, 'TILED': true },
            serverType: 'geoserver',
            transition: 0
        })
    });
});

// Hole den Button und den Legend-Container
const layerToggleButton = document.getElementById('layer-toggle-button');
const legendContainer = document.getElementById('legend-container');

// Füge ein Toggle-Event hinzu
layerToggleButton.addEventListener('click', function () {
    // Toggle zwischen 'block' und 'none', um den Legend-Container anzuzeigen oder zu verstecken
    if (legendContainer.style.display === 'none' || legendContainer.style.display === '') {
        legendContainer.style.display = 'block';
    } else {
        legendContainer.style.display = 'none';
    }
});


// OpenLayers-Karte initialisieren
var map = new ol.Map({
    target: 'map',
    layers: [rasterLayer].concat(wmsLayerGroup),
    view: new ol.View({
        projection: 'EPSG:25832',
        center: centerInEPSG25832,
        zoom: 12,
        minZoom: 2,
        maxZoom: 19
    })
});

// Funktion zum Hinzufügen der Legenden und Checkboxen
function addLegendToPage(layerInfo, layer) {
    var legendUrl = `http://localhost:8080/geoserver/recycling_in_Hamburg/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&LAYER=recycling_in_Hamburg:${layerInfo.layerName}`;
    var legendList = document.getElementById('legend-list');

    // Prüfe, ob die Legende bereits existiert, um Dopplungen zu vermeiden
    if (!document.getElementById(`${layerInfo.layerName}_checkbox`)) {
        var listItem = document.createElement('li');
        listItem.innerHTML = `
            <span class="toggle-legend" style="cursor: pointer;">&#x25BA;</span>
            <input type="checkbox" id="${layerInfo.layerName}_checkbox" checked style="margin-left: 5px;">
            <strong>${layerInfo.title}</strong><br>
            <div class="legend-content" style="display: none;">
                <img src="${legendUrl}" alt="${layerInfo.title} legend">
            </div>
        `;
        legendList.appendChild(listItem);

        // Event für die Checkbox, um Layer ein- und auszuschalten
        var checkbox = document.getElementById(`${layerInfo.layerName}_checkbox`);
        checkbox.addEventListener('change', function() {
            layer.setVisible(this.checked);
        });

        // Event für das Ein-/Ausklappen der Legende
        var toggle = listItem.querySelector('.toggle-legend');
        var legendContent = listItem.querySelector('.legend-content');

        toggle.addEventListener('click', function() {
            if (legendContent.style.display === 'none') {
                legendContent.style.display = 'block';
                toggle.innerHTML = '&#x25BC;';
            } else {
                legendContent.style.display = 'none';
                toggle.innerHTML = '&#x25BA;';
            }
        });
    }
}

// Für jeden Layer die Legende und Checkbox abrufen (ohne Dopplungen)
wmsLayers.forEach(function(layerInfo, index) {
    var layer = wmsLayerGroup[index];
    addLegendToPage(layerInfo, layer);
});


// Funktion, um alle Interaktionen zu stoppen und den Pan-Modus zu aktivieren
function enablePanMode() {
    removeCurrentInteraction();
    map.getViewport().style.cursor = 'grab';
}

// Entfernt alle Interaktionen (wie Zeichnen oder Bearbeiten)
function removeCurrentInteraction() {
    if (currentInteraction) {
        map.removeInteraction(currentInteraction);
        currentInteraction = null;
    }
    map.getViewport().style.cursor = '';
}

// Zoom-Funktion
document.getElementById('zoom-in').addEventListener('click', function() {
    var view = map.getView();
    view.setZoom(view.getZoom() + 1);
});

document.getElementById('zoom-out').addEventListener('click', function() {
    var view = map.getView();
    view.setZoom(view.getZoom() - 1);
});

// Variable, um die aktuelle Messinteraktion zu speichern
let measureInteraction;
let measureTooltipElement;
let measureTooltip;
let helpTooltipElement;
let helpTooltip;
let sketch;

function createMeasureTooltip() {
    if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }
    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'tooltip tooltip-measure';
    measureTooltip = new ol.Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center',
    });
    map.addOverlay(measureTooltip);
}

// Funktion zur Aktivierung des Messmodus
function addMeasureInteraction(type) {
    // Entferne bestehende Interaktionen
    removeCurrentInteraction();

    // Messe entweder Linie (Entfernung) oder Polygon (Fläche)
    measureInteraction = new ol.interaction.Draw({
        source: new ol.source.Vector(),
        type: type === 'area' ? 'Polygon' : 'LineString',
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)',
            }),
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2,
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ffcc33',
                }),
            }),
        }),
    });

    map.addInteraction(measureInteraction);

    // Tooltip für die Messung erstellen
    createMeasureTooltip();

    // Beim Zeichnen messen
    measureInteraction.on('drawstart', function (evt) {
        sketch = evt.feature;
        let geom = sketch.getGeometry();
        geom.on('change', function () {
            let output;
            if (geom.getType() === 'Polygon') {
                output = formatArea(geom);
            } else if (geom.getType() === 'LineString') {
                output = formatLength(geom);
            }
            measureTooltipElement.innerHTML = output;
            measureTooltip.setPosition(geom.getLastCoordinate());
        });
    });

    measureInteraction.on('drawend', function () {
        measureTooltipElement.className = 'tooltip tooltip-static';
        measureTooltip.setOffset([0, -7]);

        // Entferne die Interaktion, um die Messung zu beenden
        map.removeInteraction(measureInteraction);
        measureInteraction = null;
        map.getViewport().style.cursor = '';
    });
}

// Entfernung berechnen
function formatLength(line) {
    let length = ol.sphere.getLength(line);
    let output;
    if (length > 100) {
        output = (length / 1000).toFixed(2) + ' km';
    } else {
        output = length.toFixed(2) + ' m';
    }
    return output;
}

// Fläche berechnen
function formatArea(polygon) {
    let area = ol.sphere.getArea(polygon);
    let output;
    if (area > 10000) {
        output = (area / 1000000).toFixed(2) + ' km²';
    } else {
        output = area.toFixed(2) + ' m²';
    }
    return output;
}

// Funktion zum Entfernen der aktuellen Interaktion
function removeCurrentInteraction() {
    if (measureInteraction) {
        map.removeInteraction(measureInteraction);
        measureInteraction = null;
    }
    map.getViewport().style.cursor = '';
}

// Event-Listener für das Mess-Icon
document.getElementById('measure-button').addEventListener('click', function () {
    let type = prompt('Möchtest du eine Entfernung (line) oder Fläche (area) messen?').toLowerCase();
    if (type === 'line' || type === 'area') {
        addMeasureInteraction(type);
        map.getViewport().style.cursor = 'crosshair';
    } else {
        alert('Ungültige Eingabe. Wähle entweder "line" oder "area".');
    }
});


// Event-Listener für den Pan-Button
document.querySelector('[data-mode="pan"]').addEventListener('click', function() {
    enablePanMode();
});
// Funktion zum Exportieren der Karte als Bild (PNG)
function exportMap() {
    map.once('rendercomplete', function() {
        var mapCanvas = document.createElement('canvas');
        var size = map.getSize();
        mapCanvas.width = size[0];
        mapCanvas.height = size[1];
        var mapContext = mapCanvas.getContext('2d');
        
        // Durchläuft alle Layer und rendert sie in das Canvas
        Array.prototype.forEach.call(
            document.querySelectorAll('.ol-layer canvas'),
            function(canvas) {
                if (canvas.width > 0) {
                    var opacity = canvas.parentNode.style.opacity;
                    mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
                    var transform = canvas.style.transform;
                    var matrix = transform
                        .match(/^matrix\(([^\(]*)\)$/)[1]
                        .split(',')
                        .map(Number);
                    
                    // Transformation anwenden und das Canvas zeichnen
                    mapContext.setTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
                    mapContext.drawImage(canvas, 0, 0);
                }
            }
        );

        // Bild als PNG speichern
        var link = document.createElement('a');
        link.href = mapCanvas.toDataURL('image/png');
        link.download = 'map-export.png';
        link.click();
    });
    
    // Synchronisiert die Karte und löst den Export aus
    map.renderSync();
}

// Event-Listener für den Export-Button
document.getElementById('exportButton').addEventListener('click', function() {
    exportMap();
});
function printMap() {
    // Speichere die aktuelle Breite und Höhe der Karte
    var mapElement = document.getElementById('map');
    var originalWidth = mapElement.style.width;
    var originalHeight = mapElement.style.height;

    // Setze die Kartengröße vorübergehend auf die Druckgröße (z.B. auf volle Seite)
    mapElement.style.width = '100%';
    mapElement.style.height = '100vh';

    // Lade die Karte neu, um sicherzustellen, dass sie korrekt in der Druckgröße angezeigt wird
    map.updateSize();

    // Öffne das Druckfenster
    window.print();

    // Nach dem Druck die ursprüngliche Kartengröße wiederherstellen
    mapElement.style.width = originalWidth;
    mapElement.style.height = originalHeight;

    // Lade die Karte neu, um sie wieder auf die ursprüngliche Größe zu setzen
    map.updateSize();
}

// Event-Listener für den Print-Button
document.getElementById('printButton').addEventListener('click', function() {
    printMap();
});

document.addEventListener('DOMContentLoaded', function() {
    // Elemente abfragen
    var infoButton = document.getElementById('info-button');
    var infoContainer = document.getElementById('info-container');
    var closeButton = document.getElementById('close-info');

    // Prüfe, ob die Elemente vorhanden sind
    if (infoButton && infoContainer && closeButton) {
        // Event-Listener für den Info-Button
        infoButton.addEventListener('click', function() {
            infoContainer.style.display = 'block';
        });

        // Event-Listener für den Close-Button
        closeButton.addEventListener('click', function() {
            infoContainer.style.display = 'none';
        });
    } else {
        console.error('Eines der Elemente (Info-Button, Info-Container oder Close-Button) konnte nicht gefunden werden.');
    }
});



// Maßstabsleiste hinzufügen
var scaleLineControl = new ol.control.ScaleLine({
    units: 'metric',
    bar: true,
    steps: 4,
    text: true,
    minWidth: 100
});
map.addControl(scaleLineControl);

// Popup-Elemente referenzieren
var popupContainer = document.getElementById('popup');
var popupContent = document.getElementById('popup-content');
var popupCloser = document.getElementById('popup-closer');

// Popup Overlay erstellen
var overlay = new ol.Overlay({
    element: popupContainer,
    autoPan: true,
    autoPanAnimation: {
        duration: 250,
    }
});

// Overlay zur Karte hinzufügen
map.addOverlay(overlay);

// Funktion zum Schließen des Popups
popupCloser.onclick = function() {
    overlay.setPosition(undefined);
    popupCloser.blur();
    return false;
};

// Event-Listener für Klick auf die Karte
map.on('singleclick', function(evt) {
    var coordinate = evt.coordinate;
    var viewResolution = map.getView().getResolution();
    popupContent.innerHTML = '';
    var featureFound = false;

    // WMS-Layer durchgehen, um Feature-Informationen abzurufen
    var promises = wmsLayerGroup.map(function(layer) {
        if (layer.getVisible()) {
            var source = layer.getSource();
            var url = source.getFeatureInfoUrl(
                coordinate, viewResolution, 'EPSG:25832',
                { 'INFO_FORMAT': 'application/json' }
            );

            if (url) {
                // Feature-Informationen abrufen
                return fetch(url)
                    .then(function(response) {
                        if (!response.ok) {
                            throw new Error('Netzwerk-Antwort war nicht ok');
                        }
                        return response.json();
                    })
                    .then(function(data) {
                        if (data.features && data.features.length > 0) {
                            featureFound = true;

                            var featureInfo = data.features[0];
                            var featureName = featureInfo.properties.name || 'Unbenannt';

                            // Popup-Inhalt setzen
                            popupContent.innerHTML += `<strong>Feature Information:</strong><br>
                                                       <strong>Name:</strong> ${featureName}<br>
                                                       <strong>Layer:</strong> ${layer.get('title')}<br><hr>`;
                        }
                    })
                    .catch(function(error) {
                        console.error('Fehler bei der WMS-Abfrage:', error);
                    });
            }
        }
        return Promise.resolve();
    });

    // Popup anzeigen, wenn ein Feature gefunden wurde
    Promise.all(promises).then(function() {
        if (featureFound) {
            overlay.setPosition(coordinate);
        } else {
            overlay.setPosition(undefined);
        }
    });
});




// Koordinatenanzeige unten in der Mitte
var mouseCoordinates = document.getElementById('mouse-coordinates');
map.on('pointermove', function(evt) {
    var coordinate = evt.coordinate;
    var transformedCoord = ol.proj.transform(coordinate, 'EPSG:25832', 'EPSG:4326');
    var lon = transformedCoord[0].toFixed(6);
    var lat = transformedCoord[1].toFixed(6);
    mouseCoordinates.innerHTML = lon + ' , ' + lat;
});

// Event-Listener für das Suchfeld
document.getElementById('searchButton').addEventListener('click', function() {
    const address = document.getElementById('addressInput').value;
    if (address) {
        geocodeAddress(address);
    } else {
        alert('Bitte geben Sie eine Adresse ein.');
    }
});

// Funktion für die Nominatim-Suche und umgekehrte Geocodierung (mit Popup)
function geocodeAddress(addressOrCoordinates) {
    // Überprüfen, ob der eingegebene Wert Koordinaten sind (durch Komma getrennt und aus Zahlen bestehend)
    const coordRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
    const match = coordRegex.exec(addressOrCoordinates);

    if (match) {
        // Wenn es sich um Koordinaten handelt, extrahiere Lat und Lon
        const lat = parseFloat(match[1]);
        const lon = parseFloat(match[3]);

        // EPSG:4326 zu EPSG:25832 umwandeln
        const coordinate = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:25832');

        // Karte auf die Koordinaten zoomen
        map.getView().animate({
            center: coordinate,
            zoom: 17,
            duration: 2000
        });

        // Umgekehrte Geocodierung für die Koordinaten durchführen
        const reverseGeocodeUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;

        fetch(reverseGeocodeUrl)
            .then(response => response.json())
            .then(data => {
                if (data && data.address) {
                    const addressDetails = data.address;
                    const displayName = data.display_name;

                    // Popup mit der gefundenen Adresse anzeigen
                    const popupContent = `
                        <strong>Adresse für die Koordinaten:</strong> ${displayName}<br>
                        <strong>Postleitzahl:</strong> ${addressDetails.postcode || 'Keine Postleitzahl verfügbar'}<br>
                        <strong>Stadt:</strong> ${addressDetails.city || addressDetails.town || 'Keine Stadt verfügbar'}
                    `;
                    content.innerHTML = popupContent;
                    overlay.setPosition(coordinate);
                } else {
                    alert('Keine Adresse für diese Koordinaten gefunden.');
                }
            })
            .catch(error => {
                console.error('Fehler bei der umgekehrten Geocodierung:', error);
                alert('Fehler beim Abrufen der Adresse.');
            });

    } else {
        // Ansonsten handelt es sich um eine Adresse, also Nominatim-Suche verwenden
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressOrCoordinates)}&format=json&addressdetails=1&limit=1`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    const result = data[0];
                    const lat = parseFloat(result.lat);
                    const lon = parseFloat(result.lon);
                    const displayName = result.display_name;
                    const addressDetails = result.address;

                    // EPSG:4326 zu EPSG:25832 umwandeln
                    const coordinate = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:25832');

                    // Karte auf die gefundene Adresse zoomen
                    map.getView().animate({
                        center: coordinate,
                        zoom: 17,
                        duration: 2000
                    });

                    // Popup mit der gefundenen Adresse anzeigen
                    const popupContent = `
                        <strong>Gefundene Adresse:</strong> ${displayName}<br>
                        <strong>Postleitzahl:</strong> ${addressDetails.postcode || 'Keine Postleitzahl verfügbar'}<br>
                        <strong>Stadt:</strong> ${addressDetails.city || addressDetails.town || 'Keine Stadt verfügbar'}
                    `;
                    content.innerHTML = popupContent;
                    overlay.setPosition(coordinate);
                } else {
                    alert('Keine Adresse gefunden.');
                }
            })
            .catch(error => {
                console.error('Fehler bei der Geocodierung:', error);
                alert('Fehler beim Abrufen der Adresse.');
            });
    }
}


// Event-Listener für den Standort-Button
document.getElementById('findLocationButton').addEventListener('click', function() {
    showUserLocation();
});

// Funktion zur Anzeige der aktuellen Position des Nutzers (mit Popup)
function showUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            // Konvertiere die Position zu EPSG:25832
            const coordinate = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:25832');

            // Karte auf die aktuelle Position des Nutzers zentrieren
            map.getView().animate({
                center: coordinate,
                zoom: 17,
                duration: 2000
            });

            // Nominatim Reverse-Geocoding für Adresse/Postleitzahl
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data && data.address) {
                        const address = data.address.road || 'Keine Straße verfügbar';
                        const postcode = data.address.postcode || 'Keine Postleitzahl verfügbar';
                        const city = data.address.city || data.address.town || data.address.village || 'Keine Stadt verfügbar';

                        // Popup mit der Adresse anzeigen
                        const popupContent = `
                            <strong>Aktueller Standort:</strong><br>
                            <strong>Adresse:</strong> ${address}<br>
                            <strong>Postleitzahl:</strong> ${postcode}<br>
                            <strong>Stadt:</strong> ${city}
                        `;
                        content.innerHTML = popupContent;
                        overlay.setPosition(coordinate);
                    } else {
                        alert('Keine Adresse gefunden.');
                    }
                })
                .catch(error => {
                    console.error('Fehler beim Reverse-Geocoding:', error);
                });
        }, function(error) {
            console.error('Geolocation error:', error);
            alert('Fehler beim Abrufen der Standortinformationen');
        });
    } else {
        alert('Geolocation wird von diesem Browser nicht unterstützt.');
    }
}

// Event-Listener für den Geometrie-Modus-Button
document.getElementById('geometryTree').addEventListener('click', function() {
    const treeMenu = document.getElementById('geometryTreeMenu');
    treeMenu.classList.toggle('hidden');
});

// Popup-Elemente
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

// Popup Overlay
var overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 250
    }
});
map.addOverlay(overlay);

// Popup schließen
closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};

// Funktion zur Formatierung der Feature-Informationen im Popup
function formatFeatureInfo(properties) {
    var infoContent = '<h3>Feature Information:</h3><ul>';
    Object.keys(properties).forEach(function(key) {
        if (key !== 'geometry') {
            infoContent += `<li><strong>${key}:</strong> ${properties[key]}</li>`;
        }
    });
    infoContent += '</ul>';
    return infoContent;
}

// Event für das Abrufen von Feature-Informationen beim Klick
map.on('singleclick', function(evt) {
    var coordinate = evt.coordinate;
    var viewResolution = map.getView().getResolution();
    
    // Versuche den WMS-Layer zu finden (anhand des Titels, nicht des Index)
    var wmsLayer = map.getLayers().getArray().find(function(layer) {
        return layer instanceof ol.layer.Tile && layer.getSource() instanceof ol.source.TileWMS;
    });

    // Nur wenn ein WMS-Layer gefunden wurde, versuche FeatureInfo zu holen
    if (wmsLayer) {
        var wmsSource = wmsLayer.getSource();
        var url = wmsSource.getFeatureInfoUrl(
            coordinate, viewResolution, 'EPSG:25832', {'INFO_FORMAT': 'application/json'}
        );

        if (url) {
            fetch(url)
                .then(function(response) {
                    return response.json();
                })
                .then(function(data) {
                    if (data.features && data.features.length > 0) {
                        var feature = data.features[0];
                        var formattedInfo = formatFeatureInfo(feature.properties);
                        content.innerHTML = formattedInfo;
                    } else {
                        content.innerHTML = `<p>Keine Feature-Informationen gefunden.</p>`;
                    }
                    overlay.setPosition(coordinate);
                })
                .catch(function(error) {
                    console.error('Fehler bei der GetFeatureInfo-Anfrage:', error);
                    content.innerHTML = `<p>Fehler bei der Abfrage.</p>`;
                    overlay.setPosition(coordinate);
                });
        } else {
            showCoordinatePopup(coordinate);
        }
    } else {
        showCoordinatePopup(coordinate);
    }
});

// Funktion zum Anzeigen der Koordinaten, falls kein WMS-Feature verfügbar ist
function showCoordinatePopup(coordinate) {
    var lonLat = ol.proj.transform(coordinate, 'EPSG:25832', 'EPSG:4326');
    content.innerHTML = `<p><strong>Koordinaten:</strong><br>Lon: ${lonLat[0].toFixed(6)}, Lat: ${lonLat[1].toFixed(6)}</p>`;
    overlay.setPosition(coordinate);
}

function exportMap() {
    html2canvas(document.querySelector('#map'), {
        useCORS: false,
        ignoreElements: (element) => element.tagName === 'IMG'
    }).then(function(canvas) {
        var link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'map-export.png';
        link.click();
    }).catch(function(error) {
        console.error('Fehler beim Exportieren der Karte:', error);
    });
}

// Event-Listener für den Export-Button
document.getElementById('exportButton').addEventListener('click', function() {
    exportMap();
});



// Quelle für Vektordaten (um Punkte, Linien oder Polygone zu speichern)
var vectorSource = new ol.source.Vector({
    wrapX: false
});

// Vektor-Layer für das Zeichnen und Anzeigen von Geometrien
var vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 2
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#ffcc33'
            })
        })
    })
});

// Füge den Vektor-Layer zur Karte hinzu
map.addLayer(vectorLayer);

// Variable zum Speichern der aktuellen Interaktion
var currentInteraction = null;
var unsavedGeometries = [];
var deleteClickActive = false;

// Funktion zum Entfernen der aktuellen Interaktion
function removeCurrentInteraction() {
    if (currentInteraction) {
        map.removeInteraction(currentInteraction);
        currentInteraction = null;
    }
}

// Funktion zum Entfernen des `singleclick`-Event-Listeners für das Löschen
function disableDeleteMode() {
    deleteClickActive = false;
}

// Interaktionen für das Zeichnen von Punkten, Linien, Polygonen und Kreisen
function addDrawInteraction(geometryType) {
    removeCurrentInteraction();
    disableDeleteMode();

    currentInteraction = new ol.interaction.Draw({
        source: vectorSource,
        type: geometryType
    });

    // Füge die Interaktion hinzu
    map.addInteraction(currentInteraction);

    // Event, wenn die Zeichnung beendet wird
    currentInteraction.on('drawend', function(event) {
        var geometry = event.feature.getGeometry();
        var coordinates = geometryType === 'Circle'
            ? ol.proj.toLonLat(geometry.getCenter())
            : ol.proj.toLonLat(geometry.getCoordinates());

        var newGeometry = {
            type: 'Feature',
            geometry: {
                type: geometryType === 'Circle' ? 'Point' : geometryType,
                coordinates: coordinates
            },
            properties: {
                name: 'Neues Feature'
            }
        };

        // Füge die neue Geometrie zu den unsaved Geometries hinzu
        unsavedGeometries.push(newGeometry);
        alert("Geometrie wurde hinzugefügt.");
    });
}

// Modifikation von Geometrien ermöglichen
function addModifyInteraction() {
    removeCurrentInteraction();

    currentInteraction = new ol.interaction.Modify({
        source: vectorSource
    });

    map.addInteraction(currentInteraction);

    // Event-Listener für Änderungen an der Geometrie
    currentInteraction.on('modifyend', function(event) {
        event.features.forEach(function(modifiedFeature) {
            var geometry = modifiedFeature.getGeometry();

            var updatedGeometry = {
                id: modifiedFeature.getId(),
                geometry: {
                    type: geometry.getType(),
                    coordinates: geometry.getType() === 'Circle' ? 
                        ol.proj.toLonLat(geometry.getCenter()) : 
                        ol.proj.toLonLat(geometry.getCoordinates())
                }
            };

            // Geänderte Geometrie speichern
            unsavedGeometries.push(updatedGeometry);
        });

        alert("Geometrie wurde bearbeitet.");
    });
}

function addDeleteInteraction() {
    removeCurrentInteraction();

    deleteClickActive = true;

    map.on('singleclick', function(evt) {
        if (deleteClickActive) {
            var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
                return feature;
            });

            if (feature && confirm('Möchtest du dieses Feature wirklich löschen?')) {
                var geometryId = feature.getId();

                unsavedGeometries.push({ id: geometryId, delete: true });
                vectorSource.removeFeature(feature);
                alert("Geometrie wurde gelöscht.");
            }
        }
    });
}


// Funktion zum Speichern von Geometrien
function sendGeometryToServer(geometry) {
    fetch('http://127.0.0.1:5000/api/geometries', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ geometry: geometry })
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
function saveChanges() {
    unsavedGeometries.forEach(function(geometry) {
        if (geometry.delete) {
            // Wenn das Feature gelöscht werden soll
            deleteGeometryFromServer(geometry.id);
        } else {
            // Neue oder geänderte Geometrie speichern
            sendGeometryToServer(geometry);
        }
    });

    // Bereinige die Liste der unsaved Geometries
    unsavedGeometries = [];
}


function loadGeometries() {
    fetch('http://127.0.0.1:5000/api/geometries')
    .then(response => response.json())
    .then(data => {
        if (!Array.isArray(data)) {
            throw new Error("Erwartetes Array, aber anderes Format erhalten");
        }
        // Verarbeite die Geometrien hier, wenn es ein Array ist
        console.log("Geometrien geladen:", data);
    })
    .catch(error => {
        console.error('Fehler beim Laden der Geometrien:', error);
    });
}



// Rufe Geometrien beim Laden der Seite ab
loadGeometries();

// Event-Listener für Buttons im Geometrie-Menü
document.querySelector('[data-mode="point"]').addEventListener('click', function() {
    addDrawInteraction('Point');
});
document.querySelector('[data-mode="line"]').addEventListener('click', function() {
    addDrawInteraction('LineString');
});
document.querySelector('[data-mode="polygon"]').addEventListener('click', function() {
    addDrawInteraction('Polygon');
});
document.querySelector('[data-mode="circle"]').addEventListener('click', function() {
    addDrawInteraction('Circle');
});
document.querySelector('[data-mode="edit"]').addEventListener('click', function() {
    addModifyInteraction();
});
document.querySelector('[data-mode="delete"]').addEventListener('click', function() {
    addDeleteInteraction();
});
document.querySelector('[data-mode="save"]').addEventListener('click', function() {
    saveChanges();
});


// Funktion zum Öffnen des Feedback-Formulars
function openFeedbackForm() {
    document.getElementById('feedback-form-container').style.display = 'block';
}

// Funktion zum Schließen des Feedback-Formulars
function closeFeedbackForm() {
    document.getElementById('feedback-form-container').style.display = 'none';
}


async function submitFeedback(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const feedback = document.getElementById('feedback').value;

    const feedbackData = {
        name: name || "Anonym",
        email: email || "Keine E-Mail",
        feedback: feedback
    };

    try {
        const response = await fetch('http://127.0.0.1:5000/api/submit-feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(feedbackData)
        });

        if (response.ok) {
            alert('Vielen Dank für Ihr Feedback!');
            closeFeedbackForm();
        } else {
            alert('Fehler beim Senden des Feedbacks.');
        }
    } catch (error) {
        console.error('Fehler:', error);
        alert('Ein Fehler ist aufgetreten.');
    }
}


// Funktion zum Anzeigen der Dankesnachricht
function showThankYouMessage() {
    const thankYouMessage = document.createElement('div');
    thankYouMessage.textContent = "Vielen Dank für Ihr Feedback!";
    thankYouMessage.style.position = 'fixed';
    thankYouMessage.style.top = '50%';
    thankYouMessage.style.left = '50%';
    thankYouMessage.style.transform = 'translate(-50%, -50%)';
    thankYouMessage.style.backgroundColor = '#28a745';
    thankYouMessage.style.color = 'white';
    thankYouMessage.style.padding = '20px';
    thankYouMessage.style.borderRadius = '10px';
    thankYouMessage.style.boxShadow = '0px 8px 16px rgba(0, 0, 0, 0.3)';
    thankYouMessage.style.zIndex = '1000';
    thankYouMessage.style.textAlign = 'center';

    document.body.appendChild(thankYouMessage);

    // Entferne die Dankesnachricht nach 3 Sekunden
    setTimeout(() => {
        thankYouMessage.remove();
    }, 3000);
}



// Funktion zum Öffnen des Kontakt-Popups
function openContact() {
    document.getElementById('contact-popup').style.display = 'block';
}

// Funktion zum Schließen des Kontakt-Popups
function closeContact() {
    document.getElementById('contact-popup').style.display = 'none';
}

// Funktion für das Hinzufügen von Text auf der Karte und es verschiebbar und skalierbar machen
let drawTextActive = false;
let selectedOverlay = null;

// Event Listener für das Stift-Icon (Aktiviere den Textmodus und platziere die Textbox)
document.getElementById('draw-text-button').addEventListener('click', function () {
    drawTextActive = true;
    alert("Klicke auf die Karte, um die Textbox zu platzieren");
});

// Funktion, um das Element verschiebbar zu machen
function makeOverlayDraggable(overlayElement, overlay) {
    let isDragging = false;
    let startPosition;

    overlayElement.addEventListener('mousedown', function (event) {
        // Setze das ausgewählte Overlay
        selectedOverlay = overlay;
        
        // Verhindere, dass das Element verschoben wird, während es resizable ist (wenn man die Ecken oder Ränder zieht)
        if (event.target.tagName === 'TEXTAREA' && event.offsetX > event.target.clientWidth - 10 && event.offsetY > event.target.clientHeight - 10) {
            return;
        }

        isDragging = true;
        startPosition = {
            x: event.clientX,
            y: event.clientY
        };
        overlayElement.style.cursor = 'move';
        map.getInteractions().forEach(interaction => {
            if (interaction instanceof ol.interaction.DragPan) {
                interaction.setActive(false);
            }
        });
    });

    document.addEventListener('mousemove', function (event) {
        if (isDragging) {
            const deltaX = event.clientX - startPosition.x;
            const deltaY = event.clientY - startPosition.y;

            const overlayPosition = overlay.getPosition();
            const newPixel = map.getPixelFromCoordinate(overlayPosition);
            const newPosition = map.getCoordinateFromPixel([
                newPixel[0] + deltaX,
                newPixel[1] - deltaY
            ]);

            overlay.setPosition(newPosition);
            startPosition = {
                x: event.clientX,
                y: event.clientY
            };
        }
    });

    document.addEventListener('mouseup', function () {
        if (isDragging) {
            isDragging = false;
            overlayElement.style.cursor = 'default';
            map.getInteractions().forEach(interaction => {
                if (interaction instanceof ol.interaction.DragPan) {
                    interaction.setActive(true);
                }
            });
        }
    });
}

// Funktion zum Anpassen der Schriftgröße basierend auf der Boxgröße
function adjustFontSize(textElement) {
    const resizeObserver = new ResizeObserver(() => {
        const boxWidth = textElement.offsetWidth;
        const newFontSize = boxWidth / 10;
        textElement.style.fontSize = `${newFontSize}px`;
    });

    // Überwache Änderungen der Boxgröße
    resizeObserver.observe(textElement);
}

// Event Listener zum Entfernen des ausgewählten Overlays bei Drücken der Entfernen-Taste
document.addEventListener('keydown', function (event) {
    if (event.key === 'Delete' && selectedOverlay) {
        map.removeOverlay(selectedOverlay);
        selectedOverlay = null;
    }
});

// Klick-Event für die Karte (Textbox direkt platzieren)
map.on('click', function (evt) {
    if (drawTextActive) {
        const coordinate = evt.coordinate;

        // Textbox erstellen
        const container = document.createElement('div');
        container.style.position = 'relative';

        const textElement = document.createElement('textarea');
        textElement.placeholder = "Schreibe hier...";
        textElement.style.resize = 'both';
        textElement.style.overflow = 'auto';
        textElement.style.width = '150px';
        textElement.style.height = '50px';
        textElement.style.color = 'black';
        textElement.style.backgroundColor = 'white';
        textElement.style.border = '1px solid black';
        textElement.style.padding = '3px';
        textElement.style.fontSize = '15px';
        textElement.style.position = 'relative';

        // Löschen-Button (nur X)
        const deleteButton = document.createElement('span');
        deleteButton.innerHTML = 'X';
        deleteButton.style.position = 'absolute';
        deleteButton.style.top = '0';
        deleteButton.style.right = '0';
        deleteButton.style.cursor = 'pointer';
        deleteButton.style.padding = '0 5px';
        deleteButton.style.fontSize = '14px';

        // Event für das Entfernen des Overlays
        deleteButton.addEventListener('click', function () {
            map.removeOverlay(textOverlay);
        });

        // Füge das Textfeld und den X-Button in den Container ein
        container.appendChild(textElement);
        container.appendChild(deleteButton);

        const textOverlay = new ol.Overlay({
            position: coordinate,
            element: container,
            positioning: 'center-center',
            stopEvent: true,
        });

        map.addOverlay(textOverlay);

        // Mache das Text-Overlay verschiebbar
        makeOverlayDraggable(container, textOverlay);

        // Schriftgröße anpassen, wenn die Boxgröße geändert wird
        adjustFontSize(textElement);

        // Deaktiviere den Textmodus nach dem Platzieren
        drawTextActive = false;
    }
});
