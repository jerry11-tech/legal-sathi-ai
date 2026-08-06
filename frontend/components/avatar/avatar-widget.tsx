'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  AlertCircle,
  FileText,
  FolderOpen,
  HelpCircle,
  Loader2,
  Maximize2,
  Minus,
  Paperclip,
  PhoneCall,
  Scale,
  Search,
  Send,
  Sliders,
  Sparkles,
  X,
} from 'lucide-react';
import LegalSathiAvatar, { type AvatarExpression } from './legalsathi-avatar';
import WebsiteTour from './website-tour';
import AvatarSettingsModal, { type AvatarSettingsState } from './avatar-settings';
import LegalResponseCard, { type LegalResponse } from '../legal-response';
import Markdown from '../markdown';

const DEFAULT_SETTINGS: AvatarSettingsState = {
  size: 'md',
  animations: true,
  minimized: true,
  hidden: false,
};

type QuickAction = {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  action: () => void;
};

export default function AvatarWidget() {
  const pathname = usePathname();
  const router = useRouter();

  const [settings, setSettings] = useState<AvatarSettingsState>(DEFAULT_SETTINGS);
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<
    Array<
      | { role: 'user'; content: string }
      | { role: 'assistant'; content: string; response?: LegalResponse }
      | { role: 'error'; content: string }
    >
  >([]);

  const [expression, setExpression] = useState<AvatarExpression>('idle');
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Clean non-intrusive floating avatar (never pops unsolicited speech bubbles)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('legalsathi_avatar_settings');
      if (saved) {
        setSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch {}
  }, []);

  // Scroll to bottom of message list inside widget panel
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  // Inactivity Detection (30 Seconds)
  useEffect(() => {
    const resetTimer = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(() => {
        if (!isOpen) {
          setShowTooltip(true);
          setExpression('bounce');
          setTimeout(() => setExpression('idle'), 2500);
        }
      }, 30000);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [isOpen]);

  const updateSettings = (partial: Partial<AvatarSettingsState>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      try {
        localStorage.setItem('legalsathi_avatar_settings', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleSendQuery = async (customText?: string) => {
    const textToSend = (customText || query).trim();
    if (!textToSend || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: textToSend }]);
    setQuery('');
    setLoading(true);
    setExpression('thinking');

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/chat/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: textToSend, language: 'en' }),
        }
      );

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      const data: LegalResponse = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.summary || 'Legal response', response: data },
      ]);
      setExpression('happy');
      setTimeout(() => setExpression('idle'), 3000);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'error',
          content: `Could not reach LegalSathi backend (${(err as Error).message}). Ensure port 8000 is running.`,
        },
      ]);
      setExpression('warning');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'ask',
      title: 'Ask a Legal Question',
      desc: 'Get instant legal guidance under Indian law',
      icon: <Scale size={18} className="text-blue-600" />,
      action: () => {
        if (pathname !== '/chat') router.push('/chat');
        inputRef.current?.focus();
      },
    },
    {
      id: 'categories',
      title: 'Explore Legal Categories',
      desc: "Tenant, Women's Rights, Cyber Fraud & more",
      icon: <FolderOpen size={18} className="text-indigo-600" />,
      action: () => {
        router.push('/chat');
      },
    },
    {
      id: 'documents',
      title: 'Upload Legal Document',
      desc: 'Generate or analyze notices, FIRs & contracts',
      icon: <FileText size={18} className="text-emerald-600" />,
      action: () => router.push('/documents'),
    },
    {
      id: 'search',
      title: 'Search Laws',
      desc: 'Search Indian Acts & statutory sections',
      icon: <Search size={18} className="text-amber-600" />,
      action: () => router.push('/chat'),
    },
    {
      id: 'emergency',
      title: 'Emergency Helplines',
      desc: 'National helplines (1091, 1098, 1930, 14567)',
      icon: <PhoneCall size={18} className="text-rose-600" />,
      action: () => {
        handleSendQuery('What are the official national legal emergency helpline numbers in India?');
      },
    },
  ];

  const getRouteTip = (path: string): string => {
    if (path.startsWith('/navigator')) {
      return 'Enter your legal problem to generate a step-by-step roadmap, evidence checklist, authority guide, and complaint draft.';
    }
    if (path.startsWith('/chat')) {
      return 'Describe your legal issue in detail (include dates, parties, and documents) for accurate legal guidance.';
    }
    if (path.startsWith('/documents')) {
      return 'Select a legal template below to automatically generate FIR complaints, rental notices, or legal letters.';
    }
    if (path.startsWith('/dashboard')) {
      return 'View your consultation activity, saved legal document drafts, and emergency helpline contacts.';
    }
    return 'Welcome to LegalSathi AI! I am your interactive legal guide. Ask me any query or take a quick tour.';
  };

  if (settings.hidden) {
    return (
      <button
        onClick={() => updateSettings({ hidden: false })}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-blue-200 bg-white/95 px-4 py-2 text-xs font-bold text-blue-600 shadow-xl backdrop-blur-md transition hover:bg-blue-50"
      >
        <Sparkles size={14} /> Revive Legal Guide
      </button>
    );
  }

  return (
    <>
      {/* Floating Trigger Widget (Bottom Right: 24px) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {/* Hover Tooltip / Inactivity Bubble */}
        {showTooltip && !isOpen && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-md">
            <span className="text-xs font-semibold text-slate-800">
              👋 Hi! Need legal help?
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Floating Trigger Button */}
        {!isOpen && (
          <div
            className="group relative flex items-center gap-2"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {/* Quick Settings Icon on Hover */}
            <button
              onClick={() => setShowSettings(true)}
              aria-label="Guide Settings"
              className="hidden group-hover:flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-600 shadow-md backdrop-blur-md hover:bg-slate-50 transition"
            >
              <Sliders size={15} />
            </button>

            {/* Main Avatar Trigger Button */}
            <button
              onClick={() => {
                setIsOpen(true);
                setShowTooltip(false);
              }}
              aria-label="Open LegalSathi Assistant"
              className="relative cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              <LegalSathiAvatar expression={settings.animations ? expression : 'idle'} size="md" />
            </button>
          </div>
        )}

        {/* Expanded Assistant Panel (380px - 420px width, Glassmorphism design) */}
        {isOpen && (
          <div className="animate-in slide-in-from-bottom-5 fade-in duration-300 flex h-[620px] max-h-[85vh] w-[92vw] sm:w-[410px] flex-col rounded-3xl border border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-900/20 backdrop-blur-xl">
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 sm:px-5">
              <div className="flex items-center gap-3">
                <LegalSathiAvatar expression={expression} size="sm" showBadge={false} showGlow={false} />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">LegalSathi AI</h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200/70">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Online
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500">Your AI Legal Companion</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowSettings(true)}
                  aria-label="Settings"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                >
                  <Sliders size={16} />
                </button>
                <button
                  onClick={() => {
                    setShowTour(true);
                  }}
                  aria-label="Replay Tour"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                >
                  <HelpCircle size={16} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Minimize"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                >
                  <Minus size={16} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {/* Welcome Message Banner */}
              <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 p-4">
                <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
                  👋 <strong>Hello! I’m LegalSathi.</strong>
                  <br />
                  I'm here to help you understand Indian laws, explain your legal rights, analyze documents, and guide you step-by-step.
                </p>
              </div>

              {/* Messages History inside Widget */}
              {messages.map((msg, idx) => {
                if (msg.role === 'user') {
                  return (
                    <div key={idx} className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-blue-600 px-3.5 py-2.5 text-xs sm:text-sm text-white shadow-sm">
                        {msg.content}
                      </div>
                    </div>
                  );
                }

                if (msg.role === 'error') {
                  return (
                    <div key={idx} className="flex justify-start">
                      <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                        {msg.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={idx} className="flex justify-start">
                    <div className="max-w-[95%] w-full rounded-2xl rounded-bl-md border border-slate-200/80 bg-white p-3.5 shadow-sm text-xs leading-relaxed">
                      {msg.response ? (
                        <LegalResponseCard response={msg.response} />
                      ) : (
                        <Markdown content={msg.content} compact />
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Thinking State */}
              {loading && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md border border-blue-200 bg-blue-50/80 px-3.5 py-2.5 text-xs text-blue-700 shadow-xs">
                    <Loader2 size={14} className="animate-spin text-blue-600" />
                    <span>Analyzing your legal question...</span>
                  </div>
                </div>
              )}

              {/* Quick Action Cards (Shown when no active chat) */}
              {messages.length === 0 && !loading && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                    Quick Actions
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {quickActions.map((qa) => (
                      <button
                        key={qa.id}
                        onClick={qa.action}
                        className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 text-left shadow-2xs transition-all hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-xs active:scale-[0.98]"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 transition group-hover:bg-white group-hover:shadow-xs">
                          {qa.icon}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                            {qa.title}
                          </h4>
                          <p className="text-[11px] text-slate-500">{qa.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Embedded Chat Input Box */}
            <div className="border-t border-slate-100 bg-white p-3 rounded-b-3xl">
              <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50/60 p-1.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <button
                  type="button"
                  onClick={() => router.push('/documents')}
                  title="Upload / Attach Document"
                  className="p-2 text-slate-400 hover:text-blue-600 transition"
                >
                  <Paperclip size={16} />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendQuery()}
                  placeholder="Describe your legal issue..."
                  disabled={loading}
                  className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none disabled:opacity-60"
                />
                <button
                  onClick={() => handleSendQuery()}
                  disabled={loading || !query.trim()}
                  aria-label="Send Query"
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs hover:bg-blue-700 disabled:opacity-40 transition"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Website Spotlight Tour */}
      <WebsiteTour isOpen={showTour} onClose={() => setShowTour(false)} />

      {/* Settings Modal */}
      <AvatarSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdate={updateSettings}
        onReplayTour={() => setShowTour(true)}
        onResetOnboarding={() => {
          try {
            localStorage.removeItem('legalsathi_tour_completed');
            localStorage.removeItem('legalsathi_avatar_settings');
          } catch {}
          setSettings(DEFAULT_SETTINGS);
          setMessages([]);
        }}
      />
    </>
  );
}
