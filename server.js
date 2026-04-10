require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 3000;
const OLLAMA_URL = 'http://localhost:11434/api/generate';
const QWEN_API_KEY = process.env.QWEN_API_KEY;
const QWEN_BASE_URL = process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';

// Ollama models list
const OLLAMA_MODELS = ['gemma3', 'qwen3.5', 'qwen3'];
// Qwen cloud models list
const QWEN_MODELS = ['qwen3.5-flash', 'qwen3.5-plus'];

// Helper: get local IP
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// Helper: determine if model is cloud-based
function isCloudModel(model) {
    return QWEN_MODELS.includes(model);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ========== API: List available models ==========
app.get('/api/models', (req, res) => {
    res.json({
        ollama: OLLAMA_MODELS,
        cloud: QWEN_MODELS,
        default: 'gemma3'
    });
});

// ========== Unified AI proxy ==========
async function handleAIRequest(req, res) {
    const { model, prompt, images, stream } = req.body;

    try {
        if (isCloudModel(model)) {
            // ===== Qwen Cloud API (OpenAI-compatible) =====
            if (!QWEN_API_KEY) {
                return res.status(500).json({ error: '未配置 QWEN_API_KEY 环境变量' });
            }

            const content = [{ type: 'text', text: prompt }];
            if (images && images.length > 0) {
                content.unshift({
                    type: 'image_url',
                    image_url: { url: `data:image/png;base64,${images[0]}` }
                });
            }

            const response = await axios.post(`${QWEN_BASE_URL}/chat/completions`, {
                model: model,
                messages: [{
                    role: 'user',
                    content: content
                }]
            }, {
                headers: {
                    'Authorization': `Bearer ${QWEN_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            });

            // Normalize response to match frontend expectations
            const reply = response.data.choices[0].message.content;
            res.json({ response: reply });

        } else {
            // ===== Ollama Local API =====
            const response = await axios.post(OLLAMA_URL, {
                model,
                prompt,
                images,
                stream: stream || false
            }, { timeout: 120000 });

            res.json(response.data);
        }
    } catch (error) {
        console.error(`[${model}] AI Error:`, error.message);
        const detail = error.response?.data?.error || error.message;
        res.status(500).json({ error: 'AI Backend Error', details: detail });
    }
}

app.post('/api/generate', handleAIRequest);
app.post('/api/describe', handleAIRequest);

// Start server
app.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log(`🚀 AI Vision Studio 后端已启动:`);
    console.log(`   - 本地访问: http://localhost:${PORT}`);
    console.log(`   - 手机/他人访问: http://${localIP}:${PORT}`);
    console.log(`\n📦 可用模型:`);
    console.log(`   - Ollama 本地: ${OLLAMA_MODELS.join(', ')}`);
    console.log(`   - 阿里云 Qwen: ${QWEN_MODELS.join(', ')}`);
    console.log(`   - Qwen API Key: ${QWEN_API_KEY ? '✅ 已配置' : '❌ 未配置'}`);
});
