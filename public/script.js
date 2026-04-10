// ========== Model Selection ==========
let selectedModelId = 'gemma3';
let modelsMap = {}; // To store id -> name mapping for display

async function loadModels() {
  try {
    const res = await fetch('/api/models');
    const data = await res.json();
    const ollamaContainer = document.getElementById('ollamaModels');
    const cloudContainer = document.getElementById('cloudModels');

    // Build the mapping for display purposes
    [...data.ollama, ...data.cloud].forEach(m => {
      modelsMap[m.id] = m.name;
    });

    // Render Ollama models
    data.ollama.forEach(model => {
      const chip = document.createElement('button');
      chip.className = `model-chip${model.id === data.default ? ' active' : ''}`;
      chip.textContent = model.name;
      chip.dataset.model = model.id;
      chip.addEventListener('click', () => selectModel(model.id));
      ollamaContainer.appendChild(chip);
    });

    // Render Cloud models
    data.cloud.forEach(model => {
      const chip = document.createElement('button');
      chip.className = 'model-chip cloud';
      chip.innerHTML = `${model.name}<span class="chip-badge">云端</span>`;
      chip.dataset.model = model.id;
      chip.addEventListener('click', () => selectModel(model.id));
      cloudContainer.appendChild(chip);
    });

    selectedModelId = data.default;
  } catch (e) {
    console.error('Failed to load models:', e);
  }
}

function selectModel(modelId) {
  selectedModelId = modelId;
  document.querySelectorAll('.model-chip').forEach(c => c.classList.remove('active'));
  const targetChip = document.querySelector(`.model-chip[data-model="${modelId}"]`);
  if (targetChip) targetChip.classList.add('active');
}

loadModels();

// ========== DOM References ==========
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resultArea = document.getElementById('resultArea');
const guessBtn = document.getElementById('guessBtn');
const clearBtn = document.getElementById('clearBtn');
const undoBtn = document.getElementById('undoBtn');
const eraserBtn = document.getElementById('eraserBtn');
const sizeSlider = document.getElementById('sizeSlider');
const sizeValueEl = document.getElementById('sizeValue');
const guessCountEl = document.getElementById('guessCount');
const statusText = document.getElementById('statusText');
const historySection = document.getElementById('historySection');
const historyList = document.getElementById('historyList');
const saveBtn = document.getElementById('saveBtn');

let isDrawing = false;
let currentColor = '#1e1e1e';
let brushSize = 3;
let isEraser = false;
let guessCount = 0;
let undoStack = [];

// Initialize canvas
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);
saveState();

// ========== Drawing ==========
function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  if (e.touches) {
    return {
      x: (e.touches[0].clientX - rect.left) * scaleX,
      y: (e.touches[0].clientY - rect.top) * scaleY
    };
  }
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
}

function startDraw(e) {
  e.preventDefault();
  isDrawing = true;
  const pos = getPos(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
  // Draw a dot for single clicks
  ctx.lineWidth = brushSize;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = isEraser ? 'white' : currentColor;
  ctx.lineTo(pos.x + 0.1, pos.y + 0.1);
  ctx.stroke();
}

function draw(e) {
  if (!isDrawing) return;
  e.preventDefault();
  const pos = getPos(e);
  ctx.lineWidth = brushSize;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = isEraser ? 'white' : currentColor;
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
}

function endDraw() {
  if (isDrawing) {
    isDrawing = false;
    saveState();
  }
}

function saveState() {
  undoStack.push(canvas.toDataURL());
  if (undoStack.length > 30) undoStack.shift();
}

// Mouse events
canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', endDraw);
canvas.addEventListener('mouseout', endDraw);

// Touch events
canvas.addEventListener('touchstart', startDraw, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });
canvas.addEventListener('touchend', endDraw);

// ========== Color Buttons ==========
document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentColor = btn.dataset.color;
    isEraser = false;
    eraserBtn.classList.remove('active');
  });
});

// ========== Custom Color Picker ==========
const colorPicker = document.getElementById('colorPicker');
const colorPickerWrapper = colorPicker.parentElement;

colorPicker.addEventListener('input', (e) => {
  currentColor = e.target.value;
  isEraser = false;
  eraserBtn.classList.remove('active');
  
  // Update UI: Deactivate all preset buttons, activate picker wrapper
  document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
  colorPickerWrapper.classList.add('active');
});

