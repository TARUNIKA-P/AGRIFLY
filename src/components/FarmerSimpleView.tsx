import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Home, 
  Droplets, 
  Leaf, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Wind, 
  Battery, 
  HelpCircle, 
  ChevronRight, 
  Send, 
  MapPin, 
  Compass,
  Volume2,
  VolumeX,
  Languages,
  Palette,
  Sun,
  Moon,
  Tractor,
  Bug,
  WifiOff,
  Radio
} from 'lucide-react';
import { DroneUnit, PestDetection, FieldZone, WeatherData } from '../types/telemetry';
import { LanguageCode, SUPPORTED_LANGUAGES, TRANSLATIONS } from '../data/translations';

export type ColorTheme = 'emerald' | 'sunlight' | 'navy' | 'harvest';

interface FarmerSimpleViewProps {
  drones: DroneUnit[];
  pestDetections: PestDetection[];
  fieldZones: FieldZone[];
  weather: WeatherData;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onTriggerRTH: () => void;
  onApplySpray: (pestId: string) => void;
  onSelectPest: (detection: PestDetection) => void;
  onAddWaypoint: (x: number, y: number) => void;
  onSwitchToProMode?: () => void;
  onOpenChatbot?: () => void;
  colorTheme?: ColorTheme;
  onChangeColorTheme?: (theme: ColorTheme) => void;
  language?: LanguageCode;
  onOpenLanguageModal?: () => void;
  isEffectiveOffline?: boolean;
  onOpenOfflineModal?: () => void;
}

