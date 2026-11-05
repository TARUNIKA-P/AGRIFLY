import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Leaf, 
  Droplets, 
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { FieldZone, PestDetection, DroneUnit } from '../types/telemetry';

interface FieldAnalyticsViewProps {
  fieldZones: FieldZone[];
  pestDetections: PestDetection[];
  drones: DroneUnit[];
  areaSurveyedHa: number;
  totalAreaHa: number;
}

export const FieldAnalyticsView: React.FC<FieldAnalyticsViewProps> = ({
  fieldZones,
  pestDetections,
  drones,
  areaSurveyedHa,
  totalAreaHa,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const handleExportTelemetry = () => {
    const reportData = {
      mission: 'AgriFly Autonomous Swarm Canopy Inspection',
      timestamp: new Date().toISOString(),
      coverageHa: areaSurveyedHa,
      totalAreaHa: totalAreaHa,
      activeUnits: drones.length,
      pestDetections: pestDetections,
      pesticideSavedPercentage: 86.4,
      gpsDeniedNavigationState: '100% SLAM-VIO Reliable',
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agrifly_canopy_mission_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#334155] pb-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#68dba9] font-body flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            FIELD VEGETATION & BIO-SURVEILLANCE REPORT
          </div>
          <h1 className="text-2xl font-bold text-white font-display mt-0.5">
            Mission Telemetry & Crop Health Analytics
          </h1>
          <p className="text-sm text-[#bccac0] mt-1 font-body">
            Decentralized edge-aggregated crop health indices, pest quarantine records, and chemical conservation metrics.
          </p>
        </div>

        <button
          onClick={handleExportTelemetry}
          className="flex items-center gap-2 px-4 py-2 bg-[#1e293b] hover:bg-[#2d3449] border border-[#334155] text-white text-xs font-bold rounded-xs transition-colors cursor-pointer"
        >
          {downloadSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#68dba9]" />
              <span className="text-[#68dba9]">TELEMETRY EXPORTED</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT MISSION GEOJSON / CSV</span>
            </>
          )}
        </button>
      </div>

      {/* High-level KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="hud-card p-4 border border-[#334155]">
          <span className="text-[10px] font-bold text-[#87948b] uppercase font-body block">
            CANOPY COMPLETION
          </span>
          <span className="text-3xl font-bold text-white font-display tabular-nums mt-1 block">
            {areaSurveyedHa.toFixed(1)} <span className="text-sm text-[#87948b]">/ {totalAreaHa} ha</span>
          </span>
          <div className="w-full bg-[#171f33] h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-[#68dba9] h-full"
              style={{ width: `${(areaSurveyedHa / totalAreaHa) * 100}%` }}
            />
          </div>
        </div>

        <div className="hud-card p-4 border border-[#334155]">
          <span className="text-[10px] font-bold text-[#87948b] uppercase font-body block">
            AVERAGE CANOPY NDVI
          </span>
          <span className="text-3xl font-bold text-[#68dba9] font-display tabular-nums mt-1 block">
            0.74 <span className="text-sm text-[#87948b]">Index</span>
          </span>
          <span className="text-xs text-[#68dba9] mt-1 block">
            +18% Vigor vs last inspection
          </span>
        </div>

        <div className="hud-card p-4 border border-[#334155]">
          <span className="text-[10px] font-bold text-[#87948b] uppercase font-body block">
            PEST FOCI NEUTRALIZED
          </span>
          <span className="text-3xl font-bold text-[#4cd7f6] font-display tabular-nums mt-1 block">
            {pestDetections.filter((p) => p.sprayStatus === 'treated').length} / {pestDetections.length}
          </span>
          <span className="text-xs text-[#bccac0] mt-1 block">
            Targeted micro-dose applied
          </span>
        </div>

        <div className="hud-card p-4 border border-[#334155]">
          <span className="text-[10px] font-bold text-[#87948b] uppercase font-body block">
            BATTERY POWER EFFICIENCY
          </span>
          <span className="text-3xl font-bold text-[#ffb95f] font-display tabular-nums mt-1 block">
            14.2 <span className="text-sm text-[#87948b]">Wh / ha</span>
          </span>
          <span className="text-xs text-[#bccac0] mt-1 block">
            Uneven terrain glide optimization
          </span>
        </div>
      </div>

      {/* Detailed Analysis Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Health Breakdown */}
        <div className="hud-card p-5 border border-[#334155] space-y-4">
          <div className="border-b border-[#334155] pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#68dba9] font-body">
              CANOPY VARIETY MATRIX
            </span>
            <h3 className="text-lg font-bold text-white font-display mt-0.5">
              Sector Inspection & Micro-Spray Yield
            </h3>
          </div>

          <div className="space-y-3">
            {fieldZones.map((zone) => {
              const zonePests = pestDetections.filter((p) => 
                (zone.id === 'zone-A' && p.location.x < 50 && p.location.y < 50) ||
                (zone.id === 'zone-B' && p.location.x >= 50) ||
                (zone.id === 'zone-C' && p.location.y >= 50)
              );

              return (
                <div key={zone.id} className="p-3 bg-[#171f33] rounded-xs border border-[#334155] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white font-display">{zone.name}</span>
                    <span className="text-[#4cd7f6] font-mono">{zone.acreageHa} ha</span>
                  </div>
                  <div className="text-[11px] text-[#bccac0]">{zone.variety}</div>

                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono pt-1 text-[#87948b]">
                    <div>
                      <span>NAV STATE:</span>
                      <strong className="block text-[#68dba9]">{zone.gpsSignal}</strong>
                    </div>
                    <div>
                      <span>CANOPY:</span>
                      <strong className="block text-white">{zone.canopyDensity}</strong>
                    </div>
                    <div>
                      <span>TARGET RATE:</span>
                      <strong className="block text-[#ffb95f]">{zone.targetRateLPerHa} L/ha</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Environmental & Agronomic Value Summary */}
        <div className="hud-card p-5 border border-[#334155] space-y-4">
          <div className="border-b border-[#334155] pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4cd7f6] font-body">
              AGRONOMIC VALUE PROPOSITION
            </span>
            <h3 className="text-lg font-bold text-white font-display mt-0.5">
              Traditional Cloud vs AgriFly Edge Swarm
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#171f33] rounded-xs border border-[#334155] space-y-1">
              <span className="font-bold text-[#ef4444] block font-mono">
                TRADITIONAL OFF-SITE CLOUD PIPELINE:
              </span>
              <p className="text-[#bccac0] font-body">
                Requires manual SD card extraction or cellular upload of 40GB+ RAW ortophotos. Off-site cloud compute takes 24–48 hours to generate prescription maps, allowing pest infestation to spread rapidly across tree rows.
              </p>
            </div>

            <div className="p-3 bg-[#003825]/40 rounded-xs border border-[#68dba9] space-y-1">
              <span className="font-bold text-[#68dba9] block font-mono">
                AGRIFLY EDGE-AI SWARM PIPELINE:
              </span>
              <p className="text-[#dae2fd] font-body">
                100% decentralized real-time inference on drone NPU (&lt;15ms latency). Target pest clusters are detected and micro-sprayed in the exact same flight pass, eliminating follow-up tractor passes and preventing canopy destruction.
              </p>
            </div>

            <div className="p-3 bg-[#171f33] rounded-xs border border-[#334155] space-y-1">
              <span className="font-bold text-[#ffb95f] block font-mono">
                GPS-DENIED ORCHARD NAVIGATION:
              </span>
              <p className="text-[#bccac0] font-body">
                Standard consumer drones lose RTK lock under dense canopies. AgriFly's multi-spectral stereo VIO and solid-state LiDAR SLAM maintain 0.04m positional accuracy regardless of satellite blockages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
