'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mic, Paperclip, Plus, Scale, Send, Sparkles } from 'lucide-react';
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
  "Hello! I am **LegalSathi**, your AI legal assistant.\n\nAsk me about:\n- Women's Rights & POSH / Domestic Violence\n- Children's Rights (POCSO)\n- Senior Citizen Rights\n- Rental / Tenant Disputes\n- Cyber Bullying & Financial Fraud\n- Copyright\n- Consumer Rights\n- Police Complaints\n\n_This platform provides legal information for educational purposes, not legal advice._";

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

  // Handle URL prefilled query from homepage
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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/chat/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Remainder': 'true' },
          body: JSON.stringify({ query: userMsg.content, language: 'en' }),
        }
      );

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
          content: `Sorry, I could not reach the LegalSathi backend. Please make sure port 8000 is running. (${
            (err as Error).message
          })`,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      {/* Top Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Scale size={16} />
            </span>
            <div>
              <h1 className="text-sm font-bold text-slate-900">LegalSathi AI Consultation</h1>
              <p className="text-[11px] text-slate-500 font-medium">ChatGPT-Heart Legal Assistant</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Online
          </span>
        </div>
      </header>

      {/* Conversation Feed */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-5 px-3 py-5 sm:px-6 sm:py-6">
          {messages.map((msg, idx) => {
            if (msg.role === 'user') {
              return (
                <div key={idx} className="flex justify-end">
                  <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-br-md bg-blue-600 px-4 py-3 text-sm leading-relaxed text-white shadow-md shadow-blue-600/20">
                    {msg.content}
                  </div>
                </div>
              );
            }

            if (msg.role === 'error') {
              return (
                <div key={idx} className="flex justify-start">
                  <div className="max-w-[95%] sm:max-w-[90%] rounded-2xl rounded-bl-md border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800 shadow-xs">
                    {msg.content}
                  </div>
                </div>
              );
            }

            return (
              <div key={idx} className="flex justify-start">
                <div className="max-w-[95%] sm:max-w-[90%] w-full rounded-2xl rounded-bl-md border border-slate-200/80 bg-white px-4 py-4 sm:px-5 sm:py-5 shadow-sm">
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
              <div className="inline-flex items-center gap-2.5 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-500 shadow-sm">
                <Loader2 size={16} className="animate-spin text-blue-600" />
                Analyzing your legal query...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Sticky Bottom Input Bar */}
      <div className="sticky bottom-0 border-t border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-3 py-3 sm:px-6 sm:py-4 space-y-2.5">
          {/* Guest Progress Counter */}
          {!isLoggedIn && (
            <div className="flex items-center justify-between text-xs px-1 text-slate-500 font-semibold">
              <span className="flex items-center gap-2">
                <span className="text-slate-600">Guest Usage:</span>
                <span className="tracking-widest font-mono text-blue-600 font-bold text-sm">
                  {'●'.repeat(Math.min(guestCount, 5))}{'○'.repeat(Math.max(0, 5 - guestCount))}
                </span>
              </span>
              <span className="text-slate-600 font-bold">
                {guestCount >= 5 ? '0 of 5 free chats remaining' : `${5 - guestCount} of 5 free chats remaining`}
              </span>
            </div>
          )}

          {!query && messages.length <= 2 && !isGuestLimitReached() && (
            <SmartSuggestions onSelect={(q) => handleSend(q)} />
          )}

          <div
            className={`relative flex items-end gap-2 rounded-2xl border bg-white p-1.5 shadow-sm transition-all ${
              !isLoggedIn && isGuestLimitReached()
                ? 'border-red-200 bg-slate-100/80 cursor-not-allowed'
                : 'border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100'
            }`}
            onClick={() => {
              if (!isLoggedIn && isGuestLimitReached()) {
                setShowGuestModal(true);
              }
            }}
          >
            <button
              type="button"
              disabled={!isLoggedIn && isGuestLimitReached()}
              onClick={() => {
                if (!isLoggedIn) setShowGuestModal(true);
                else alert('Attachment upload ready');
              }}
              className="p-2 text-slate-400 hover:text-blue-600 transition disabled:opacity-40"
              title="Attach File / Document"
            >
              <Plus size={18} />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={
                !isLoggedIn && isGuestLimitReached()
                  ? 'Free guest question limit reached. Create account to continue...'
                  : 'Describe your legal issue in plain language...'
              }
              disabled={loading || (!isLoggedIn && isGuestLimitReached())}
              className="flex-1 bg-transparent px-2 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none disabled:opacity-60"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !query.trim() || (!isLoggedIn && isGuestLimitReached())}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs hover:bg-blue-700 disabled:opacity-40 transition"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>

            {!isLoggedIn && isGuestLimitReached() && (
              <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] rounded-2xl flex items-center justify-center">
                <button
                  onClick={() => setShowGuestModal(true)}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700"
                >
                  Unlock Unlimited Chats ➔
                </button>
              </div>
            )}
          </div>
          <p className="text-center text-[11px] text-slate-400">
            Legal information only · Not a substitute for professional legal advice
          </p>
        </div>
      </div>
      <GuestLimitModal isOpen={showGuestModal} onClose={() => setShowGuestModal(false)} />
    </div>
  );
}
