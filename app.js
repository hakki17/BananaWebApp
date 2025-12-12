// Configuración
const CONFIG = {
  YOLO_API: 'http://localhost:5000/api/predict',
};

let selectedFiles = [];

// Elementos DOM
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const previewContainer = document.getElementById('previewContainer');
const processBtn = document.getElementById('processBtn');
const resultsSection = document.getElementById('resultsSection');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultsContainer = document.getElementById('resultsContainer');

// Event Listeners
fileInput.addEventListener('change', handleFileSelect);
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
processBtn.addEventListener('click', processImages);

function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  addFiles(files);
}

function handleDragOver(e) {
  e.preventDefault();
  uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
  addFiles(files);
}

function addFiles(files) {
  selectedFiles = [...selectedFiles, ...files];
  updatePreview();
  processBtn.disabled = selectedFiles.length === 0;
}

function updatePreview() {
  previewContainer.innerHTML = '';
  selectedFiles.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement('div');
      div.className = 'preview-item';
      div.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}">
                <button class="remove-btn" onclick="removeFile(${index})">×</button>
            `;
      previewContainer.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
}

function removeFile(index) {
  selectedFiles.splice(index, 1);
  updatePreview();
  processBtn.disabled = selectedFiles.length === 0;
}

async function processImages() {
  resultsSection.style.display = 'block';
  processBtn.disabled = true;
  resultsContainer.innerHTML = '';

  let processed = 0;
  const total = selectedFiles.length;

  for (const file of selectedFiles) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(CONFIG.YOLO_API, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error en el servidor');

      const result = await response.json();
      displayResult(file.name, result.data, 'success');
    } catch (error) {
      console.error(`Error procesando ${file.name}:`, error);
      displayResult(file.name, { error: error.message }, 'error');
    }

    processed++;
    updateProgress(processed, total);
  }

  processBtn.disabled = false;
  alert('✅ Procesamiento completado. Revisa Azure Blob Storage.');
}

function updateProgress(current, total) {
  const percent = (current / total) * 100;
  progressFill.style.width = `${percent}%`;
  progressText.textContent = `${current} de ${total} procesadas`;
}

function displayResult(filename, data, status) {
  const card = document.createElement('div');
  card.className = `result-card ${status}`;

  if (status === 'success' && data.predictions) {
    const pred = data.predictions;
    card.innerHTML = `
            <div class="result-header">
                <h3>📍 ${filename}</h3>
                <span class="result-status ${status}">✓ Procesado</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0;">
                <div><strong>Parcela:</strong> ${data.field_name || 'N/A'}</div>
                <div><strong>Planta ID:</strong> ${data.plant_id || 'N/A'}</div>
                <div><strong>Latitud:</strong> ${data.latitude || 'N/A'}</div>
                <div><strong>Longitud:</strong> ${data.longitude || 'N/A'}</div>
            </div>
            <div style="background: white; padding: 15px; border-radius: 10px; margin-top: 10px;">
                <h4 style="margin-bottom: 10px;">🔬 Detección: ${pred.label}</h4>
                <div style="font-size: 1.5em; color: #667eea; font-weight: bold;">
                    Confianza: ${(pred.confidence * 100).toFixed(1)}%
                </div>
                <div style="margin-top: 10px; font-size: 0.9em;">
                    <strong>Scores:</strong>
                    ${Object.entries(pred.scores)
                      .map(([k, v]) => `<div>${k}: ${(v * 100).toFixed(1)}%</div>`)
                      .join('')}
                </div>
            </div>
        `;
  } else {
    card.innerHTML = `
            <div class="result-header">
                <h3>${filename}</h3>
                <span class="result-status error">✗ Error</span>
            </div>
            <pre>${JSON.stringify(data, null, 2)}</pre>
        `;
  }

  resultsContainer.appendChild(card);
}
