import React from 'react';
import { X, Droplet, Bug, CheckCircle2, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';
import { PestDetection } from '../types/telemetry';

interface PestDetailModalProps {
  pest: PestDetection | null;
  onClose: () => void;
  onApplySpray: (pestId: string) => void;
}

export const PestDetailModal: React.FC<PestDetailModalProps> = ({
  pest,
  onClose,
  onApplySpray,
}) => {
  if (!pest) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="hud-card max-w-lg w-full p-6 border-2 border-[#334155] shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#bccac0] hover:text-white p-1 rounded-xs transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#334155] pb-4 mb-4">
          <div className={`p-2.5 rounded-xs border ${
            pest.severity === 'critical'
              ? 'bg-[#93000a] border-[#ef4444] text-[#ffdad6]'
              : 'bg-[#5b3800] border-[#ffb95f] text-[#ffddb8]'
          }`}>
            <Bug className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#68dba9] font-body">
              EDGE-AI TARGET DETECTED
            </div>
            <h2 className="text-xl font-bold text-white font-display">
              {pest.pestName}
            </h2>
            <div className="text-xs text-[#87948b] italic font-body">
              {pest.scientificName} · {pest.cropType}
            </div>
          </div>
        </div>

        {/* Macro visual crop */}
        <div className="relative rounded-xs overflow-hidden border border-[#334155] aspect-[16/9] mb-4 bg-black">
          <img
            src="/src/assets/images/canopy_pest_detection_macro_1793902131154.jpg"
            alt={pest.pestName}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 border border-[#334155] text-[10px] font-mono text-[#68dba9] rounded-xs">
            NPU CONFIDENCE: {pest.confidence}%
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 border border-[#334155] text-[10px] font-mono text-white rounded-xs">
            GRID: X={pest.location.x}% Y={pest.location.y}%
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-4">
          <div className="bg-[#171f33] p-2.5 rounded-xs border border-[#334155]">
            <span className="text-[10px] text-[#87948b] block">ISOLATION SEVERITY:</span>
            <span className={`text-sm font-bold uppercase ${
              pest.severity === 'critical' ? 'text-[#ef4444]' : 'text-[#ffb95f]'
            }`}>
              {pest.severity} THREAT
            </span>
          </div>

          <div className="bg-[#171f33] p-2.5 rounded-xs border border-[#334155]">
            <span className="text-[10px] text-[#87948b] block">NDVI VEGETATION VIGOR:</span>
            <span className="text-sm font-bold text-white tabular-nums">
              {pest.ndviScore.toFixed(2)} (Chlorosis)
            </span>
          </div>
        </div>

        {/* Treatment Status & Action */}
        <div className="bg-[#171f33] p-3 rounded-xs border border-[#334155] mb-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#87948b]">TREATMENT STATUS:</span>
            <span className={`font-bold uppercase ${
              pest.sprayStatus === 'treated' ? 'text-[#68dba9]' : 'text-[#ffb95f]'
            }`}>
              {pest.sprayStatus}
            </span>
          </div>
          <p className="text-[11px] text-[#bccac0] font-body">
            Target micro-spraying dispenses exactly {pest.sprayDoseMl || 30} mL ultra-fine biological solution directly to the identified colony, sparing 95% of adjacent beneficial predatory insects.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              onApplySpray(pest.id);
              onClose();
            }}
            className={`flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider rounded-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              pest.sprayStatus === 'treated'
                ? 'bg-[#003825] border border-[#68dba9] text-[#68dba9]'
                : 'bg-[#68dba9] hover:bg-[#85f8c4] text-[#002114] shadow-[0_0_12px_rgba(104,219,169,0.4)]'
            }`}
          >
            <Droplet className="w-4 h-4 fill-current" />
            {pest.sprayStatus === 'treated' ? 'TARGET MICRO-SPRAY APPLIED' : 'EXECUTE MICRO-SPRAY NOW'}
          </button>

          <button
            onClick={onClose}
            className="py-2.5 px-4 text-xs font-bold uppercase tracking-wider bg-[#1e293b] hover:bg-[#2d3449] border border-[#334155] text-[#bccac0] hover:text-white rounded-xs transition-colors cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
