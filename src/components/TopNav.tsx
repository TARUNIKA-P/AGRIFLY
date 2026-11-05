import React from 'react';
import { ShieldAlert, ShieldCheck, Leaf, Bot, Palette, Globe, Download, Smartphone, Check, WifiOff, Radio } from 'lucide-react';
import { ColorTheme } from './FarmerSimpleView';
import { LanguageCode, SUPPORTED_LANGUAGES, TRANSLATIONS } from '../data/translations';

interface TopNavProps {
  activeTab: 'farmer' | 'mission' | 'google-maps' | 'three-d' | 'mesh' | 'spraying';
  setActiveTab: (tab: 'farmer' | 'mission' | 'google-maps' | 'three-d' | 'mesh' | 'spraying') => void;
  isArmed: boolean;
  onToggleArm: () => void;
  userMode: 'simple' | 'pro';
  onToggleUserMode: () => void;
  onOpenChatbot?: () => void;
  colorTheme?: ColorTheme;
  onChangeColorTheme?: (theme: ColorTheme) => void;
  language?: LanguageCode;
  onOpenLanguageModal?: () => void;
  onInstallApp?: () => void;
  isAppInstalled?: boolean;
  isEffectiveOffline?: boolean;
  onOpenOfflineModal?: () => void;
  activeDroneCount?: number;
  onAddDrone?: () => void;
  onRemoveDrone?: () => void;
  onSetDroneCount?: (count: number) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  isArmed,
  onToggleArm,
  userMode,
  onToggleUserMode,
  onOpenChatbot,
  colorTheme = 'emerald',
  onChangeColorTheme,
  language = 'en',
  onOpenLanguageModal,
  onInstallApp,
  isAppInstalled = false,
  isEffectiveOffline = false,
  onOpenOfflineModal,
  activeDroneCount = 1,
  onAddDrone,
  onRemoveDrone,
  onSetDroneCount,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
  const currentLangInfo = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="flex items-center justify-between gap-2.5 md:gap-5 px-3 sm:px-4 md:px-6 py-2.5 bg-[#0b1326] border-b border-[#334155] select-none z-30">
      {/* Zone 1: Wordmark & Rupee Badge */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-2.5 h-2.5 bg-[#10b981] rounded-xs shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base md:text-lg font-black tracking-tight text-[#dae2fd] whitespace-nowrap font-display">
              {t.appName}
            </span>
            <span className="px-1.5 py-0.5 bg-[#047857] text-white border border-[#10b981] rounded-xs text-[10px] font-mono font-bold flex items-center gap-0.5 shadow-xs">
              <span>₹</span>
              <span className="hidden sm:inline">{t.rupeeBadge}</span>
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#87948b] hidden md:block">
            {userMode === 'simple' ? t.tagline : 'Autonomous Multi-Drone Edge-AI Precision Agronomy'}
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links (Adapted for Simple vs Pro mode) */}
      <nav className="hidden xl:flex items-center gap-4 text-xs font-semibold">
        {userMode === 'simple' ? (
          <>
            <button
              onClick={() => setActiveTab('farmer')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'farmer'
                  ? 'text-[#68dba9] border-b-2 border-[#68dba9] font-bold'
                  : 'text-[#bccac0] hover:text-[#dae2fd]'
              }`}
            >
              <Leaf className="w-3.5 h-3.5 text-[#68dba9]" />
              <span>{t.navOverview}</span>
            </button>
            <button
              onClick={() => setActiveTab('google-maps')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer ${
                activeTab === 'google-maps'
                  ? 'text-[#68dba9] border-b-2 border-[#68dba9] font-bold'
                  : 'text-[#bccac0] hover:text-[#dae2fd]'
              }`}
            >
              {t.navMap}
            </button>
            <button
              onClick={() => setActiveTab('spraying')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer ${
                activeTab === 'spraying'
                  ? 'text-[#68dba9] border-b-2 border-[#68dba9] font-bold'
                  : 'text-[#bccac0] hover:text-[#dae2fd]'
              }`}
            >
              {t.navSprayer}
            </button>
            <button
              onClick={() => setActiveTab('three-d')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer ${
                activeTab === 'three-d'
                  ? 'text-[#68dba9] border-b-2 border-[#68dba9] font-bold'
                  : 'text-[#bccac0] hover:text-[#dae2fd]'
              }`}
            >
              {t.nav3DDrone}
            </button>
            <button
              onClick={() => setActiveTab('mesh')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer ${
                activeTab === 'mesh'
                  ? 'text-[#68dba9] border-b-2 border-[#68dba9] font-bold'
                  : 'text-[#bccac0] hover:text-[#dae2fd]'
              }`}
            >
              {t.navMesh}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('mission')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer ${
                activeTab === 'mission'
                  ? 'text-[#68dba9] border-b-2 border-[#68dba9] font-semibold'
                  : 'text-[#bccac0] hover:text-[#dae2fd]'
              }`}
            >
              Mission HUD
            </button>
            <button
              onClick={() => setActiveTab('mesh')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer ${
                activeTab === 'mesh'
                  ? 'text-[#68dba9] border-b-2 border-[#68dba9] font-semibold'
                  : 'text-[#bccac0] hover:text-[#dae2fd]'
              }`}
            >
              Swarm Mesh
            </button>
            <button
              onClick={() => setActiveTab('google-maps')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer ${
                activeTab === 'google-maps'
                  ? 'text-[#68dba9] border-b-2 border-[#68dba9] font-semibold'
                  : 'text-[#bccac0] hover:text-[#dae2fd]'
              }`}
            >
              Google Maps
            </button>
            <button
              onClick={() => setActiveTab('three-d')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer ${
                activeTab === 'three-d'
                  ? 'text-[#68dba9] border-b-2 border-[#68dba9] font-semibold'
                  : 'text-[#bccac0] hover:text-[#dae2fd]'
              }`}
            >
              3D Avionics
            </button>
            <button
              onClick={() => setActiveTab('spraying')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer ${
                activeTab === 'spraying'
                  ? 'text-[#68dba9] border-b-2 border-[#68dba9] font-semibold'
                  : 'text-[#bccac0] hover:text-[#dae2fd]'
              }`}
            >
              Micro-Spray
            </button>
          </>
        )}
      </nav>

