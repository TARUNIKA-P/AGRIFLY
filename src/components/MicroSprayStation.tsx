import React, { useState } from 'react';
import { 
  Droplets, 
  Gauge, 
  Wind, 
  TrendingDown, 
  CheckCircle, 
  Sliders, 
  DollarSign, 
  AlertCircle,
  Play
} from 'lucide-react';
import { DroneUnit } from '../types/telemetry';

interface MicroSprayStationProps {
  drones: DroneUnit[];
  selectedDroneId: string;
  onSelectDrone: (id: string) => void;
  onTestNozzlePulse: () => void;
}

export const MicroSprayStation: React.FC<MicroSprayStationProps> = ({
  drones,
  selectedDroneId,
  onSelectDrone,
  onTestNozzlePulse,
}) => {
  const [dropletSizeMicrons, setDropletSizeMicrons] = useState<number>(120);
  const [pulseFrequencyHz, setPulseFrequencyHz] = useState<number>(25);
  const [windCompensation, setWindCompensation] = useState<boolean>(true);
  const [isTestFiring, setIsTestFiring] = useState<boolean>(false);

  const selectedDrone = drones.find((d) => d.id === selectedDroneId) || drones[0];

  const handleTestPulse = () => {
    setIsTestFiring(true);
    onTestNozzlePulse();
    setTimeout(() => setIsTestFiring(false), 600);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#334155] pb-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#68dba9] font-body flex items-center gap-2">
            <Droplets className="w-4 h-4" />
            TARGET-SPECIFIC MICRO-ACTUATION SYSTEM
          </div>
          <h1 className="text-2xl font-bold text-white font-display mt-0.5">
            Precision PWM Micro-Spraying Station
          </h1>
          <p className="text-sm text-[#bccac0] mt-1 font-body">
            Eliminates traditional blanket crop dousing. Solenoid valves open only when edge-AI verifies an active pest cluster.
          </p>
        </div>

        <button
          onClick={handleTestPulse}
          disabled={isTestFiring}
          className="flex items-center gap-2 px-4 py-2 bg-[#003825] hover:bg-[#005137] border border-[#68dba9] text-[#68dba9] text-xs font-bold rounded-xs transition-colors cursor-pointer shadow-[0_0_12px_rgba(104,219,169,0.3)]"
        >
          <Play className={`w-3.5 h-3.5 ${isTestFiring ? 'animate-ping' : ''}`} />
          {isTestFiring ? 'EMITTING TEST PULSE...' : 'TEST 25ms CALIBRATION PULSE'}
        </button>
      </div>

      {/* Chemical Savings & Ecological Comparison Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="hud-card p-4 border border-[#68dba9]">
          <span className="text-[10px] font-bold text-[#87948b] uppercase font-body block">
            CHEMICAL REDUCTION
          </span>
          <span className="text-3xl font-bold text-[#68dba9] font-display tabular-nums mt-1 block">
            -86.4 %
          </span>
          <span className="text-xs text-[#bccac0] mt-1 block">
            vs broadcast aerial dusting
          </span>
        </div>

        <div className="hud-card p-4 border border-[#334155]">
          <span className="text-[10px] font-bold text-[#87948b] uppercase font-body block">
            ACTIVE FLOW VOLUME
          </span>
          <span className="text-3xl font-bold text-white font-display tabular-nums mt-1 block">
            {selectedDrone.sprayFlowRate.toFixed(2)} <span className="text-sm text-[#87948b]">L/min</span>
          </span>
          <span className="text-xs text-[#bccac0] mt-1 block">
            PWM variable duty cycle
          </span>
        </div>

        <div className="hud-card p-4 border border-[#334155]">
          <span className="text-[10px] font-bold text-[#87948b] uppercase font-body block">
            SAVINGS PER 24-HA BLOCK
          </span>
          <span className="text-3xl font-bold text-[#4cd7f6] font-display tabular-nums mt-1 block">
            $1,840
          </span>
          <span className="text-xs text-[#bccac0] mt-1 block">
            Bio-pesticide expense spared
          </span>
        </div>

        <div className="hud-card p-4 border border-[#334155]">
          <span className="text-[10px] font-bold text-[#87948b] uppercase font-body block">
            GROUNDWATER RUNOFF
          </span>
          <span className="text-3xl font-bold text-[#68dba9] font-display tabular-nums mt-1 block">
            0.0 %
          </span>
          <span className="text-xs text-[#bccac0] mt-1 block">
            Zero off-target soil saturation
          </span>
        </div>
      </div>

      {/* Main Grid: Nozzle Array & Fluid Dynamics Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 6-Nozzle Solenoid Boom Diagram */}
        <div className="lg:col-span-2 space-y-4">
          <div className="hud-card p-5 border border-[#334155] space-y-4">
            <div className="flex items-center justify-between border-b border-[#334155] pb-3">
              <div>
                <span className="text-xs font-mono uppercase text-[#4cd7f6] font-bold">
                  CRAFT BOOM: {selectedDrone.name} ({selectedDrone.callsign})
                </span>
                <h3 className="text-lg font-bold text-white font-display mt-0.5">
                  6-Channel Independent PWM Micro-Nozzle Array
                </h3>
              </div>
              <span className="px-2.5 py-1 bg-[#171f33] border border-[#334155] text-xs font-mono text-[#68dba9] rounded-xs font-bold">
                SYSTEM NOMINAL
              </span>
            </div>

            {/* Visual Boom Representation */}
            <div className="relative py-8 px-4 bg-[#060e20] rounded-xs border border-[#334155]">
              {/* Horizontal boom bar */}
              <div className="h-2 w-full bg-[#334155] rounded-full relative">
                {/* 6 Solenoid Nozzles along the boom */}
                {[0, 1, 2, 3, 4, 5].map((nozzleIdx) => {
                  const isActive = isTestFiring || (selectedDrone.sprayActive && (nozzleIdx === 2 || nozzleIdx === 3));
                  return (
                    <div
                      key={nozzleIdx}
                      style={{ left: `${(nozzleIdx / 5) * 88 + 6}%` }}
                      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                    >
                      {/* Valve housing */}
                      <div className={`w-6 h-6 rounded-xs border-2 flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-[#003825] border-[#68dba9] shadow-[0_0_12px_rgba(104,219,169,0.8)]'
                          : 'bg-[#171f33] border-[#334155]'
                      }`}>
                        <Droplets className={`w-3.5 h-3.5 ${isActive ? 'text-[#68dba9]' : 'text-[#87948b]'}`} />
                      </div>

                      {/* Nozzle Label */}
                      <span className="text-[10px] font-mono font-bold text-[#87948b] mt-1">
                        NZ-{nozzleIdx + 1}
                      </span>

                      {/* Animated Mist Cone */}
                      {isActive && (
                        <div className="w-8 h-12 bg-gradient-to-b from-[#4cd7f6]/60 to-transparent mt-1 rounded-b-full animate-pulse pointer-events-none" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Nozzle Duty Cycle & Calibration */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-[#171f33] rounded-xs border border-[#334155]">
                <span className="text-[10px] text-[#87948b] block">ATOMIZATION MICRONS:</span>
                <span className="text-base font-bold text-white tabular-nums">{dropletSizeMicrons} µm</span>
                <span className="text-[10px] text-[#68dba9] block">Ultra-Fine Bio-Mist</span>
              </div>

              <div className="p-2.5 bg-[#171f33] rounded-xs border border-[#334155]">
                <span className="text-[10px] text-[#87948b] block">PWM PULSE FREQ:</span>
                <span className="text-base font-bold text-white tabular-nums">{pulseFrequencyHz} Hz</span>
                <span className="text-[10px] text-[#4cd7f6] block">High-Speed Solenoid</span>
              </div>

              <div className="p-2.5 bg-[#171f33] rounded-xs border border-[#334155]">
                <span className="text-[10px] text-[#87948b] block">PRESSURE LINE:</span>
                <span className="text-base font-bold text-white tabular-nums">4.2 bar</span>
                <span className="text-[10px] text-[#68dba9] block">Constant Flow EKF</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Parameters & Tank Payload Telemetry */}
        <div className="space-y-4">
          <div className="hud-card p-5 border border-[#334155] space-y-4">
            <div className="border-b border-[#334155] pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#68dba9] font-body">
                CALIBRATION REGIME
              </span>
              <h3 className="text-lg font-bold text-white font-display mt-0.5">
                Aerosol & Terrain Tuning
              </h3>
            </div>

            {/* Droplet Size Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#87948b]">DROPLET SIZE:</span>
                <span className="text-white font-bold">{dropletSizeMicrons} µm</span>
              </div>
              <input
                type="range"
                min="80"
                max="250"
                value={dropletSizeMicrons}
                onChange={(e) => setDropletSizeMicrons(Number(e.target.value))}
                className="w-full accent-[#68dba9] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#87948b]">
                <span>80µm (Penetrative)</span>
                <span>250µm (Coarse Drift-Free)</span>
              </div>
            </div>

            {/* Pulse Rate Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#87948b]">SOLENOID PULSE RATE:</span>
                <span className="text-white font-bold">{pulseFrequencyHz} Hz</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={pulseFrequencyHz}
                onChange={(e) => setPulseFrequencyHz(Number(e.target.value))}
                className="w-full accent-[#4cd7f6] cursor-pointer"
              />
            </div>

            {/* Micro-wind Compensation Toggle */}
            <div className="p-3 bg-[#171f33] rounded-xs border border-[#334155] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Wind className="w-3.5 h-3.5 text-[#ffb95f]" />
                  Canopy Crosswind Offset
                </span>
                <button
                  onClick={() => setWindCompensation(!windCompensation)}
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-xs cursor-pointer ${
                    windCompensation ? 'bg-[#003825] text-[#68dba9] border border-[#68dba9]' : 'bg-[#222a3d] text-[#87948b]'
                  }`}
                >
                  {windCompensation ? 'ENABLED' : 'MANUAL'}
                </button>
              </div>
              <p className="text-[11px] text-[#bccac0] font-body">
                Automatically offsets nozzle trajectory using 3-axis anemometer readings to guarantee droplets hit the exact infected leaf cluster.
              </p>
            </div>

            {/* Tank Payload Distribution */}
            <div className="space-y-2 pt-2 border-t border-[#334155] text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#87948b]">PAYLOAD COG BALANCE:</span>
                <span className="text-[#68dba9] font-bold">0.02% OFFSET (OPTIMAL)</span>
              </div>
              <div className="w-full bg-[#171f33] h-2 rounded-full overflow-hidden border border-[#334155]">
                <div
                  className="bg-[#4cd7f6] h-full transition-all"
                  style={{ width: `${(selectedDrone.payloadRemaining / selectedDrone.payloadCapacity) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#87948b]">
                <span>REMAINING: {selectedDrone.payloadRemaining.toFixed(1)}L</span>
                <span>CAPACITY: {selectedDrone.payloadCapacity}L</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
