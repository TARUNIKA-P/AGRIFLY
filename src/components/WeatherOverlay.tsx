import React, { useState } from 'react';
import { 
  Wind, 
  Droplets, 
  Thermometer, 
  Compass, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  RotateCw,
  Sliders,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { WeatherData } from '../types/telemetry';

interface WeatherOverlayProps {
  weather: WeatherData;
  onRefreshWeather: () => void;
  onSelectPreset: (preset: 'calm' | 'moderate' | 'gusty') => void;
  isLoading?: boolean;
}

export const WeatherOverlay: React.FC<WeatherOverlayProps> = ({
  weather,
  onRefreshWeather,
  onSelectPreset,
  isLoading = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const getRiskStyle = (risk: 'Low' | 'Moderate' | 'High') => {
    switch (risk) {
      case 'High':
        return {
          bg: 'bg-[#93000a]/80',
          border: 'border-[#ef4444]',
          text: 'text-[#ffdad6]',
          badge: 'text-[#ef4444]',
          label: 'HIGH DRIFT RISK · SUSPEND COARSE MIST',
        };
      case 'Moderate':
        return {
          bg: 'bg-[#5b3800]/80',
          border: 'border-[#ffb95f]',
          text: 'text-[#ffddb8]',
          badge: 'text-[#ffb95f]',
          label: 'MODERATE · CRAB COMPENSATION ACTIVE',
        };
      default:
        return {
          bg: 'bg-[#003825]/80',
          border: 'border-[#68dba9]',
          text: 'text-[#dae2fd]',
          badge: 'text-[#68dba9]',
          label: 'OPTIMAL CANOPY SPRAY CONDITIONS',
        };
    }
  };

  const riskStyle = getRiskStyle(weather.sprayDriftRisk);

  // Calculate crab angle compensation based on wind speed (roughly 1.2 deg per m/s)
  const simulatedCrabAngle = (weather.windSpeed * 1.35).toFixed(1);

  return (
    <div className="select-none transition-all duration-200">
      {/* Collapsed Pill View */}
      {isCollapsed ? (
        <div 
          onClick={() => setIsCollapsed(false)}
          className="hud-card px-3 py-1.5 flex items-center gap-3 cursor-pointer shadow-xl hover:border-[#68dba9] transition-all"
        >
          <div className="flex items-center gap-1.5 text-xs">
            <Wind className="w-3.5 h-3.5 text-[#4cd7f6]" />
            <span className="font-mono font-bold text-white tabular-nums">
              {weather.windSpeed.toFixed(1)} m/s {weather.windDirectionLabel}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Droplets className="w-3.5 h-3.5 text-[#68dba9]" />
            <span className="font-mono font-bold text-white tabular-nums">
              {weather.humidity}% RH
            </span>
          </div>
          <span className={`text-[10px] font-mono font-bold uppercase ${riskStyle.badge}`}>
            {weather.sprayDriftRisk} Risk
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-[#bccac0]" />
        </div>
      ) : (
        /* Full HUD Weather Card */
        <div className="hud-card p-3 w-72 shadow-2xl border border-[#334155] space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#334155] pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-xs bg-[#002f38] text-[#4cd7f6] border border-[#4cd7f6]/40">
                <Wind className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[9px] font-bold tracking-wider text-[#68dba9] uppercase font-body block leading-none">
                  METEOROLOGICAL TELEMETRY
                </span>
                <span className="text-xs font-bold text-white font-display">
                  Field Canopy Micro-Climate
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onRefreshWeather}
                title="Refresh Weather Telemetry"
                className="p-1 text-[#87948b] hover:text-[#dae2fd] transition-colors cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#68dba9]' : ''}`} />
              </button>
              <button
                onClick={() => setIsCollapsed(true)}
                title="Collapse Weather Widget"
                className="p-1 text-[#87948b] hover:text-[#dae2fd] transition-colors cursor-pointer"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Primary Metrics: Wind & Humidity */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Wind Vector */}
            <div className="bg-[#171f33] p-2 rounded-xs border border-[#334155]/60 relative overflow-hidden">
              <div className="flex items-center justify-between text-[9px] text-[#87948b] font-mono">
                <span>WIND VELOCITY</span>
                <span className="text-[#4cd7f6] font-bold">{weather.windDirectionLabel}</span>
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-bold text-white font-display tabular-nums">
                  {weather.windSpeed.toFixed(1)}
                </span>
                <span className="text-[10px] text-[#87948b] font-mono">m/s</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#bccac0] mt-1 pt-1 border-t border-[#334155]/40">
                <span>GUST:</span>
                <span className="text-[#ffb95f] font-bold tabular-nums">{weather.windGust.toFixed(1)} m/s</span>
              </div>
            </div>

            {/* Relative Humidity */}
            <div className="bg-[#171f33] p-2 rounded-xs border border-[#334155]/60">
              <div className="flex items-center justify-between text-[9px] text-[#87948b] font-mono">
                <span>CANOPY HUMIDITY</span>
                <Droplets className="w-2.5 h-2.5 text-[#68dba9]" />
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-bold text-[#68dba9] font-display tabular-nums">
                  {weather.humidity}
                </span>
                <span className="text-[10px] text-[#87948b] font-mono">% RH</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#bccac0] mt-1 pt-1 border-t border-[#334155]/40">
                <span>TEMP:</span>
                <span className="text-white font-bold tabular-nums">{weather.temperature.toFixed(1)}°C</span>
              </div>
            </div>
          </div>

          {/* Secondary Agronomic Metrics: Delta T & Barometric */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="bg-[#171f33] px-2 py-1 rounded-xs border border-[#334155]/60 flex items-center justify-between">
              <span className="text-[#87948b]">DELTA-T:</span>
              <span className="text-[#4cd7f6] font-bold tabular-nums">
                {weather.canopyDeltaT.toFixed(1)}°C
              </span>
            </div>
            <div className="bg-[#171f33] px-2 py-1 rounded-xs border border-[#334155]/60 flex items-center justify-between">
              <span className="text-[#87948b]">PRESSURE:</span>
              <span className="text-white tabular-nums">
                {weather.barometricHpa} hPa
              </span>
            </div>
          </div>

          {/* Real-time Influence on Swarm Behavior Card */}
          <div className={`p-2 rounded-xs border text-[11px] font-mono ${riskStyle.bg} ${riskStyle.border}`}>
            <div className="flex items-center gap-1.5 font-bold mb-1">
              {weather.sprayDriftRisk === 'High' ? (
                <AlertTriangle className="w-3.5 h-3.5 text-[#ef4444]" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-[#68dba9]" />
              )}
              <span className={riskStyle.badge}>{riskStyle.label}</span>
            </div>
            <div className="space-y-0.5 text-[10px] text-[#bccac0]">
              <div className="flex justify-between">
                <span>FLIGHT CRAB OFFSET:</span>
                <span className="text-white font-bold">±{simulatedCrabAngle}° crosswind</span>
              </div>
              <div className="flex justify-between">
                <span>AUTO-TUNED NOZZLE:</span>
                <span className="text-[#68dba9] font-bold">{weather.recommendedNozzleMicrons} µm atomization</span>
              </div>
            </div>
          </div>

          {/* Atmospheric Simulation Test Presets */}
          <div className="border-t border-[#334155]/60 pt-2 flex items-center justify-between text-[10px] font-mono">
            <span className="text-[#87948b]">SIMULATE:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onSelectPreset('calm')}
                className="px-2 py-0.5 bg-[#171f33] hover:bg-[#1e293b] border border-[#334155] text-[#bccac0] hover:text-white rounded-xs transition-colors cursor-pointer"
              >
                Calm
              </button>
              <button
                onClick={() => onSelectPreset('moderate')}
                className="px-2 py-0.5 bg-[#171f33] hover:bg-[#1e293b] border border-[#334155] text-[#bccac0] hover:text-white rounded-xs transition-colors cursor-pointer"
              >
                Normal
              </button>
              <button
                onClick={() => onSelectPreset('gusty')}
                className="px-2 py-0.5 bg-[#171f33] hover:bg-[#1e293b] border border-[#ef4444]/60 text-[#ffb4ab] hover:bg-[#93000a] rounded-xs transition-colors cursor-pointer"
              >
                Gusty (6+ m/s)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
