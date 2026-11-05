import React, { useState, useRef } from 'react';
import { Mic, MicOff, X, Copy, Check, FileText, Loader2, Play, Volume2 } from 'lucide-react';

interface AudioTranscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMissionLog: (text: string) => void;
}

export const AudioTranscribeModal: React.FC<AudioTranscribeModalProps> = ({
  isOpen,
  onClose,
  onAddMissionLog,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [recordDuration, setRecordDuration] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      setErrorMessage(null);
      setTranscript('');
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        await sendAudioToTranscribe(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordDuration(0);

      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone recording error:', err);
      setErrorMessage('Microphone access denied. You can also test with a pre-recorded audio sample below.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const sendAudioToTranscribe = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const res = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audio: base64Data,
            mimeType: 'audio/webm',
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setTranscript(data.text);
        } else {
          setErrorMessage(data.error || 'Transcription failed');
        }
        setIsTranscribing(false);
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error');
      setIsTranscribing(false);
    }
  };

  const handleTestAudioSample = async () => {
    // Generate a simple synthetic tone or audio sample to demonstrate gemini-3.5-transcribe
    setIsTranscribing(true);
    setErrorMessage(null);
    try {
      // Create a short WebM audio buffer using Web Audio API
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const dest = audioCtx.createMediaStreamDestination();
      osc.connect(dest);
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.start();
      
      const recorder = new MediaRecorder(dest.stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        audioCtx.close();
        await sendAudioToTranscribe(blob);
      };
      recorder.start();
      setTimeout(() => recorder.stop(), 1200);
    } catch (e: any) {
      setIsTranscribing(false);
      setErrorMessage('Failed to generate test tone: ' + e.message);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToLog = () => {
    if (transcript) {
      onAddMissionLog(`Operator Voice Log: "${transcript}"`);
      onClose();
    }
  };

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
          <div className="p-2.5 rounded-xs bg-[#171f33] border border-[#ffb95f] text-[#ffb95f]">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#ffb95f] font-body">
              AUDIO TRANSCRIPTION · GEMINI-3.5-TRANSCRIBE
            </div>
            <h2 className="text-xl font-bold text-white font-display">
              Dictate Flight Observation
            </h2>
            <div className="text-xs text-[#87948b] font-body">
              Speak into your microphone to transcribe canopy telemetry notes
            </div>
          </div>
        </div>

        {/* Recording Visual & Button */}
        <div className="p-6 bg-[#060e20] rounded-xs border border-[#334155] flex flex-col items-center justify-center space-y-4 mb-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isTranscribing}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 ${
              isRecording
                ? 'bg-[#ef4444] text-white shadow-[0_0_25px_rgba(239,68,68,0.8)] animate-pulse'
                : 'bg-[#171f33] hover:bg-[#1e293b] border-2 border-[#ffb95f] text-[#ffb95f]'
            }`}
          >
            {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>

          <div className="text-center font-mono text-xs">
            {isRecording ? (
              <span className="text-[#ef4444] font-bold">
                RECORDING AUDIO... ({recordDuration}s) · CLICK TO FINISH
              </span>
            ) : isTranscribing ? (
              <span className="text-[#4cd7f6] font-bold flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                TRANSCRIBING WITH GEMINI-3.5-TRANSCRIBE...
              </span>
            ) : (
              <span className="text-[#bccac0]">
                CLICK MICROPHONE TO RECORD FIELD VOICE NOTE
              </span>
            )}
          </div>
        </div>

        {/* Error message if any */}
        {errorMessage && (
          <div className="p-2.5 bg-[#93000a]/60 border border-[#ef4444] rounded-xs text-xs text-[#ffdad6] font-mono mb-4">
            {errorMessage}
          </div>
        )}

        {/* Transcription Output Field */}
        <div className="space-y-2 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#87948b] font-body block">
            TRANSCRIPTION RESULT
          </span>
          <div className="p-3 bg-[#171f33] rounded-xs border border-[#334155] min-h-[80px] text-xs font-mono text-white">
            {transcript || (
              <span className="text-[#87948b] italic">
                Transcribed speech from gemini-3.5-transcribe will appear here...
              </span>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between text-xs font-mono">
          <button
            onClick={handleTestAudioSample}
            disabled={isTranscribing || isRecording}
            className="text-[#4cd7f6] hover:underline cursor-pointer"
          >
            Run Synthetic Sample Test
          </button>

          <div className="flex items-center gap-2">
            {transcript && (
              <>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-[#1e293b] hover:bg-[#2d3449] border border-[#334155] text-white rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#68dba9]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'COPIED' : 'COPY'}</span>
                </button>
                <button
                  onClick={handleAddToLog}
                  className="px-3 py-1.5 bg-[#003825] hover:bg-[#005137] border border-[#68dba9] text-[#68dba9] rounded-xs font-bold transition-colors cursor-pointer"
                >
                  ADD TO MISSION LOG
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
