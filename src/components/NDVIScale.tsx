import React from 'react';

interface NDVIScaleProps {
  currentNDVI: number; // e.g. 0.0 to 1.0
  droneCallsign: string;
}

export const NDVIScale: React.FC<NDVIScaleProps> = ({ currentNDVI, droneCallsign }) => {
  // Clamp between 0 and 1
  const clamped = Math.max(0, Math.min(1, currentNDVI));
  const percentage = clamped * 100;

  const getVigorLabel = (val: number) => {
    if (val >= 0.7) return { text: 'HIGH VIGOR CANOPY', color: 'text-[#68dba9]' };
    if (val >= 0.45) return { text: 'MODERATE / STRESS DETECTED', color: 'text-[#ffb95f]' };
    return { text: 'SEVERE BIOMASS DEFICIT', color: 'text-[#ef4444]' };
  };

  const status = getVigorLabel(clamped);

  return (
    <div className="bg-[#131b2e]/90 backdrop-blur-md border border-[#334155] rounded-xs p-2.5 w-64 select-none shadow-lg">
      <div className="flex items-center justify-between text-[11px] mb-1.5">
        <span className="font-bold tracking-wider text-[#bccac0] uppercase font-body">
          NDVI SPECTRUM SCALE
        </span>
        <span className={`font-mono font-bold text-xs tabular-nums ${status.color}`}>
          {clamped.toFixed(2)}
        </span>
      </div>

      {/* Spectrum Continuous Gradient Bar */}
      <div className="relative h-3 w-full rounded-xs overflow-hidden border border-[#334155]">
        <div 
          className="w-full h-full"
          style={{
            background: 'linear-gradient(to right, #ef4444 0%, #ffb95f 50%, #059669 85%, #68dba9 100%)',
          }}
        />

        {/* Real-time Pointer Anchor */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_6px_#ffffff] transform -translate-x-1/2 transition-all duration-300"
          style={{ left: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[9px] font-mono text-[#87948b] mt-1">
        <span>0.00 (STRESSED)</span>
        <span>0.50</span>
        <span>1.00 (HEALTHY)</span>
      </div>

      <div className="mt-1 text-[10px] flex items-center justify-between border-t border-[#334155]/60 pt-1">
        <span className="text-[#87948b]">PROBE: {droneCallsign}</span>
        <span className={`font-bold ${status.color}`}>{status.text}</span>
      </div>
    </div>
  );
};
