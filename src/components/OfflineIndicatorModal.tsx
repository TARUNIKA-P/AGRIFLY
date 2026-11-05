import React, { useState } from 'react';
import { 
  Radio, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  Cpu, 
  Coins, 
  Volume2, 
  X, 
  CheckCircle2, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Zap
} from 'lucide-react';
import { LanguageCode, getOfflineTranslations, SUPPORTED_LANGUAGES } from '../data/translations';

interface OfflineIndicatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  isSimulatedOffline: boolean;
  onToggleSimulateOffline: () => void;
  language: LanguageCode;
}

export const OfflineIndicatorModal: React.FC<OfflineIndicatorModalProps> = ({
  isOpen,
  onClose,
  isOnline,
  isSimulatedOffline,
  onToggleSimulateOffline,
  language,
}) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  if (!isOpen) return null;

  const isEffectiveOffline = !isOnline || isSimulatedOffline;
  const offT = getOfflineTranslations(language);
  const langInfo = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const narration = isEffectiveOffline
      ? `${offT.offlineModeTitle}. ${offT.offlineEdgeActive}. ${offT.offlineEdgeExplanation}. ${offT.networkDeniedSafeNote}`
      : `${offT.onlineModeBadge}. All drones connected to local edge radio and cloud sync.`;

    const utterance = new SpeechSynthesisUtterance(narration);
    utterance.lang = langInfo.speechCode || 'en-GB';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md select-none animate-fadeIn font-body overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0b1326] border-2 border-[#10b981] rounded-xs shadow-2xl flex flex-col overflow-hidden text-white my-auto">
        {/* Header Ribbon */}
        <div className={`p-4 sm:p-5 border-b border-[#334155] flex items-start justify-between gap-4 ${
          isEffectiveOffline 
            ? 'bg-gradient-to-r from-[#291e0a] via-[#0b1326] to-[#00281b]' 
            : 'bg-gradient-to-r from-[#003825] via-[#0b1326] to-[#002f38]'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`p-2 rounded-xs border ${
                isEffectiveOffline 
                  ? 'bg-amber-400/20 border-amber-400 text-amber-300' 
                  : 'bg-[#10b981]/20 border-[#10b981] text-[#10b981]'
              }`}>
                {isEffectiveOffline ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
              </span>
              <div>
                <span className={`px-2 py-0.5 text-[10px] font-black uppercase font-mono tracking-wider rounded-xs ${
                  isEffectiveOffline ? 'bg-amber-400 text-black' : 'bg-[#10b981] text-[#002114]'
                }`}>
                  {isEffectiveOffline ? '📡 OFFLINE EDGE PROCESSING' : '🟢 ONLINE CLOUD SYNC'}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight font-display mt-0.5">
                  {offT.offlineModeTitle}
                </h2>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              onClose();
            }}
            className="p-2 bg-[#171f33] hover:bg-[#25324d] text-[#bccac0] hover:text-white rounded-xs border border-[#334155] transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Callout Banner */}
        <div className={`p-4 sm:p-5 border-b flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isEffectiveOffline 
            ? 'bg-amber-950/30 border-amber-500/40 text-amber-200' 
            : 'bg-[#003825]/50 border-[#10b981]/40 text-[#a7f3d0]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-3.5 h-3.5 rounded-full shrink-0 animate-ping ${
              isEffectiveOffline ? 'bg-amber-400' : 'bg-[#10b981]'
            }`} />
            <div>
              <div className="text-sm font-black text-white flex items-center gap-2">
                <span>{offT.offlineEdgeActive}</span>
              </div>
              <p className="text-xs text-[#bccac0] mt-0.5 leading-relaxed">
                {offT.offlineEdgeExplanation}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSpeak}
            className={`px-3 py-2 rounded-xs border text-xs font-bold flex items-center gap-2 shrink-0 cursor-pointer transition-all shadow-sm ${
              isSpeaking
                ? 'bg-[#10b981] text-[#002114] border-white animate-bounce'
                : 'bg-[#171f33] hover:bg-[#202c46] text-white border-[#334155]'
            }`}
          >
            <Volume2 className="w-4 h-4 text-[#10b981]" />
            <span>{isSpeaking ? 'Speaking... (Stop)' : 'Listen in Voice'}</span>
          </button>
        </div>

        {/* 4 Core Edge Safety Guarantees for Farmers */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[50vh]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#10b981] font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Farm Safety Guarantees Without Internet</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Card 1: Direct Swarm Mesh Radio */}
            <div className="p-3.5 bg-[#131b2e] border border-[#334155] rounded-xs space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#4cd7f6]">
                <Radio className="w-4 h-4" />
                <span>Direct Swarm Radio Link (915 MHz)</span>
              </div>
              <p className="text-[11px] text-[#bccac0] leading-snug">
                Direct wireless peer-to-peer link between ground phone and all 4 drones. Zero mobile towers or cellular internet needed.
              </p>
              <div className="text-[10px] text-[#10b981] font-mono font-bold">
                14.2ms Response Latency · 100% Connected
              </div>
            </div>

            {/* Card 2: Onboard Edge AI */}
            <div className="p-3.5 bg-[#131b2e] border border-[#334155] rounded-xs space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#68dba9]">
                <Cpu className="w-4 h-4" />
                <span>Onboard Drone Edge AI Computer</span>
              </div>
              <p className="text-[11px] text-[#bccac0] leading-snug">
                360-degree LiDAR and stereo vision cameras detect tree branches, overhead wires, and obstacles autonomously on the drone.
              </p>
              <div className="text-[10px] text-[#68dba9] font-mono font-bold">
                0% Cloud Dependency · Complete Collision Avoidance
              </div>
            </div>

            {/* Card 3: Rupee Savings Guaranteed */}
            <div className="p-3.5 bg-[#131b2e] border border-[#334155] rounded-xs space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#f59e0b]">
                <Coins className="w-4 h-4" />
                <span>₹1.56 Lakh Rupee Savings Meter</span>
              </div>
              <p className="text-[11px] text-[#bccac0] leading-snug">
                86.4% chemical reduction and precision micro-spray calculations update locally on your device in Indian Rupees.
              </p>
              <div className="text-[10px] text-[#f59e0b] font-mono font-bold">
                ₹ RUPEES Tracking Active 100% Offline
              </div>
            </div>

            {/* Card 4: Safe Return Home */}
            <div className="p-3.5 bg-[#131b2e] border border-[#334155] rounded-xs space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#38bdf8]">
                <Zap className="w-4 h-4" />
                <span>Battery Safety & Auto-Return Home (RTH)</span>
              </div>
              <p className="text-[11px] text-[#bccac0] leading-snug">
                When battery drops to 20%, the drone halts spraying and returns safely to takeoff home base. Never falls in the field.
              </p>
              <div className="text-[10px] text-[#38bdf8] font-mono font-bold">
                100% Autonomous Local Safety Protocol
              </div>
            </div>
          </div>

          {/* Interactive Simulation Switch for Testing */}
          <div className="p-3.5 bg-[#0e172a] border border-[#334155] rounded-xs flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>{offT.simulatedOfflineBtn}</span>
                {isSimulatedOffline && (
                  <span className="px-1.5 py-0.2 bg-amber-400 text-black text-[9px] font-black rounded-xs">
                    SIMULATED
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#87948b]">
                Toggle this button to test zero-network field conditions on demand.
              </p>
            </div>

            <button
              type="button"
              onClick={onToggleSimulateOffline}
              className={`px-3 py-1.5 rounded-xs border text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                isSimulatedOffline
                  ? 'bg-amber-400 text-black border-amber-300'
                  : 'bg-[#1e293b] text-[#bccac0] border-[#334155] hover:text-white'
              }`}
            >
              {isSimulatedOffline ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              <span>{isSimulatedOffline ? 'Offline Active' : 'Test Offline'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0a1122] border-t border-[#334155] flex items-center justify-between text-xs">
          <span className="text-[#87948b] text-[11px]">
            {offT.meshFrequencyLabel} · {offT.edgeLatencyLabel}
          </span>
          <button
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              onClose();
            }}
            className="px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-[#002114] font-black rounded-xs transition-colors cursor-pointer"
          >
            Got it / OK
          </button>
        </div>
      </div>
    </div>
  );
};
