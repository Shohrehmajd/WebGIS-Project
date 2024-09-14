// Initialisiere die Karte mit einer OSM-Grundkarte und einem WMS-Layer
var map = new ol.Map({
    target: 'map', // ID des HTML-Elements, in dem die Karte angezeigt wird
    layers: [
        // OpenStreetMap Grundkarte
        new ol.layer.Tile({
            source: new ol.source.OSM()
        }),
        // WMS-Layer vom Geoserver
        new ol.layer.Tile({
            source: new ol.source.TileWMS({
                url: 'http://localhost:8080/geoserver/recycling_in_Hamburg/wms', // WMS-URL vom Geoserver
                params: {
                    'LAYERS': 'recycling_in_Hamburg:alleinerziehende', // Korrektes Layer-Format <workspace>:<layername>
                    'TILED': true
                },
                serverType: 'geoserver', // WMS-Servertyp Geoserver
                crossOrigin: 'anonymous'
            })
        })
    ],
    view: new ol.View({
        // Zentrum der Karte und Zoom-Level (Hamburg)
        center: ol.proj.fromLonLat([9.993682, 53.551086]), // Koordinaten von Hamburg (LonLat)
        zoom: 12 // Zoom-Level
    })
});
