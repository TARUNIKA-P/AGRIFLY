import React, { useState } from 'react';
import { Globe, Volume2, Check, Download, X, Sparkles, Smartphone } from 'lucide-react';
import { LanguageCode, SUPPORTED_LANGUAGES, TRANSLATIONS } from '../data/translations';

interface LanguageSelectModalProps {
  isOpen: boolean;
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onClose: () => void;
  isFirstInstall?: boolean;
  installPrompt?: any;
  onInstallApp?: () => void;
  isAppInstalled?: boolean;
}

export const LanguageSelectModal: React.FC<LanguageSelectModalProps> = ({
  isOpen,
  currentLanguage,
  onSelectLanguage,
  onClose,
  isFirstInstall = false,
  installPrompt,
  onInstallApp,
  isAppInstalled = false,
}) => {
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(currentLanguage);
  const [speakingLang, setSpeakingLang] = useState<LanguageCode | null>(null);

  if (!isOpen) return null;

  const t = TRANSLATIONS[selectedLang] || TRANSLATIONS.hi;

  const handleSpeakSample = (e: React.MouseEvent, langCode: LanguageCode) => {
    e.stopPropagation();
    const langInfo = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
    if (!langInfo) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(langInfo.greetingText);
      utterance.lang = langInfo.speechCode;
      utterance.rate = 0.9;
      setSpeakingLang(langCode);
      utterance.onend = () => setSpeakingLang(null);
      utterance.onerror = () => setSpeakingLang(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleConfirm = () => {
    onSelectLanguage(selectedLang);
    // Play selected language greeting to confirm
    const langInfo = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang);
    if (langInfo && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(langInfo.greetingText);
      utterance.lang = langInfo.speechCode;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
    onClose();
  };

  const ukLanguage = SUPPORTED_LANGUAGES.find((l) => l.code === 'en') || SUPPORTED_LANGUAGES[0];
  const indianLanguages = SUPPORTED_LANGUAGES.filter((l) => l.code !== 'en' && (l.flag === '🇮🇳' || l.code === 'hi'));
  const otherLanguages = SUPPORTED_LANGUAGES.filter((l) => l.code !== 'en' && l.flag !== '🇮🇳' && l.code !== 'hi');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md select-none animate-fadeIn font-body overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#0b1326] border-2 border-[#10b981] rounded-xs shadow-2xl flex flex-col overflow-hidden text-white my-auto">
        {/* Header Ribbon */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#003825] via-[#0b1326] to-[#002f38] border-b border-[#334155] flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-[#10b981]/20 border border-[#10b981] rounded-xs text-[#10b981]">
                <Globe className="w-5 h-5" />
              </span>
              <div>
                <span className="px-2 py-0.5 bg-[#10b981] text-[#002114] text-[10px] font-black uppercase font-mono tracking-wider rounded-xs">
                  {isFirstInstall ? '📱 NEW INSTALLATION' : '🌍 LANGUAGE SELECTION'}
                </span>
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight font-display flex items-center gap-2">
                  <span>{t.welcomeModalSubtitle}</span>
                </h2>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#bccac0] max-w-2xl">
              {t.welcomeModalPrompt}
            </p>
          </div>

          {!isFirstInstall && (
            <button
              onClick={onClose}
              className="p-2 bg-[#171f33] hover:bg-[#25324d] text-[#bccac0] hover:text-white rounded-xs border border-[#334155] transition-colors cursor-pointer shrink-0"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* PWA Phone Install Prompt Banner */}
        <div className="px-4 sm:px-6 py-3 bg-[#131b2e] border-b border-[#334155] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#002f38] border border-[#4cd7f6] rounded-xs text-[#4cd7f6] shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  {t.installAppModalTitle}
                </span>
                <span className="px-1.5 py-0.2 bg-[#047857] text-[#68dba9] text-[9px] font-bold rounded-xs">
                  PWA APP
                </span>
              </div>
              <p className="text-[11px] text-[#87948b]">
                {t.installAppModalDesc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            {isAppInstalled ? (
              <span className="px-3 py-1.5 bg-[#003825] border border-[#10b981] text-[#10b981] text-xs font-bold rounded-xs flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>{t.alreadyInstalled}</span>
              </span>
            ) : (
              <button
                onClick={onInstallApp}
                className="px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-[#002114] font-extrabold text-xs rounded-xs flex items-center gap-2 shadow-md cursor-pointer transition-transform hover:scale-102"
              >
                <Download className="w-4 h-4" />
                <span>{t.installNowAction}</span>
              </button>
            )}
          </div>
        </div>

        {/* Audio Listen Hint */}
        <div className="px-4 sm:px-6 py-2 bg-[#0c192c] border-b border-[#1e293b] flex items-center justify-between text-xs text-[#4cd7f6]">
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 animate-pulse text-[#10b981]" />
            <span className="font-semibold text-[11px] sm:text-xs">
              {t.welcomeModalAudioHint}
            </span>
          </div>
          <span className="text-[10px] text-[#87948b] font-mono hidden sm:inline">
            14 LANGUAGES SUPPORTED · ₹ RUPEES FIRST
          </span>
        </div>

        {/* Scrollable Language Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 max-h-[50vh]">
          {/* Section 0: TOP FIRST PRIORITY - ENGLISH (UK) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">👑</span>
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 font-mono flex items-center gap-1.5">
                  <span>FIRST PRIORITY LANGUAGE</span>
                </h3>
              </div>
              <span className="px-2 py-0.5 bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider rounded-xs font-mono shadow-xs">
                ⭐ FIRST PRIORITY · DEFAULT
              </span>
            </div>

            {/* Featured UK English Card */}
            <div
              onClick={() => setSelectedLang(ukLanguage.code)}
              className={`relative p-4 rounded-xs border-2 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xl ${
                selectedLang === ukLanguage.code
                  ? 'bg-gradient-to-r from-[#003825] via-[#052e1c] to-[#002f38] border-amber-400 ring-2 ring-amber-400/50 shadow-amber-400/20 scale-101'
                  : 'bg-gradient-to-r from-[#10233b] via-[#131b2e] to-[#10233b] border-amber-400/80 hover:border-amber-300 hover:bg-[#1a2944]'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="text-3xl shrink-0">🇬🇧</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg sm:text-xl font-black text-amber-300 tracking-wide truncate">
                      English (UK)
                    </span>
                    <span className="px-2 py-0.5 bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider rounded-xs shadow-xs">
                      ⭐ FIRST PRIORITY
                    </span>
                    {selectedLang === ukLanguage.code && (
                      <span className="w-4 h-4 rounded-full bg-[#10b981] text-[#002114] flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-amber-200/90 font-medium truncate mt-0.5">
                    United Kingdom · British Accent Flight Avionics · 100% Indian Rupees (₹)
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => handleSpeakSample(e, ukLanguage.code)}
                title="Listen in English (UK)"
                className={`px-3 py-2 rounded-xs border transition-all cursor-pointer shrink-0 flex items-center gap-1.5 text-xs font-bold ${
                  speakingLang === ukLanguage.code
                    ? 'bg-[#10b981] text-[#002114] border-white animate-bounce'
                    : 'bg-amber-400/20 text-amber-300 border-amber-400/60 hover:bg-amber-400 hover:text-black'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span className="text-xs">
                  {speakingLang === ukLanguage.code ? 'Speaking...' : 'Listen UK Voice'}
                </span>
              </button>
            </div>
          </div>

          {/* Section 1: Indian Regional Mother Tongues */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">🇮🇳</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#10b981] font-mono">
                Indian Regional Languages
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {indianLanguages.map((lang) => {
                const isSelected = selectedLang === lang.code;
                const isSpeaking = speakingLang === lang.code;

                return (
                  <div
                    key={lang.code}
                    onClick={() => setSelectedLang(lang.code)}
                    className={`relative p-3.5 rounded-xs border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#003825] border-[#10b981] shadow-lg shadow-[#10b981]/20 scale-101'
                        : 'bg-[#131b2e] border-[#334155] hover:border-[#68dba9]/60 hover:bg-[#1a243c]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="text-2xl shrink-0">
                        {lang.flag}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base sm:text-lg font-black text-white tracking-wide truncate">
                            {lang.nativeName}
                          </span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-[#10b981] text-[#002114] flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#87948b] truncate">
                          {lang.name} · {lang.region}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleSpeakSample(e, lang.code)}
                      title={`Listen in ${lang.nativeName}`}
                      className={`px-2.5 py-1.5 rounded-xs border transition-all cursor-pointer shrink-0 flex items-center gap-1.5 text-xs font-bold ${
                        isSpeaking
                          ? 'bg-[#10b981] text-[#002114] border-white animate-bounce'
                          : 'bg-[#1e293b] text-[#bccac0] border-[#334155] hover:text-white hover:bg-[#334155]'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                      <span className="hidden sm:inline text-[11px]">
                        {isSpeaking ? 'Speaking...' : 'Listen'}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Global Languages */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">🌍</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#4cd7f6] font-mono">
                Global Languages (International)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {otherLanguages.map((lang) => {
                const isSelected = selectedLang === lang.code;
                const isSpeaking = speakingLang === lang.code;
                return (
                  <div
                    key={lang.code}
                    onClick={() => setSelectedLang(lang.code)}
                    className={`relative p-3 rounded-xs border-2 transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-[#002f38] border-[#4cd7f6] shadow-md shadow-[#4cd7f6]/20'
                        : 'bg-[#131b2e] border-[#334155] hover:border-[#4cd7f6]/60 hover:bg-[#1a243c]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl shrink-0">{lang.flag}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-bold text-white truncate">
                            {lang.nativeName}
                          </span>
                          {lang.code === 'en-global' && (
                            <span className="px-1.5 py-0.2 bg-[#002f38] text-[#4cd7f6] border border-[#4cd7f6]/40 text-[9px] font-bold rounded-xs">
                              GLOBAL
                            </span>
                          )}
                          {isSelected && (
                            <span className="w-3.5 h-3.5 rounded-full bg-[#4cd7f6] text-[#002f38] flex items-center justify-center shrink-0">
                              <Check className="w-2 h-2 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#87948b] truncate">
                          {lang.name}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleSpeakSample(e, lang.code)}
                      title={`Listen in ${lang.nativeName}`}
                      className={`p-1.5 rounded-xs border transition-all cursor-pointer shrink-0 ${
                        isSpeaking
                          ? 'bg-[#4cd7f6] text-[#002f38] border-white animate-bounce'
                          : 'bg-[#1e293b] text-[#bccac0] border-[#334155] hover:text-white'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer with Primary Confirm Button */}
        <div className="p-4 sm:p-5 bg-[#0e1628] border-t border-[#334155] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#bccac0] text-center sm:text-left">
            <Sparkles className="w-4 h-4 text-[#fbbf24] shrink-0" />
            <span>
              Selected Language: <strong className="text-white">{SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang)?.nativeName}</strong> ({SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang)?.name})
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!isFirstInstall && (
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-[#171f33] hover:bg-[#222c42] text-[#bccac0] hover:text-white border border-[#334155] font-semibold text-xs rounded-xs cursor-pointer"
              >
                {t.installLater}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className="flex-1 sm:flex-none px-6 py-3 bg-[#10b981] hover:bg-[#059669] text-[#002114] font-black text-sm rounded-xs flex items-center justify-center gap-2 shadow-lg shadow-[#10b981]/25 cursor-pointer transition-all hover:scale-102"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{t.welcomeModalContinue}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
