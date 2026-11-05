import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Home, Droplets, Crosshair, AlertTriangle } from 'lucide-react';

interface FlightFABControlsProps {
  isArmed: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onTriggerRTH: () => void;
  onToggleSprayOverride: () => void;
  sprayOverrideActive: boolean;
  onCenterCraft: () => void;
}

export const FlightFABControls: React.FC<FlightFABControlsProps> = ({
  isArmed,
  isPlaying,
  onTogglePlay,
  onTriggerRTH,
  onToggleSprayOverride,
  sprayOverrideActive,
  onCenterCraft,
}) => {
  // Long press for Return to Home (1.5 seconds)
  const [rthProgress, setRthProgress] = useState(0);
  const [isPressingRth, setIsPressingRth] = useState(false);
  const rthTimerRef = useRef<NodeJS.Timeout | null>(null);
  const rthStartTimeRef = useRef<number>(0);

  const startRthPress = () => {
    setIsPressingRth(true);
    rthStartTimeRef.current = Date.now();
    const interval = 30; // update every 30ms
    const totalDuration = 1200; // 1.2s required hold

    rthTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - rthStartTimeRef.current;
      const progress = Math.min(100, (elapsed / totalDuration) * 100);
      setRthProgress(progress);

      if (progress >= 100) {
        if (rthTimerRef.current) clearInterval(rthTimerRef.current);
        setIsPressingRth(false);
        setRthProgress(0);
        onTriggerRTH();
      }
    }, interval);
  };

  const cancelRthPress = () => {
    if (rthTimerRef.current) {
      clearInterval(rthTimerRef.current);
      rthTimerRef.current = null;
    }
    setIsPressingRth(false);
    setRthProgress(0);
  };

  useEffect(() => {
    return () => {
      if (rthTimerRef.current) clearInterval(rthTimerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* Center on Selected Craft */}
      <button
        onClick={onCenterCraft}
        title="Recenter HUD on Selected Craft"
        className="w-11 h-11 rounded-full bg-[#1e293b]/90 border border-[#334155] text-[#bccac0] hover:text-[#dae2fd] hover:border-[#4cd7f6] flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer backdrop-blur-md"
      >
        <Crosshair className="w-5 h-5 text-[#4cd7f6]" />
      </button>

      {/* Manual Micro-Spray Pulse Override */}
      <button
        onClick={onToggleSprayOverride}
        title={sprayOverrideActive ? 'Targeted Micro-Spray Active' : 'Spray Nozzles Idle'}
        className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer backdrop-blur-md ${
          sprayOverrideActive
            ? 'bg-[#003825] border-[#68dba9] text-[#68dba9] shadow-[0_0_12px_rgba(104,219,169,0.4)]'
            : 'bg-[#1e293b]/90 border-[#334155] text-[#bccac0] hover:border-[#4cd7f6]'
        }`}
      >
        <Droplets className={`w-5 h-5 ${sprayOverrideActive ? 'text-[#68dba9] animate-pulse' : 'text-[#4cd7f6]'}`} />
      </button>

      {/* Primary Flight Control: Mission Play / Pause */}
      <button
        onClick={onTogglePlay}
        title={isPlaying ? 'Pause Swarm Simulation' : 'Launch & Resume Swarm'}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer relative group ${
          isArmed
            ? isPlaying
              ? 'bg-[#25a475] text-[#002114] shadow-[0_0_20px_rgba(104,219,169,0.5)] ring-4 ring-[#68dba9]/30 active:scale-95'
              : 'bg-[#ffb95f] text-[#2a1700] shadow-[0_0_16px_rgba(255,185,95,0.4)] ring-4 ring-[#ffb95f]/30 active:scale-95'
            : 'bg-[#222a3d] text-[#87948b] border border-[#334155] cursor-not-allowed opacity-75'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-6 h-6 fill-current" />
        ) : (
          <Play className="w-6 h-6 fill-current ml-0.5" />
        )}
      </button>

      {/* Return To Home (RTH) with Long-Press Radial Confirmation */}
      <div className="relative">
        {/* SVG Ring for radial timer fill */}
        {isPressingRth && (
          <svg className="absolute -top-1 -left-1 w-16 h-16 pointer-events-none -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="29"
              fill="none"
              stroke="#ef4444"
              strokeWidth="3"
              strokeDasharray={182.2}
              strokeDashoffset={182.2 - (182.2 * rthProgress) / 100}
              className="transition-all duration-75"
            />
          </svg>
        )}

        <button
          onMouseDown={startRthPress}
          onMouseUp={cancelRthPress}
          onMouseLeave={cancelRthPress}
          onTouchStart={startRthPress}
          onTouchEnd={cancelRthPress}
          title="Hold 1.2s for Emergency Return To Home (RTH)"
          className={`w-14 h-14 rounded-full flex items-center justify-center border-2 border-[#ef4444] transition-all cursor-pointer shadow-lg active:scale-95 ${
            isPressingRth
              ? 'bg-[#ef4444] text-white shadow-[0_0_24px_rgba(239,68,68,0.7)]'
              : 'bg-[#93000a]/80 text-[#ffb4ab] hover:bg-[#ef4444] hover:text-white'
          }`}
        >
          <div className="flex flex-col items-center">
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-bold tracking-tighter uppercase font-display leading-none mt-0.5">
              RTH
            </span>
          </div>
        </button>

        {isPressingRth && (
          <div className="absolute right-16 top-3 bg-[#0f172a] border border-[#ef4444] px-2.5 py-1 rounded text-[11px] text-[#ffdad6] font-bold whitespace-nowrap shadow-xl">
            HOLD TO ABORT ({Math.round(rthProgress)}%)
          </div>
        )}
      </div>
    </div>
  );
};