      {/* Zone 3: Drone Fleet Selector, Offline Mode Indicator, Language Selector, PWA Install, Colour Theme, Mode & Arm */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Drone Fleet Quick Count (Min 1, Max 4) */}
        <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 bg-[#002f38] border border-[#4cd7f6] rounded-xs text-xs">
          <span className="font-bold text-[#4cd7f6] flex items-center gap-1">
            <span>🚁</span>
            <span className="font-mono font-black">{activeDroneCount}/4</span>
            <span className="hidden xl:inline text-[#dae2fd]">Drones</span>
          </span>
          {onAddDrone && onRemoveDrone && (
            <div className="flex items-center gap-1 ml-1 pl-1 border-l border-white/20">
              <button
                type="button"
                onClick={onRemoveDrone}
                disabled={activeDroneCount <= 1}
                title="Remove 1 drone (Minimum 1)"
                className="w-4 h-4 flex items-center justify-center bg-[#10233b] hover:bg-[#1a3455] disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold rounded-xs text-[10px] cursor-pointer"
              >
                −
              </button>
              <button
                type="button"
                onClick={onAddDrone}
                disabled={activeDroneCount >= 4}
                title="Add 1 drone (Up to 4)"
                className="px-1.5 h-4 flex items-center justify-center bg-[#10b981] hover:bg-[#059669] disabled:opacity-30 disabled:cursor-not-allowed text-[#002114] font-black rounded-xs text-[10px] cursor-pointer"
              >
                <span>+</span>
                <span className="hidden sm:inline text-[9px]">Add</span>
              </button>
            </div>
          )}
        </div>
        {/* Swarm Offline / Connectivity Indicator */}
        {onOpenOfflineModal && (
          <button
            onClick={onOpenOfflineModal}
            title={isEffectiveOffline ? "Offline Mode: Swarm is running safely on Local Edge Radio (Click for details)" : "Online: Swarm connected to Cloud and Local Radio (Click for details)"}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xs text-xs font-bold transition-all cursor-pointer shadow-xs border ${
              isEffectiveOffline
                ? 'bg-[#2a1e0b] border-amber-400 text-amber-300 hover:bg-[#38280f] shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                : 'bg-[#003825] border-[#10b981] text-[#10b981] hover:bg-[#005137]'
            }`}
          >
            {isEffectiveOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
                <span className="hidden md:inline">📡 OFFLINE · LOCAL SWARM</span>
                <span className="md:hidden">📡 OFFLINE</span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                <span className="hidden md:inline">🟢 SWARM READY</span>
                <span className="md:hidden">🟢 READY</span>
              </>
            )}
          </button>
        )}

        {/* Language Picker Trigger Button */}
        {onOpenLanguageModal && (
          <button
            onClick={onOpenLanguageModal}
            title={t.selectLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#171f33] hover:bg-[#1f2a44] border-2 border-[#10b981] rounded-xs text-xs font-bold text-white transition-all cursor-pointer shadow-sm hover:scale-102"
          >
            <Globe className="w-3.5 h-3.5 text-[#10b981]" />
            <span className="text-sm">{currentLangInfo.flag}</span>
            <span className="font-bold text-white hidden sm:inline">{currentLangInfo.nativeName}</span>
          </button>
        )}

        {/* PWA App Install Button */}
        {onInstallApp && (
          <button
            onClick={onInstallApp}
            title={isAppInstalled ? t.alreadyInstalled : t.installAppBtn}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xs text-xs font-bold transition-all cursor-pointer shadow-xs ${
              isAppInstalled
                ? 'bg-[#003825] border border-[#10b981] text-[#10b981]'
                : 'bg-[#10b981] hover:bg-[#059669] text-[#002114] border border-[#10b981]'
            }`}
          >
            {isAppInstalled ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Installed</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Install App</span>
              </>
            )}
          </button>
        )}

