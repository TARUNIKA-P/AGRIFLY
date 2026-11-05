import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Radio, Sparkles, Activity } from 'lucide-react';

interface LiveVoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveVoiceDialog: React.FC<LiveVoiceDialogProps> = ({ isOpen, onClose }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isTalking, setIsTalking] = useState<boolean>(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [conversation, setConversation] = useState<{ role: 'user' | 'model'; text: string }[]>([
    {
      role: 'model',
      text: 'AgriFly Tactical Voice Copilot online. Ready for swarm queries, sensor fusion readouts, or micro-spray commands.',
    },
  ]);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);

  // Helper: Float32Array to 16-bit PCM Base64
  const floatTo16BitPCMBase64 = (float32Array: Float32Array): string => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Helper: Play back 24kHz PCM chunk
  const playPcmChunk = (base64Audio: string) => {
    try {
      if (!outputAudioCtxRef.current) {
        outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
      }
      const ctx = outputAudioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const binary = window.atob(base64Audio);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
      audioBuffer.copyToChannel(float32, 0);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      if (nextPlayTimeRef.current < currentTime) {
        nextPlayTimeRef.current = currentTime;
      }

      source.start(nextPlayTimeRef.current);
      nextPlayTimeRef.current += audioBuffer.duration;

      setIsModelSpeaking(true);
      setTimeout(() => setIsModelSpeaking(false), audioBuffer.duration * 1000 + 100);
    } catch (err) {
      console.error('Playback error:', err);
    }
  };

  const startSession = async () => {
    try {
      setErrorMessage(null);
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        setIsConnected(true);
        // Start microphone capture
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;

          const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 16000,
          });
          inputAudioCtxRef.current = inputCtx;

          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          scriptProcessorRef.current = processor;

          processor.onaudioprocess = (e) => {
            if (ws.readyState === WebSocket.OPEN) {
              const inputData = e.inputBuffer.getChannelData(0);
              const base64Pcm = floatTo16BitPCMBase64(inputData);
              ws.send(JSON.stringify({ audio: base64Pcm }));
            }
          };

          source.connect(processor);
          processor.connect(inputCtx.destination);
          setIsTalking(true);
        } catch (micErr: any) {
          console.error('Microphone error:', micErr);
          setErrorMessage('Microphone access denied or unavailable.');
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.audio) {
            playPcmChunk(data.audio);
          }
          if (data.text) {
            setConversation((prev) => [...prev, { role: 'model', text: data.text }]);
          }
          if (data.interrupted) {
            nextPlayTimeRef.current = 0;
            setIsModelSpeaking(false);
          }
          if (data.error) {
            setErrorMessage(data.error);
          }
        } catch (e) {
          console.error('Error handling message:', e);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setErrorMessage('Failed to connect to Live API voice session.');
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsTalking(false);
      };
    } catch (err: any) {
      setErrorMessage(err.message || 'Error starting session');
    }
  };

  const stopSession = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close();
      outputAudioCtxRef.current = null;
    }
    setIsConnected(false);
    setIsTalking(false);
    setIsModelSpeaking(false);
  };

  useEffect(() => {
    if (isOpen) {
      startSession();
    } else {
      stopSession();
    }
    return () => {
      stopSession();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="hud-card max-w-lg w-full p-6 border-2 border-[#334155] shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#bccac0] hover:text-white p-1 rounded-xs transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#334155] pb-4 mb-4">
          <div className="p-2.5 rounded-xs bg-[#002f38] border border-[#4cd7f6] text-[#4cd7f6]">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#68dba9] font-body flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#68dba9]" />
              GEMINI LIVE API · GEMINI-3.8-LIVE
            </div>
            <h2 className="text-xl font-bold text-white font-display">
              Real-Time Swarm Voice Copilot
            </h2>
            <div className="text-xs text-[#87948b] font-body">
              Zero-latency bidirectional audio link (16kHz input / 24kHz output)
            </div>
          </div>
        </div>

        {/* Audio Visualizer & State Orb */}
        <div className="p-6 bg-[#060e20] rounded-xs border border-[#334155] flex flex-col items-center justify-center space-y-4 mb-4">
          <div className="relative">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isModelSpeaking
                ? 'bg-[#002f38] border-2 border-[#4cd7f6] shadow-[0_0_25px_rgba(76,215,246,0.8)] scale-110'
                : isTalking
                ? 'bg-[#003825] border-2 border-[#68dba9] shadow-[0_0_20px_rgba(104,219,169,0.6)]'
                : 'bg-[#171f33] border border-[#334155]'
            }`}>
              {isModelSpeaking ? (
                <Volume2 className="w-8 h-8 text-[#4cd7f6] animate-pulse" />
              ) : isTalking ? (
                <Mic className="w-8 h-8 text-[#68dba9]" />
              ) : (
                <MicOff className="w-8 h-8 text-[#87948b]" />
              )}
            </div>
          </div>

          <div className="text-center font-mono text-xs">
            {isModelSpeaking ? (
              <span className="text-[#4cd7f6] font-bold animate-pulse">COPILOT SPEAKING...</span>
            ) : isTalking ? (
              <span className="text-[#68dba9] font-bold">LISTENING TO YOUR MICROPHONE</span>
            ) : isConnected ? (
              <span className="text-[#bccac0]">INITIALIZING AUDIO STREAM...</span>
            ) : (
              <span className="text-[#ef4444]">DISCONNECTED</span>
            )}
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-2.5 bg-[#93000a]/60 border border-[#ef4444] rounded-xs text-xs text-[#ffdad6] font-mono mb-4">
            {errorMessage}
          </div>
        )}

        {/* Conversation transcript feed */}
        <div className="max-h-36 overflow-y-auto space-y-2 font-mono text-xs p-3 bg-[#171f33] rounded-xs border border-[#334155] mb-4">
          {conversation.map((c, i) => (
            <div key={i} className="flex gap-2">
              <span className={`text-[10px] font-bold uppercase ${c.role === 'user' ? 'text-[#ffb95f]' : 'text-[#68dba9]'}`}>
                {c.role === 'user' ? 'YOU:' : 'COPILOT:'}
              </span>
              <span className="text-[#dae2fd] text-[11px]">{c.text}</span>
            </div>
          ))}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#87948b]">
            MODEL: <strong className="text-white">gemini-3.8-live</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1e293b] hover:bg-[#2d3449] border border-[#334155] text-white rounded-xs font-bold transition-colors cursor-pointer"
          >
            END VOICE SESSION
          </button>
        </div>
      </div>
    </div>
  );
};
