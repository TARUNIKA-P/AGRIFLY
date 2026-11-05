import React, { useState } from 'react';
import { 
  Layers, 
  MapPin, 
  Eye, 
  Droplet, 
  ShieldAlert, 
  Radar, 
  Maximize2, 
  Minimize2,
  Bug,
  Sparkles,
  Zap
} from 'lucide-react';
import { DroneUnit, PestDetection, FieldZone, WeatherData } from '../types/telemetry';
import { NDVIScale } from './NDVIScale';
import { FlightFABControls } from './FlightFABControls';
import { WeatherOverlay } from './WeatherOverlay';

interface MissionHUDProps {
  drones: DroneUnit[];
  selectedDroneId: string;
  onSelectDrone: (id: string) => void;
  pestDetections: PestDetection[];
  onSelectPest: (detection: PestDetection) => void;
  fieldZones: FieldZone[];
  isArmed: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onTriggerRTH: () => void;
  onToggleSprayOverride: () => void;
  sprayOverrideActive: boolean;
  onAddWaypoint: (x: number, y: number) => void;
  sprayedPoints: { x: number; y: number; timestamp: number }[];
  weather: WeatherData;
  onRefreshWeather: () => void;
  onSelectWeatherPreset: (preset: 'calm' | 'moderate' | 'gusty') => void;
  isWeatherLoading?: boolean;
}

