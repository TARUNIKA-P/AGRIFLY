import React, { useState, useEffect, useMemo } from 'react';
import { 
  Network, 
  Wifi, 
  Cpu, 
  ShieldCheck, 
  Layers, 
  Battery, 
  Zap, 
  Compass, 
  Radar, 
  Radio,
  ArrowRight,
  Maximize2,
  AlertTriangle,
  CheckCircle2,
  Signal,
  SlidersHorizontal,
  RefreshCw,
  Activity,
  ChevronRight
} from 'lucide-react';
import { DroneUnit, SwarmMeshStats, MeshLinkData } from '../types/telemetry';

interface SwarmMeshViewProps {
  drones: DroneUnit[];
  meshStats: SwarmMeshStats;
  selectedDroneId: string;
  onSelectDrone: (id: string) => void;
}

// Color thresholds strictly adhering to requirements:
// latency > 100ms in red (#ef4444)
// latency < 50ms in green (#68dba9)
// intermediate (50-100ms) in amber (#ffb95f)
export const getLatencyColor = (latencyMs: number): string => {
  if (latencyMs > 100) return '#ef4444'; // Red
  if (latencyMs < 50) return '#68dba9';  // Green
  return '#ffb95f';                     // Amber
};

export const getLatencyBadgeClass = (latencyMs: number): { text: string; bg: string; border: string; label: string } => {
  if (latencyMs > 100) {
    return {
      text: 'text-[#ef4444]',
      bg: 'bg-[#3b1212]/80',
      border: 'border-[#ef4444]',
      label: 'CRITICAL (>100ms)'
    };
  }
  if (latencyMs < 50) {
    return {
      text: 'text-[#68dba9]',
      bg: 'bg-[#003825]/80',
      border: 'border-[#68dba9]',
      label: 'OPTIMAL (<50ms)'
    };
  }
  return {
    text: 'text-[#ffb95f]',
    bg: 'bg-[#382600]/80',
    border: 'border-[#ffb95f]',
    label: 'NOMINAL (50-100ms)'
  };
};

// Initial pairwise mesh links between all 4 drones
const INITIAL_MESH_LINKS: MeshLinkData[] = [
  {
    id: 'link-1-2',
    sourceDroneId: 'drone-1',
    targetDroneId: 'drone-2',
    latencyMs: 32, // <50ms -> GREEN
    packetLossPercent: 0.1,
    rssiDb: -58,
    band: '5.8GHz High-Band',
    status: 'optimal',
    physicalDistanceMeters: 28.4,
  },
  {
    id: 'link-1-3',
    sourceDroneId: 'drone-1',
    targetDroneId: 'drone-3',
    latencyMs: 74, // 50-100ms -> AMBER
    packetLossPercent: 0.8,
    rssiDb: -72,
    band: '5.8GHz High-Band',
    status: 'degraded',
    physicalDistanceMeters: 62.1,
  },
  {
    id: 'link-1-4',
    sourceDroneId: 'drone-1',
    targetDroneId: 'drone-4',
    latencyMs: 126, // >100ms -> RED (dense canopy shadow obstruction)
    packetLossPercent: 4.6,
    rssiDb: -86,
    band: '802.11ah 900MHz (Sub-GHz)',
    status: 'critical',
    physicalDistanceMeters: 89.3,
  },
  {
    id: 'link-2-3',
    sourceDroneId: 'drone-2',
    targetDroneId: 'drone-3',
    latencyMs: 44, // <50ms -> GREEN
    packetLossPercent: 0.2,
    rssiDb: -62,
    band: '5.8GHz High-Band',
    status: 'optimal',
    physicalDistanceMeters: 35.8,
  },
  {
    id: 'link-2-4',
    sourceDroneId: 'drone-2',
    targetDroneId: 'drone-4',
    latencyMs: 68, // 50-100ms -> AMBER
    packetLossPercent: 0.5,
    rssiDb: -75,
    band: '5.8GHz High-Band',
    status: 'degraded',
    physicalDistanceMeters: 58.7,
  },
  {
    id: 'link-3-4',
    sourceDroneId: 'drone-3',
    targetDroneId: 'drone-4',
    latencyMs: 27, // <50ms -> GREEN
    packetLossPercent: 0.0,
    rssiDb: -54,
    band: '5.8GHz High-Band',
    status: 'optimal',
    physicalDistanceMeters: 24.2,
  },
];

// 2D positions for SVG topology layout (viewBox 0 0 800 400)
const NODE_COORDINATES: Record<string, { x: number; y: number }> = {
  'drone-1': { x: 200, y: 110 }, // Top-Left: Apex-Alpha
  'drone-2': { x: 600, y: 110 }, // Top-Right: Vector-Bravo
  'drone-3': { x: 600, y: 310 }, // Bottom-Right: Spectra-Gamma
  'drone-4': { x: 200, y: 310 }, // Bottom-Left: Terra-Delta
};