        {/* Colour Theme Picker Bar */}
        {onChangeColorTheme && (
          <div className="hidden lg:flex items-center gap-1.5 bg-[#171f33] border border-[#334155] px-2 py-1 rounded-xs" title={t.themeTooltip}>
            <Palette className="w-3.5 h-3.5 text-[#bccac0]" />
            <button
              onClick={() => onChangeColorTheme('emerald')}
              title="Kisan Emerald (Farm Green)"
              className={`w-3.5 h-3.5 rounded-full bg-[#10b981] border transition-transform cursor-pointer ${colorTheme === 'emerald' ? 'scale-125 border-white ring-1 ring-white' : 'border-transparent opacity-70'}`}
            />
            <button
              onClick={() => onChangeColorTheme('sunlight')}
              title="Sunlight High-Contrast (Bright Gold)"
              className={`w-3.5 h-3.5 rounded-full bg-[#f59e0b] border transition-transform cursor-pointer ${colorTheme === 'sunlight' ? 'scale-125 border-white ring-1 ring-white' : 'border-transparent opacity-70'}`}
            />
            <button
              onClick={() => onChangeColorTheme('harvest')}
              title="Harvest Earth (Terracotta Wheat)"
              className={`w-3.5 h-3.5 rounded-full bg-[#ea580c] border transition-transform cursor-pointer ${colorTheme === 'harvest' ? 'scale-125 border-white ring-1 ring-white' : 'border-transparent opacity-70'}`}
            />
            <button
              onClick={() => onChangeColorTheme('navy')}
              title="Cyber Navy (Night Cockpit)"
              className={`w-3.5 h-3.5 rounded-full bg-[#38bdf8] border transition-transform cursor-pointer ${colorTheme === 'navy' ? 'scale-125 border-white ring-1 ring-white' : 'border-transparent opacity-70'}`}
            />
          </div>
        )}

        {/* Gemini Multi-Turn Chatbot */}
        {onOpenChatbot && (
          <button
            onClick={onOpenChatbot}
            title="Open Multi-Turn Gemini Swarm Copilot Chat"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#002f38] hover:bg-[#004754] border border-[#4cd7f6] rounded-xs text-xs font-bold text-[#4cd7f6] transition-all cursor-pointer shadow-xs"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">COPILOT</span>
            <span className="sm:hidden">AI</span>
          </button>
        )}

        {/* Simple vs Pro Mode Switcher */}
        <button
          onClick={onToggleUserMode}
          title="Toggle between Simple Farmer Mode and Pro Avionics Mode"
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 bg-[#171f33] hover:bg-[#1f2a44] border border-[#4cd7f6]/80 rounded-xs text-xs font-semibold text-[#4cd7f6] transition-all cursor-pointer shadow-xs"
        >
          {userMode === 'simple' ? (
            <span className="text-[#68dba9] font-bold">{t.simpleModeBtn}</span>
          ) : (
            <span className="text-[#4cd7f6] font-bold">{t.proModeBtn}</span>
          )}
        </button>

        {/* Master Flight Status Arming */}
        <button
          onClick={onToggleArm}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xs transition-all cursor-pointer whitespace-nowrap ${
            isArmed
              ? 'bg-[#003825] border border-[#68dba9] text-[#68dba9] shadow-[0_0_12px_rgba(104,219,169,0.3)] hover:bg-[#005137]'
              : 'bg-[#222a3d] border border-[#334155] text-[#bccac0] hover:bg-[#2d3449] hover:text-[#dae2fd]'
          }`}
        >
          {isArmed ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-[#68dba9]" />
              <span>{userMode === 'simple' ? t.swarmArmed : 'SWARM ARMED'}</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-[#ffb95f]" />
              <span>{userMode === 'simple' ? t.swarmDisarmed : 'ARM SWARM'}</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
