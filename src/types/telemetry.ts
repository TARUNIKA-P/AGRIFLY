export interface DroneUnit {
  id: string;
  name: string;
  callsign: string;
  role: 'Scout & SLAM' | 'Micro-Sprayer' | 'Precision Sprayer' | 'Relay & Escort';
  battery: number; // percentage
  voltage: number; // V
  payloadRemaining: number; // Liters
  payloadCapacity: number; // Liters
  altitudeAGL: number; // meters above ground canopy
  groundSpeed: number; // m/s
  position: { x: number; y: number }; // Percentage coordinates on map 0-100
  targetWaypoint: { x: number; y: number };
  heading: number; // degrees 0-360
  status: 'scanning' | 'spraying' | 'relocating' | 'holding' | 'rth' | 'docked' | 'taking-off';
  slamFix: 'VIO-STEREO' | 'LIDAR-ICP' | 'FUSED-ODOM';
  npuTemp: number; // °C
  meshRssi: number; // dBm
  sprayFlowRate: number; // L/min
  sprayActive: boolean;
  color: string;
}

export interface PestDetection {
  id: string;
  droneId: string;
  timestamp: string;
  cropType: string;
  pestName: string;
  scientificName: string;
  severity: 'low' | 'moderate' | 'critical';
  confidence: number; // percentage e.g. 96.4
  location: { x: number; y: number };
  sprayStatus: 'treated' | 'queued' | 'monitoring';
  sprayDoseMl: number;
  ndviScore: number;
  imageUrl?: string;
  box: { top: number; left: number; width: number; height: number }; // percentage on image
}

export interface SwarmMeshStats {
  activeNodes: number;
  totalNodes: number;
  meshLatencyMs: number;
  cloudDependency: '0% (Offline Edge)' | 'Offline';
  bandwidthKbps: number;
  consensusLeader: string;
  decentralizedSync: 'Verified' | 'Syncing';
}

export interface FieldZone {
  id: string;
  name: string;
  variety: string;
  acreageHa: number;
  targetRateLPerHa: number;
  canopyDensity: 'Dense' | 'Moderate' | 'Sparse';
  gpsSignal: 'Denied (Canopy Shadow)' | 'Weak (Multipath)' | 'Intermittent';
  boundary: { x: number; y: number }[];
}

export interface WeatherData {
  windSpeed: number; // m/s
  windGust: number; // m/s
  windDirectionDeg: number; // 0-360
  windDirectionLabel: string; // e.g. "SW", "NNE"
  humidity: number; // %
  temperature: number; // °C
  barometricHpa: number; // hPa
  canopyDeltaT: number; // °C (evaporative spraying delta)
  sprayDriftRisk: 'Low' | 'Moderate' | 'High';
  recommendedNozzleMicrons: number;
  lastUpdated: string;
}

export interface MeshLinkData {
  id: string;
  sourceDroneId: string;
  targetDroneId: string;
  latencyMs: number;
  packetLossPercent: number;
  rssiDb: number;
  band: '802.11ah 900MHz (Sub-GHz)' | '5.8GHz High-Band';
  status: 'optimal' | 'degraded' | 'critical';
  physicalDistanceMeters: number;
}