export const SwarmMeshView: React.FC<SwarmMeshViewProps> = ({
  drones,
  meshStats,
  selectedDroneId,
  onSelectDrone,
}) => {
  const [selectedSensor, setSelectedSensor] = useState<'lidar' | 'vio' | 'sonar' | 'imu'>('lidar');
  const [showDiagnosticLayer, setShowDiagnosticLayer] = useState<boolean>(true);
  const [filterThreshold, setFilterThreshold] = useState<'all' | 'critical' | 'nominal' | 'optimal'>('all');
  const [selectedLinkId, setSelectedLinkId] = useState<string>('link-1-4');
  
  // Interactive Simulation Controls
  const [simulateCanopyShadow, setSimulateCanopyShadow] = useState<boolean>(true);
  const [latencyJitterActive, setLatencyJitterActive] = useState<boolean>(true);
  const [manualLatencyOffset, setManualLatencyOffset] = useState<number>(0);
  const [links, setLinks] = useState<MeshLinkData[]>(INITIAL_MESH_LINKS);

  // Subtle real-time RF ping jitter simulation
  useEffect(() => {
    if (!latencyJitterActive) return;
    const interval = setInterval(() => {
      setLinks((prev) =>
        prev.map((link) => {
          // If canopy shadow is active on link-1-4, keep it high (>100ms)
          if (link.id === 'link-1-4' && simulateCanopyShadow) {
            const jitter = Math.sin(Date.now() / 1500) * 8;
            const newLatency = Math.max(105, Math.round(124 + jitter + manualLatencyOffset));
            return {
              ...link,
              latencyMs: newLatency,
              status: newLatency > 100 ? 'critical' : newLatency < 50 ? 'optimal' : 'degraded',
              rssiDb: Math.round(-84 + Math.sin(Date.now() / 2000) * 3),
            };
          }

          // Subtle natural variation for other links
          const baseOffset = link.id === 'link-1-4' ? 45 : link.latencyMs;
          const jitter = (Math.random() - 0.5) * 4;
          const newLatency = Math.max(18, Math.round(baseOffset + jitter + (manualLatencyOffset > 0 ? manualLatencyOffset * 0.4 : 0)));
          return {
            ...link,
            latencyMs: newLatency,
            status: newLatency > 100 ? 'critical' : newLatency < 50 ? 'optimal' : 'degraded',
          };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [latencyJitterActive, simulateCanopyShadow, manualLatencyOffset]);

  // Handle toggling the canopy shadow stress test
  const handleToggleCanopyShadow = () => {
    const nextState = !simulateCanopyShadow;
    setSimulateCanopyShadow(nextState);
    setLinks((prev) =>
      prev.map((l) => {
        if (l.id === 'link-1-4') {
          const newLatency = nextState ? 128 : 38;
          return {
            ...l,
            latencyMs: newLatency,
            status: newLatency > 100 ? 'critical' : newLatency < 50 ? 'optimal' : 'degraded',
            packetLossPercent: nextState ? 4.8 : 0.1,
            rssiDb: nextState ? -86 : -61,
            band: nextState ? '802.11ah 900MHz (Sub-GHz)' : '5.8GHz High-Band',
          };
        }
        return l;
      })
    );
  };

  // Filter links based on user preference
  const visibleLinks = useMemo(() => {
    if (filterThreshold === 'critical') return links.filter((l) => l.latencyMs > 100);
    if (filterThreshold === 'nominal') return links.filter((l) => l.latencyMs >= 50 && l.latencyMs <= 100);
    if (filterThreshold === 'optimal') return links.filter((l) => l.latencyMs < 50);
    return links;
  }, [links, filterThreshold]);

  // Selected link data for inspector
  const activeLink = links.find((l) => l.id === selectedLinkId) || links[0];
  const sourceDrone = drones.find((d) => d.id === activeLink.sourceDroneId) || drones[0];
  const targetDrone = drones.find((d) => d.id === activeLink.targetDroneId) || drones[1];
  const activeBadge = getLatencyBadgeClass(activeLink.latencyMs);

  // Link summary metrics
  const optimalCount = links.filter((l) => l.latencyMs < 50).length;
  const nominalCount = links.filter((l) => l.latencyMs >= 50 && l.latencyMs <= 100).length;
  const criticalCount = links.filter((l) => l.latencyMs > 100).length;
  const avgLatency = Math.round(links.reduce((acc, l) => acc + l.latencyMs, 0) / links.length);

  const selectedDrone = drones.find((d) => d.id === selectedDroneId) || drones[0];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#334155] pb-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#4cd7f6] font-body flex items-center gap-2">
            <Network className="w-4 h-4" />
            DECENTRALIZED P2P AD-HOC FIELD MESH
          </div>
          <h1 className="text-2xl font-bold text-white font-display mt-0.5">
            Swarm Mesh Topology & Signal Latency Diagnostics
          </h1>
          <p className="text-sm text-[#bccac0] mt-1 font-body">
            Real-time peer-to-peer RF links across GPS-denied orchard canopy. Color-coded latency highlights optimal paths (&lt;50ms) and tree obstruction (&gt;100ms).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1.5 bg-[#003825] border border-[#68dba9] rounded-xs text-xs font-mono text-[#68dba9] font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#68dba9] animate-pulse" />
            RAFT CONSENSUS: IN QUORUM
          </div>
          <button
            onClick={() => setShowDiagnosticLayer(!showDiagnosticLayer)}
            className={`px-3 py-1.5 border rounded-xs text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              showDiagnosticLayer
                ? 'bg-[#002f38] border-[#4cd7f6] text-[#4cd7f6]'
                : 'bg-[#171f33] border-[#334155] text-[#87948b] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            DIAGNOSTIC LAYER: {showDiagnosticLayer ? 'ACTIVE' : 'MUTED'}
          </button>
        </div>
      </div>

      {/* Top 4 Swarm Node Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {drones.map((drone) => {
          const isSelected = drone.id === selectedDroneId;
          const connectedLinks = links.filter(
            (l) => l.sourceDroneId === drone.id || l.targetDroneId === drone.id
          );
          const hasCriticalLink = connectedLinks.some((l) => l.latencyMs > 100);

          return (
            <div
              key={drone.id}
              onClick={() => onSelectDrone(drone.id)}
              className={`hud-card p-3.5 border transition-all cursor-pointer relative ${
                isSelected
                  ? 'border-[#4cd7f6] shadow-[0_0_15px_rgba(76,215,246,0.25)]'
                  : 'border-[#334155] hover:border-[#87948b]'
              }`}
            >
              {hasCriticalLink && (
                <span
                  title="Node has high latency link (>100ms)"
                  className="absolute top-2 right-2 flex h-2 w-2"
                >
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ef4444] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ef4444]" />
                </span>
              )}

              <div className="flex items-center justify-between mb-2">
                <span className="font-display font-bold text-white flex items-center gap-1.5 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: drone.color }} />
                  {drone.name}
                </span>
                <span className="text-[10px] font-mono font-bold text-[#87948b]">
                  {drone.callsign}
                </span>
              </div>

              <div className="text-xs text-[#bccac0] mb-3">
                <span className="text-[#dae2fd] font-semibold">{drone.role}</span>
              </div>

              <div className="space-y-1.5 text-xs font-mono text-[#bccac0]">
                <div className="flex justify-between">
                  <span>BATTERY:</span>
                  <span className={drone.battery > 50 ? 'text-[#68dba9]' : 'text-[#ffb95f]'}>
                    {drone.battery}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>SLAM FIX:</span>
                  <span className="text-[#4cd7f6]">{drone.slamFix}</span>
                </div>
                <div className="flex justify-between">
                  <span>PAYLOAD:</span>
                  <span className="text-white">{drone.payloadRemaining.toFixed(1)}L</span>
                </div>
                <div className="flex justify-between">
                  <span>P2P MESH:</span>
                  <span className={hasCriticalLink ? 'text-[#ef4444]' : 'text-[#68dba9]'}>
                    {drone.meshRssi} dBm
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DIAGNOSTIC VISUAL LAYER: P2P Swarm Topology & Latency Matrix */}
      <div className="hud-card p-5 border border-[#334155] space-y-4">
        {/* Layer Controls & Threshold Legend Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#334155] pb-4">
          <div className="flex items-center gap-2">
            <Signal className="w-4 h-4 text-[#4cd7f6]" />
            <h2 className="text-base font-bold text-white font-display">
              P2P Mesh Topology & Latency Diagnostic Layer
            </h2>
            <span className="text-xs font-mono text-[#87948b] ml-1">
              (6 Bidirectional Links · Avg {avgLatency} ms)
            </span>
          </div>

          {/* Color-coded Threshold Legend (latency >100ms red, <50ms green, 50-100ms amber) */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            {/* Green <50ms */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#003825] border border-[#68dba9] rounded-xs text-[#68dba9]">
              <span className="w-2 h-2 rounded-full bg-[#68dba9]" />
              <span className="font-bold">&lt; 50 ms</span>
              <span className="text-[10px] text-[#bccac0]">OPTIMAL ({optimalCount})</span>
            </div>

            {/* Amber 50-100ms */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#382600] border border-[#ffb95f] rounded-xs text-[#ffb95f]">
              <span className="w-2 h-2 rounded-full bg-[#ffb95f]" />
              <span className="font-bold">50–100 ms</span>
              <span className="text-[10px] text-[#bccac0]">NOMINAL ({nominalCount})</span>
            </div>

            {/* Red >100ms */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#3b1212] border border-[#ef4444] rounded-xs text-[#ef4444]">
              <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
              <span className="font-bold">&gt; 100 ms</span>
              <span className="text-[10px] text-[#bccac0]">CRITICAL ({criticalCount})</span>
            </div>
          </div>
        </div>

        {/* Filter and Stress Test Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-[#131b2e] p-3 rounded-xs border border-[#334155]">
          {/* Threshold Filters */}
          <div className="flex items-center gap-2">
            <span className="text-[#87948b] font-mono uppercase text-[10px] font-bold">Filter View:</span>
            <button
              onClick={() => setFilterThreshold('all')}
              className={`px-2.5 py-1 rounded-xs font-mono transition-colors cursor-pointer ${
                filterThreshold === 'all'
                  ? 'bg-[#002f38] text-[#4cd7f6] border border-[#4cd7f6]'
                  : 'text-[#87948b] hover:text-white'
              }`}
            >
              All Links ({links.length})
            </button>
            <button
              onClick={() => setFilterThreshold('optimal')}
              className={`px-2.5 py-1 rounded-xs font-mono transition-colors cursor-pointer ${
                filterThreshold === 'optimal'
                  ? 'bg-[#003825] text-[#68dba9] border border-[#68dba9]'
                  : 'text-[#87948b] hover:text-[#68dba9]'
              }`}
            >
              &lt;50ms Green ({optimalCount})
            </button>
            <button
              onClick={() => setFilterThreshold('nominal')}
              className={`px-2.5 py-1 rounded-xs font-mono transition-colors cursor-pointer ${
                filterThreshold === 'nominal'
                  ? 'bg-[#382600] text-[#ffb95f] border border-[#ffb95f]'
                  : 'text-[#87948b] hover:text-[#ffb95f]'
              }`}
            >
              50-100ms Amber ({nominalCount})
            </button>
            <button
              onClick={() => setFilterThreshold('critical')}
              className={`px-2.5 py-1 rounded-xs font-mono transition-colors cursor-pointer ${
                filterThreshold === 'critical'
                  ? 'bg-[#3b1212] text-[#ef4444] border border-[#ef4444]'
                  : 'text-[#87948b] hover:text-[#ef4444]'
              }`}
            >
              &gt;100ms Red ({criticalCount})
            </button>
          </div>

          {/* Interactive Stress Tester & Simulation Toggles */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleCanopyShadow}
              className={`px-3 py-1 rounded-xs border font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                simulateCanopyShadow
                  ? 'bg-[#3b1212] border-[#ef4444] text-[#ef4444]'
                  : 'bg-[#171f33] border-[#334155] text-[#bccac0] hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>SIMULATE CANOPY SHADOW: {simulateCanopyShadow ? 'ON (>100ms RED)' : 'OFF (CLEAN RF)'}</span>
            </button>

            <button
              onClick={() => setLatencyJitterActive(!latencyJitterActive)}
              title="Toggle live millisecond ping telemetry updates"
              className={`p-1.5 rounded-xs border transition-colors cursor-pointer ${
                latencyJitterActive ? 'text-[#68dba9] border-[#68dba9] bg-[#003825]' : 'text-[#87948b] border-[#334155]'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${latencyJitterActive ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            </button>
          </div>
        </div>

        {/* Main Diagnostic Layer Canvas & Inspector Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* SVG Visual Mesh Topology (Span 2 cols) */}
          <div className="lg:col-span-2 relative bg-[#070d19] rounded-xs border border-[#334155] overflow-hidden min-h-[380px] flex items-center justify-center">
            {/* Background High-Tech Grid & Canopy Pattern */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#334155 1px, transparent 1px), linear-gradient(to right, #131b2e 1px, transparent 1px), linear-gradient(to bottom, #131b2e 1px, transparent 1px)',
                backgroundSize: '24px 24px, 48px 48px, 48px 48px'
              }}
            />

            {/* Tree Canopy Shadow Visual Indicator (Simulated dense foliage zone) */}
            {simulateCanopyShadow && (
              <div className="absolute left-[8%] bottom-[12%] w-[260px] h-[160px] rounded-full bg-[#1b4332]/20 border border-[#2d6a4f]/40 blur-[1px] pointer-events-none flex flex-col items-center justify-center text-center p-2">
                <span className="text-[10px] font-mono text-[#80ed99] uppercase tracking-wider font-bold">
                  DENSE ORCHARD CANOPY
                </span>
                <span className="text-[9px] font-mono text-[#ef4444] mt-0.5">
                  RF MULTI-PATH SHADOW ZONE
                </span>
              </div>
            )}

            {/* Interactive SVG Mesh Canvas */}
            <svg
              viewBox="0 0 800 420"
              className="w-full h-full max-h-[440px] relative z-10"
              style={{ filter: 'drop-shadow(0px 0px 4px rgba(0,0,0,0.5))' }}
            >
              <defs>
                {/* Glow filters for links */}
                <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Reroute indicator when link > 100ms */}
              {simulateCanopyShadow && (
                <path
                  d="M 200 110 Q 400 210 600 110 T 200 310"
                  fill="none"
                  stroke="#4cd7f6"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.4"
                />
              )}

              {/* RENDER LINKS */}
              {links.map((link) => {
                const source = NODE_COORDINATES[link.sourceDroneId];
                const target = NODE_COORDINATES[link.targetDroneId];
                if (!source || !target) return null;

                const isSelected = link.id === selectedLinkId;
                const isVisible = visibleLinks.some((l) => l.id === link.id);
                const color = getLatencyColor(link.latencyMs);
                const isCritical = link.latencyMs > 100;
                const isOptimal = link.latencyMs < 50;

                const midX = (source.x + target.x) / 2;
                const midY = (source.y + target.y) / 2;

                return (
                  <g
                    key={link.id}
                    className={`cursor-pointer transition-opacity duration-300 ${
                      isVisible ? 'opacity-100' : 'opacity-20 pointer-events-none'
                    }`}
                    onClick={() => setSelectedLinkId(link.id)}
                  >
                    {/* Wider transparent hit target for easy clicking */}
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke="transparent"
                      strokeWidth="20"
                    />

                    {/* Outer Glow Line */}
                    {showDiagnosticLayer && (
                      <line
                        x1={source.x}
                        y1={source.y}
                        x2={target.x}
                        y2={target.y}
                        stroke={color}
                        strokeWidth={isSelected ? '6' : isCritical ? '4' : '2.5'}
                        strokeOpacity={isSelected ? '0.6' : '0.25'}
                        filter={isCritical ? 'url(#glow-red)' : isOptimal ? 'url(#glow-green)' : 'url(#glow-amber)'}
                      />
                    )}

                    {/* Main Link Line */}
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={showDiagnosticLayer ? color : '#334155'}
                      strokeWidth={isSelected ? '3' : isCritical ? '2.5' : '1.8'}
                      strokeDasharray={isCritical ? '6 4' : undefined}
                    />

                    {/* Animated Data Packets (Pulsing circles traveling the link) */}
                    {showDiagnosticLayer && (
                      <circle r={isCritical ? '4' : '3'} fill={color}>
                        <animateMotion
                          path={`M ${source.x} ${source.y} L ${target.x} ${target.y}`}
                          dur={isCritical ? '3s' : isOptimal ? '1.2s' : '2s'}
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}

                    {/* Centered Latency Diagnostic Badge */}
                    {showDiagnosticLayer && (
                      <g transform={`translate(${midX}, ${midY})`}>
                        {/* Badge Background */}
                        <rect
                          x="-34"
                          y="-12"
                          width="68"
                          height="24"
                          rx="4"
                          fill="#0b1326"
                          stroke={color}
                          strokeWidth={isSelected ? '2' : '1.2'}
                        />

                        {/* Latency Number & Unit */}
                        <text
                          x="0"
                          y="4"
                          textAnchor="middle"
                          fill={color}
                          fontSize="11"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {link.latencyMs} ms
                        </text>

                        {/* Red Critical Warning Indicator on the badge */}
                        {isCritical && (
                          <circle
                            cx="26"
                            cy="-6"
                            r="3"
                            fill="#ef4444"
                            className="animate-ping"
                          />
                        )}
                      </g>
                    )}
                  </g>
                );
              })}

              {/* RENDER DRONE NODES */}
              {drones.map((drone) => {
                const coord = NODE_COORDINATES[drone.id];
                if (!coord) return null;
                const isSelected = drone.id === selectedDroneId;
                const connectedLinks = links.filter(
                  (l) => l.sourceDroneId === drone.id || l.targetDroneId === drone.id
                );
                const hasCritical = connectedLinks.some((l) => l.latencyMs > 100);

                return (
                  <g
                    key={drone.id}
                    transform={`translate(${coord.x}, ${coord.y})`}
                    className="cursor-pointer"
                    onClick={() => onSelectDrone(drone.id)}
                  >
                    {/* Selection Pulse Ring */}
                    {isSelected && (
                      <circle
                        r="34"
                        fill="none"
                        stroke="#4cd7f6"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        className="animate-spin"
                        style={{ transformOrigin: '0 0', animationDuration: '10s' }}
                      />
                    )}

                    {/* Node Bounding Halo */}
                    <circle
                      r="24"
                      fill="#0b1326"
                      stroke={hasCritical ? '#ef4444' : isSelected ? '#4cd7f6' : '#334155'}
                      strokeWidth="2"
                    />

                    {/* Drone Color Core */}
                    <circle
                      r="16"
                      fill={drone.color}
                      fillOpacity="0.25"
                      stroke={drone.color}
                      strokeWidth="1.5"
                    />

                    {/* Craft Glyph / Number */}
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {drone.callsign.replace('SWARM-', '')}
                    </text>

                    {/* Drone Label Card Tag Below */}
                    <g transform="translate(0, 36)">
                      <rect
                        x="-50"
                        y="-8"
                        width="100"
                        height="18"
                        rx="2"
                        fill="#060e20"
                        stroke={isSelected ? '#4cd7f6' : '#334155'}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill="#dae2fd"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {drone.name.split(' ')[0]}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>

            {/* Bottom HUD Overlay Info */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-[#87948b] bg-[#0b1326]/85 backdrop-blur-sm px-3 py-1.5 rounded-xs border border-[#334155]">
              <span>CLICK ANY LINK OR NODE TO INSPECT RF DIAGNOSTICS</span>
              <span className="text-[#68dba9] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                CANOPY PENETRATION 900MHz ACTIVE
              </span>
            </div>
          </div>

          {/* Right Col: Link Diagnostic Inspector */}
          <div className="space-y-4">
            <div className="bg-[#131b2e] p-4 rounded-xs border border-[#334155] space-y-4">
              <div className="flex items-center justify-between border-b border-[#334155] pb-2">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#4cd7f6]" />
                  <span className="text-xs font-bold text-white font-display uppercase tracking-wider">
                    Link Diagnostic Inspector
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#87948b] uppercase">
                  ID: {activeLink.id}
                </span>
              </div>

              {/* Connected Nodes Header */}
              <div className="p-2.5 bg-[#171f33] rounded-xs border border-[#334155] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#87948b] font-mono">NODE A</div>
                  <div className="text-xs font-bold text-white font-display flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sourceDrone.color }} />
                    {sourceDrone.name}
                  </div>
                  <div className="text-[10px] text-[#bccac0] font-mono">{sourceDrone.callsign}</div>
                </div>

                <div className="flex flex-col items-center px-2">
                  <ArrowRight className="w-4 h-4 text-[#4cd7f6]" />
                  <span className="text-[9px] font-mono text-[#87948b]">{activeLink.physicalDistanceMeters}m</span>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-[#87948b] font-mono">NODE B</div>
                  <div className="text-xs font-bold text-white font-display flex items-center justify-end gap-1.5">
                    {targetDrone.name}
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: targetDrone.color }} />
                  </div>
                  <div className="text-[10px] text-[#bccac0] font-mono">{targetDrone.callsign}</div>
                </div>
              </div>

              {/* Latency & Status Card */}
              <div className={`p-3 rounded-xs border ${activeBadge.bg} ${activeBadge.border} space-y-1.5`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#bccac0]">
                    MEASURED ROUND-TRIP LATENCY
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs border ${activeBadge.border} ${activeBadge.text}`}>
                    {activeBadge.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-bold font-mono tabular-nums ${activeBadge.text}`}>
                    {activeLink.latencyMs}
                  </span>
                  <span className="text-sm font-mono text-[#bccac0]">ms</span>
                </div>
                {activeLink.latencyMs > 100 ? (
                  <p className="text-[11px] text-[#ef4444] font-body leading-tight pt-1">
                    Tree canopy leaf mass attenuating 5.8GHz carrier. Swarm autonomous routing protocol is redistributing consensus telemetry via Sub-GHz HaLow.
                  </p>
                ) : activeLink.latencyMs < 50 ? (
                  <p className="text-[11px] text-[#68dba9] font-body leading-tight pt-1">
                    Direct line-of-sight canopy clearance. Zero packet loss, maximum throughput for real-time micro-spray coordination.
                  </p>
                ) : (
                  <p className="text-[11px] text-[#ffb95f] font-body leading-tight pt-1">
                    Moderate multi-path jitter observed through outer vineyard canopy. Within nominal operating bounds.
                  </p>
                )}
              </div>

              {/* Deep Diagnostic RF Metrics */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between p-2 bg-[#171f33] rounded-xs border border-[#334155]">
                  <span className="text-[#87948b]">PACKET LOSS:</span>
                  <span className={activeLink.packetLossPercent > 2 ? 'text-[#ef4444] font-bold' : 'text-[#68dba9] font-bold'}>
                    {activeLink.packetLossPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between p-2 bg-[#171f33] rounded-xs border border-[#334155]">
                  <span className="text-[#87948b]">SIGNAL STRENGTH (RSSI):</span>
                  <span className={activeLink.rssiDb < -80 ? 'text-[#ef4444] font-bold' : 'text-white font-bold'}>
                    {activeLink.rssiDb} dBm
                  </span>
                </div>
                <div className="flex justify-between p-2 bg-[#171f33] rounded-xs border border-[#334155]">
                  <span className="text-[#87948b]">RF CARRIER BAND:</span>
                  <span className="text-[#4cd7f6] font-bold">{activeLink.band}</span>
                </div>
                <div className="flex justify-between p-2 bg-[#171f33] rounded-xs border border-[#334155]">
                  <span className="text-[#87948b]">CANOPY PENETRATION:</span>
                  <span className="text-white font-bold">
                    {activeLink.latencyMs > 100 ? 'Deep Foliage (Shadowed)' : 'Direct LOS'}
                  </span>
                </div>
              </div>

              {/* Edge Reroute Action */}
              {activeLink.latencyMs > 100 && (
                <div className="p-2.5 bg-[#3b1212]/50 border border-[#ef4444] rounded-xs text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-[#ef4444] font-bold font-mono">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>AUTONOMOUS EDGE REROUTE ACTIVE</span>
                  </div>
                  <p className="text-[11px] text-[#bccac0] font-body">
                    Payload coordination packets between {sourceDrone.callsign} and {targetDrone.callsign} are automatically relaying through <strong className="text-white">SWARM-02 (Vector-Bravo)</strong> to maintain sub-50ms consensus quorum.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Hardware & Sensor Fusion Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Aircraft Hardware & Sensor Fusion */}
        <div className="lg:col-span-2 space-y-4">
          <div className="hud-card p-4 border border-[#334155] space-y-4">
            <div className="flex items-center justify-between border-b border-[#334155] pb-2">
              <span className="font-bold text-white font-display text-sm flex items-center gap-2">
                <Radar className="w-4 h-4 text-[#4cd7f6]" />
                Selected Node: {selectedDrone.name} Physical Architecture
              </span>
              <span className="text-xs font-mono text-[#87948b]">
                FIRMWARE: EDGE-PX4 v1.14 AUTONOMOUS
              </span>
            </div>

            {/* Drone Hero Image */}
            <div className="relative rounded-xs overflow-hidden border border-[#334155] aspect-[16/9] bg-black">
              <img
                src="/src/assets/images/drone_hexacopter_sprayer_1793902131507.jpg"
                alt="AgriFly Hexacopter Micro-Sprayer Drone"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono uppercase text-[#68dba9] font-bold">
                      {selectedDrone.callsign} · {selectedDrone.role}
                    </span>
                    <h3 className="text-lg font-bold text-white font-display">
                      Autonomous Agricultural Hexacopter Avionics
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 bg-[#131b2e] border border-[#334155] text-xs font-mono text-[#4cd7f6] rounded-xs">
                    AGL 1.8m CANOPY LOCK
                  </span>
                </div>
              </div>
            </div>

            {/* Sensor Fusion Interactive Tabs */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-[#334155] pb-2 text-xs overflow-x-auto">
                <button
                  onClick={() => setSelectedSensor('lidar')}
                  className={`px-3 py-1 font-semibold rounded-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
                    selectedSensor === 'lidar'
                      ? 'bg-[#002f38] text-[#4cd7f6] border border-[#4cd7f6]'
                      : 'text-[#87948b] hover:text-white'
                  }`}
                >
                  3D LiDAR Point Cloud (360°)
                </button>
                <button
                  onClick={() => setSelectedSensor('vio')}
                  className={`px-3 py-1 font-semibold rounded-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
                    selectedSensor === 'vio'
                      ? 'bg-[#002f38] text-[#4cd7f6] border border-[#4cd7f6]'
                      : 'text-[#87948b] hover:text-white'
                  }`}
                >
                  Stereo Visual Odometry (VIO)
                </button>
                <button
                  onClick={() => setSelectedSensor('sonar')}
                  className={`px-3 py-1 font-semibold rounded-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
                    selectedSensor === 'sonar'
                      ? 'bg-[#002f38] text-[#4cd7f6] border border-[#4cd7f6]'
                      : 'text-[#87948b] hover:text-white'
                  }`}
                >
                  Ground Terrain Sonar (AGL)
                </button>
                <button
                  onClick={() => setSelectedSensor('imu')}
                  className={`px-3 py-1 font-semibold rounded-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
                    selectedSensor === 'imu'
                      ? 'bg-[#002f38] text-[#4cd7f6] border border-[#4cd7f6]'
                      : 'text-[#87948b] hover:text-white'
                  }`}
                >
                  6-DOF Redundant IMU
                </button>
              </div>

              {/* Sensor Diagnostics Description */}
              <div className="p-3 bg-[#171f33] rounded-xs border border-[#334155] text-xs space-y-2">
                {selectedSensor === 'lidar' && (
                  <>
                    <div className="flex justify-between font-mono">
                      <span className="text-[#4cd7f6] font-bold">LIVOX MID-360 SOLID-STATE LIDAR:</span>
                      <span className="text-[#68dba9]">200,000 pts/sec · Range 40m</span>
                    </div>
                    <p className="text-[#bccac0] font-body">
                      Maps dense tree trunks, low-hanging grape vines, and terrain slopes in real-time. Eliminates GPS multi-path errors when flying deep under orchard canopies.
                    </p>
                    <div className="flex gap-4 font-mono text-[11px] text-[#87948b] pt-1">
                      <span>BRANCH CLEARANCE: <strong className="text-white">1.14m</strong></span>
                      <span>OBSTACLE CONFIDENCE: <strong className="text-[#68dba9]">99.8%</strong></span>
                      <span>DRIFT RATE: <strong className="text-white">&lt;0.02m / min</strong></span>
                    </div>
                  </>
                )}

                {selectedSensor === 'vio' && (
                  <>
                    <div className="flex justify-between font-mono">
                      <span className="text-[#4cd7f6] font-bold">DUAL GLOBAL SHUTTER STEREO VIO:</span>
                      <span className="text-[#68dba9]">Feature Tracking: 480 Keypoints</span>
                    </div>
                    <p className="text-[#bccac0] font-body">
                      Tracks high-frequency optical motion against foliage and soil texture. Provides sub-centimeter velocity estimates when satellite signals are obstructed.
                    </p>
                  </>
                )}

                {selectedSensor === 'sonar' && (
                  <>
                    <div className="flex justify-between font-mono">
                      <span className="text-[#4cd7f6] font-bold">DUAL-BEAM ULTRASONIC RANGEFINDER:</span>
                      <span className="text-[#68dba9]">100Hz Canopy-to-Ground Profiling</span>
                    </div>
                    <p className="text-[#bccac0] font-body">
                      Constrains vertical flight altitude to maintain constant 1.8m AGL over rolling hills and terraces, preventing chemical drift.
                    </p>
                  </>
                )}

                {selectedSensor === 'imu' && (
                  <>
                    <div className="flex justify-between font-mono">
                      <span className="text-[#4cd7f6] font-bold">TRIPLE REDUNDANT INDUSTRIAL IMU:</span>
                      <span className="text-[#68dba9]">Vibration-Isolated EKF3 State Estimation</span>
                    </div>
                    <p className="text-[#bccac0] font-body">
                      Compensates for rotor vibration and sudden micro-wind gusts along vineyard slopes, guaranteeing ultra-stable micro-nozzle aiming.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Decentralized Consensus & Energy Relay */}
        <div className="space-y-4">
          <div className="hud-card p-4 border border-[#334155] space-y-4">
            <div className="border-b border-[#334155] pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4cd7f6] font-body">
                DECENTRALIZED PROTOCOL
              </span>
              <h3 className="text-lg font-bold text-white font-display mt-0.5">
                P2P Ad-Hoc Swarm Mesh
              </h3>
            </div>

            {/* Mesh Parameters */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2 bg-[#171f33] rounded-xs border border-[#334155]">
                <span className="text-[#87948b]">NETWORK PROTOCOL:</span>
                <span className="text-white font-bold">802.11ah HaLow + 5.8GHz</span>
              </div>
              <div className="flex justify-between p-2 bg-[#171f33] rounded-xs border border-[#334155]">
                <span className="text-[#87948b]">INTER-NODE LATENCY:</span>
                <span className="text-[#68dba9] font-bold">{meshStats.meshLatencyMs.toFixed(1)} ms</span>
              </div>
              <div className="flex justify-between p-2 bg-[#171f33] rounded-xs border border-[#334155]">
                <span className="text-[#87948b]">CONSENSUS LEADER:</span>
                <span className="text-[#ffb95f] font-bold">{meshStats.consensusLeader}</span>
              </div>
              <div className="flex justify-between p-2 bg-[#171f33] rounded-xs border border-[#334155]">
                <span className="text-[#87948b]">CLOUD RELIANCE:</span>
                <span className="text-[#68dba9] font-bold">{meshStats.cloudDependency}</span>
              </div>
            </div>

            {/* Dynamic Swarm Task Allocation Rules */}
            <div className="space-y-2 pt-2 border-t border-[#334155]">
              <span className="text-[10px] font-bold uppercase text-[#87948b] font-body block">
                AUTONOMOUS ROLE HANDOFF
              </span>
              <div className="p-2.5 bg-[#171f33] rounded-xs border border-[#334155] text-xs text-[#bccac0] space-y-1.5 font-body">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Zap className="w-3.5 h-3.5 text-[#ffb95f]" />
                  <span>Battery Exhaustion Auto-Relay</span>
                </div>
                <p className="text-[11px]">
                  When any craft dips below 20% SoC, it seamlessly hands its assigned orchard quadrant to nearest escort node (<span className="text-white font-mono">SWARM-04</span>) and executes autonomous low-energy glide RTH.
                </p>
              </div>

              <div className="p-2.5 bg-[#171f33] rounded-xs border border-[#334155] text-xs text-[#bccac0] space-y-1.5 font-body">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#68dba9]" />
                  <span>Cross-Agent Collision Envelope</span>
                </div>
                <p className="text-[11px]">
                  Continuous 3-meter dynamic bounding cylinder maintained between drones via distributed Velocity Obstacle (VO) algorithms without central server.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
