import { WeatherData } from '../types/telemetry';

const degToCompass = (deg: number): string => {
  const val = Math.floor((deg / 22.5) + 0.5);
  const arr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return arr[val % 16];
};

export const calculateDriftRisk = (windSpeed: number, deltaT: number): 'Low' | 'Moderate' | 'High' => {
  // Delta T: 2°C - 8°C is ideal for spraying. If wind > 5.5 m/s or delta T > 8°C -> High drift risk
  if (windSpeed > 6.0 || deltaT > 9.0) return 'High';
  if (windSpeed > 3.8 || deltaT > 7.0 || deltaT < 1.5) return 'Moderate';
  return 'Low';
};

export const getRecommendedMicrons = (windSpeed: number): number => {
  if (windSpeed > 5.5) return 220; // Coarse droplet to prevent drift
  if (windSpeed > 3.5) return 160; // Medium droplet
  return 110; // Ultra-fine micro-droplet for dense canopy penetration
};

export const INITIAL_WEATHER: WeatherData = {
  windSpeed: 3.4,
  windGust: 5.1,
  windDirectionDeg: 235,
  windDirectionLabel: 'SW',
  humidity: 64,
  temperature: 22.8,
  barometricHpa: 1014.2,
  canopyDeltaT: 3.6,
  sprayDriftRisk: 'Low',
  recommendedNozzleMicrons: 120,
  lastUpdated: '10:30:00',
};

export const fetchWeatherService = async (): Promise<WeatherData> => {
  // Simulate network request to on-field micro-weather meteorological station
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...INITIAL_WEATHER });
    }, 150);
  });
};

export const simulateWeatherStep = (prev: WeatherData): WeatherData => {
  // Natural subtle drift in wind and humidity
  const windJitter = (Math.random() - 0.5) * 0.4;
  const newSpeed = Math.max(0.8, Math.min(8.5, prev.windSpeed + windJitter));
  const newGust = Math.max(newSpeed, newSpeed + Math.random() * 2.2);

  const dirJitter = Math.round((Math.random() - 0.5) * 6);
  const newDirDeg = (prev.windDirectionDeg + dirJitter + 360) % 360;

  const humJitter = (Math.random() - 0.5) * 0.8;
  const newHumidity = Math.round(Math.max(30, Math.min(95, prev.humidity + humJitter)));

  const tempJitter = (Math.random() - 0.5) * 0.1;
  const newTemp = Number((prev.temperature + tempJitter).toFixed(1));

  // Delta T estimation: dry bulb temp minus wet bulb temp approximated from humidity
  const newDeltaT = Number((((100 - newHumidity) / 5) * 0.5 + (newTemp - 18) * 0.3).toFixed(1));

  const driftRisk = calculateDriftRisk(newSpeed, newDeltaT);
  const recommendedMicrons = getRecommendedMicrons(newSpeed);

  return {
    windSpeed: Number(newSpeed.toFixed(1)),
    windGust: Number(newGust.toFixed(1)),
    windDirectionDeg: newDirDeg,
    windDirectionLabel: degToCompass(newDirDeg),
    humidity: newHumidity,
    temperature: newTemp,
    barometricHpa: Number((prev.barometricHpa + (Math.random() - 0.5) * 0.1).toFixed(1)),
    canopyDeltaT: newDeltaT,
    sprayDriftRisk: driftRisk,
    recommendedNozzleMicrons: recommendedMicrons,
    lastUpdated: new Date().toLocaleTimeString('en-US', { hour12: false }),
  };
};

export const createPresetWeather = (preset: 'calm' | 'moderate' | 'gusty'): WeatherData => {
  if (preset === 'calm') {
    return {
      windSpeed: 1.4,
      windGust: 2.2,
      windDirectionDeg: 180,
      windDirectionLabel: 'S',
      humidity: 75,
      temperature: 20.2,
      barometricHpa: 1016.0,
      canopyDeltaT: 2.4,
      sprayDriftRisk: 'Low',
      recommendedNozzleMicrons: 90,
      lastUpdated: new Date().toLocaleTimeString('en-US', { hour12: false }),
    };
  }
  if (preset === 'gusty') {
    return {
      windSpeed: 6.8,
      windGust: 9.4,
      windDirectionDeg: 310,
      windDirectionLabel: 'NW',
      humidity: 42,
      temperature: 26.5,
      barometricHpa: 1009.2,
      canopyDeltaT: 8.2,
      sprayDriftRisk: 'High',
      recommendedNozzleMicrons: 240,
      lastUpdated: new Date().toLocaleTimeString('en-US', { hour12: false }),
    };
  }
  // Moderate
  return { ...INITIAL_WEATHER };
};