export const MissionHUD: React.FC<MissionHUDProps> = ({
  drones,
  selectedDroneId,
  onSelectDrone,
  pestDetections,
  onSelectPest,
  fieldZones,
  isArmed,
  isPlaying,
  onTriggerRTH,
  onToggleSprayOverride,
  sprayOverrideActive,
  onTogglePlay,
  onAddWaypoint,
  sprayedPoints,
  weather,
  onRefreshWeather,
  onSelectWeatherPreset,
  isWeatherLoading = false,
}) => {
  // Layer toggles
  const [showNDVI, setShowNDVI] = useState<boolean>(true);
  const [showLidarContours, setShowLidarContours] = useState<boolean>(true);
  const [showMeshVectors, setShowMeshVectors] = useState<boolean>(true);
  const [showSprayBursts, setShowSprayBursts] = useState<boolean>(true);
  const [showPestMarkers, setShowPestMarkers] = useState<boolean>(true);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  // Crosshair hover coordinates
  const [cursorCoord, setCursorCoord] = useState<{ x: number; y: number } | null>(null);

  const selectedDrone = drones.find((d) => d.id === selectedDroneId) || drones[0];

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    onAddWaypoint(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setCursorCoord({ x, y });
  };

  return (
    <div className={`relative w-full overflow-hidden bg-[#060e20] flex-1 select-none ${
      isFullScreen ? 'fixed inset-0 z-50 h-screen' : 'min-h-[560px] h-[calc(100vh-140px)]'
    }`}>
      {/* Background Orthomosaic Drone Canopy View */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 cursor-crosshair"
        style={{
          backgroundImage: `url('/src/assets/images/canopy_orthomosaic_map_1793902130133.jpg')`,
          filter: showNDVI ? 'brightness(0.75) contrast(1.15)' : 'brightness(0.9)',
        }}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setCursorCoord(null)}
      >
        {/* Subtle tactical grid lines */}
        <div className="absolute inset-0 tactical-grid opacity-30 pointer-events-none" />

        {/* Scanline CRT overlay effect */}
        <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />

        {/* SVG Tactical Vectors Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            {/* Filter for targeted micro spray glow */}
            <filter id="sprayGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
            </filter>
            {/* Mesh line glow */}
            <filter id="meshGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            </filter>
          </defs>

          {/* Field Zones Boundaries */}
          {fieldZones.map((zone) => {
            const pointsString = zone.boundary.map((p) => `${p.x}%,${p.y}%`).join(' ');
            return (
              <g key={zone.id}>
                <polygon
                  points={pointsString}
                  fill="rgba(5, 150, 105, 0.08)"
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={`${zone.boundary[0].x + 1}%`}
                  y={`${zone.boundary[0].y + 3}%`}
                  fill="#bccac0"
                  fontSize="10"
                  fontFamily="Manrope"
                  fontWeight="bold"
                  letterSpacing="0.05em"
                >
                  {zone.name.toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* NDVI Multispectral False-Color Heatmap overlay if enabled */}
          {showNDVI && (
            <g opacity="0.35">
              <ellipse cx="38%" cy="32%" rx="18%" ry="12%" fill="#68dba9" filter="url(#sprayGlow)" />
              <ellipse cx="64%" cy="40%" rx="14%" ry="10%" fill="#ffb95f" filter="url(#sprayGlow)" />
              <ellipse cx="54%" cy="58%" rx="12%" ry="8%" fill="#ef4444" filter="url(#sprayGlow)" />
              <ellipse cx="78%" cy="35%" rx="15%" ry="12%" fill="#68dba9" filter="url(#sprayGlow)" />
              <ellipse cx="28%" cy="68%" rx="16%" ry="14%" fill="#25a475" filter="url(#sprayGlow)" />
            </g>
          )}

          {/* LiDAR Elevation Contours overlay if enabled */}
          {showLidarContours && (
            <g opacity="0.4" stroke="#4cd7f6" strokeWidth="1" fill="none">
              <path d="M 100,200 Q 300,180 600,240 T 1200,200" strokeDasharray="3 3" />
              <path d="M 80,320 Q 350,300 700,380 T 1300,310" strokeDasharray="3 3" />
              <path d="M 60,450 Q 400,420 800,510 T 1400,430" strokeDasharray="3 3" />
              <text x="30" y="200" fill="#4cd7f6" fontSize="9" fontFamily="monospace">
                +142m MSL (CANOPY TOP)
              </text>
              <text x="30" y="320" fill="#4cd7f6" fontSize="9" fontFamily="monospace">
                +138m MSL
              </text>
              <text x="30" y="450" fill="#4cd7f6" fontSize="9" fontFamily="monospace">
                +134m MSL (DRAINAGE)
              </text>
            </g>
          )}

          {/* Sprayed Points (Micro-spray mist history) */}
          {showSprayBursts &&
            sprayedPoints.map((pt, i) => (
              <circle
                key={i}
                cx={`${pt.x}%`}
                cy={`${pt.y}%`}
                r="7"
                fill="#4cd7f6"
                opacity="0.5"
                filter="url(#sprayGlow)"
              />
            ))}

          {/* Decentralized P2P Swarm Mesh Links between all drones */}
          {showMeshVectors && (
            <g>
              {drones.map((droneA, idxA) =>
                drones.slice(idxA + 1).map((droneB) => (
                  <line
                    key={`${droneA.id}-${droneB.id}`}
                    x1={`${droneA.position.x}%`}
                    y1={`${droneA.position.y}%`}
                    x2={`${droneB.position.x}%`}
                    y2={`${droneB.position.y}%`}
                    stroke="#4cd7f6"
                    strokeWidth="1.2"
                    strokeDasharray="6 4"
                    opacity="0.6"
                    filter="url(#meshGlow)"
                  />
                ))
              )}
            </g>
          )}

          {/* Planned Flight Path to Waypoints */}
          {drones.map((drone) => (
            <g key={`path-${drone.id}`}>
              <line
                x1={`${drone.position.x}%`}
                y1={`${drone.position.y}%`}
                x2={`${drone.targetWaypoint.x}%`}
                y2={`${drone.targetWaypoint.y}%`}
                stroke={drone.color}
                strokeWidth="1.8"
                strokeDasharray="4 2"
                opacity="0.8"
              />
              <circle
                cx={`${drone.targetWaypoint.x}%`}
                cy={`${drone.targetWaypoint.y}%`}
                r="3"
                fill="none"
                stroke={drone.color}
                strokeWidth="2"
              />
            </g>
          ))}
        </svg>

        {/* Drone Swarm Markers */}
        {drones.map((drone) => {
          const isSelected = drone.id === selectedDroneId;
          return (
            <div
              key={drone.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectDrone(drone.id);
              }}
              style={{ left: `${drone.position.x}%`, top: `${drone.position.y}%` }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer pointer-events-auto group"
            >
              {/* Active Spray Nozzle Plume Animation */}
              {drone.sprayActive && (
                <div className="absolute -inset-4 bg-[#4cd7f6]/20 rounded-full animate-ping pointer-events-none" />
              )}

              {/* Selection ring */}
              <div
                className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isSelected
                    ? 'border-2 border-white shadow-[0_0_16px_rgba(104,219,169,0.8)] scale-110'
                    : 'border border-[#334155] hover:scale-105'
                }`}
                style={{ backgroundColor: `${drone.color}22` }}
              >
                {/* Heading Arrow */}
                <div
                  className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[10px] absolute"
                  style={{
                    borderBottomColor: drone.color,
                    transform: `rotate(${drone.heading}deg) translateY(-8px)`,
                  }}
                />

                {/* Drone Core Glyph */}
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center font-display text-[9px] font-bold text-black"
                  style={{ backgroundColor: drone.color }}
                >
                  {drone.callsign.replace('SWARM-0', '')}
                </div>
              </div>

              {/* Mini Craft Callout Tag */}
              <div
                className={`absolute left-1/2 top-10 -translate-x-1/2 px-1.5 py-0.5 rounded-xs text-[9px] font-mono whitespace-nowrap shadow-md pointer-events-none border ${
                  isSelected
                    ? 'bg-[#131b2e] border-white text-white font-bold'
                    : 'bg-[#060e20]/80 border-[#334155] text-[#bccac0]'
                }`}
              >
                {drone.name} · {drone.altitudeAGL.toFixed(1)}m
              </div>
            </div>
          );
        })}

        {/* Live Hover Crosshair HUD Coordinates */}
        {cursorCoord && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#131b2e]/90 border border-[#334155] rounded-xs text-[10px] font-mono text-[#dae2fd] pointer-events-none shadow-lg flex items-center gap-3">
            <span>GRID: X={cursorCoord.x}% Y={cursorCoord.y}%</span>
            <span>AGL ESTIMATE: ~2.0m</span>
            <span className="text-[#68dba9]">SLAM COV: 0.04m</span>
          </div>
        )}
      </div>

      {/* TOP-LEFT: Selected Craft Tactical Avionics Card */}
      <div className="absolute top-4 left-4 z-30 select-none">
        <div className="hud-card p-3 w-64 shadow-2xl border border-[#334155]">
          <div className="flex items-center justify-between border-b border-[#334155] pb-2 mb-2">
            <div>
              <div className="text-[10px] font-bold tracking-wider text-[#68dba9] uppercase font-body">
                ACTIVE UNIT TELEMETRY
              </div>
              <div className="text-sm font-bold text-white font-display">
                {selectedDrone.name} <span className="text-xs text-[#87948b] font-mono">({selectedDrone.callsign})</span>
              </div>
            </div>
            <div className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-xs font-mono border ${
              selectedDrone.status === 'spraying'
                ? 'bg-[#003825] text-[#68dba9] border-[#68dba9]'
                : selectedDrone.status === 'scanning'
                ? 'bg-[#171f33] text-[#4cd7f6] border-[#4cd7f6]'
                : 'bg-[#222a3d] text-[#ffb95f] border-[#ffb95f]'
            }`}>
              {selectedDrone.status}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#171f33] p-1.5 rounded-xs border border-[#334155]/60">
              <span className="text-[9px] text-[#87948b] block font-mono">ALTITUDE (AGL)</span>
              <span className="text-sm font-bold text-white font-display tabular-nums">
                {selectedDrone.altitudeAGL.toFixed(1)} <span className="text-[10px] text-[#87948b]">m</span>
              </span>
            </div>
            <div className="bg-[#171f33] p-1.5 rounded-xs border border-[#334155]/60">
              <span className="text-[9px] text-[#87948b] block font-mono">GROUND SPEED</span>
              <span className="text-sm font-bold text-white font-display tabular-nums">
                {selectedDrone.groundSpeed.toFixed(1)} <span className="text-[10px] text-[#87948b]">m/s</span>
              </span>
            </div>
            <div className="bg-[#171f33] p-1.5 rounded-xs border border-[#334155]/60">
              <span className="text-[9px] text-[#87948b] block font-mono">BATTERY VOLTAGE</span>
              <span className="text-sm font-bold text-[#68dba9] font-display tabular-nums">
                {selectedDrone.battery}% <span className="text-[10px] text-[#87948b]">({selectedDrone.voltage}V)</span>
              </span>
            </div>
            <div className="bg-[#171f33] p-1.5 rounded-xs border border-[#334155]/60">
              <span className="text-[9px] text-[#87948b] block font-mono">TANK PAYLOAD</span>
              <span className="text-sm font-bold text-[#4cd7f6] font-display tabular-nums">
                {selectedDrone.payloadRemaining.toFixed(1)} <span className="text-[10px] text-[#87948b]">/ {selectedDrone.payloadCapacity}L</span>
              </span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-[#334155]/60 flex items-center justify-between text-[10px] font-mono text-[#bccac0]">
            <span>ODOM: {selectedDrone.slamFix}</span>
            <span>NPU: {selectedDrone.npuTemp.toFixed(1)}°C</span>
            <span>RSSI: {selectedDrone.meshRssi}dBm</span>
          </div>
        </div>
      </div>

      {/* TOP-RIGHT: Tactical Map Layer Controls, Weather Overlay & Fullscreen */}
      <div className="absolute top-4 right-4 z-30 flex items-start gap-2 select-none">
        {/* WeatherOverlay Widget */}
        <WeatherOverlay
          weather={weather}
          onRefreshWeather={onRefreshWeather}
          onSelectPreset={onSelectWeatherPreset}
          isLoading={isWeatherLoading}
        />

        <div className="hud-card p-2 shadow-2xl flex flex-col gap-1.5">
          <div className="text-[9px] font-bold uppercase tracking-wider text-[#87948b] px-1 font-body">
            CANOPY LAYERS
          </div>
          <button
            onClick={() => setShowNDVI(!showNDVI)}
            className={`flex items-center justify-between gap-3 px-2 py-1 text-[11px] rounded-xs font-mono transition-colors cursor-pointer ${
              showNDVI ? 'bg-[#003825] text-[#68dba9] border border-[#68dba9]/40' : 'text-[#87948b] hover:text-[#dae2fd]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Eye className="w-3 h-3" /> NDVI Biomass
            </span>
            <span className="text-[9px]">{showNDVI ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setShowLidarContours(!showLidarContours)}
            className={`flex items-center justify-between gap-3 px-2 py-1 text-[11px] rounded-xs font-mono transition-colors cursor-pointer ${
              showLidarContours ? 'bg-[#002f38] text-[#4cd7f6] border border-[#4cd7f6]/40' : 'text-[#87948b] hover:text-[#dae2fd]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Radar className="w-3 h-3" /> LiDAR Contours
            </span>
            <span className="text-[9px]">{showLidarContours ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setShowMeshVectors(!showMeshVectors)}
            className={`flex items-center justify-between gap-3 px-2 py-1 text-[11px] rounded-xs font-mono transition-colors cursor-pointer ${
              showMeshVectors ? 'bg-[#002f38] text-[#4cd7f6] border border-[#4cd7f6]/40' : 'text-[#87948b] hover:text-[#dae2fd]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Zap className="w-3 h-3" /> Swarm Vectors
            </span>
            <span className="text-[9px]">{showMeshVectors ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setShowSprayBursts(!showSprayBursts)}
            className={`flex items-center justify-between gap-3 px-2 py-1 text-[11px] rounded-xs font-mono transition-colors cursor-pointer ${
              showSprayBursts ? 'bg-[#003825] text-[#68dba9] border border-[#68dba9]/40' : 'text-[#87948b] hover:text-[#dae2fd]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Droplet className="w-3 h-3" /> Micro-Sprays
            </span>
            <span className="text-[9px]">{showSprayBursts ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setShowPestMarkers(!showPestMarkers)}
            className={`flex items-center justify-between gap-3 px-2 py-1 text-[11px] rounded-xs font-mono transition-colors cursor-pointer ${
              showPestMarkers ? 'bg-[#5b3800] text-[#ffb95f] border border-[#ffb95f]/40' : 'text-[#87948b] hover:text-[#dae2fd]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Bug className="w-3 h-3" /> Pest Targets
            </span>
            <span className="text-[9px]">{showPestMarkers ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="hud-card p-2.5 text-[#bccac0] hover:text-white transition-colors cursor-pointer"
          title={isFullScreen ? 'Exit Fullscreen' : 'Fullscreen HUD'}
        >
          {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* BOTTOM-LEFT: NDVI Continuous Spectrum Scale */}
      <div className="absolute bottom-4 left-4 z-30 select-none">
        <NDVIScale currentNDVI={selectedDrone.id === 'drone-1' ? 0.82 : 0.64} droneCallsign={selectedDrone.callsign} />
      </div>

      {/* BOTTOM-RIGHT: Flight FAB Primary Orbitals */}
      <div className="absolute bottom-4 right-4 z-30 select-none">
        <FlightFABControls
          isArmed={isArmed}
          isPlaying={isPlaying}
          onTogglePlay={onTogglePlay}
          onTriggerRTH={onTriggerRTH}
          onToggleSprayOverride={onToggleSprayOverride}
          sprayOverrideActive={sprayOverrideActive}
          onCenterCraft={() => onSelectDrone(selectedDroneId)}
        />
      </div>
    </div>
  );
};
