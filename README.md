# Sistema de Detección de Enfermedades en Banano

Sistema web para detectar enfermedades en plantas de banano utilizando visión por computadora (YOLO) y almacenamiento en Azure Blob Storage.

## Autores:
- Juan Esteban Medina Rivas
- María Paula Sánchez Macías
- Sergio Andres Bejarano Rodríguez

## Prueba
https://youtu.be/H408ygZgoDU

<video src="https://github.com/hakki17/BananaWebApp/blob/main/PruebaDeteccionEnfermedadesPlatano.mp4" width="100%" controls>
  Tu navegador no soporta el video.
</video>

## Características

- Carga múltiple de imágenes (drag & drop)
- Detección automática de enfermedades con modelo YOLO
- Almacenamiento de resultados en Azure Blob Storage
- Geolocalización aleatoria simulada (región de Urabá, Antioquia)
- Interfaz responsive con vista previa de imágenes
- Dashboard de resultados en tiempo real

## Tecnologías

**Frontend:**
- HTML5, CSS3, JavaScript vanilla
- Interfaz drag-and-drop nativa

**Backend:**
- Python 3.x
- Flask + Flask-CORS
- Azure Storage SDK
- Requests

**Machine Learning:**
- YOLO API (modelo de detección)

## Requisitos

```bash
pip install flask flask-cors azure-storage-blob requests python-dotenv
```

## Configuración

1. **Clonar el repositorio**
```bash
git clone <tu-repo>
cd <nombre-proyecto>
```

2. **Crear archivo `.env`**
```env
YOLO_API=http://localhost:8000/predict
AZURE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
```

3. **Crear contenedor en Azure**
- Nombre: `detection-results`
- Nivel de acceso: Privado

## Uso

1. **Iniciar servidor**
```bash
python server.py
```

2. **Abrir navegador**
```
http://localhost:5000
```

3. **Procesar imágenes**
   - Cargar imágenes de plantas de banano
   - Click en "Procesar Imágenes"
   - Ver resultados con predicciones y confianza

## Estructura del Proyecto

```
├── index.html          # Interfaz principal
├── dashboard.html      # Vista de resultados (opcional)
├── app.js             # Lógica frontend
├── styles.css         # Estilos
├── server.py          # API Flask
├── .env               # Variables de entorno
└── README.md
```

## Formato de Resultados

Los resultados se guardan en Azure como JSON:

```json
{
  "image_name": "banana-images/imagen.jpg",
  "timestamp": "2025-02-10T12:00:00",
  "field_name": "ParcelaA",
  "plant_id": "P-1234",
  "latitude": 7.85,
  "longitude": -76.55,
  "predictions": {
    "label": "Sigatoka Negra",
    "confidence": 0.92,
    "scores": {...}
  }
}
```

## Notas

- El sistema genera coordenadas aleatorias para simular geolocalización
- Los IDs de planta y nombres de parcela son generados automáticamente
- Requiere modelo YOLO pre-entrenado funcionando en endpoint configurado