export const FarmerSimpleView: React.FC<FarmerSimpleViewProps> = ({
  drones,
  pestDetections,
  fieldZones,
  weather,
  isPlaying,
  onTogglePlay,
  onTriggerRTH,
  onApplySpray,
  onSelectPest,
  onAddWaypoint,
  onSwitchToProMode,
  onOpenChatbot,
  colorTheme = 'emerald',
  onChangeColorTheme,
  language = 'en',
  onOpenLanguageModal,
  isEffectiveOffline = false,
  onOpenOfflineModal,
}) => {
  const [selectedDroneTab, setSelectedDroneTab] = useState<string>(drones[0]?.id || 'drone-1');
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [customAnswer, setCustomAnswer] = useState<string | null>(null);
  const [farmSizeHa, setFarmSizeHa] = useState<number>(24);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
  const currentLangInfo = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const untreatedPests = pestDetections.filter((p) => p.sprayStatus !== 'treated');
  const treatedPests = pestDetections.filter((p) => p.sprayStatus === 'treated');

  const selectedDrone = drones.find((d) => d.id === selectedDroneTab) || drones[0];
  const avgBattery = Math.round(drones.reduce((acc, d) => acc + d.battery, 0) / drones.length);
  const totalSprayRemainingL = drones.reduce((acc, d) => acc + d.payloadRemaining, 0);

  // RUPEES CALCULATION (Indian Market Rates for Concentrated Crop Medicine)
  // Traditional tractor uses ~5.2 L/ha blanket. AgriFly micro-spray uses ~0.7 L/ha.
  // 1 Liter concentrated pesticide in India = ~₹1,450.
  const costPerLiterRupees = 1450;
  const traditionalLiters = Math.round(farmSizeHa * 5.2);
  const droneLiters = Math.round(farmSizeHa * 0.7);
  const litersSaved = traditionalLiters - droneLiters;
  const rupeesSaved = Math.round(litersSaved * costPerLiterRupees);
  // Tractor diesel saved (approx 2.5L/ha * ₹92/L = ~₹5,520 for 24ha)
  const dieselRupeesSaved = Math.round(farmSizeHa * 2.5 * 92);
  const totalRupeesBenefit = rupeesSaved + dieselRupeesSaved;

  // Format Rupees in Indian standard Lakhs/Thousands
  const formatRupees = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  // Multi-Language Web Speech API Audio Narration for Common Farmers
  const getSpokenStatusByLanguage = (code: LanguageCode): string => {
    const rupeeStr = formatRupees(totalRupeesBenefit);
    switch (code) {
      case 'te':
        return `నమస్కారం రైతు సోదరులారా! మీ 4 డ్రోన్లు పొలంలో సురక్షితంగా ఎగురుతున్నాయి. చెట్ల కొమ్మల నుండి రక్షణ చురుకుగా ఉంది. ఈ రోజు మీ పొలంలో మొత్తం ${rupeeStr} రూపాయలు ఆదా అయ్యాయి. 86 శాతం మందుల ఖర్చు మిగిలింది. వాతావరణం పిచికారీకి చాలా అనుకూలంగా ఉంది.`;
      case 'ta':
        return `வணக்கம் விவசாய பெருமக்களே! உங்கள் 4 ட்ரோன்கள் வயலில் பாதுகாப்பாக பறக்கின்றன. மரக்கிளை மோதல் தவிர்ப்பு செயல்படுகிறது. இன்று உங்கள் வயலில் மொத்தம் ${rupeeStr} ரூபாய் சேமிக்கப்பட்டுள்ளது. 86 சதவீதம் மருந்து மிச்சமானது.`;
      case 'kn':
        return `ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ! ನಿಮ್ಮ 4 ಡ್ರೋನ್‌ಗಳು ಹೊಲದಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿ ಹಾರಾಡುತ್ತಿವೆ. ಮರದ ಕೊಂಬೆಗಳಿಂದ ರಕ್ಷಣೆ ಚಾಲನೆಯಲ್ಲಿದೆ. ಇಂದು ನಿಮ್ಮ ಹೊಲದಲ್ಲಿ ಒಟ್ಟು ${rupeeStr} ರೂಪಾಯಿ ಉಳಿತಾಯವಾಗಿದೆ. 86 ಶೇಕಡಾ ಔಷಧಿ ಉಳಿದಿದೆ.`;
      case 'mr':
        return `नमस्कार शेतकरी बांधवांनो! आपले 4 ड्रोन शेतात सुरक्षित उडत आहेत. झाडांच्या फांद्यांपासून संरक्षण सुरू आहे. आज आपल्या शेतात एकूण ${rupeeStr} रुपयांची थेट बचत झाली आहे. 86 टक्के औषध वाचले आहे.`;
      case 'bn':
        return `নমস্কার কৃষক বন্ধুরা! আপনার ৪টি ড্রোন জমিতে নিরাপদে উড়ছে। গাছের ডাল এড়িয়ে চলার ব্যবস্থা চালু আছে। আজ আপনার জমিতে মোট ${rupeeStr} টাকা সাশ্রয় হয়েছে। 86 শতাংশ ওষুধ বেঁচেছে।`;
      case 'gu':
        return `નમસ્તે ખેડૂત મિત્રો! તમારા 4 ડ્રોન ખેતરમાં સુરક્ષિત રીતે ઉડી રહ્યા છે. ઝાડની ડાળીઓથી બચાવ ચાલુ છે. આજે તમારા ખેતરમાં કુલ ${rupeeStr} રૂપિયાની સીધી બચત થઈ છે.`;
      case 'pa':
        return `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! ਤੁਹਾਡੇ 4 ਡਰੋਨ ਖੇਤ ਵਿੱਚ ਸੁਰੱਖਿਅਤ ਉੱਡ ਰਹੇ ਹਨ। ਦਰੱਖਤਾਂ ਤੋਂ ਬਚਾਅ ਚਾਲੂ ਹੈ। ਅੱਜ ਤੁਹਾਡੇ ਖੇਤ ਵਿੱਚ ਕੁੱਲ ${rupeeStr} ਰੁਪਏ ਦੀ ਬੱਚਤ ਹੋਈ ਹੈ।`;
      case 'ml':
        return `നമസ്കാരം കർഷക സുഹൃത്തുക്കളെ! നിങ്ങളുടെ 4 ഡ്രോണുകൾ പാടത്ത് സുരക്ഷിതമായി പറക്കുന്നു. ഇന്ന് നിങ്ങളുടെ പാടത്ത് ആകെ ${rupeeStr} രൂപ ലാഭിക്കാൻ കഴിഞ്ഞു.`;
      case 'or':
        return `ନମସ୍କାର କୃଷକ ଭାଇମାନେ! ଆପଣଙ୍କ 4ଟି ଡ୍ରୋନ୍ ଜମିରେ ସୁରକ୍ଷିତ ଉଡ଼ୁଛି। ଆଜି ଆପଣଙ୍କ ଜମିରେ ମୋଟ ${rupeeStr} ଟଙ୍କା ସଞ୍ଚୟ ହୋଇଛି।`;
      case 'en':
      case 'en-in':
      case 'en-global':
      default:
        return `Hello farmer! All four drones are flying safely. Branch collision avoidance is active. Today you saved a total of ${rupeeStr} rupees in chemicals and tractor diesel.`;
      case 'es':
        return `¡Hola agricultor! Los 4 drones vuelan de forma segura. Ha ahorrado un total de ${rupeeStr} rupias hoy.`;
      case 'fr':
        return `Bonjour cher agriculteur! Vos 4 drones volent en sécurité. Vous avez économisé au total ${rupeeStr} roupies aujourd'hui.`;
      case 'ar':
        return `مرحباً بك أيها المزارع! طائرات الدرون الـ 4 تطير بأمان تام. وفرت اليوم ما مجموعه ${rupeeStr} روبية في تكاليف المبيدات والديزل.`;
      case 'hi':
        return `नमस्ते किसान भाई! आपके 4 ड्रोन खेत में सुरक्षित उड़ रहे हैं। पेड़ों की डालियों से बचाव चालू है। खेत 94 प्रतिशत स्वस्थ है। आज आपकी 86 प्रतिशत दवाई बची है और कुल ${rupeeStr} रुपये की बचत हुई है। मौसम छिड़काव के लिए बहुत अच्छा है।`;
    }
  };

  const speakStatus = () => {
    if (!('speechSynthesis' in window)) {
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = getSpokenStatusByLanguage(language);
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = currentLangInfo.speechCode;
    utterance.rate = 0.92; // Deliberate and clear speed for elder farmers
    utterance.pitch = 1.0;

    // Pick voice matching language code if available
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => 
      v.lang.toLowerCase().startsWith(language) || 
      v.lang.toLowerCase() === currentLangInfo.speechCode.toLowerCase()
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Friendly names for drones
  const getDroneFriendlyName = (drone: DroneUnit, idx: number) => {
    if (language === 'hi') {
      switch (drone.id) {
        case 'drone-1': return { title: 'ड्रोन 1', role: 'निगरानी ड्रोन (Lead Scout)', desc: 'खेत का नक्शा और पेड़ों की ऊंचाई नापता है' };
        case 'drone-2': return { title: 'ड्रोन 2', role: 'दवाई छिड़कने वाला (Micro-Sprayer)', desc: 'सटीक माइक्रो-बूंदों में छिड़काव करता है' };
        case 'drone-3': return { title: 'ड्रोन 3', role: 'सटीक स्प्रेयर (Precision Sprayer)', desc: 'सटीक रूप से फसल पर छिड़काव करता है' };
        case 'drone-4': return { title: 'ड्रोन 4', role: 'सहयोगी ड्रोन (Helper Relay)', desc: 'सभी ड्रोनों को आपस में जोड़कर रखता है' };
        default: return { title: `ड्रोन ${idx + 1}`, role: drone.role, desc: 'खेत का रखवाला ड्रोन' };
      }
    }
    // English (UK) Default
    switch (drone.id) {
      case 'drone-1': return { title: 'Drone 1', role: 'Lead Scout', desc: 'Maps field contours and branch clearance' };
      case 'drone-2': return { title: 'Drone 2', role: 'Micro-Sprayer', desc: 'Applies precision droplets to affected crops' };
      case 'drone-3': return { title: 'Drone 3', role: 'Precision Sprayer', desc: 'Targets leaves with exact micro-dosing' };
      case 'drone-4': return { title: 'Drone 4', role: 'Helper Relay', desc: 'Keeps all drones connected across trees' };
      default: return { title: `Drone ${idx + 1}`, role: drone.role, desc: 'Field guardian drone' };
    }
  };

  const handleQuickTreatAll = () => {
    untreatedPests.forEach((p) => onApplySpray(p.id));
    const msg = language === 'hi'
      ? 'आदेश भेजा गया! ड्रोन 2 सभी बीमार पौधों पर सटीक दवाई छिड़क रहा है।'
      : 'Orders sent! Drone 2 is micro-spraying all infected plants.';
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 5000);
  };

  const handleSimpleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    onAddWaypoint(x, y);
    const msg = language === 'hi'
      ? `ड्रोन 1 को खेत के इस हिस्से (${x}%, ${y}%) की जांच के लिए भेजा गया।`
      : `Sent Drone 1 to inspect the plant at field spot (${x}%, ${y}%).`;
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    const q = customQuestion.toLowerCase();
    let reply = "All 4 drones are flying safely, keeping 3 metres clearance from trees and branches.";

    if (language === 'hi') {
      reply = "आपके सभी 4 ड्रोन पूरी तरह सुरक्षित उड़ रहे हैं। पेड़ों से 3 मीटर की दूरी बनाकर रख रहे हैं।";
      if (q.includes('rupee') || q.includes('रुपये') || q.includes('पैसा') || q.includes('money') || q.includes('बचत') || q.includes('cost')) {
        reply = `आज खेत में पारंपरिक ट्रैक्टर की जगह ड्रोन से दवाई डालने पर आपके कुल ${formatRupees(totalRupeesBenefit)} की बचत हो रही है! इसमें 86% कीटनाशक दवाई और ट्रैक्टर का डीजल शामिल है।`;
      } else if (q.includes('battery') || q.includes('चार्ज') || q.includes('power')) {
        reply = `ड्रोनों में औसत बैटरी ${avgBattery}% बची है (लगभग 28 मिनट की उड़ान)। 20% होते ही ड्रोन खुद-ब-खुद घर लौट आएगा।`;
      } else if (q.includes('spray') || q.includes('दवाई') || q.includes('chemical') || q.includes('छिड़काव')) {
        reply = `ड्रोन टैंक में अभी ${totalSprayRemainingL.toFixed(1)} लीटर दवाई तैयार है। केवल बीमार पत्तों पर छिड़कने से 86% दवाई की सीधी बचत होती है।`;
      } else if (q.includes('weather') || q.includes('हवा') || q.includes('मौसम') || q.includes('wind')) {
        reply = `हवा की गति ${weather.windSpeed} मीटर/सेकंड है जो छिड़काव के लिए बहुत अनुकूल है। दवाई उड़कर पड़ोसी के खेत में नहीं जाएगी।`;
      } else if (q.includes('crash') || q.includes('पेड़') || q.includes('टक्कर') || q.includes('branch')) {
        reply = "ड्रोन में 360 डिग्री लेजर आंखें (LiDAR) और कैमरे लगे हैं। वे किसी भी डाल, तार या खंभे से टकराए बिना खुद रास्ता मोड़ लेते हैं।";
      }
    } else {
      if (q.includes('rupee') || q.includes('save') || q.includes('money') || q.includes('cost') || q.includes('price')) {
        reply = `Using drones instead of a tractor saves you a total of ${formatRupees(totalRupeesBenefit)} today! This includes 86% chemical savings and zero tractor diesel cost.`;
      } else if (q.includes('battery') || q.includes('charge') || q.includes('power')) {
        reply = `Average battery is ${avgBattery}% (approx 28 minutes flight time remaining). The drone automatically returns home when battery hits 20%.`;
      } else if (q.includes('spray') || q.includes('chemical') || q.includes('medicine') || q.includes('liquid')) {
        reply = `There is ${totalSprayRemainingL.toFixed(1)} Litres of spray solution ready. Micro-dosing only infected leaves saves 86% chemical cost.`;
      } else if (q.includes('weather') || q.includes('wind') || q.includes('rain')) {
        reply = `Wind speed is ${weather.windSpeed} m/s, which is calm and ideal for spraying. Droplets will not drift away from your field.`;
      } else if (q.includes('crash') || q.includes('tree') || q.includes('branch') || q.includes('wire') || q.includes('obstacle')) {
        reply = "Each drone has 360-degree LiDAR and stereo vision cameras. They automatically steer around any tree, branch, or wire with 3-metre clearance.";
      }
    }

    setCustomAnswer(reply);
    setCustomQuestion('');
  };

  const faqs = [
    {
      q: t.faq1Q,
      a: t.faq1A,
    },
    {
      q: t.faq2Q,
      a: t.faq2A,
    },
    {
      q: t.faq3Q,
      a: t.faq3A,
    },
  ];

  // Dynamic Theme Palette Styles
  const getThemeClasses = () => {
    switch (colorTheme) {
      case 'emerald':
        return {
          cardBg: 'bg-[#062419]',
          cardBorder: 'border-[#10b981]',
          accentText: 'text-[#34d399]',
          rupeeBadge: 'bg-[#047857] text-[#ecfdf5] border-[#10b981]',
          headerGradient: 'from-[#064e3b] via-[#022c22] to-[#0b1326]',
          highlightBg: 'bg-[#064e3b]/80',
        };
      case 'sunlight':
        return {
          cardBg: 'bg-[#18181b]',
          cardBorder: 'border-[#f59e0b]',
          accentText: 'text-[#fbbf24]',
          rupeeBadge: 'bg-[#f59e0b] text-[#000000] border-[#d97706]',
          headerGradient: 'from-[#451a03] via-[#1c1917] to-[#000000]',
          highlightBg: 'bg-[#78350f]/80',
        };
      case 'harvest':
        return {
          cardBg: 'bg-[#2a130b]',
          cardBorder: 'border-[#ea580c]',
          accentText: 'text-[#fb923c]',
          rupeeBadge: 'bg-[#c2410c] text-white border-[#ea580c]',
          headerGradient: 'from-[#7c2d12] via-[#431407] to-[#0b1326]',
          highlightBg: 'bg-[#7c2d12]/80',
        };
      default: // navy
        return {
          cardBg: 'bg-[#131b2e]',
          cardBorder: 'border-[#334155]',
          accentText: 'text-[#4cd7f6]',
          rupeeBadge: 'bg-[#003825] text-[#68dba9] border-[#68dba9]',
          headerGradient: 'from-[#0f172a] via-[#131b2e] to-[#0b1326]',
          highlightBg: 'bg-[#171f33]',
        };
    }
  };

  const themeStyles = getThemeClasses();

  return (
    <div className="p-3 sm:p-5 md:p-6 max-w-7xl mx-auto space-y-5 select-none font-body">
      {/* Top Banner: RUPEE PRIORITY + VOICE SPEAKER + THEME PICKER */}
      <div className={`p-4 md:p-6 rounded-xs border ${themeStyles.cardBorder} bg-gradient-to-r ${themeStyles.headerGradient} shadow-2xl text-white space-y-4`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 text-xs font-bold rounded-xs uppercase tracking-wider border font-mono ${themeStyles.rupeeBadge} flex items-center gap-1 shadow-sm`}>
                <span className="text-sm font-bold">₹</span>
                <span>{t.rupeeBadge}</span>
              </span>
              <span className="px-2 py-0.5 bg-black/40 text-[#68dba9] border border-white/10 rounded-xs text-xs font-semibold">
                {t.simpleModeBtn}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
              <span>{t.heroHeadline}</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#dae2fd] max-w-2xl leading-relaxed">
              {t.heroSubheadline}:{' '}
              <strong className="text-[#68dba9] underline decoration-2 underline-offset-2">
                86% chemical and {formatRupees(totalRupeesBenefit)}
              </strong>{' '}
              saved in total!
            </p>
          </div>

          {/* Quick Voice Audio Narrator & Language Toggle */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Audio Voice Read-Aloud Button */}
            <button
              onClick={speakStatus}
              title={t.listenVoiceBtn}
              className={`flex items-center gap-2 px-4 py-3 rounded-xs font-bold text-sm transition-all cursor-pointer shadow-lg ${
                isSpeaking
                  ? 'bg-[#ef4444] hover:bg-[#dc2626] text-white animate-pulse'
                  : 'bg-[#003825] hover:bg-[#005137] text-[#68dba9] border-2 border-[#68dba9]'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-5 h-5" />
                  <span>{t.stopVoiceBtn}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5 text-[#68dba9]" />
                  <span>🔊 {t.listenVoiceBtn}</span>
                </>
              )}
            </button>

            {/* Comprehensive 14-Languages Modal Switcher */}
            {onOpenLanguageModal && (
              <button
                onClick={onOpenLanguageModal}
                title="Change language / Select language"
                className="flex items-center gap-1.5 px-3 py-2.5 bg-black/50 hover:bg-black/70 border-2 border-[#10b981] rounded-xs text-xs font-bold text-white transition-all cursor-pointer shadow-md hover:scale-102"
              >
                <Languages className="w-4 h-4 text-[#10b981]" />
                <span className="text-sm">{currentLangInfo.flag}</span>
                <span className="font-extrabold text-[#68dba9]">{currentLangInfo.nativeName}</span>
                <span className="text-[10px] text-[#bccac0] hidden sm:inline">(14 Languages)</span>
              </button>
            )}

            {/* Theme Selector Swatches */}
            {onChangeColorTheme && (
              <div className="flex items-center gap-1.5 bg-black/50 border border-white/20 p-1.5 rounded-xs" title="Select Colour Theme">
                <Palette className="w-3.5 h-3.5 text-[#bccac0] mr-0.5" />
                <button
                  onClick={() => onChangeColorTheme('emerald')}
                  title="Kisan Emerald (Farm Green)"
                  className={`w-5 h-5 rounded-full bg-[#10b981] border-2 transition-transform cursor-pointer ${colorTheme === 'emerald' ? 'scale-125 border-white' : 'border-transparent opacity-75'}`}
                />
                <button
                  onClick={() => onChangeColorTheme('sunlight')}
                  title="Sunlight High-Contrast (Bright Gold)"
                  className={`w-5 h-5 rounded-full bg-[#f59e0b] border-2 transition-transform cursor-pointer ${colorTheme === 'sunlight' ? 'scale-125 border-white' : 'border-transparent opacity-75'}`}
                />
                <button
                  onClick={() => onChangeColorTheme('harvest')}
                  title="Harvest Earth (Terracotta Wheat)"
                  className={`w-5 h-5 rounded-full bg-[#ea580c] border-2 transition-transform cursor-pointer ${colorTheme === 'harvest' ? 'scale-125 border-white' : 'border-transparent opacity-75'}`}
                />
                <button
                  onClick={() => onChangeColorTheme('navy')}
                  title="Cyber Navy (Night Cockpit)"
                  className={`w-5 h-5 rounded-full bg-[#38bdf8] border-2 transition-transform cursor-pointer ${colorTheme === 'navy' ? 'scale-125 border-white' : 'border-transparent opacity-75'}`}
                />
              </div>
            )}
          </div>
        </div>

        {/* 1-Tap Big Visual Action Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10">
          {/* Green Play/Pause Button */}
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xs font-extrabold text-sm transition-all cursor-pointer shadow-lg ${
              isPlaying
                ? 'bg-[#003825] hover:bg-[#005137] text-[#68dba9] border-2 border-[#68dba9]'
                : 'bg-[#ffb95f] hover:bg-[#e09e45] text-black border-2 border-[#ffb95f]'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5" />
                <span>{t.btnStopSafety}</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>{t.btnStartDrones}</span>
              </>
            )}
          </button>

          {/* Call Home Button */}
          <button
            onClick={onTriggerRTH}
            className="flex items-center gap-2.5 px-5 py-3 bg-[#1e293b] hover:bg-[#2e3b52] text-white border-2 border-white/20 rounded-xs font-extrabold text-sm transition-all cursor-pointer shadow-md"
          >
            <Home className="w-5 h-5 text-[#4cd7f6]" />
            <span>{t.btnReturnHome}</span>
          </button>

          {/* Spray All Button */}
          {untreatedPests.length > 0 && (
            <button
              onClick={handleQuickTreatAll}
              className="flex items-center gap-2 px-5 py-3 bg-[#047857] hover:bg-[#065f46] text-white border-2 border-[#34d399] rounded-xs font-extrabold text-sm transition-all cursor-pointer shadow-lg"
            >
              <Droplets className="w-5 h-5 text-[#34d399]" />
              <span>{t.btnSprayAll} ({untreatedPests.length})</span>
            </button>
          )}

          {onSwitchToProMode && (
            <button
              onClick={onSwitchToProMode}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-black/40 hover:bg-black/60 text-[#bccac0] hover:text-white border border-white/20 rounded-xs text-xs font-mono transition-all cursor-pointer ml-auto"
            >
              <Compass className="w-4 h-4 text-[#4cd7f6]" />
              <span>Avionics Engineering Deck &rarr;</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation feedback banner */}
      {actionSuccessMsg && (
        <div className="p-3.5 bg-[#003825] border-2 border-[#68dba9] rounded-xs text-sm text-[#68dba9] flex items-center gap-2.5 font-bold animate-fadeIn shadow-md">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* OFFLINE MODE / SWARM CONNECTIVITY BANNER FOR REMOTE FARMLAND */}
      <div 
        onClick={onOpenOfflineModal}
        className={`p-3.5 sm:p-4 rounded-xs border-2 flex flex-col sm:flex-row items-center justify-between gap-3 cursor-pointer transition-all shadow-xl ${
          isEffectiveOffline
            ? 'bg-gradient-to-r from-[#2a1e0b] via-[#1a1407] to-[#00281b] border-amber-400 text-amber-200 hover:border-amber-300'
            : 'bg-gradient-to-r from-[#003825] via-[#091f1a] to-[#002f38] border-[#10b981] text-[#a7f3d0] hover:border-[#34d399]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xs border shrink-0 ${
            isEffectiveOffline 
              ? 'bg-amber-400/20 border-amber-400 text-amber-300 animate-pulse' 
              : 'bg-[#10b981]/20 border-[#10b981] text-[#10b981]'
          }`}>
            {isEffectiveOffline ? <WifiOff className="w-5 h-5" /> : <Radio className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 text-[10px] font-black uppercase font-mono tracking-wider rounded-xs ${
                isEffectiveOffline ? 'bg-amber-400 text-black' : 'bg-[#10b981] text-[#002114]'
              }`}>
                {isEffectiveOffline ? '📡 OFFLINE MODE (EDGE SWARM)' : '🟢 ONLINE CLOUD SYNC'}
              </span>
              <span className="text-xs sm:text-sm font-black text-white">
                {isEffectiveOffline 
                  ? '100% Safe Offline in Field (Edge Processing)' 
                  : 'Swarm Fully Connected (Dual Cloud + RF)'}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#dae2fd] mt-0.5 leading-snug">
              {isEffectiveOffline 
                ? 'No mobile network in the field? No worries! Drones connect directly to your device via 915 MHz local radio. Tree & wire avoidance runs onboard with zero cloud delay.' 
                : 'Dual cloud sync and direct swarm radio active. Drones flying safely with 0% cloud data delay.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <span className="px-2.5 py-1 bg-black/50 border border-white/20 text-xs font-mono font-bold text-white rounded-xs">
            {isEffectiveOffline ? '0% CLOUD DELAY · 14.2ms' : '100% READY'}
          </span>
          <span className="text-xs font-bold text-[#68dba9] underline decoration-dotted">
            Tap Details &rarr;
          </span>
        </div>
      </div>

      {/* 4 BIG FRIENDLY VISUAL CARDS (PRIORITY 1: RUPEES) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: RUPEES SAVED (FIRST PRIORITY) */}
        <div className={`${themeStyles.cardBg} p-5 rounded-xs border-2 ${themeStyles.cardBorder} space-y-2 shadow-xl relative overflow-hidden`}>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
            <span className={themeStyles.accentText}>DIRECT RUPEES SAVED (₹)</span>
            <span className="text-xl font-bold font-mono text-[#f59e0b]">₹</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#f59e0b] font-display tabular-nums">
              {formatRupees(totalRupeesBenefit)}
            </span>
          </div>
          <p className="text-xs text-[#dae2fd] leading-snug">
            <strong className="text-[#34d399] font-bold">86.4% chemical saved</strong> compared to traditional tractor spraying. Zero tractor diesel burned.
          </p>
          <div className="text-[10px] text-[#bccac0] font-mono pt-1 border-t border-white/10">
            Chemical Saved: {formatRupees(rupeesSaved)} + Diesel: {formatRupees(dieselRupeesSaved)}
          </div>
        </div>

        {/* Card 2: Crop Health */}
        <div className={`${themeStyles.cardBg} p-5 rounded-xs border-2 ${themeStyles.cardBorder} space-y-2 shadow-xl`}>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#bccac0]">
            <span className="text-[#68dba9]">CROP HEALTH & PROTECTION</span>
            <Leaf className="w-5 h-5 text-[#68dba9]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#68dba9] font-display">100%</span>
            <span className="text-xs text-[#bccac0] font-bold">Protected</span>
          </div>
          <p className="text-xs text-[#dae2fd] leading-snug">
            Farmland crops are fully protected and healthy. All 4 drones are armed for precision micro-spraying.
          </p>
          <div className="text-[10px] text-[#bccac0] font-mono pt-1 border-t border-white/10">
            Total Farmland: 24 Hectares Orchard
          </div>
        </div>

        {/* Card 3: Drones Status */}
        <div className={`${themeStyles.cardBg} p-5 rounded-xs border-2 ${themeStyles.cardBorder} space-y-2 shadow-xl`}>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#bccac0]">
            <span className="text-[#38bdf8]">SWARM FLIGHT STATUS</span>
            <ShieldCheck className="w-5 h-5 text-[#38bdf8]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white font-display">4 of 4</span>
            <span className="text-xs text-[#68dba9] font-bold">Safe & Active</span>
          </div>
          <p className="text-xs text-[#dae2fd] leading-snug">
            Average Battery: <strong className="text-white">{avgBattery}%</strong> (~28 mins flight reserve). 360-degree tree avoidance active.
          </p>
          <div className="text-[10px] text-[#bccac0] font-mono pt-1 border-t border-white/10">
            Tank Payload: {totalSprayRemainingL.toFixed(1)} Litres Ready
          </div>
        </div>

        {/* Card 4: Weather to Spray */}
        <div className={`${themeStyles.cardBg} p-5 rounded-xs border-2 ${themeStyles.cardBorder} space-y-2 shadow-xl`}>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#bccac0]">
            <span className="text-[#34d399]">WEATHER FOR SPRAYING</span>
            <Wind className="w-5 h-5 text-[#34d399]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#68dba9] font-display">
              {weather.sprayDriftRisk === 'Low' ? 'Ideal for Spraying' : 'Moderate Wind'}
            </span>
          </div>
          <p className="text-xs text-[#dae2fd] leading-snug">
            Breeze is calm ({weather.windSpeed} m/s). 0% chemical drift risk to neighbouring fields, spray hits leaves directly.
          </p>
          <div className="text-[10px] text-[#bccac0] font-mono pt-1 border-t border-white/10">
            Temperature: {weather.temperature}°C · Humidity: {weather.humidity}%
          </div>
        </div>
      </div>

      {/* Main Row: Visual Orchard Map + Plant Issues & Rupee Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Simple Visual Map (Tap to Send Drone) */}
        <div className={`lg:col-span-2 ${themeStyles.cardBg} border-2 ${themeStyles.cardBorder} rounded-xs p-4 sm:p-5 space-y-3.5 shadow-xl`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#68dba9]" />
                Live Field Spray Coverage & Drone Tracking
              </h2>
              <p className="text-xs text-[#dae2fd]">
                Tap anywhere on the field map to immediately dispatch Drone 1 for inspection & spot spraying.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-[#003825] text-[#68dba9] border border-[#68dba9] rounded-xs text-xs font-mono font-bold">
                BRANCH AVOIDANCE ACTIVE
              </span>
            </div>
          </div>

          {/* Interactive Map Surface */}
          <div 
            onClick={handleSimpleMapClick}
            className="relative w-full aspect-[16/9] min-h-[340px] rounded-xs overflow-hidden border border-white/20 bg-cover bg-center cursor-pointer shadow-inner"
            style={{
              backgroundImage: `url('/src/assets/images/canopy_orthomosaic_map_1793902130133.jpg')`,
              filter: 'brightness(0.85) contrast(1.1)',
            }}
          >
            {/* Field Zones */}
            {fieldZones.map((zone) => (
              <div
                key={zone.id}
                className="absolute text-[11px] font-bold text-white bg-black/75 px-2.5 py-1 rounded-xs border border-white/30 backdrop-blur-xs pointer-events-none shadow-md"
                style={{
                  left: `${zone.boundary[0].x + 3}%`,
                  top: `${zone.boundary[0].y + 5}%`,
                }}
              >
                🌾 {zone.name} ({zone.variety})
              </div>
            ))}

            {/* Drones on Map */}
            {drones.map((drone, idx) => {
              const friendly = getDroneFriendlyName(drone, idx);
              return (
                <div
                  key={drone.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDroneTab(drone.id);
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700 cursor-pointer group z-20"
                  style={{
                    left: `${drone.position.x}%`,
                    top: `${drone.position.y}%`,
                  }}
                >
                  <span className="absolute -inset-2.5 rounded-full bg-[#68dba9] opacity-35 animate-ping pointer-events-none" />

                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#060e20] border-2 border-white rounded-full shadow-2xl group-hover:scale-115 transition-transform">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: drone.color }} />
                    <span className="text-xs font-extrabold text-white font-mono whitespace-nowrap">
                      Drone {idx + 1}
                    </span>
                    {drone.sprayActive && (
                      <Droplets className="w-3.5 h-3.5 text-[#38bdf8] animate-bounce" />
                    )}
                  </div>

                  {/* Tooltip */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:block bg-[#0b1326] text-white text-[11px] p-2.5 rounded-xs border border-white/20 whitespace-nowrap z-30 shadow-2xl">
                    <div className="font-bold text-[#68dba9]">{friendly.title} · {friendly.role}</div>
                    <div>Battery: {drone.battery}% · Spray: {drone.payloadRemaining.toFixed(1)}L</div>
                    <div className="text-[#bccac0]">{friendly.desc}</div>
                  </div>
                </div>
              );
            })}

            <div className="absolute bottom-2.5 left-2.5 bg-black/85 backdrop-blur-xs text-xs text-[#dae2fd] px-3 py-1.5 rounded-xs border border-white/20 pointer-events-none">
              💡 Tip: Tap any tree row on the map to dispatch drone spray.
            </div>
          </div>

          {/* Quick Drone Selector Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {drones.map((drone, idx) => {
              const friendly = getDroneFriendlyName(drone, idx);
              const isSelected = drone.id === selectedDroneTab;
              return (
                <button
                  key={drone.id}
                  onClick={() => setSelectedDroneTab(drone.id)}
                  className={`p-2.5 rounded-xs border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1e293b] border-[#4cd7f6] shadow-lg'
                      : 'bg-black/30 border-white/10 hover:border-white/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: drone.color }} />
                      Drone {idx + 1}
                    </span>
                    <span className={drone.battery > 40 ? 'text-[#68dba9]' : 'text-[#f59e0b]'}>
                      {drone.battery}%
                    </span>
                  </div>
                  <div className="text-[11px] text-[#38bdf8] font-bold mt-0.5">{friendly.role.split('(')[0]}</div>
                  <div className="text-[10px] text-[#dae2fd] mt-1 flex justify-between">
                    <span>Spray: {drone.payloadRemaining.toFixed(1)}L</span>
                    <span>{drone.status === 'spraying' ? '💧 Spraying' : 'Flying'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Col: RUPEE CALCULATOR & CROP HEALTH LIST */}
        <div className="space-y-4">
          {/* RUPEE SAVINGS CALCULATOR (EXPLICIT PRIORITY 1) */}
          <div className={`${themeStyles.cardBg} border-2 ${themeStyles.cardBorder} rounded-xs p-4 sm:p-5 space-y-3.5 shadow-xl`}>
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-mono text-[#f59e0b]">₹</span>
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  RUPEE SAVINGS CALCULATOR
                </span>
              </div>
              <span className="text-xs font-mono text-[#f59e0b] font-extrabold bg-black/40 px-2 py-0.5 rounded-xs border border-[#f59e0b]/40">
                {farmSizeHa} Hectares ({Math.round(farmSizeHa * 2.47)} Acres)
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#dae2fd] flex justify-between">
                <span>Select Farmland Size:</span>
                <strong className="text-white">{farmSizeHa} Ha ({Math.round(farmSizeHa * 2.47)} Acres)</strong>
              </label>
              <input
                type="range"
                min="2"
                max="80"
                value={farmSizeHa}
                onChange={(e) => setFarmSizeHa(Number(e.target.value))}
                className="w-full accent-[#10b981] cursor-pointer h-2 bg-black/40 rounded-lg"
              />
            </div>

            {/* Side-by-Side Rupee Comparison */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 bg-black/40 rounded-xs border border-white/10 space-y-1">
                <div className="text-[11px] text-[#bccac0] font-bold flex items-center gap-1">
                  <Tractor className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>Tractor Spray Cost</span>
                </div>
                <div className="text-base font-extrabold text-[#f59e0b] font-display">
                  {formatRupees(traditionalLiters * costPerLiterRupees)}
                </div>
                <div className="text-[10px] text-[#bccac0]">{traditionalLiters} Litres Chemical Used</div>
              </div>

              <div className="p-2.5 bg-[#064e3b]/90 rounded-xs border-2 border-[#10b981] space-y-1">
                <div className="text-[11px] text-[#68dba9] font-bold flex items-center gap-1">
                  <span>AgriFly Drone Cost</span>
                </div>
                <div className="text-base font-extrabold text-white font-display">
                  {formatRupees(droneLiters * costPerLiterRupees)}
                </div>
                <div className="text-[10px] text-[#68dba9] font-bold">Only {droneLiters} Litres Used!</div>
              </div>
            </div>

            {/* Total Rupee Net Savings Box */}
            <div className="text-center p-3 bg-gradient-to-r from-[#047857] to-[#065f46] border-2 border-[#34d399] rounded-xs text-xs text-white shadow-lg space-y-0.5">
              <div className="text-[11px] uppercase tracking-wider text-[#d1fae5] font-bold">
                Net Farmer Savings per Spray:
              </div>
              <div className="text-2xl font-black text-white font-display">
                {formatRupees(totalRupeesBenefit)} Direct Benefit!
              </div>
              <div className="text-[10px] text-[#d1fae5]">
                Annual Savings (3 Sprays): <strong>{formatRupees(totalRupeesBenefit * 3)}</strong>
              </div>
            </div>
          </div>

          {/* Field Spray Coverage & Farm Protection */}
          <div className={`${themeStyles.cardBg} border-2 ${themeStyles.cardBorder} rounded-xs p-4 sm:p-5 space-y-3.5 shadow-xl`}>
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div>
                <h3 className="text-sm font-bold text-white font-display flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#68dba9]" />
                  Field Spray Coverage
                </h3>
                <p className="text-[11px] text-[#dae2fd]">
                  Uniform protection status across all 24 hectares of farmland.
                </p>
              </div>

              <button
                onClick={handleQuickTreatAll}
                className="px-3 py-1.5 bg-[#047857] hover:bg-[#065f46] text-white border border-[#34d399] rounded-xs text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1"
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>Spray Field Now</span>
              </button>
            </div>

            {/* Quick Farm Protection Metrics */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-xs border-2 border-[#10b981] bg-[#064e3b]/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Protected Farmland Area</span>
                    <span className="px-1.5 py-0.5 bg-[#003825] text-[#68dba9] border border-[#68dba9] rounded-xs text-[9px] font-bold">100% COVERED</span>
                  </div>
                  <div className="text-[11px] text-[#dae2fd] mt-0.5">24 Hectares Orchard & Crop Canopy</div>
                </div>
                <span className="text-base font-extrabold text-[#68dba9] font-mono">24 Ha</span>
              </div>

              <div className="p-3 rounded-xs border border-white/10 bg-black/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Chemical Medicine Savings</span>
                    <span className="px-1.5 py-0.5 bg-[#f59e0b] text-black rounded-xs text-[9px] font-black">₹ RUPEE SAVER</span>
                  </div>
                  <div className="text-[11px] text-[#dae2fd] mt-0.5">86.4% less chemical vs traditional tractor</div>
                </div>
                <span className="text-base font-extrabold text-[#f59e0b] font-mono">{formatRupees(rupeesSaved)}</span>
              </div>

              <div className="p-3 rounded-xs border border-white/10 bg-black/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Tractor Diesel Savings</div>
                  <div className="text-[11px] text-[#dae2fd] mt-0.5">Zero tractor diesel burned & zero soil compaction</div>
                </div>
                <span className="text-base font-extrabold text-white font-mono">{formatRupees(dieselRupeesSaved)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Plain English Copilot & FAQs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Ask Question Box */}
        <div className={`${themeStyles.cardBg} border-2 ${themeStyles.cardBorder} rounded-xs p-5 space-y-4 shadow-xl`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#f59e0b]" />
              <div>
                <h3 className="text-sm font-bold text-white font-display">
                  Ask in Simple Words (Farmer Copilot)
                </h3>
                <p className="text-xs text-[#dae2fd]">
                  Clear, everyday answers. Ask anything about rupee savings, wind, or flight safety.
                </p>
              </div>
            </div>
            {onOpenChatbot && (
              <button
                type="button"
                onClick={onOpenChatbot}
                className="px-3 py-1.5 bg-[#002f38] hover:bg-[#004754] text-[#4cd7f6] border border-[#4cd7f6] rounded-xs text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1 shrink-0"
              >
                <span>Full Copilot Chat &rarr;</span>
              </button>
            )}
          </div>

          <form onSubmit={handleAskQuestion} className="flex gap-2">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="e.g. How many rupees saved? Is wind safe today? Will it hit trees?"
              className="flex-1 px-3.5 py-2.5 bg-black/50 border border-white/20 rounded-xs text-xs text-white placeholder-[#bccac0] focus:outline-none focus:border-[#10b981]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#047857] hover:bg-[#065f46] text-white border border-[#34d399] rounded-xs text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>

          {customAnswer && (
            <div className="p-3.5 bg-black/60 rounded-xs border-2 border-[#10b981] text-xs text-white space-y-1 animate-fadeIn shadow-lg">
              <div className="text-[10px] font-bold text-[#34d399] uppercase tracking-wider font-mono">
                AGRIFLY COPILOT:
              </div>
              <p className="leading-relaxed text-sm">{customAnswer}</p>
            </div>
          )}

          {/* Quick Click Question Chips */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-[#bccac0] font-medium block">Or tap any of these quick questions:</span>
            <div className="flex flex-wrap gap-2">
              {[
                'How many Rupees saved?',
                'Will it crash into trees?',
                'How much battery left?',
                'Is wind safe for spraying today?',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setCustomQuestion(q)}
                  className="px-3 py-1 bg-black/40 hover:bg-black/70 text-[#dae2fd] hover:text-white rounded-xs text-xs border border-white/20 transition-colors cursor-pointer text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 30-Second Guide / FAQs for Common Users */}
        <div className={`${themeStyles.cardBg} border-2 ${themeStyles.cardBorder} rounded-xs p-5 space-y-3.5 shadow-xl`}>
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <HelpCircle className="w-5 h-5 text-[#68dba9]" />
            <div>
              <h3 className="text-sm font-bold text-white font-display">
                Farmer 30-Second Quick Guide & FAQs
              </h3>
              <p className="text-xs text-[#dae2fd]">
                Clear answers on how autonomous swarm drones protect your crop safely.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, index) => {
              const isOpen = activeFAQ === index;
              return (
                <div
                  key={index}
                  className="border border-white/15 rounded-xs overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setActiveFAQ(isOpen ? null : index)}
                    className="w-full p-3 bg-black/40 hover:bg-black/60 flex items-center justify-between text-left text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronRight className={`w-4 h-4 text-[#bccac0] transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-3.5 bg-black/70 text-xs text-[#dae2fd] leading-relaxed border-t border-white/15">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
