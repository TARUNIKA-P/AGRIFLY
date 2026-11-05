import React from 'react';
import { 
  Radio, 
  BatteryCharging, 
  Droplet, 
  Network, 
  Compass, 
  Cpu,
  ShieldCheck,
  Leaf,
  Bot,
  WifiOff
} from 'lucide-react';
import { DroneUnit, SwarmMeshStats } from '../types/telemetry';

interface TopTelemetryRibbonProps {
  selectedDrone: DroneUnit;
  drones: DroneUnit[];
  meshStats: SwarmMeshStats;
  onOpenVoiceDialog: () => void;
  onOpenTranscribeModal: () => void;
  onOpenMeshTab?: () => void;
  onOpenChatbot?: () => void;
  userMode?: 'simple' | 'pro';
  isEffectiveOffline?: boolean;
  onOpenOfflineModal?: () => void;
  activeDroneCount?: number;
  onAddDrone?: () => void;
  onRemoveDrone?: () => void;
  onSetDroneCount?: (count: number) => void;
}

export const TopTelemetryRibbon: React.FC<TopTelemetryRibbonProps> = ({
  selectedDrone,
  drones,
  meshStats,
  onOpenVoiceDialog,
  onOpenTranscribeModal,
  onOpenMeshTab,
  onOpenChatbot,
  userMode = 'simple',
  isEffectiveOffline = false,
  onOpenOfflineModal,
  activeDroneCount,
  onAddDrone,
  onRemoveDrone,
  onSetDroneCount,
}) => {
  const currentCount = activeDroneCount ?? drones.length;
  const avgBattery = Math.round(
    drones.reduce((acc, d) => acc + d.battery, 0) / (drones.length || 1)
  );
  const totalPayloadL = drones.reduce((acc, d) => acc + d.payloadRemaining, 0);
  const totalCapacityL = drones.reduce((acc, d) => acc + d.payloadCapacity, 0);

  if (userMode === 'simple') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-[#060e20]/95 backdrop-blur-md border-b border-[#334155] overflow-x-auto text-xs scrollbar-none select-none z-20">
        {/* Simple Mode: Safe Tree Avoidance */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#003825]/80 border border-[#68dba9] rounded-xs shrink-0 shadow-[0_0_8px_rgba(104,219,169,0.15)]">
          <ShieldCheck className="w-4 h-4 text-[#68dba9]" />
          <div>
            <div className="text-[10px] font-bold tracking-wider text-[#68dba9] uppercase font-body leading-none">
              FLIGHT SAFETY
            </div>
            <div className="text-xs font-bold text-white font-display tabular-nums leading-tight mt-0.5">
              BRANCH AVOIDANCE ACTIVE
            </div>
          </div>
        </div>

        {/* Simple Mode: Offline / Edge Processing Indicator */}
        <button
          onClick={onOpenOfflineModal}
          title="Click to view Swarm Offline Edge Processing status"
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xs shrink-0 cursor-pointer text-left transition-colors border ${
            isEffectiveOffline
              ? 'bg-[#291e0a] border-amber-400 text-amber-300 hover:bg-[#38280f] shadow-[0_0_8px_rgba(245,158,11,0.2)]'
              : 'bg-[#003825] border-[#10b981] text-[#10b981] hover:bg-[#005137]'
          }`}
        >
          {isEffectiveOffline ? (
            <WifiOff className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
          ) : (
            <Radio className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
          )}
          <div>
            <div className={`text-[10px] font-bold tracking-wider uppercase font-body leading-none ${
              isEffectiveOffline ? 'text-amber-300' : 'text-[#68dba9]'
            }`}>
              {isEffectiveOffline ? 'OFFLINE EDGE PROCESSING' : 'SWARM CONNECTIVITY'}
            </div>
            <div className="text-xs font-bold text-white font-display tabular-nums leading-tight mt-0.5">
              {isEffectiveOffline ? 'LOCAL RADIO ACTIVE (100% SAFE)' : 'DUAL CLOUD + RF RADIO READY'}
            </div>
          </div>
        </button>

        {/* Simple Mode: Drone Swarm Count + Add/Remove Controls */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#131b2e] border border-[#334155] rounded-xs shrink-0 text-left">
          <Network className="w-3.5 h-3.5 text-[#4cd7f6] shrink-0" />
          <div>
            <div className="text-[10px] font-bold tracking-wider text-[#bccac0] uppercase font-body leading-none flex items-center gap-1">
              <span>DRONE FLEET</span>
              <span className="text-[9px] text-[#4cd7f6] font-mono">(MIN 1 · MAX 4)</span>
            </div>
            <div className="text-xs font-bold text-[#dae2fd] font-display tabular-nums leading-tight mt-0.5">
              {currentCount} OF 4 ACTIVE {currentCount === 1 ? '(SOLO)' : '(SWARM)'}
            </div>
          </div>
          {onAddDrone && onRemoveDrone && (
            <div className="flex items-center gap-1 ml-1.5 pl-1.5 border-l border-white/15">
              <button
                type="button"
                onClick={onRemoveDrone}
                disabled={currentCount <= 1}
                title="Remove 1 drone (Minimum 1)"
                className="w-5 h-5 flex items-center justify-center bg-[#1e293b] hover:bg-[#334155] disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold rounded-xs text-xs cursor-pointer"
              >
                −
              </button>
              <button
                type="button"
                onClick={onAddDrone}
                disabled={currentCount >= 4}
                title="Add 1 drone (Up to 4)"
                className="px-1.5 h-5 flex items-center justify-center gap-0.5 bg-[#10b981] hover:bg-[#059669] disabled:opacity-30 disabled:cursor-not-allowed text-[#002114] font-black rounded-xs text-[10px] cursor-pointer"
              >
                <span>+</span>
                <span>Add</span>
              </button>
            </div>
          )}
        </div>

        {/* Simple Mode: Lead Drone Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#131b2e] border border-[#334155] rounded-xs shrink-0">
          <Radio className="w-3.5 h-3.5 text-[#68dba9]" />
          <div>
            <div className="text-[10px] font-bold tracking-wider text-[#bccac0] uppercase font-body leading-none">
              ACTIVE DRONE
            </div>
            <div className="text-xs font-bold text-[#dae2fd] font-display tabular-nums leading-tight mt-0.5">
              {selectedDrone.callsign} · <span className="text-[#68dba9] font-mono">{selectedDrone.altitudeAGL.toFixed(1)}m</span> ABOVE CANOPY
            </div>
          </div>
        </div>

        {/* Simple Mode: Average Battery */}
        <div className={`flex items-center gap-2 px-3 py-1.5 bg-[#131b2e] border rounded-xs shrink-0 ${
          avgBattery > 40 ? 'border-[#334155]' : avgBattery > 20 ? 'border-[#ffb95f]' : 'border-[#ef4444]'
        }`}>
          <BatteryCharging className={`w-3.5 h-3.5 ${avgBattery > 40 ? 'text-[#68dba9]' : 'text-[#ffb95f]'}`} />
          <div>
            <div className="text-[10px] font-bold tracking-wider text-[#bccac0] uppercase font-body leading-none">
              TEAM BATTERY
            </div>
            <div className="text-xs font-bold text-[#dae2fd] font-display tabular-nums leading-tight mt-0.5">
              <span className={avgBattery > 40 ? 'text-[#68dba9]' : 'text-[#ffb95f]'}>{avgBattery}%</span> · <span className="text-[#bccac0]">~28 MINS LEFT</span>
            </div>
          </div>
        </div>

        {/* Simple Mode: Spray Remaining & RUPEES Savings */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#003825]/90 border border-[#10b981] rounded-xs shrink-0 shadow-sm">
          <Droplet className="w-3.5 h-3.5 text-[#34d399]" />
          <div>
            <div className="text-[10px] font-bold tracking-wider text-[#d1fae5] uppercase font-body leading-none flex items-center gap-1">
              <span>RUPEE & CHEMICAL SAVINGS</span>
              <span className="text-[9px] bg-[#f59e0b] text-black font-extrabold px-1 rounded-xs">₹ RUPEES</span>
            </div>
            <div className="text-xs font-bold text-white font-display tabular-nums leading-tight mt-0.5">
              <span className="text-[#34d399] font-mono">{totalPayloadL.toFixed(1)}L READY</span> · <span className="text-[#f59e0b] font-extrabold">₹1.56 LAKH SAVED (86%)</span>
            </div>
          </div>
        </div>

        {/* Gemini Multi-Turn Chatbot Button */}
        {onOpenChatbot && (
          <button
            onClick={onOpenChatbot}
            title="Chat with Gemini Swarm Copilot"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#002f38] hover:bg-[#003d4a] border border-[#4cd7f6] rounded-xs shrink-0 text-xs font-bold text-[#4cd7f6] transition-colors cursor-pointer ml-auto shadow-[0_0_8px_rgba(76,215,246,0.2)]"
          >
            <Bot className="w-3.5 h-3.5 text-[#4cd7f6]" />
            <span>AI COPILOT</span>
          </button>
        )}

        {/* Voice Copilot Button (Friendly) */}
        <button
          onClick={onOpenVoiceDialog}
          title="Talk with real-time Gemini voice assistant"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171f33] hover:bg-[#1e293b] border border-[#334155] hover:border-[#4cd7f6] rounded-xs shrink-0 text-xs font-bold text-[#bccac0] hover:text-white transition-colors cursor-pointer shadow-[0_0_8px_rgba(76,215,246,0.1)]"
        >
          <Radio className="w-3.5 h-3.5 text-[#68dba9] animate-pulse" />
          <span>VOICE LIVE</span>
        </button>

        {/* Dictate Button */}
        <button
          onClick={onOpenTranscribeModal}
          title="Dictate farm notes with microphone"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171f33] hover:bg-[#1e293b] border border-[#ffb95f] rounded-xs shrink-0 text-xs font-bold text-[#ffb95f] transition-colors cursor-pointer"
        >
          <span>VOICE NOTE</span>
        </button>
      </div>
    );
  }

  // Pro Mode (Detailed Engineering Avionics)
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-[#060e20]/90 backdrop-blur-md border-b border-[#334155] overflow-x-auto text-xs scrollbar-none select-none z-20">
      {/* RTK / SLAM Navigation Lock */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#131b2e] border border-[#68dba9]/60 rounded-xs shrink-0 shadow-[0_0_8px_rgba(104,219,169,0.15)]">
        <Compass className="w-3.5 h-3.5 text-[#68dba9]" />
        <div>
          <div className="text-[10px] font-bold tracking-wider text-[#bccac0] uppercase font-body leading-none">
            NAV INTEGRITY
          </div>
          <div className="text-xs font-bold text-[#dae2fd] font-display tabular-nums leading-tight mt-0.5">
            SLAM-VIO FIXED <span className="text-[10px] text-[#68dba9] font-mono">(GPS-DENIED)</span>
          </div>
        </div>
      </div>

      {/* Connectivity & Edge Processing Pill */}
      <button
        onClick={onOpenOfflineModal}
        title="View Swarm Edge Link Diagnostics"
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xs shrink-0 cursor-pointer text-left transition-colors border ${
          isEffectiveOffline
            ? 'bg-[#291e0a] border-amber-400 text-amber-300 hover:bg-[#38280f]'
            : 'bg-[#131b2e] border-[#334155] hover:border-[#68dba9] text-[#bccac0]'
        }`}
      >
        {isEffectiveOffline ? (
          <WifiOff className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
        ) : (
          <Radio className="w-3.5 h-3.5 text-[#68dba9] shrink-0" />
        )}
        <div>
          <div className="text-[10px] font-bold tracking-wider text-[#bccac0] uppercase font-body leading-none">
            CONNECTIVITY
          </div>
          <div className="text-xs font-bold text-white font-display tabular-nums leading-tight mt-0.5">
            {isEffectiveOffline ? (
              <span className="text-amber-300">EDGE RF · 0% CLOUD LEAK</span>
            ) : (
              <span className="text-[#68dba9]">DUAL RF + CLOUD SYNC</span>
            )}
          </div>
        </div>
      </button>

      {/* Swarm Mesh & Latency (Clickable to switch to Swarm Mesh Diagnostics) */}
      <button
        onClick={onOpenMeshTab}
        title="View P2P Swarm Mesh & Latency Diagnostics Layer"
        className="flex items-center gap-2 px-3 py-1.5 bg-[#131b2e] hover:bg-[#1a253d] border border-[#334155] hover:border-[#4cd7f6] transition-colors rounded-xs shrink-0 cursor-pointer text-left"
      >
        <Network className="w-3.5 h-3.5 text-[#4cd7f6]" />
        <div>
          <div className="text-[10px] font-bold tracking-wider text-[#bccac0] uppercase font-body leading-none flex items-center gap-1">
            <span>P2P MESH SWARM</span>
            <span className="text-[9px] text-[#4cd7f6] font-mono">DIAGNOSTICS &rarr;</span>
          </div>
          <div className="text-xs font-bold text-[#dae2fd] font-display tabular-nums leading-tight mt-0.5">
            {meshStats.activeNodes}/{meshStats.totalNodes} NODES · <span className="text-[#4cd7f6] font-mono">{meshStats.meshLatencyMs.toFixed(1)}ms</span>
          </div>
        </div>
      </button>

      {/* Selected Craft Telemetry Pill */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#131b2e] border border-[#68dba9] rounded-xs shrink-0">
        <Radio className="w-3.5 h-3.5 text-[#68dba9]" />
        <div>
          <div className="text-[10px] font-bold tracking-wider text-[#68dba9] uppercase font-body leading-none">
            CRAFT: {selectedDrone.callsign}
          </div>
          <div className="text-xs font-bold text-[#dae2fd] font-display tabular-nums leading-tight mt-0.5">
            AGL <span className="text-[#68dba9] font-mono">{selectedDrone.altitudeAGL.toFixed(1)}m</span> · SPD <span className="font-mono">{selectedDrone.groundSpeed.toFixed(1)}m/s</span>
          </div>
        </div>
      </div>

      {/* Aggregate Swarm Battery */}
      <div className={`flex items-center gap-2 px-3 py-1.5 bg-[#131b2e] border rounded-xs shrink-0 ${
        avgBattery > 40 ? 'border-[#334155]' : avgBattery > 20 ? 'border-[#ffb95f]' : 'border-[#ef4444]'
      }`}>
        <BatteryCharging className={`w-3.5 h-3.5 ${avgBattery > 40 ? 'text-[#68dba9]' : 'text-[#ffb95f]'}`} />
        <div>
          <div className="text-[10px] font-bold tracking-wider text-[#bccac0] uppercase font-body leading-none">
            SWARM ENERGY
          </div>
          <div className="text-xs font-bold text-[#dae2fd] font-display tabular-nums leading-tight mt-0.5">
            <span className={avgBattery > 40 ? 'text-[#68dba9]' : 'text-[#ffb95f]'}>{avgBattery}%</span> AVG · <span className="font-mono text-[#bccac0]">28 MIN EST</span>
          </div>
        </div>
      </div>

      {/* Spray Payload Tank */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#131b2e] border border-[#334155] rounded-xs shrink-0">
        <Droplet className="w-3.5 h-3.5 text-[#4cd7f6]" />
        <div>
          <div className="text-[10px] font-bold tracking-wider text-[#bccac0] uppercase font-body leading-none">
            MICRO-SPRAY PAYLOAD
          </div>
          <div className="text-xs font-bold text-[#dae2fd] font-display tabular-nums leading-tight mt-0.5">
            <span className="text-[#4cd7f6] font-mono">{totalPayloadL.toFixed(1)}L</span> / {totalCapacityL}L · <span className="text-[#f59e0b] font-bold font-mono">₹1.56L SAVING (86%)</span>
          </div>
        </div>
      </div>

      {/* Swarm Autonomous Core */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#131b2e] border border-[#334155] rounded-xs shrink-0">
        <Cpu className="w-3.5 h-3.5 text-[#68dba9]" />
        <div>
          <div className="text-[10px] font-bold tracking-wider text-[#bccac0] uppercase font-body leading-none">
            SWARM AUTONOMY
          </div>
          <div className="text-xs font-bold text-[#dae2fd] font-display tabular-nums leading-tight mt-0.5">
            <span className="text-[#68dba9] font-mono">14.2ms</span> · 0% CLOUD LEAK
          </div>
        </div>
      </div>

      {/* Gemini Multi-Turn Chatbot Button */}
      {onOpenChatbot && (
        <button
          onClick={onOpenChatbot}
          title="Open Multi-Turn Gemini Swarm Copilot Chat"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#002f38] hover:bg-[#003d4a] border border-[#4cd7f6] rounded-xs shrink-0 text-xs font-bold text-[#4cd7f6] transition-colors cursor-pointer ml-auto shadow-[0_0_8px_rgba(76,215,246,0.2)]"
        >
          <Bot className="w-3.5 h-3.5 text-[#4cd7f6]" />
          <span>COPILOT CHAT</span>
        </button>
      )}

      {/* Voice Copilot (Live API gemini-3.8-live) */}
      <button
        onClick={onOpenVoiceDialog}
        title="Open Real-Time Gemini Live Voice Copilot"
        className={`flex items-center gap-1.5 px-3 py-1.5 bg-[#171f33] hover:bg-[#1e293b] border border-[#334155] hover:border-[#4cd7f6] rounded-xs shrink-0 text-xs font-bold text-[#bccac0] hover:text-white transition-colors cursor-pointer ${onOpenChatbot ? '' : 'ml-auto'}`}
      >
        <Radio className="w-3.5 h-3.5 text-[#68dba9] animate-pulse" />
        <span>VOICE LIVE (3.8)</span>
      </button>

      {/* Audio Dictate / Transcribe (gemini-3.5-transcribe) */}
      <button
        onClick={onOpenTranscribeModal}
        title="Dictate Flight Log with Microphone"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171f33] hover:bg-[#1e293b] border border-[#ffb95f] rounded-xs shrink-0 text-xs font-bold text-[#ffb95f] transition-colors cursor-pointer"
      >
        <Droplet className="w-3.5 h-3.5 hidden" />
        <span>DICTATE (3.5)</span>
      </button>
    </div>
  );
};
