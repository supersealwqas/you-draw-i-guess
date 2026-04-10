const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const OLLAMA_URL = 'http://localhost:11434/api/generate';

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
    console.log(`🚀 AI Vision Studio Backend running at:`);
    console.log(`   - Local:   http://localhost:${PORT}`);
    console.log(`   - Network: http://<YOUR_LAN_IP>:${PORT}`);
    console.log(`\nOllama Backend Targeted at: ${OLLAMA_URL}`);
});
