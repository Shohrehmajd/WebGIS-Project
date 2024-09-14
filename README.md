WebGIS für das Recycling in Hamburg
Inhaltsverzeichnis

    Projektübersicht
    Systemanforderungen
    Installation
    Ausführung des Projekts
    Bedienung
    Technologien
    Funktionen
    Kontakt

1. Projektübersicht <a name="projektübersicht"></a>

Dieses WebGIS-Projekt wurde entwickelt, um die Verteilung und Effizienz von Recyclingstationen in Hamburg zu analysieren. Es visualisiert die Standorte der Recyclingstationen in Kombination mit demografischen und sozioökonomischen Daten. Die Benutzer können Layer ein- und ausblenden, Entfernungen und Flächen messen, Geometrien zeichnen und bearbeiten sowie Feedback geben.
2. Systemanforderungen <a name="systemanforderungen"></a>

    Betriebssystem: Windows, macOS oder Linux
    Software:
        Node.js und npm
        Flask (Python)
        GeoServer
        Ein Webbrowser (Google Chrome, Firefox, etc.)

3. Installation <a name="installation"></a>
1. Installiere Node.js und npm

Lade die neueste Version von Node.js herunter und installiere sie. Dies ist notwendig, um das Frontend zu bedienen.
2. Installiere Flask

Installiere Flask für das Backend über Pip:

bash

pip install flask

3. GeoServer einrichten

Installiere GeoServer, um die WMS-Daten bereitzustellen. Lade die erforderlichen Layer hoch (z. B. Recyclingstationen, demografische Daten).
4. Installiere npm-Abhängigkeiten

Navigiere in das Verzeichnis des Projekts und installiere die benötigten npm-Pakete:

bash

npm install

4. Ausführung des Projekts <a name="ausführung-des-projekts"></a>
1. Starte den Flask-Server

bash

flask run

2. Starte den Node.js-Server

bash

npm start

3. Öffne den Browser und gehe zu:

arduino

http://localhost:8080

5. Bedienung <a name="bedienung"></a>
Login

    Standard-Benutzername: admin
    Standard-Passwort: admin

Funktionen:

    Layer-Management: WMS-Layer für Recyclingstationen und demografische Daten.
    Geometrien zeichnen, bearbeiten, löschen: CRUD-Funktionen für Geometrien.
    Messwerkzeuge: Entfernungen und Flächen messen.
    Kartenexport und Druck: Karte als Bild exportieren oder direkt drucken.
    Suche: Adressen oder Koordinaten eingeben, um die Karte zu zentrieren.
    Standortbestimmung: Anzeige des aktuellen Standorts auf der Karte.
    Feedback und Kontakt: Benutzer können Feedback senden und den Entwickler kontaktieren.

6. Technologien <a name="technologien"></a>

    Frontend: HTML, CSS, JavaScript, OpenLayers
    Backend: Flask (Python)
    GeoServer: Für die Bereitstellung von WMS-Daten
    OpenStreetMap: Basiskarten

7. Funktionen <a name="funktionen"></a>

    CRUD für Geometrien: Zeichnen, Bearbeiten und Löschen von Punkten, Linien, Polygonen und Kreisen.
    Layer-Management: Benutzer können die Sichtbarkeit der Layer steuern.
    Popup-Informationen: Anzeigen von Informationen über Recyclingstationen und andere Daten durch Klick auf die Karte.
    Feedback-Formular: Benutzer können über ein Formular Feedback geben.
    Kartenexport: Karte als Bild exportieren oder drucken.

8. Kontakt <a name="kontakt"></a>

Autor: ...
E-Mail: ...