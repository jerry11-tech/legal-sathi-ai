'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  Copy,
  Download,
  FileCheck,
  FileText,
  FolderOpen,
  History,
  Loader2,
  Mic,
  Paperclip,
  Pin,
  Plus,
  Scale,
  Send,
  Share2,
  Sparkles,
  Trash2,
  Volume2,
} from 'lucide-react';
import LegalResponseCard, { type LegalResponse } from '@/components/legal-response';
import Markdown from '@/components/markdown';
import SmartSuggestions from '@/components/smart-suggestions';
import GuestLimitModal from '@/components/guest-limit-modal';
import { getGuestCount, incrementGuestCount, isGuestLimitReached } from '@/lib/guest';

type Message =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string; response?: LegalResponse }
  | { role: 'error'; content: string };

const WELCOME =
  "Hello! I am **LegalSathi AI**, your Indian Legal Intelligence assistant.\n\nAsk me any question regarding:\n- Women's Rights & POSH / Domestic Violence\n- Cyber Crime, Financial Fraud & Online Bullying\n- Rental & Tenant Disputes\n- Police Complaints (CrPC / BNSS FIRs)\n- Labour & Workplace Rights\n- Consumer Complaints & RTI Forms\n\n_This platform provides legal information for educational purposes, not official legal representation._";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: WELCOME },
  ]);
  const [loading, setLoading] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [guestCount, setGuestCount] = useState(0);
  const [pinnedChats, setPinnedChats] = useState<string[]>([
    'Cyber Fraud Recovery Process',
    'Tenant Security Deposit Dispute',
    'POSH Workplace Complaint Steps',
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialHandled = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem('legalsathi_token');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setGuestCount(getGuestCount());
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (initialQuery && !initialHandled.current) {
      initialHandled.current = true;
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  const handleSend = async (customQuery?: string) => {
    const textToSend = (customQuery || query).trim();
    if (!textToSend || loading) return;

    if (!isLoggedIn && isGuestLimitReached()) {
      setShowGuestModal(true);
      return;
    }

    const userMsg: Message = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    if (!isLoggedIn) {
      const updated = incrementGuestCount();
      setGuestCount(updated);
      if (updated >= 5) {
        setTimeout(() => setShowGuestModal(true), 1200);
      }
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('legalsathi_token') : null;
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query: userMsg.content, language: 'en' }),
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      const data: LegalResponse = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.summary || 'Legal response', response: data },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'error',
          content: `Sorry, I could not reach the LegalSathi backend. (${(err as Error).message})`,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleExportChat = () => {
    const text = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LegalSathi_Chat_Export_${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-navy-deeper">
      {/* Left Chat History Panel */}
      <aside className="hidden w-72 flex-col space-y-4 border-r border-line bg-white p-4 dark:border-slate-800 dark:bg-[#0B1331] lg:flex">
        <button
          onClick={() => {
            setMessages([{ role: 'assistant', content: WELCOME }]);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-royal px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-bright"
        >
          <Plus size={16} />
          <span>New Chat Session</span>
        </button>

        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          <div>
            <div className="mb-2 flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-bodytext">
              <Pin size={12} /> Pinned Consultations
            </div>
            <div className="space-y-1">
              {pinnedChats.map((chat, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(chat)}
                  className="w-full truncate rounded-xl px-3 py-2 text-left text-xs font-medium text-navy-text transition hover:bg-soft dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {chat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-bodytext">
              <History size={12} /> Recent History
            </div>
            <div className="space-y-1">
              {['IPC 302 legal implications', 'POSH committee filing procedure', 'Consumer court fee structure'].map(
                (item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(item)}
                    className="w-full truncate rounded-xl px-3 py-2 text-left text-xs font-medium text-bodytext transition hover:bg-soft dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-line pt-3 dark:border-slate-800">
          <button
            onClick={handleExportChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-soft py-2 text-xs font-semibold text-navy-text transition hover:bg-line dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
          >
            <Download size={14} /> Export Chat (TXT)
          </button>
        </div>
      </aside>

      {/* Main Chat Workspace */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-[68px] z-20 flex h-14 items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur sm:px-6 dark:border-slate-800 dark:bg-[#0B1331]/90">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-royal text-white shadow-xs">
              <Scale size={16} />
            </span>
            <div>
              <h1 className="text-sm font-bold text-navy-text dark:text-white">LegalSathi AI Consultation</h1>
              <p className="text-[10px] font-medium text-bodytext">Enterprise Indian Legal Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportChat}
              className="flex items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-xs font-semibold text-navy-text transition hover:bg-soft dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Download size={13} /> Export
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Online
            </span>
          </div>
        </header>

        {/* Conversation Feed */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl space-y-5 px-3 py-5 sm:px-6 sm:py-6">
            {messages.map((msg, idx) => {
              if (msg.role === 'user') {
                return (
                  <div key={idx} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-royal px-4 py-3 text-sm leading-relaxed text-white shadow-md shadow-royal/20 sm:max-w-[75%]">
                      {msg.content}
                    </div>
                  </div>
                );
              }

              if (msg.role === 'error') {
                return (
                  <div key={idx} className="flex justify-start">
                    <div className="max-w-[95%] rounded-2xl rounded-bl-md border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800 shadow-xs dark:border-red-900/50 dark:bg-red-950 dark:text-red-300 sm:max-w-[90%]">
                      {msg.content}
                    </div>
                  </div>
                );
              }

              return (
                <div key={idx} className="flex justify-start">
                  <div className="w-full max-w-[95%] rounded-2xl rounded-bl-md border border-line bg-white px-4 py-4 shadow-sm sm:max-w-[90%] sm:px-5 sm:py-5 dark:border-slate-800 dark:bg-[#0B1331]">
                    {msg.response ? (
                      <LegalResponseCard response={msg.response} />
                    ) : (
                      <Markdown content={msg.content} />
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2.5 rounded-2xl rounded-bl-md border border-line bg-white px-4 py-3.5 text-sm text-bodytext shadow-sm dark:border-slate-800 dark:bg-[#0B1331]">
                  <Loader2 size={16} className="animate-spin text-royal" />
                  Analyzing query against Indian legal database...
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Sticky Bottom Input Bar */}
        <div className="sticky bottom-0 border-t border-line bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-[#0B1331]/95">
          <div className="mx-auto w-full max-w-6xl space-y-2.5 px-3 py-3 sm:px-6 sm:py-4">
            {/* Guest Progress Counter */}
            {!isLoggedIn && (
              <div className="flex items-center justify-between px-1 text-xs font-semibold text-bodytext">
                <span className="flex items-center gap-2">
                  <span className="text-bodytext dark:text-slate-400">Guest Limit:</span>
                  <span className="font-mono text-sm font-bold tracking-widest text-royal">
                    {'●'.repeat(Math.min(guestCount, 5))}{'○'.repeat(Math.max(0, 5 - guestCount))}
                  </span>
                </span>
                <span className="font-bold text-bodytext dark:text-slate-400">
                  {guestCount >= 5 ? '0 of 5 free chats remaining' : `${5 - guestCount} of 5 free chats remaining`}
                </span>
              </div>
            )}

            {!query && messages.length <= 2 && !isGuestLimitReached() && (
              <SmartSuggestions
                onSelect={(suggestion) => {
                  setQuery(suggestion);
                  inputRef.current?.focus();
                }}
              />
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 rounded-2xl border border-line bg-slate-50 p-2 shadow-xs transition focus-within:border-royal focus-within:bg-white dark:border-slate-800 dark:bg-slate-900 dark:focus-within:bg-[#0B1331]"
            >
              <button
                type="button"
                onClick={() => alert('Voice input activated. Speak your query...')}
                className="rounded-xl p-2 text-bodytext transition hover:bg-soft hover:text-navy-text dark:text-slate-500 dark:hover:bg-slate-800"
                title="Voice Input"
              >
                <Mic size={18} />
              </button>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask any legal question (e.g., Landlord deposit dispute, POSH complaint, FIR rights)..."
                disabled={loading}
                className="flex-1 bg-transparent px-2 text-xs text-navy-text outline-none placeholder:text-bodytext/70 sm:text-sm dark:text-white"
              />

              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-royal text-white transition hover:bg-bright disabled:opacity-40 disabled:hover:bg-royal"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>

            <p className="text-center text-[10px] text-bodytext dark:text-slate-500">
              LegalSathi AI provides general legal information. For official legal representation, consult a licensed advocate.
            </p>
          </div>
        </div>
      </div>

      <GuestLimitModal isOpen={showGuestModal} onClose={() => setShowGuestModal(false)} />
    </div>
  );
}