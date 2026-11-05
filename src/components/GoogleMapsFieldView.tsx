import React, { useState } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin 
} from '@vis.gl/react-google-maps';
import { DroneUnit, PestDetection } from '../types/telemetry';
import { Radio, Crosshair, MapPin, Compass, AlertCircle, Droplets, Bug } from 'lucide-react';

interface GoogleMapsFieldViewProps {
  drones: DroneUnit[];
  selectedDroneId: string;
  onSelectDrone: (id: string) => void;
  pestDetections: PestDetection[];
  onSelectPest: (detection: PestDetection) => void;
  onAddWaypoint: (x: number, y: number) => void;
}

// Field Base reference coordinates: Napa Valley Agricultural Parcel
const FIELD_BASE_LAT = 38.2975;
const FIELD_BASE_LNG = -122.2869;

// Converts relative percentage coords (0-100) to actual GPS Lat/Lng for Google Maps
const percentToLatLng = (x: number, y: number) => {
  const latSpan = 0.008; // ~880m
  const lngSpan = 0.012; // ~1050m
  return {
    lat: FIELD_BASE_LAT + ((50 - y) / 100) * latSpan,
    lng: FIELD_BASE_LNG + ((x - 50) / 100) * lngSpan,
  };
};

export const GoogleMapsFieldView: React.FC<GoogleMapsFieldViewProps> = ({
  drones,
  selectedDroneId,
  onSelectDrone,
  pestDetections,
  onSelectPest,
  onAddWaypoint,
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [mapType, setMapType] = useState<string>('hybrid');
  const [activeCenter, setActiveCenter] = useState({ lat: FIELD_BASE_LAT, lng: FIELD_BASE_LNG });
  const [zoom, setZoom] = useState(16);

  const selectedDrone = drones.find((d) => d.id === selectedDroneId) || drones[0];

  const handleMapClick = (e: any) => {
    if (e.detail?.latLng) {
      const lat = e.detail.latLng.lat;
      const lng = e.detail.latLng.lng;
      // Convert back to relative percentage
      const latSpan = 0.008;
      const lngSpan = 0.012;
      const relY = Math.round(50 - ((lat - FIELD_BASE_LAT) / latSpan) * 100);
      const relX = Math.round(50 + ((lng - FIELD_BASE_LNG) / lngSpan) * 100);
      onAddWaypoint(Math.max(5, Math.min(95, relX)), Math.max(5, Math.min(95, relY)));
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[580px] bg-[#060e20] overflow-hidden select-none">
      {/* If API key is not yet configured, show informative fallback */}
      {!apiKey ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-[#0b1326]">
          <div className="max-w-md hud-card p-6 border border-[#334155] space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#171f33] border border-[#ffb95f] flex items-center justify-center mx-auto text-[#ffb95f]">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">
              Google Maps Platform Key Required
            </h3>
            <p className="text-xs text-[#bccac0] font-body leading-relaxed">
              Google Maps integration has been provisioned. To load satellite tiles, set <code className="text-[#68dba9] font-mono">VITE_GOOGLE_MAPS_API_KEY</code> in your environment or Secrets panel.
            </p>
          </div>
        </div>
      ) : (
        <APIProvider apiKey={apiKey}>
          <Map
            mapId="DEMO_MAP_ID"
            defaultCenter={activeCenter}
            defaultZoom={zoom}
            mapTypeId={mapType}
            onClick={handleMapClick}
            disableDefaultUI={false}
            gestureHandling="greedy"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            className="w-full h-full"
          >
            {/* Swarm Base Landing Pad Marker */}
            <AdvancedMarker position={{ lat: FIELD_BASE_LAT, lng: FIELD_BASE_LNG }}>
              <div className="flex flex-col items-center">
                <div className="px-2 py-0.5 bg-[#0b1326] border border-[#68dba9] rounded-xs text-[9px] font-mono font-bold text-[#68dba9] shadow-md">
                  GCS BASE STATION
                </div>
                <div className="w-4 h-4 rounded-full bg-[#68dba9] border-2 border-white shadow-lg animate-pulse" />
              </div>
            </AdvancedMarker>

            {/* Drones Advanced Markers */}
            {drones.map((drone) => {
              const pos = percentToLatLng(drone.position.x, drone.position.y);
              const isSelected = drone.id === selectedDroneId;
              return (
                <AdvancedMarker
                  key={drone.id}
                  position={pos}
                  onClick={() => onSelectDrone(drone.id)}
                >
                  <div className="flex flex-col items-center cursor-pointer group">
                    <div className={`px-2 py-0.5 rounded-xs text-[9px] font-mono whitespace-nowrap shadow-md mb-1 transition-all ${
                      isSelected
                        ? 'bg-[#131b2e] border border-white text-white font-bold'
                        : 'bg-[#060e20]/90 border border-[#334155] text-[#bccac0]'
                    }`}>
                      {drone.callsign} · {drone.altitudeAGL.toFixed(1)}m AGL
                    </div>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-lg transition-transform ${
                        isSelected ? 'scale-125 ring-4 ring-[#68dba9]/40' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: drone.color }}
                    >
                      <Radio className="w-3.5 h-3.5 text-black" />
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

          </Map>
        </APIProvider>
      )}

      {/* Floating HUD Controls & Telemetry */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="hud-card p-3 border border-[#334155] shadow-2xl backdrop-blur-md pointer-events-auto">
          <div className="text-[10px] font-bold text-[#68dba9] tracking-wider uppercase font-body">
            GOOGLE MAPS PLATFORM SATELLITE
          </div>
          <h2 className="text-sm font-bold text-white font-display mt-0.5">
            Sonoma Orchard Parcel Telemetry
          </h2>
          <div className="text-[11px] font-mono text-[#bccac0] mt-1">
            COORDINATES: {FIELD_BASE_LAT.toFixed(4)}° N, {Math.abs(FIELD_BASE_LNG).toFixed(4)}° W
          </div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#334155]/60 text-[10px] font-mono">
            <span className="text-[#68dba9]">RTK 3D FIX: ±0.02m</span>
            <span>·</span>
            <span className="text-[#4cd7f6]">4 ACTIVE UNITS</span>
          </div>
        </div>
      </div>

      {/* Map Mode Selector */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <div className="hud-card p-1.5 flex items-center gap-1 shadow-2xl">
          {['satellite', 'hybrid', 'terrain'].map((type) => (
            <button
              key={type}
              onClick={() => setMapType(type)}
              className={`px-3 py-1 text-xs uppercase font-mono rounded-xs transition-colors cursor-pointer ${
                mapType === type
                  ? 'bg-[#003825] text-[#68dba9] border border-[#68dba9]'
                  : 'text-[#87948b] hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