// Sync preset buttons with picker wrapper
document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    colorPickerWrapper.classList.remove('active');
  });
});

// ========== Size Slider ==========
sizeSlider.addEventListener('input', () => {
  brushSize = parseInt(sizeSlider.value);
  sizeValueEl.textContent = brushSize;
});

// ========== Eraser ==========
eraserBtn.addEventListener('click', () => {
  isEraser = !isEraser;
  eraserBtn.classList.toggle('active');
  if (isEraser) {
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
  } else {
    // Re-activate the current color button
    document.querySelectorAll('.color-btn').forEach(b => {
      if (b.dataset.color === currentColor) b.classList.add('active');
    });
  }
});

// ========== Undo ==========
undoBtn.addEventListener('click', () => {
  if (undoStack.length > 1) {
    undoStack.pop();
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = undoStack[undoStack.length - 1];
  }
});

// ========== Clear ==========
clearBtn.addEventListener('click', () => {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  saveState();
});

// ========== Save ==========
saveBtn.addEventListener('click', () => {
  // We use toDataURL synchronously instead of toBlob.
  // Using an async callback like toBlob loses the trusted user-interaction context (the click event token),
  // which causes strict browsers to silently block the download as a "popup".
  const dataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  
  link.download = `ai-vision-drawing-${Date.now()}.png`;
  link.href = dataURL;
  
  // Attach to body for browser compatibility, click, then remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// ========== Ripple Effect ==========
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    this.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
});

// ========== AI Guess ==========
guessBtn.addEventListener('click', async () => {
  const imageData = canvas.toDataURL('image/png').split(',')[1];

  guessBtn.disabled = true;
  resultArea.className = 'result-area';
  resultArea.innerHTML = `
    <div class="loading-spinner"></div>
    <div class="loading">AI (${modelsMap[selectedModelId] || selectedModelId}) 正在观察你的画作…</div>
  `;
  statusText.innerHTML = '<span class="status-dot loading"></span>思考中…';

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: selectedModelId,
        prompt: '你画我猜游戏。请仔细观察这幅简笔画，猜测用户画的是什么。只回答一个最可能的中文词语或短句，不超过10个字。不要解释，直接给出答案。',
        images: [imageData],
        stream: false
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.details || `API Error: ${response.status}`);
    }

    const data = await response.json();
    const guess = data.response.trim();

    guessCount++;
    guessCountEl.textContent = guessCount;

    resultArea.className = 'result-area has-result';
    resultArea.innerHTML = `<div class="label">AI 猜测结果 (${modelsMap[selectedModelId] || selectedModelId})</div><div class="guess">${guess}</div>`;
    statusText.innerHTML = '<span class="status-dot"></span>完成';

    // Add to history
    historySection.style.display = 'block';
    const item = document.createElement('div');
    item.className = 'history-item';
    item.textContent = `#${guessCount} [${modelsMap[selectedModelId] || selectedModelId}] ${guess}`;
    historyList.prepend(item);

  } catch (error) {
    resultArea.className = 'result-area has-error';
    resultArea.innerHTML = `
      <div class="label">出错了</div>
      <div class="guess" style="font-size: 14px; -webkit-text-fill-color: #f87171;">${error.message}</div>
    `;
    statusText.innerHTML = '<span class="status-dot error"></span>错误';
  } finally {
    guessBtn.disabled = false;
  }
});

// ========== Keyboard Shortcuts ==========
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'z') {
    e.preventDefault();
    undoBtn.click();
  }
});

// ========== Tab Switching ==========
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const targetId = btn.dataset.tab === 'draw' ? 'drawPanel' : 'uploadPanel';
    document.getElementById(targetId).classList.add('active');
  });
});

// ========== Image Upload & Recognition ==========
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const descResult = document.getElementById('descResult');
let uploadedImageBase64 = null;

// Click to upload
uploadZone.addEventListener('click', () => {
  if (!uploadedImageBase64) fileInput.click();
});

// Drag & Drop
uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.classList.add('dragover');
});
uploadZone.addEventListener('dragleave', () => {
  uploadZone.classList.remove('dragover');
});
uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) handleImageFile(file);
});

// File input change
fileInput.addEventListener('change', (e) => {
  if (e.target.files[0]) handleImageFile(e.target.files[0]);
});

function handleImageFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedImageBase64 = e.target.result.split(',')[1];
    uploadZone.classList.add('has-image');
    uploadZone.innerHTML = `
      <img src="${e.target.result}" class="upload-preview" alt="预览">
      <div class="upload-actions">
        <div class="upload-actions-row">
          <button class="btn btn-reupload" id="reuploadBtn">🔄 重新选择</button>
          <button class="btn btn-describe btn-large" id="describeBtnDefault">✨ 一键生成描述</button>
        </div>
        <button class="btn btn-secondary" id="moreBtn">💬 我想知道更多...</button>
      </div>
      <div class="more-prompt-panel" id="morePromptPanel">
        <textarea id="customPromptInput" placeholder="输入你想问的具体问题，例如：提取文字、算数学题或分析细节..."></textarea>
        <button class="btn btn-send-custom" id="sendCustomBtn">🚀 发送自定义指令</button>
      </div>
    `;
    // Bind buttons
    document.getElementById('reuploadBtn').addEventListener('click', (ev) => {
      ev.stopPropagation();
      resetUpload();
    });
    document.getElementById('describeBtnDefault').addEventListener('click', (ev) => {
      ev.stopPropagation();
      const defaultPrompt = '请用中文详细描述这张图片中的内容。包括：1. 图片中有什么主要物体或人物；2. 场景和环境；3. 颜色和氛围。请用自然流畅的中文描述，大约100-200字。';
      describeImage(defaultPrompt);
    });
    
    // Toggle more panel
    const morePanel = document.getElementById('morePromptPanel');
    document.getElementById('moreBtn').addEventListener('click', (ev) => {
      ev.stopPropagation();
      morePanel.classList.toggle('active');
    });

    // Custom prompt send
    document.getElementById('sendCustomBtn').addEventListener('click', (ev) => {
      ev.stopPropagation();
      const customVal = document.getElementById('customPromptInput').value.trim();
      if (!customVal) {
        alert("请输入自定义指令");
        return;
      }
      describeImage(customVal);
    });
    // Reset desc result
    descResult.className = 'desc-result';
    descResult.innerHTML = `
      <div class="label">AI 图片描述</div>
      <div class="desc-text-placeholder">点击「让 AI 描述」开始识别</div>
    `;
  };
  reader.readAsDataURL(file);
}

function resetUpload() {
  uploadedImageBase64 = null;
  fileInput.value = '';
  uploadZone.classList.remove('has-image');
  uploadZone.innerHTML = `
    <div class="upload-icon">📤</div>
    <div class="upload-text">拖拽图片到这里，或 <strong>点击选择文件</strong></div>
    <div class="upload-hint">支持 JPG / PNG / GIF / WebP</div>
  `;
  descResult.className = 'desc-result';
  descResult.innerHTML = `
    <div class="label">AI 图片描述</div>
    <div class="desc-text-placeholder">上传一张图片，让 AI 告诉你图片里有什么</div>
  `;
}

async function describeImage(userPrompt) {
  if (!uploadedImageBase64) return;

  const descBtn = document.getElementById('describeBtnDefault');
  if (descBtn) descBtn.disabled = true;
  const customBtn = document.getElementById('sendCustomBtn');
  if (customBtn) customBtn.disabled = true;

  descResult.className = 'desc-result';
  descResult.innerHTML = `
    <div class="label">AI 图片描述</div>
    <div style="text-align:center">
      <div class="loading-spinner"></div>
      <div class="loading">AI (${modelsMap[selectedModelId] || selectedModelId}) 正在仔细观察这张图片…</div>
    </div>
  `;

  try {
    const response = await fetch('/api/describe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: selectedModelId,
        prompt: userPrompt,
        images: [uploadedImageBase64],
        stream: false
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.details || `API Error: ${response.status}`);
    }

    const data = await response.json();
    const description = data.response.trim();

    descResult.className = 'desc-result has-result';
    descResult.innerHTML = `
      <div class="label">AI 识别结果</div>
      <div class="desc-text">${description.replace(/\n/g, '<br>')}</div>
    `;

  } catch (error) {
    console.error('Describe Error:', error);
    descResult.className = 'desc-result';
    descResult.innerHTML = `
      <div class="label" style="color:#ef4444">识别失败</div>
      <div class="desc-text" style="color:#ef4444">${error.message}</div>
    `;
  } finally {
    if (descBtn) descBtn.disabled = false;
    if (customBtn) customBtn.disabled = false;
  }
}
