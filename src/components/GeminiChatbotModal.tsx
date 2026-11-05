import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  RotateCcw, 
  Copy, 
  Check, 
  Cpu, 
  Leaf, 
  Radar, 
  Microscope,
  Zap,
  AlertCircle
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface GeminiChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'farmer' | 'avionics' | 'pathologist';
}

export const GeminiChatbotModal: React.FC<GeminiChatbotModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'farmer',
}) => {
  const [rolePersona, setRolePersona] = useState<'farmer' | 'avionics' | 'pathologist'>(initialRole);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initial greeting according to role
  const getGreeting = (role: 'farmer' | 'avionics' | 'pathologist') => {
    switch (role) {
      case 'farmer':
        return "Hello Farmer! I am your AgriFly Copilot. Ask anything about your field in simple words — total Rupees saved in ₹, wind & weather conditions, or how the drones avoid tree branches. Indian Rupees (₹) are calculated automatically.";
      case 'avionics':
        return "AgriFly Tactical Avionics AI online. Interfacing with Livox 360° LiDAR, stereo VIO odometry, and 802.11ah HaLow P2P swarm mesh. Operating and hardware costs calculated in Indian Rupees (₹).";
      case 'pathologist':
        return "Crop Health Copilot ready. Monitoring multi-spectral NDVI imagery and leaf macro-optics across Sector 01-04. Ask about crop leaf care, Powdery Mildew quarantine, or targeted micro-dose calculations in Indian Rupees (₹).";
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-initial',
      role: 'model',
      text: getGreeting(initialRole),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Reset or switch persona greeting
  const handleRoleChange = (newRole: 'farmer' | 'avionics' | 'pathologist') => {
    setRolePersona(newRole);
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: 'model',
        text: getGreeting(newRole),
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: 'model',
        text: getGreeting(rolePersona),
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setErrorMsg(null);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setErrorMsg(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setIsLoading(true);

    try {
      // Map for server-side history
      const payloadMessages = updatedHistory.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          model: selectedModel,
          rolePersona,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${res.status}`);
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.text || 'Telemetry analyzed. All systems operational.',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Gemini chat error:', err);
      setErrorMsg(err.message || 'Failed to connect to Gemini AI. Check internet connection or API settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  const quickStarters = {
    farmer: [
      'How many Rupees (₹) and chemical did we save today?',
      'Are drones completely safe from tree branches and wires?',
      'How much battery is remaining and when will drones return home?',
      'Is today\'s wind and weather calm and safe for spraying?',
    ],
    avionics: [
      'Explain the GPS-denied VIO error envelope under dense canopy.',
      'How does the 802.11ah HaLow P2P mesh maintain Raft consensus?',
      'Analyze 6-DOF IMU vibration compensation during micro-spraying.',
      'Show fail-safe trajectory for low-battery escort handoff.',
    ],
    pathologist: [
      'How does micro-spraying save 86% chemical compared to tractor?',
      'What is the optimal droplet micron size for high-humidity spraying?',
      'How does multi-spectral NDVI measure canopy density and leaf hydration?',
      'Calculate total Rupee savings for a 50-acre orchard harvest.',
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm select-none animate-fadeIn font-body">
      <div className="relative w-full max-w-3xl h-[88vh] max-h-[720px] bg-[#0b1326] border border-[#334155] rounded-xs shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#131b2e] border-b border-[#334155]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#002f38] border border-[#4cd7f6] rounded-xs text-[#4cd7f6]">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-display">
                  AgriFly Gemini Copilot
                </h2>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-[#003825] text-[#68dba9] border border-[#68dba9] rounded-xs">
                  MULTI-TURN CHAT
                </span>
              </div>
              <p className="text-xs text-[#bccac0] mt-0.5">
                Multi-turn conversation powered by server-side @google/genai
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              title="Reset conversation history"
              className="p-1.5 text-[#87948b] hover:text-[#ffb95f] hover:bg-[#1a253d] rounded-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#87948b] hover:text-white hover:bg-[#1a253d] rounded-xs transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Role Persona and Model Selector Bar */}
        <div className="px-5 py-2.5 bg-[#0e1628] border-b border-[#334155] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Persona Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-[#87948b] font-mono">ROLE:</span>
            <button
              onClick={() => handleRoleChange('farmer')}
              className={`px-2.5 py-1 rounded-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                rolePersona === 'farmer'
                  ? 'bg-[#003825] text-[#68dba9] border border-[#68dba9]'
                  : 'bg-[#171f33] text-[#bccac0] border border-[#334155] hover:text-white'
              }`}
            >
              <Leaf className="w-3 h-3 text-[#68dba9]" />
              <span>Farmer Copilot (₹)</span>
            </button>
            <button
              onClick={() => handleRoleChange('avionics')}
              className={`px-2.5 py-1 rounded-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                rolePersona === 'avionics'
                  ? 'bg-[#002f38] text-[#4cd7f6] border border-[#4cd7f6]'
                  : 'bg-[#171f33] text-[#bccac0] border border-[#334155] hover:text-white'
              }`}
            >
              <Radar className="w-3 h-3 text-[#4cd7f6]" />
              <span>Avionics Specialist</span>
            </button>
            <button
              onClick={() => handleRoleChange('pathologist')}
              className={`px-2.5 py-1 rounded-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                rolePersona === 'pathologist'
                  ? 'bg-[#382600] text-[#ffb95f] border border-[#ffb95f]'
                  : 'bg-[#171f33] text-[#bccac0] border border-[#334155] hover:text-white'
              }`}
            >
              <Microscope className="w-3 h-3 text-[#ffb95f]" />
              <span>Agronomist</span>
            </button>
          </div>

          {/* Model Selector Dropdown */}
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-[10px] uppercase font-bold text-[#87948b]">MODEL:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-2 py-1 bg-[#131b2e] border border-[#334155] text-[#4cd7f6] rounded-xs text-[11px] focus:outline-none focus:border-[#4cd7f6] cursor-pointer"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (General / Balanced)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast &amp; Responsive)</option>
              <option value="gemini-4-argon">gemini-4-argon (Complex Deep Reasoning)</option>
            </select>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 select-text">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xs bg-[#131b2e] border border-[#334155] flex items-center justify-center shrink-0 text-[#4cd7f6]">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`relative max-w-[85%] rounded-xs p-3.5 space-y-1.5 text-xs ${
                  isUser
                    ? 'bg-[#002f38] text-[#dae2fd] border border-[#4cd7f6]/50 shadow-md'
                    : 'bg-[#131b2e] text-[#dae2fd] border border-[#334155] shadow-md'
                }`}>
                  <div className="flex items-center justify-between gap-4 text-[10px] text-[#87948b] font-mono">
                    <span className="font-bold text-white">
                      {isUser ? 'OPERATOR' : rolePersona === 'farmer' ? 'FARMER COPILOT' : rolePersona === 'avionics' ? 'AVIONICS SPECIALIST' : 'AGRONOMIST'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{msg.timestamp}</span>
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        title="Copy text"
                        className="hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-[#68dba9]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="leading-relaxed whitespace-pre-wrap font-body text-[13px]">
                    {msg.text}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xs bg-[#003825] border border-[#68dba9] flex items-center justify-center shrink-0 text-[#68dba9]">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xs bg-[#131b2e] border border-[#334155] flex items-center justify-center shrink-0 text-[#4cd7f6]">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-[#131b2e] border border-[#334155] rounded-xs px-4 py-2.5 text-xs text-[#bccac0] flex items-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-ping" />
                <span>Gemini is generating flight &amp; agronomy response...</span>
              </div>
            </div>
          )}

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-3 bg-[#3b1212] border border-[#ef4444] rounded-xs text-xs text-[#ef4444] flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Starters Bar */}
        <div className="px-5 py-2 bg-[#0e1628] border-t border-[#334155] flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px]">
          <span className="text-[#87948b] font-mono uppercase shrink-0 text-[10px]">QUICK PROMPT:</span>
          {quickStarters[rolePersona].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputMessage(prompt);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
              className="px-2.5 py-1 bg-[#171f33] hover:bg-[#1f2a44] border border-[#334155] hover:border-[#4cd7f6] text-[#bccac0] hover:text-white rounded-xs whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSendMessage} className="p-4 bg-[#131b2e] border-t border-[#334155] flex gap-2">
          <textarea
            ref={inputRef}
            rows={1}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              rolePersona === 'farmer'
                ? 'Ask in simple English... e.g. How many Rupees (₹) did I save today? (Press Enter to send)'
                : 'Ask about avionics telemetry or crop leaf care... (Press Enter to send)'
            }
            className="flex-1 px-3 py-2.5 bg-[#0b1326] border border-[#334155] rounded-xs text-xs text-white placeholder-[#87948b] focus:outline-none focus:border-[#4cd7f6] resize-none max-h-24 leading-normal"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2.5 bg-[#002f38] hover:bg-[#004754] disabled:opacity-50 disabled:cursor-not-allowed text-[#4cd7f6] border border-[#4cd7f6] rounded-xs font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
