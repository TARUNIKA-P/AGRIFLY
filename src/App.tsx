/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  INITIAL_DRONES, 
  INITIAL_PEST_DETECTIONS, 
  FIELD_ZONES, 
  INITIAL_MESH_STATS 
} from './data/mockData';
import { DroneUnit, PestDetection, SwarmMeshStats, WeatherData } from './types/telemetry';
import { INITIAL_WEATHER, simulateWeatherStep, createPresetWeather, fetchWeatherService } from './services/weatherService';
import { TopNav } from './components/TopNav';
import { TopTelemetryRibbon } from './components/TopTelemetryRibbon';
import { MissionHUD } from './components/MissionHUD';
import { BottomExecutionDrawer } from './components/BottomExecutionDrawer';
import { SwarmMeshView } from './components/SwarmMeshView';
import { MicroSprayStation } from './components/MicroSprayStation';
import { FieldAnalyticsView } from './components/FieldAnalyticsView';
import { PestDetailModal } from './components/PestDetailModal';
import { GoogleMapsFieldView } from './components/GoogleMapsFieldView';
import { ThreeDDroneViewer } from './components/ThreeDDroneViewer';
import { LiveVoiceDialog } from './components/LiveVoiceDialog';
import { AudioTranscribeModal } from './components/AudioTranscribeModal';
import { FarmerSimpleView, ColorTheme } from './components/FarmerSimpleView';
import { GeminiChatbotModal } from './components/GeminiChatbotModal';
import { LanguageCode, SUPPORTED_LANGUAGES, TRANSLATIONS } from './data/translations';
import { LanguageSelectModal } from './components/LanguageSelectModal';
import { OfflineIndicatorModal } from './components/OfflineIndicatorModal';

