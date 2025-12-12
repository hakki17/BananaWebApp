from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import json
from datetime import datetime
from azure.storage.blob import BlobServiceClient
import random
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

YOLO_API = os.getenv('YOLO_API')
AZURE_CONNECTION_STRING = os.getenv('AZURE_CONNECTION_STRING')

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        file = request.files['file']
        filename = file.filename

        print(f"Procesando: {filename}")

        # 1. Enviar a YOLO
        file.seek(0)
        response = requests.post(YOLO_API, files={'file': (filename, file, 'image/jpeg')})

        print(f"YOLO response: {response.status_code}")

        if response.status_code != 200:
            raise Exception(f"YOLO API error: {response.text}")

        predictions = response.json()
        print(f"Predictions: {predictions}")

        # Generar coordenadas aleatorias en Urabá, Antioquia
        latitude = round(7.8 + random.uniform(-0.15, 0.15), 5)
        longitude = round(-76.6 + random.uniform(-0.15, 0.15), 5)

        plant_id = f"P-{random.randint(1000, 9999)}"
        field_name = random.choice(['ParcelaA', 'ParcelaB', 'ParcelaC', 'LoteNorte', 'LoteSur'])

        result_data = {
            "image_name": f"banana-images/{filename}",
            "timestamp": datetime.now().isoformat(),
            "field_name": field_name,
            "plant_id": plant_id,
            "latitude": latitude,
            "longitude": longitude,
            "predictions": predictions,
            "processed": True
        }

        print("Connecting to Azure...")
        blob_service = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
        container_client = blob_service.get_container_client("detection-results")

        blob_name = f"result_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}.json"
        print(f"Saving to blob: {blob_name}")

        blob_client = container_client.get_blob_client(blob_name)
        blob_client.upload_blob(json.dumps(result_data, indent=2), overwrite=True)

        print(f"✅ Saved successfully")

        return jsonify({
            'success': True,
            'data': result_data
        }), 200

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
