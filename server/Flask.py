from flask import Flask, jsonify, request
from flask_cors import CORS
import geopandas as gpd
import json
import os

app = Flask(__name__)

# Verzeichnis mit den GeoPackage-Dateien
GPKG_DIR = 'C:/recycling-webgis/server/geopackages/'


# Aktiviere CORS nur für die API-Routen unter "/api"
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Datei für Geometrien und Feedback
GEOMETRIES_FILE = 'geometries.json'
FEEDBACK_FILE = 'feedback.json'

# Hilfsfunktion, um Geometrien aus der Datei zu laden
def load_geometries():
    if not os.path.exists(GEOMETRIES_FILE):
        return []  # Leere Liste, wenn die Datei nicht existiert
    with open(GEOMETRIES_FILE, 'r') as f:
        return json.load(f)  # Lese die gesamte Datei als JSON (komplettes Array)

# Hilfsfunktion, um Geometrien zu speichern
def save_geometries(geometries):
    with open(GEOMETRIES_FILE, 'w') as f:
        json.dump(geometries, f, indent=4)  # Schreibe die Geometrien als Array ins JSON

# Hilfsfunktion, um Feedback zu speichern
def save_feedback(feedback):
    if not os.path.exists(FEEDBACK_FILE):
        feedback_data = []
    else:
        with open(FEEDBACK_FILE, 'r') as f:
            feedback_data = json.load(f)
    
    feedback_data.append(feedback)
    
    with open(FEEDBACK_FILE, 'w') as f:
        json.dump(feedback_data, f, indent=4)

# POST API zum Speichern von Feedback
@app.route('/api/submit-feedback', methods=['POST'])
def submit_feedback():
    try:
        feedback = request.json.get('feedback')
        name = request.json.get('name', 'Anonym')
        email = request.json.get('email', 'Keine E-Mail')

        if not feedback:
            return jsonify({'error': 'Feedback-Daten fehlen'}), 400

        # Feedback speichern
        feedback_data = {
            'name': name,
            'email': email,
            'feedback': feedback
        }
        save_feedback(feedback_data)

        return jsonify({'message': 'Feedback erfolgreich gespeichert', 'feedback': feedback_data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# POST API zum Speichern von Geometrien
@app.route('/api/geometries', methods=['POST'])
def save_geometry():
    try:
        geometry = request.json.get('geometry')
        if not geometry:
            return jsonify({'error': 'Geometrie-Daten fehlen'}), 400

        # Lade bestehende Geometrien und füge die neue hinzu
        geometries = load_geometries()
        geometry_id = len(geometries) + 1
        geometry['id'] = geometry_id

        # Speichere die neue Geometrie
        geometries.append(geometry)
        save_geometries(geometries)

        return jsonify({'message': 'Geometrie erfolgreich gespeichert', 'geometry': geometry}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# GET API zum Abrufen aller Geometrien
@app.route('/api/geometries', methods=['GET'])
def get_geometries():
    try:
        geometries = load_geometries()
        return jsonify(geometries), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# DELETE API zum Löschen einer Geometrie
@app.route('/api/geometries', methods=['DELETE'])
def delete_geometry():
    try:
        geometry = request.json.get('geometry')
        if not geometry:
            return jsonify({'error': 'Geometrie-Daten fehlen'}), 400

        geometry_id = geometry.get('id')  # Hole die ID der zu löschenden Geometrie
        if not geometry_id:
            return jsonify({'error': 'Geometrie-ID fehlt'}), 400

        # Lade die Geometrien und lösche die gewünschte
        geometries = load_geometries()
        geometries = [g for g in geometries if g.get('id') != geometry_id]

        # Speichere die aktualisierte Liste der Geometrien
        save_geometries(geometries)

        return jsonify({'message': f'Geometrie mit ID {geometry_id} erfolgreich gelöscht'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
