import React, { useState } from 'react';
import { 
  Cpu, 
  Target, 
  Zap, 
  ShieldCheck, 
  Droplet, 
  Camera, 
  Activity, 
  Layers, 
  Bug, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { PestDetection, DroneUnit } from '../types/telemetry';

interface EdgeAIVisionViewProps {
  pestDetections: PestDetection[];
  drones: DroneUnit[];
  onTriggerSprayTarget: (pestId: string) => void;
  onSimulateNewDetection: () => void;
}

export const EdgeAIVisionView: React.FC<EdgeAIVisionViewProps> = ({
  pestDetections,
  drones,
  onTriggerSprayTarget,
  onSimulateNewDetection,
}) => {
  const [selectedPestId, setSelectedPestId] = useState<string>(pestDetections[0]?.id || 'det-101');
  const [activeModel, setActiveModel] = useState<string>('AgriYOLO-v10-INT8');
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const selectedPest = pestDetections.find((p) => p.id === selectedPestId) || pestDetections[0];

  const handleManualScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      onSimulateNewDetection();
    }, 800);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* View Header & Edge Computing Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#334155] pb-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#68dba9] font-body flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            ON-DRONE DECENTRALIZED EDGE NPU CLUSTER
          </div>
          <h1 className="text-2xl font-bold text-white font-display mt-0.5">
            Real-Time Edge-AI Pest & Pathogen Vision
          </h1>
          <p className="text-sm text-[#bccac0] mt-1 font-body">
            100% On-device neural inference in remote GPS-denied canopies with 0ms cloud dependency and zero latency off-site transfer.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleManualScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2 bg-[#1e293b] hover:bg-[#2d3449] border border-[#334155] text-white text-xs font-bold rounded-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-[#68dba9]' : ''}`} />
            {isScanning ? 'INFERENCING CANOPY...' : 'RUN ON-EDGE INFERENCE'}
          </button>
        </div>
      </div>

      {/* Main Grid: Optical Camera Stream + Edge Diagnostics Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Optical Drone Macro Camera Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative hud-card overflow-hidden rounded-xs border border-[#334155] aspect-[4/3] bg-black">
            {/* Camera Feed Image */}
            <img
              src="/src/assets/images/canopy_pest_detection_macro_1793902131154.jpg"
              alt="High-resolution crop canopy optical inspection"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />

            {/* Tactical Camera HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
              {/* Top HUD Stats */}
              <div className="flex items-center justify-between text-xs font-mono text-[#dae2fd] bg-black/60 px-3 py-1.5 rounded-xs border border-[#334155]/60 backdrop-blur-sm">
                <span className="flex items-center gap-2 text-[#68dba9] font-bold">
                  <Camera className="w-3.5 h-3.5" />
                  OPTICAL CAM: 4K 60FPS CANOPY MACRO
                </span>
                <span>F/2.8 · 1/1200s · ISO 160</span>
                <span className="text-[#4cd7f6]">NPU LATENCY: 12.8ms</span>
              </div>

              {/* Bounding Boxes on Pests */}
              {showBoundingBoxes && (
                <div className="absolute inset-0 pointer-events-auto">
                  {pestDetections.map((pest) => {
                    const isSelected = pest.id === selectedPestId;
                    return (
                      <div
                        key={pest.id}
                        onClick={() => setSelectedPestId(pest.id)}
                        style={{
                          top: `${pest.box.top}%`,
                          left: `${pest.box.left}%`,
                          width: `${pest.box.width}%`,
                          height: `${pest.box.height}%`,
                        }}
                        className={`absolute border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#68dba9] bg-[#68dba9]/20 shadow-[0_0_15px_rgba(104,219,169,0.6)]'
                            : 'border-[#ffb95f] bg-[#ffb95f]/10 hover:border-white'
                        }`}
                      >
                        {/* Corner Reticles */}
                        <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-white" />
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-white" />
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white" />

                        {/* Identification Tag */}
                        <div className="absolute -top-6 left-0 bg-[#060e20]/90 border border-[#334155] px-1.5 py-0.5 text-[9px] font-mono text-white whitespace-nowrap flex items-center gap-1.5">
                          <span className="font-bold text-[#68dba9]">{pest.confidence}%</span>
                          <span>{pest.pestName}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom HUD Reticle */}
              <div className="flex items-center justify-between text-[11px] font-mono text-[#bccac0] bg-black/60 px-3 py-1.5 rounded-xs border border-[#334155]/60 backdrop-blur-sm">
                <span>CANOPY CLEARANCE: 1.82m AGL</span>
                <span>SPECTRAL BANDS: NIR (840nm) / RED (660nm)</span>
                <span className="text-[#68dba9]">TARGET LOCK: ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Quick Camera & Model Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 hud-card">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[10px] font-bold text-[#87948b] uppercase font-body mr-1">
                EDGE MODEL:
              </span>
              {['AgriYOLO-v10-INT8', 'CanopyNet-Mobile', 'InsectSeg-Edge'].map((model) => (
                <button
                  key={model}
                  onClick={() => setActiveModel(model)}
                  className={`px-3 py-1 text-xs rounded-xs font-mono transition-colors cursor-pointer ${
                    activeModel === model
                      ? 'bg-[#003825] text-[#68dba9] border border-[#68dba9]'
                      : 'bg-[#171f33] text-[#87948b] hover:text-white border border-[#334155]'
                  }`}
                >
                  {model}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-[#bccac0] hover:text-white">
                <input
                  type="checkbox"
                  checked={showBoundingBoxes}
                  onChange={(e) => setShowBoundingBoxes(e.target.checked)}
                  className="rounded border-[#334155] text-[#68dba9] focus:ring-0"
                />
                <span>Bounding Reticles</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Col: Target Quarantine & Micro-Spraying Actuation */}
        <div className="space-y-4">
          <div className="hud-card p-4 border border-[#334155] space-y-4">
            <div className="flex items-center justify-between border-b border-[#334155] pb-3">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-[#68dba9] uppercase font-body">
                  TARGET CLASSIFICATION
                </span>
                <h3 className="text-lg font-bold text-white font-display mt-0.5">
                  {selectedPest.pestName}
                </h3>
                <span className="text-xs text-[#87948b] italic font-body">
                  {selectedPest.scientificName}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-[#68dba9] font-mono tabular-nums">
                  {selectedPest.confidence}%
                </span>
                <span className="text-[9px] text-[#87948b] block font-mono">CONFIDENCE</span>
              </div>
            </div>

            {/* Severity & Bio-index */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-[#171f33] p-2 rounded-xs border border-[#334155]">
                <span className="text-[9px] text-[#87948b] block">INFESTATION SEVERITY</span>
                <span className={`text-sm font-bold uppercase ${
                  selectedPest.severity === 'critical'
                    ? 'text-[#ef4444]'
                    : selectedPest.severity === 'moderate'
                    ? 'text-[#ffb95f]'
                    : 'text-[#68dba9]'
                }`}>
                  {selectedPest.severity}
                </span>
              </div>
              <div className="bg-[#171f33] p-2 rounded-xs border border-[#334155]">
                <span className="text-[9px] text-[#87948b] block">LOCAL NDVI SCORE</span>
                <span className="text-sm font-bold text-white">
                  {selectedPest.ndviScore.toFixed(2)} (Deficit)
                </span>
              </div>
            </div>

            {/* Target Micro-Spraying Solution */}
            <div className="bg-[#171f33] p-3 rounded-xs border border-[#334155] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5 font-display">
                  <Droplet className="w-3.5 h-3.5 text-[#4cd7f6]" />
                  Prescribed Micro-Spray Dose
                </span>
                <span className="text-[#68dba9] font-mono font-bold">
                  {selectedPest.sprayDoseMl || 30} mL Ultra-Fine
                </span>
              </div>
              <p className="text-[11px] text-[#bccac0] font-body">
                Pulse-width modulated (PWM) dual-fluid nozzle atomization at 120µm droplet size. Applies organic biological aphidicide directly to leaf underside.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => onTriggerSprayTarget(selectedPest.id)}
                  className={`w-full py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    selectedPest.sprayStatus === 'treated'
                      ? 'bg-[#003825] border border-[#68dba9] text-[#68dba9]'
                      : 'bg-[#68dba9] hover:bg-[#85f8c4] text-[#002114] shadow-[0_0_12px_rgba(104,219,169,0.3)]'
                  }`}
                >
                  <Droplet className="w-4 h-4 fill-current" />
                  {selectedPest.sprayStatus === 'treated'
                    ? 'TARGET SPRAY COMPLETED'
                    : 'TRIGGER TARGETED MICRO-SPRAY'}
                </button>
              </div>
            </div>

            {/* Edge NPU Hardware Metrics */}
            <div className="space-y-1.5 text-xs font-mono pt-2 border-t border-[#334155]">
              <div className="text-[10px] uppercase font-bold text-[#87948b]">
                ONBOARD HARDWARE ACCELERATION
              </div>
              <div className="flex justify-between text-[#bccac0]">
                <span>NPU ACCELERATOR:</span>
                <span className="text-white">NVIDIA Orin Nano (40 TOPS)</span>
              </div>
              <div className="flex justify-between text-[#bccac0]">
                <span>INFERENCE LATENCY:</span>
                <span className="text-[#68dba9] font-bold">12.8 ms (Local INT8)</span>
              </div>
              <div className="flex justify-between text-[#bccac0]">
                <span>REMOTE CLOUD RELIANCE:</span>
                <span className="text-[#68dba9] font-bold">0.0% (Air-Gapped Field)</span>
              </div>
              <div className="flex justify-between text-[#bccac0]">
                <span>NPU OPERATING TEMP:</span>
                <span className="text-white">48.2°C (Thermal Nominal)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
