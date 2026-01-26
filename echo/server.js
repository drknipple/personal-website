// Simple Express proxy server for Runway ML API
// This handles CORS restrictions by proxying requests from the browser to Runway

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for your frontend
app.use(cors({
    origin: ['http://localhost:8000', 'http://localhost:3000'], // Add your frontend URLs
    credentials: true
}));

app.use(express.json());

// Proxy endpoint for creating image-to-video job
app.post('/api/runway/image-to-video', async (req, res) => {
    // Prefer .env file, fallback to header
    const API_KEY = process.env.RUNWAY_API_KEY || req.headers['x-runway-api-key'];
    
    console.log('[proxy] Received image-to-video request');
    console.log('[proxy] Has API key from .env:', !!process.env.RUNWAY_API_KEY);
    console.log('[proxy] Has API key from header:', !!req.headers['x-runway-api-key']);
    console.log('[proxy] Using API key:', API_KEY ? 'Yes' : 'No');
    console.log('[proxy] Request body:', JSON.stringify(req.body, null, 2));
    
    if (!API_KEY) {
        console.error('[proxy] No API key found! Check .env file has RUNWAY_API_KEY set');
        return res.status(400).json({ 
            error: 'API key required. Set RUNWAY_API_KEY in .env file or send x-runway-api-key header.' 
        });
    }

    try {
        // Transform request body to Runway API format
        const runwayBody = {
            model: 'gen4_turbo', // Required: model name
            promptImage: req.body.image_url, // Required: image URL
            promptText: req.body.prompt || '', // Optional: text description
            duration: req.body.duration || 3, // Optional: duration in seconds
            ratio: req.body.resolution === '720p' ? '1280:720' : '1280:720' // Required: video ratio
        };
        
        console.log('[proxy] Calling Runway API...');
        console.log('[proxy] Transformed request body:', JSON.stringify(runwayBody, null, 2));
        const response = await fetch('https://api.dev.runwayml.com/v1/image_to_video', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'X-Runway-Version': '2024-11-06'
            },
            body: JSON.stringify(runwayBody)
        });

        console.log('[proxy] Runway response status:', response.status);
        const data = await response.json();
        console.log('[proxy] Runway response:', JSON.stringify(data, null, 2));

        if (!response.ok) {
            console.error('[proxy] Runway API error:', data);
            return res.status(response.status).json(data);
        }

        console.log('[proxy] Job created successfully, job ID:', data.id || data.job_id);
        res.json(data);
    } catch (error) {
        console.error('[proxy] Error calling Runway API:', error);
        res.status(500).json({ error: 'Failed to call Runway API', message: error.message });
    }
});

// Proxy endpoint for checking job status
app.get('/api/runway/image-to-video/:jobId', async (req, res) => {
    const { jobId } = req.params;
    const API_KEY = process.env.RUNWAY_API_KEY || req.headers['x-runway-api-key'];
    
    if (!API_KEY) {
        return res.status(400).json({ 
            error: 'API key required. Set RUNWAY_API_KEY environment variable or send x-runway-api-key header.' 
        });
    }

    try {
        const response = await fetch(`https://api.dev.runwayml.com/v1/tasks/${jobId}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'X-Runway-Version': '2024-11-06'
            }
        });

        const data = await response.json();
        console.log(`[proxy] Job ${jobId} status:`, data.status || data.state);
        if (data.status === 'SUCCEEDED') {
            console.log(`[proxy] Job ${jobId} SUCCEEDED! Output:`, JSON.stringify(data.output, null, 2));
        }

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.json(data);
    } catch (error) {
        console.error('[proxy] Error checking job status:', error);
        res.status(500).json({ error: 'Failed to check job status', message: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'runway-proxy' });
});

app.listen(PORT, () => {
    console.log(`🚀 Runway proxy server running on http://localhost:${PORT}`);
    console.log(`📝 Set RUNWAY_API_KEY environment variable or send x-runway-api-key header`);
});
