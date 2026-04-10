const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const os = require('os');

const app = express();
const PORT = 3000;
const OLLAMA_URL = 'http://localhost:11434/api/generate';

// Helper function to get local IP
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

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for high-res images
app.use(express.static(path.join(__dirname, 'public')));

// Proxy endpoint for drawing recognition (Guess)
app.post('/api/generate', async (req, res) => {
    try {
        const { model, prompt, images, stream } = req.body;
        
        const response = await axios.post(OLLAMA_URL, {
            model,
            prompt,
            images,
            stream: stream || false
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error proxying to Ollama:', error.message);
        res.status(500).json({ error: 'AI Backend Error', details: error.message });
    }
});

// Proxy endpoint for image description (Describe)
app.post('/api/describe', async (req, res) => {
    try {
        const { model, prompt, images, stream } = req.body;
        
        const response = await axios.post(OLLAMA_URL, {
            model,
            prompt,
            images,
            stream: stream || false
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error proxying to Ollama:', error.message);
        res.status(500).json({ error: 'AI Backend Error', details: error.message });
    }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log(`🚀 AI Vision Studio 后端已启动:`);
    console.log(`   - 本地访问: http://localhost:${PORT}`);
    console.log(`   - 手机/他人访问: http://${localIP}:${PORT}`);
    console.log(`\nOllama 后端目标地址: ${OLLAMA_URL}`);
});
