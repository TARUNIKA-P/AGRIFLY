import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// Server-side Gemini client with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: Audio Transcription with model gemini-3.5-transcribe
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audio, mimeType } = req.body;
    if (!audio) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: audio,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          {
            text: 'Transcribe this voice audio accurately. If agricultural terms (canopy, aphids, NDVI, spray, waypoint, hectare) are mentioned, transcribe them with standard spelling.',
          },
        ],
      },
    });

    const text = response.text || '';
    return res.json({ text });
  } catch (error: any) {
    console.error('Transcription error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to transcribe audio' });
  }
});

// Endpoint: Multi-Turn Gemini Chatbot with History and Role Personas
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model, rolePersona } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Default to gemini-3.8-flash for general tasks, or gemini-3.1-flash-lite / gemini-4-argon as requested
    const selectedModel = model || 'gemini-3.8-flash';

    let systemInstruction = `You are AgriFly Copilot, an expert AI assistant embedded inside an autonomous edge-AI multi-drone precision agriculture platform.
You assist farmers, agronomists, and flight operators with GPS-denied canopy navigation and targeted micro-spraying that reduces chemical usage by 85%+ with huge Indian Rupee (₹) savings.
Always maintain context of the conversation, give actionable and technically sound answers, and format key points with concise clarity.`;

    if (rolePersona === 'farmer') {
      systemInstruction = `You are AgriFly Farmer Copilot. You speak in simple, warm, everyday language for farmers, growers, and field workers (and support Hindi or simple English).
FIRST PRIORITY: ALWAYS USE INDIAN RUPEES (₹ / INR) for all currency, chemical savings, tractor diesel costs, and farm economics (e.g. ₹1,56,600 saved, ₹1,450 per Liter of pesticide). Never use dollar signs ($).
Avoid complex aeronautical jargon unless asked. Focus on crop health, pesticide savings, wind safety for spraying, and peace of mind that drones won't hit tree branches or vines. Be encouraging, respectful, and direct.`;
    } else if (rolePersona === 'avionics') {
      systemInstruction = `You are AgriFly Avionics & Swarm Flight Specialist. You specialize in decentralized P2P ad-hoc mesh telemetry (802.11ah HaLow, 5.8GHz), GPS-denied canopy SLAM (Livox LiDAR, stereo VIO), Raft consensus quorums, and micro-PWM solenoid sprayers. ALWAYS use Indian Rupees (₹) for hardware and operating cost calculations.`;
    } else if (rolePersona === 'pathologist') {
      systemInstruction = `You are AgriFly Agronomist & Crop Pathologist. You specialize in vineyard and orchard crop health, leaf symptom identification (Powdery Mildew, Downy Mildew, Cotton Aphids, Leafroll Virus), NDVI spectral analysis, and targeted micro-dosage spray formulations. Quote all chemical savings and treatment costs in Indian Rupees (₹).`;
    }

    // Transform messages array to Gemini contents format
    const contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction,
      },
    });

    const replyText = response.text || 'I analyzed the swarm telemetry, but could not generate a response. Please try again.';
    return res.json({ text: replyText });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to generate response' });
  }
});

// Endpoint: Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'AgriFly Precision Flight Server' });
});

// Setup WebSocket Server for Live API voice conversation (model: gemini-3.8-live)
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url || '', `http://${request.headers.host}`);
  if (url.pathname === '/live') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('[Live API] Client connected to voice stream');
  let session: any = null;

  try {
    session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' },
          },
        },
        systemInstruction:
          'You are AgriFly Tactical Swarm Operations AI. You provide immediate, crisp real-time spoken flight intelligence for an edge-AI multi-drone autonomous spraying system. Keep responses concise, high-tech, and direct.',
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          for (const part of message.serverContent?.modelTurn?.parts ?? []) {
            if (part.inlineData?.data && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
            }
            if (part.text && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ text: part.text }));
            }
          }
          if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }
        },
        onclose: () => {
          console.log('[Live API] Gemini Live session closed');
        },
        onerror: (err) => {
          console.error('[Live API] Gemini Live session error:', err);
        },
      },
    });

    clientWs.on('message', (data) => {
      try {
        const payload = JSON.parse(data.toString());
        if (payload.audio && session) {
          session.sendRealtimeInput({
            audio: {
              data: payload.audio,
              mimeType: 'audio/pcm;rate=16000',
            },
          });
        }
      } catch (err) {
        console.error('[Live API] Error parsing client message:', err);
      }
    });

    clientWs.on('close', () => {
      console.log('[Live API] Client disconnected');
      if (session) {
        try {
          session.close();
        } catch (_) {}
      }
    });
  } catch (error) {
    console.error('[Live API] Failed to connect session:', error);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ error: 'Failed to initiate Gemini Live voice session' }));
    }
  }
});

// Vite middleware or static serving
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(port, () => {
    console.log(`[AgriFly Server] Running on http://localhost:${port}`);
  });
}

setupVite();