export default function App() {
  const [colorTheme, setColorTheme] = useState<ColorTheme>('emerald');
  const [userMode, setUserMode] = useState<'simple' | 'pro'>('simple');
  const [activeTab, setActiveTab] = useState<'farmer' | 'mission' | 'google-maps' | 'three-d' | 'mesh' | 'spraying'>('farmer');
  const [isArmed, setIsArmed] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [sprayOverrideActive, setSprayOverrideActive] = useState<boolean>(false);

  // Language & Installation state ("when we install the app it has to ask which type language do you want. first priority is english(IN)")
  const [language, setLanguage] = useState<LanguageCode>(() => {
    return (localStorage.getItem('agrifly_language') as LanguageCode) || 'en';
  });
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(() => {
    return !localStorage.getItem('agrifly_lang_chosen');
  });
  const [isFirstInstall, setIsFirstInstall] = useState<boolean>(() => {
    return !localStorage.getItem('agrifly_lang_chosen');
  });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(false);

  // Modals for Gemini Chatbot, Live Voice & Transcribe
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [chatbotInitialRole, setChatbotInitialRole] = useState<'farmer' | 'avionics' | 'pathologist'>('farmer');
  const [isVoiceLiveOpen, setIsVoiceLiveOpen] = useState<boolean>(false);
  const [isTranscribeOpen, setIsTranscribeOpen] = useState<boolean>(false);

  // Connectivity & Field Offline Mode state (Swarm Edge Processing in Remote Farmland)
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState<boolean>(false);

  const isEffectiveOffline = !isOnline || isSimulatedOffline;

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleToggleSimulateOffline = () => {
    setIsSimulatedOffline((prev) => !prev);
  };

  // PWA beforeinstallprompt & appinstalled event handling
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
      // After app is installed, immediately ask which type language do you want!
      setIsFirstInstall(true);
      setIsLanguageModalOpen(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsAppInstalled(true);
        // After installation accepted, immediately ask which type language do you want!
        setIsFirstInstall(true);
        setIsLanguageModalOpen(true);
      }
      setDeferredPrompt(null);
    } else {
      // If already installed or browser fallback, open language preference modal
      setIsFirstInstall(true);
      setIsLanguageModalOpen(true);
    }
  };

  const handleSelectLanguage = (lang: LanguageCode) => {
    setLanguage(lang);
    localStorage.setItem('agrifly_language', lang);
    localStorage.setItem('agrifly_lang_chosen', 'true');
    setIsFirstInstall(false);
  };

  // Google Maps Platform Quota Exceeded Banner state (Tier 2 defense)
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState<boolean>(false);

  // Weather state & live simulation
  const [weather, setWeather] = useState<WeatherData>(INITIAL_WEATHER);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);

  useEffect(() => {
    const handleQuota = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Periodic subtle weather drift ticker
  useEffect(() => {
    const weatherTimer = setInterval(() => {
      setWeather((prev) => simulateWeatherStep(prev));
    }, 6000);
    return () => clearInterval(weatherTimer);
  }, []);

  const handleRefreshWeather = async () => {
    setIsWeatherLoading(true);
    const fresh = await fetchWeatherService();
    setWeather(fresh);
    setIsWeatherLoading(false);
  };

  const handleSelectWeatherPreset = (preset: 'calm' | 'moderate' | 'gusty') => {
    const updated = createPresetWeather(preset);
    setWeather(updated);
    setMissionLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        type: updated.sprayDriftRisk === 'High' ? 'alert' : 'info',
        message: `Weather Preset '${preset.toUpperCase()}': Wind ${updated.windSpeed}m/s (${updated.windDirectionLabel}), Humidity ${updated.humidity}%. Drift risk: ${updated.sprayDriftRisk}. Auto-tuned nozzle to ${updated.recommendedNozzleMicrons}µm.`,
      },
      ...prev,
    ]);
  };

  const [drones, setDrones] = useState<DroneUnit[]>(INITIAL_DRONES);
  const [selectedDroneId, setSelectedDroneId] = useState<string>('drone-1');
  const [pestDetections, setPestDetections] = useState<PestDetection[]>(INITIAL_PEST_DETECTIONS);
  const [selectedPestModal, setSelectedPestModal] = useState<PestDetection | null>(null);

  const [meshStats] = useState<SwarmMeshStats>(INITIAL_MESH_STATS);
  const [areaSurveyedHa, setAreaSurveyedHa] = useState<number>(18.6);
  const totalAreaHa = 24.0;
  const chemicalSavedPercent = 86.4;

  const [sprayedPoints, setSprayedPoints] = useState<{ x: number; y: number; timestamp: number }[]>([
    { x: 52, y: 56, timestamp: Date.now() - 5000 },
    { x: 53, y: 57, timestamp: Date.now() - 4000 },
    { x: 54, y: 58, timestamp: Date.now() - 3000 },
    { x: 67, y: 43, timestamp: Date.now() - 12000 },
  ]);

  const [missionLogs, setMissionLogs] = useState<{ id: string; time: string; message: string; type: 'info' | 'spray' | 'alert' }[]>([
    {
      id: 'log-1',
      time: '10:07:51',
      type: 'info',
      message: 'Apex-Alpha completed LIDAR canopy elevation pass across Sector 01.',
    },
    {
      id: 'log-2',
      time: '10:06:42',
      type: 'spray',
      message: 'Vector-Bravo deployed 22 mL micro-dose on Powdery Mildew at Grid (67%, 43%).',
    },
    {
      id: 'log-3',
      time: '10:04:18',
      type: 'spray',
      message: 'Targeted PWM micro-spray successfully quarantined Cotton Aphid colony in Cabernet block.',
    },
    {
      id: 'log-4',
      time: '10:01:05',
      type: 'info',
      message: 'Decentralized 4-node P2P mesh formed. GPS-denied VIO locked with 0.04m error envelope.',
    },
  ]);

  // Simulation loop when isPlaying & isArmed are active (influenced by live wind & humidity)
  useEffect(() => {
    if (!isPlaying || !isArmed) return;

    const interval = setInterval(() => {
      setDrones((prevDrones) =>
        prevDrones.map((drone) => {
          // Calculate movement step towards targetWaypoint
          const dx = drone.targetWaypoint.x - drone.position.x;
          const dy = drone.targetWaypoint.y - drone.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let newX = drone.position.x;
          let newY = drone.position.y;
          let newTarget = { ...drone.targetWaypoint };
          let newHeading = drone.heading;
          let newSprayActive = drone.sprayActive;

          if (dist > 1.2) {
            // Atmospheric wind vector influence on flight
            const windAngleRad = (weather.windDirectionDeg * Math.PI) / 180;
            const windDriftX = Math.cos(windAngleRad) * (weather.windSpeed * 0.012);
            const windDriftY = Math.sin(windAngleRad) * (weather.windSpeed * 0.012);

            // Ground speed modulation by relative wind heading
            const baseHeading = Math.round((Math.atan2(dy, dx) * 180) / Math.PI + 90);
            const relativeAngle = Math.abs(((baseHeading - weather.windDirectionDeg + 180) % 360) - 180);
            const speedMod = 1 + (relativeAngle > 90 ? -1 : 1) * (weather.windSpeed * 0.03);
            const effectiveSpeed = Math.max(1.8, Math.min(6.5, drone.groundSpeed * speedMod));

            // Crab angle compensation to hold flight corridor
            const crabAngle = Math.round(
              (weather.windSpeed * 1.35) * Math.sin(((weather.windDirectionDeg - baseHeading) * Math.PI) / 180)
            );
            newHeading = (baseHeading + crabAngle + 360) % 360;

            const step = effectiveSpeed * 0.15;
            newX += (dx / dist) * step + windDriftX;
            newY += (dy / dist) * step + windDriftY;
          } else {
            // Reached waypoint: pick next row sweep waypoint
            const randomOffsetX = (Math.random() - 0.5) * 20;
            const randomOffsetY = (Math.random() - 0.5) * 20;
            newTarget = {
              x: Math.max(15, Math.min(85, drone.position.x + randomOffsetX)),
              y: Math.max(15, Math.min(85, drone.position.y + randomOffsetY)),
            };
          }

          // Weather-modulated spray rate: if High drift risk, throttle nozzle
          let currentSprayFlow = drone.sprayFlowRate;
          if (weather.sprayDriftRisk === 'High') {
            currentSprayFlow = 0.12; // Throttled coarse spray
          } else if (weather.sprayDriftRisk === 'Moderate') {
            currentSprayFlow = 0.32;
          } else {
            currentSprayFlow = 0.48;
          }

          // Spray simulation for Micro-Sprayer drone (drone-2) or when sprayOverrideActive
          if (drone.id === 'drone-2' || sprayOverrideActive) {
            newSprayActive = weather.sprayDriftRisk !== 'High'; // Auto-pause if severe gust
            // record sprayed point occasionally
            if (newSprayActive && Math.random() > 0.6) {
              setSprayedPoints((prev) => [
                ...prev.slice(-30),
                { x: Math.round(newX), y: Math.round(newY), timestamp: Date.now() },
              ]);
            }
          }

          // Subtle natural canopy terrain height fluctuation (1.6m - 2.3m)
          const altitudeJitter = Math.sin(Date.now() / 2000 + drone.position.x) * 0.08;
          const newAltitude = Math.max(1.4, Math.min(3.0, drone.altitudeAGL + altitudeJitter));

          return {
            ...drone,
            position: { x: Number(newX.toFixed(2)), y: Number(newY.toFixed(2)) },
            targetWaypoint: newTarget,
            heading: (newHeading + 360) % 360,
            altitudeAGL: Number(newAltitude.toFixed(2)),
            sprayActive: newSprayActive,
            sprayFlowRate: currentSprayFlow,
            payloadRemaining: drone.sprayActive
              ? Math.max(0.1, drone.payloadRemaining - 0.005)
              : drone.payloadRemaining,
          };
        })
      );

      // Increment surveyed area gradually
      setAreaSurveyedHa((prev) => Math.min(totalAreaHa, prev + 0.008));
    }, 400);

    return () => clearInterval(interval);
  }, [isPlaying, isArmed, sprayOverrideActive, weather]);

  const handleToggleArm = () => {
    setIsArmed(!isArmed);
    setMissionLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        type: 'alert',
        message: isArmed ? 'Swarm disarmed by operator. Motors in standby.' : 'Swarm armed. Motors active and ready for autonomous sortie.',
      },
      ...prev,
    ]);
  };

  const handleTriggerRTH = () => {
    setIsPlaying(true);
    setDrones((prev) =>
      prev.map((d) => ({
        ...d,
        status: 'rth',
        targetWaypoint: { x: 22, y: 78 }, // Base station coords
        sprayActive: false,
      }))
    );
    setMissionLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        type: 'alert',
        message: 'EMERGENCY RTH EXECUTED: All 4 units navigating to base landing pad at constant canopy clearance.',
      },
      ...prev,
    ]);
  };

  const handleToggleSprayOverride = () => {
    const nextState = !sprayOverrideActive;
    setSprayOverrideActive(nextState);
    setDrones((prev) =>
      prev.map((d) => (d.id === 'drone-2' ? { ...d, sprayActive: nextState } : d))
    );
    setMissionLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        type: 'spray',
        message: nextState
          ? 'Manual micro-spray override ENGAGED on Vector-Bravo nozzles.'
          : 'Manual micro-spray override DISENGAGED. Returned to edge-AI autonomous trigger mode.',
      },
      ...prev,
    ]);
  };

  const handleAddWaypoint = (x: number, y: number) => {
    setDrones((prev) =>
      prev.map((d) => (d.id === selectedDroneId ? { ...d, targetWaypoint: { x, y } } : d))
    );
    setMissionLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        type: 'info',
        message: `Custom waypoint assigned to ${selectedDroneId}: Grid (${x}%, ${y}%).`,
      },
      ...prev,
    ]);
  };

  const handleApplySpray = (pestId: string) => {
    setPestDetections((prev) =>
      prev.map((p) => (p.id === pestId ? { ...p, sprayStatus: 'treated' as const } : p))
    );

    const targetPest = pestDetections.find((p) => p.id === pestId);
    if (targetPest) {
      setSprayedPoints((prev) => [
        ...prev,
        { x: targetPest.location.x, y: targetPest.location.y, timestamp: Date.now() },
      ]);
      setMissionLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          type: 'spray',
          message: `Micro-spray treatment completed for ${targetPest.pestName} at (${targetPest.location.x}%, ${targetPest.location.y}%).`,
        },
        ...prev,
      ]);
    }
  };

  const handleSimulateNewDetection = () => {
    const pestCatalog = [
      { name: 'Grapevine Mealybug', sci: 'Pseudococcus maritimus', crop: 'Cabernet Sauvignon' },
      { name: 'Citrus Red Mite', sci: 'Panonychus citri', crop: 'Valencia Orange' },
      { name: 'Olive Leaf Spot', sci: 'Spilocaea oleaginea', crop: 'Mission Olive' },
    ];
    const pick = pestCatalog[Math.floor(Math.random() * pestCatalog.length)];
    const newId = `det-${Date.now()}`;
    const newDetection: PestDetection = {
      id: newId,
      droneId: 'drone-3',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      cropType: pick.crop,
      pestName: pick.name,
      scientificName: pick.sci,
      severity: Math.random() > 0.5 ? 'critical' : 'moderate',
      confidence: Number((88 + Math.random() * 11).toFixed(1)),
      location: {
        x: Math.round(25 + Math.random() * 55),
        y: Math.round(25 + Math.random() * 55),
      },
      sprayStatus: 'queued',
      sprayDoseMl: 28,
      ndviScore: 0.49,
      box: { top: 32, left: 40, width: 22, height: 24 },
    };

    setPestDetections((prev) => [newDetection, ...prev]);
    setMissionLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        time: newDetection.timestamp,
        type: 'alert',
        message: `Edge-AI Alert: Detected ${newDetection.pestName} (${newDetection.confidence}% Conf) in ${newDetection.cropType}.`,
      },
      ...prev,
    ]);
  };

  const selectedDrone = drones.find((d) => d.id === selectedDroneId) || drones[0];

  const handleToggleUserMode = () => {
    setUserMode((prev) => {
      const next = prev === 'simple' ? 'pro' : 'simple';
      if (next === 'simple' && activeTab === 'mission') {
        setActiveTab('farmer');
      } else if (next === 'pro' && activeTab === 'farmer') {
        setActiveTab('mission');
      }
      return next;
    });
  };

  const getAppBgClass = () => {
    switch (colorTheme) {
      case 'emerald': return 'bg-[#041a12] text-[#ecfdf5]';
      case 'sunlight': return 'bg-[#09090b] text-[#fef3c7]';
      case 'harvest': return 'bg-[#180a05] text-[#ffedd5]';
      default: return 'bg-[#0b1326] text-[#dae2fd]';
    }
  };

  return (
    <div className={`min-h-screen ${getAppBgClass()} flex flex-col font-body transition-colors duration-500`}>
      {/* Tier 2 Demo Key Quota Defense Banner */}
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Top Bar Header with Farmer Simple vs Pro Switcher & Copilot */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isArmed={isArmed}
        onToggleArm={handleToggleArm}
        userMode={userMode}
        onToggleUserMode={handleToggleUserMode}
        onOpenChatbot={() => {
          setChatbotInitialRole(userMode === 'simple' ? 'farmer' : 'avionics');
          setIsChatbotOpen(true);
        }}
        colorTheme={colorTheme}
        onChangeColorTheme={setColorTheme}
        language={language}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        onInstallApp={handleInstallApp}
        isAppInstalled={isAppInstalled}
        isEffectiveOffline={isEffectiveOffline}
        onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
      />

      {/* Rugged Cockpit Top Telemetry Ribbon */}
      <TopTelemetryRibbon
        selectedDrone={selectedDrone}
        drones={drones}
        meshStats={meshStats}
        onOpenVoiceDialog={() => setIsVoiceLiveOpen(true)}
        onOpenTranscribeModal={() => setIsTranscribeOpen(true)}
        onOpenMeshTab={() => setActiveTab('mesh')}
        onOpenChatbot={() => {
          setChatbotInitialRole(userMode === 'simple' ? 'farmer' : 'avionics');
          setIsChatbotOpen(true);
        }}
        userMode={userMode}
        isEffectiveOffline={isEffectiveOffline}
        onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
      />

      {/* Main Screen Switcher */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'farmer' && (
          <FarmerSimpleView
            drones={drones}
            pestDetections={pestDetections}
            fieldZones={FIELD_ZONES}
            weather={weather}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onTriggerRTH={handleTriggerRTH}
            onApplySpray={handleApplySpray}
            onSelectPest={setSelectedPestModal}
            onAddWaypoint={handleAddWaypoint}
            onSwitchToProMode={() => {
              setUserMode('pro');
              setActiveTab('mission');
            }}
            onOpenChatbot={() => {
              setChatbotInitialRole('farmer');
              setIsChatbotOpen(true);
            }}
            colorTheme={colorTheme}
            onChangeColorTheme={setColorTheme}
            language={language}
            onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
            isEffectiveOffline={isEffectiveOffline}
            onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
          />
        )}

        {activeTab === 'mission' && (
          <>
            <MissionHUD
              drones={drones}
              selectedDroneId={selectedDroneId}
              onSelectDrone={setSelectedDroneId}
              pestDetections={pestDetections}
              onSelectPest={setSelectedPestModal}
              fieldZones={FIELD_ZONES}
              isArmed={isArmed}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onTriggerRTH={handleTriggerRTH}
              onToggleSprayOverride={handleToggleSprayOverride}
              sprayOverrideActive={sprayOverrideActive}
              onAddWaypoint={handleAddWaypoint}
              sprayedPoints={sprayedPoints}
              weather={weather}
              onRefreshWeather={handleRefreshWeather}
              onSelectWeatherPreset={handleSelectWeatherPreset}
              isWeatherLoading={isWeatherLoading}
            />
            <BottomExecutionDrawer
              drones={drones}
              pestDetections={pestDetections}
              areaSurveyedHa={areaSurveyedHa}
              totalAreaHa={totalAreaHa}
              chemicalSavedPercent={chemicalSavedPercent}
              missionLogs={missionLogs}
            />
          </>
        )}

        {activeTab === 'mesh' && (
          <SwarmMeshView
            drones={drones}
            meshStats={meshStats}
            selectedDroneId={selectedDroneId}
            onSelectDrone={setSelectedDroneId}
          />
        )}

        {activeTab === 'google-maps' && (
          <GoogleMapsFieldView
            drones={drones}
            selectedDroneId={selectedDroneId}
            onSelectDrone={setSelectedDroneId}
            pestDetections={pestDetections}
            onSelectPest={setSelectedPestModal}
            onAddWaypoint={handleAddWaypoint}
          />
        )}

        {activeTab === 'three-d' && (
          <ThreeDDroneViewer />
        )}

        {activeTab === 'spraying' && (
          <MicroSprayStation
            drones={drones}
            selectedDroneId={selectedDroneId}
            onSelectDrone={setSelectedDroneId}
            onTestNozzlePulse={() => {
              setSprayedPoints((prev) => [
                ...prev,
                { x: selectedDrone.position.x, y: selectedDrone.position.y, timestamp: Date.now() },
              ]);
            }}
          />
        )}
      </main>

      {/* Pest Quarantine & Treatment Modal */}
      <PestDetailModal
        pest={selectedPestModal}
        onClose={() => setSelectedPestModal(null)}
        onApplySpray={handleApplySpray}
      />

      {/* Real-Time Live API Voice Conversation Dialog (gemini-3.8-live) */}
      <LiveVoiceDialog
        isOpen={isVoiceLiveOpen}
        onClose={() => setIsVoiceLiveOpen(false)}
      />

      {/* Audio Transcription Modal (gemini-3.5-transcribe) */}
      <AudioTranscribeModal
        isOpen={isTranscribeOpen}
        onClose={() => setIsTranscribeOpen(false)}
        onAddMissionLog={(msg) => {
          setMissionLogs((prev) => [
            {
              id: `log-${Date.now()}`,
              time: new Date().toLocaleTimeString('en-US', { hour12: false }),
              type: 'info',
              message: msg,
            },
            ...prev,
          ]);
        }}
      />

      {/* Multi-Turn Gemini AI Swarm Copilot Modal */}
      <GeminiChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        initialRole={chatbotInitialRole}
      />

      {/* Language Selection & First-Install Onboarding Modal */}
      <LanguageSelectModal
        isOpen={isLanguageModalOpen}
        currentLanguage={language}
        onSelectLanguage={handleSelectLanguage}
        onClose={() => setIsLanguageModalOpen(false)}
        isFirstInstall={isFirstInstall}
        installPrompt={deferredPrompt}
        onInstallApp={handleInstallApp}
        isAppInstalled={isAppInstalled}
      />

      {/* Field Offline Mode & Swarm Edge Processing Modal */}
      <OfflineIndicatorModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        isOnline={isOnline}
        isSimulatedOffline={isSimulatedOffline}
        onToggleSimulateOffline={handleToggleSimulateOffline}
        language={language}
      />
    </div>
  );
}
