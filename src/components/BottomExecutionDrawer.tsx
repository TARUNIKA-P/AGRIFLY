import React, { useState } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Activity, 
  Droplet, 
  Compass, 
  ShieldCheck, 
  TrendingDown, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { DroneUnit, PestDetection } from '../types/telemetry';

interface BottomExecutionDrawerProps {
  drones: DroneUnit[];
  pestDetections: PestDetection[];
  areaSurveyedHa: number;
  totalAreaHa: number;
  chemicalSavedPercent: number;
  missionLogs: { id: string; time: string; message: string; type: 'info' | 'spray' | 'alert' }[];
}

export const BottomExecutionDrawer: React.FC<BottomExecutionDrawerProps> = ({
  drones,
  pestDetections,
  areaSurveyedHa,
  totalAreaHa,
  chemicalSavedPercent,
  missionLogs,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'metrics' | 'swarmlog' | 'pestlist'>('metrics');

  const activeSprayingDrones = drones.filter((d) => d.sprayActive).length;
  const currentTotalFlow = drones.reduce((acc, d) => acc + d.sprayFlowRate, 0);

  return (
    <div className="bg-[#0b1326] border-t border-[#334155] select-none z-30 transition-all duration-300">
      {/* Top collapsed bar / drawer handle */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-6 py-2.5 bg-[#131b2e]/95 hover:bg-[#171f33] cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#87948b] font-body">
              SURVEY PROGRESS
            </span>
            <span className="font-display font-bold text-[#dae2fd] tabular-nums">
              {areaSurveyedHa.toFixed(1)} / {totalAreaHa} ha ({Math.round((areaSurveyedHa / totalAreaHa) * 100)}%)
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#87948b] font-body">
              APPLICATION RATE
            </span>
            <span className="font-display font-bold text-[#4cd7f6] tabular-nums">
              {currentTotalFlow.toFixed(2)} L/min
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#87948b] font-body">
              MICRO-SPRAY EFFICIENCY
            </span>
            <span className="font-display font-bold text-[#68dba9] tabular-nums flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" /> -{chemicalSavedPercent}% Chemical Load
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#87948b] font-body">
              VERIFIED TARGETS
            </span>
            <span className="font-display font-bold text-[#ffb95f] tabular-nums">
              {pestDetections.length} Foci Isolated
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-[#87948b]">
            {isExpanded ? 'COLLAPSE DRAWER' : 'EXPAND TELEMETRY'}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-[#bccac0]" />
          ) : (
            <ChevronUp className="w-4 h-4 text-[#bccac0]" />
          )}
        </div>
      </div>

      {/* Expanded telemetry contents */}
      {isExpanded && (
        <div className="p-4 bg-[#0b1326] border-t border-[#334155]/60 max-h-72 overflow-y-auto">
          {/* Sub-tab selection */}
          <div className="flex items-center gap-2 mb-3 border-b border-[#334155] pb-2 text-xs">
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-3 py-1 font-semibold rounded-xs transition-colors cursor-pointer ${
                activeTab === 'metrics'
                  ? 'bg-[#1e293b] text-[#68dba9] border border-[#68dba9]/40'
                  : 'text-[#87948b] hover:text-[#dae2fd]'
              }`}
            >
              Swarm Flight Dynamics
            </button>
            <button
              onClick={() => setActiveTab('pestlist')}
              className={`px-3 py-1 font-semibold rounded-xs transition-colors cursor-pointer ${
                activeTab === 'pestlist'
                  ? 'bg-[#1e293b] text-[#68dba9] border border-[#68dba9]/40'
                  : 'text-[#87948b] hover:text-[#dae2fd]'
              }`}
            >
              Precision Spray Sectors ({pestDetections.length})
            </button>
            <button
              onClick={() => setActiveTab('swarmlog')}
              className={`px-3 py-1 font-semibold rounded-xs transition-colors cursor-pointer ${
                activeTab === 'swarmlog'
                  ? 'bg-[#1e293b] text-[#68dba9] border border-[#68dba9]/40'
                  : 'text-[#87948b] hover:text-[#dae2fd]'
              }`}
            >
              P2P Decentralized Consensus Log
            </button>
          </div>

          {/* Tab 1: Swarm Flight Dynamics */}
          {activeTab === 'metrics' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {drones.map((drone) => (
                <div key={drone.id} className="hud-card p-2.5 border border-[#334155]">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-white font-display flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: drone.color }} />
                      {drone.name}
                    </span>
                    <span className="text-[10px] text-[#87948b] font-mono">{drone.role}</span>
                  </div>
                  <div className="space-y-1 text-[11px] font-mono text-[#bccac0]">
                    <div className="flex justify-between">
                      <span>BATTERY:</span>
                      <span className="text-white font-bold">{drone.battery}% ({drone.voltage}V)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AGL CANOPY ALT:</span>
                      <span className="text-[#68dba9] font-bold">{drone.altitudeAGL.toFixed(1)}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ODOM SLAM:</span>
                      <span className="text-[#4cd7f6]">{drone.slamFix}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>MICRO-SPRAY:</span>
                      <span className={drone.sprayActive ? 'text-[#68dba9] font-bold' : 'text-[#87948b]'}>
                        {drone.sprayActive ? `${drone.sprayFlowRate.toFixed(2)} L/m` : 'STANDBY'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Sector Spraying */}
          {activeTab === 'pestlist' && (
            <div className="space-y-2">
              <div className="grid grid-cols-6 text-[10px] font-mono uppercase text-[#87948b] px-3 py-1 bg-[#131b2e] rounded-xs border border-[#334155]">
                <span>Timestamp</span>
                <span>Spray Target / Zone</span>
                <span>Host Crop</span>
                <span>Confidence</span>
                <span>Micro-Dose</span>
                <span>Treatment Status</span>
              </div>
              {pestDetections.map((pest) => (
                <div
                  key={pest.id}
                  className="grid grid-cols-6 items-center text-xs px-3 py-2 bg-[#131b2e]/60 border border-[#334155]/60 rounded-xs font-mono"
                >
                  <span className="text-[#87948b]">{pest.timestamp}</span>
                  <span className="text-white font-bold">{pest.pestName}</span>
                  <span className="text-[#bccac0]">{pest.cropType}</span>
                  <span className="text-[#4cd7f6] font-bold">{pest.confidence}%</span>
                  <span className="text-[#68dba9]">{pest.sprayDoseMl > 0 ? `${pest.sprayDoseMl} mL` : '0 mL'}</span>
                  <span className={`uppercase font-bold text-[10px] px-2 py-0.5 rounded-xs w-max ${
                    pest.sprayStatus === 'treated'
                      ? 'bg-[#003825] text-[#68dba9] border border-[#68dba9]/40'
                      : pest.sprayStatus === 'queued'
                      ? 'bg-[#5b3800] text-[#ffb95f] border border-[#ffb95f]/40'
                      : 'bg-[#222a3d] text-[#bccac0]'
                  }`}>
                    {pest.sprayStatus}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Swarm Consensus Logs */}
          {activeTab === 'swarmlog' && (
            <div className="space-y-1.5 font-mono text-xs max-h-48 overflow-y-auto pr-2">
              {missionLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-1.5 rounded-xs bg-[#131b2e]/40 border border-[#334155]/40"
                >
                  <span className="text-[#87948b] text-[10px] shrink-0 mt-0.5">{log.time}</span>
                  <span className={`text-[10px] uppercase font-bold shrink-0 px-1 py-0.2 rounded-xs ${
                    log.type === 'alert'
                      ? 'bg-[#93000a] text-[#ffdad6]'
                      : log.type === 'spray'
                      ? 'bg-[#003825] text-[#68dba9]'
                      : 'bg-[#222a3d] text-[#4cd7f6]'
                  }`}>
                    {log.type}
                  </span>
                  <span className="text-[#dae2fd] text-[11px]">{log.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
