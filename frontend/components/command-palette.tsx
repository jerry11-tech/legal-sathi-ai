'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BookOpen,
  Building2,
  FileCheck,
  FileText,
  FolderOpen,
  Gavel,
  Globe,
  Home,
  Lock,
  MessageSquare,
  PhoneCall,
  Scale,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  User,
  X,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const allActions = [
    {
      category: 'Primary Actions',
      items: [
        {
          label: 'Ask AI Legal Assistant',
          desc: 'Get instant legal guidance in plain language under Indian laws',
          icon: <MessageSquare size={16} className="text-royal" />,
          action: () => {
            router.push(query ? `/chat?q=${encodeURIComponent(query)}` : '/chat');
            onClose();
          },
        },
        {
          label: 'Launch Case Navigator Studio',
          desc: 'Convert complex legal problems into structured roadmaps & checklists',
          icon: <Sparkles size={16} className="text-accentpurple" />,
          action: () => {
            router.push('/navigator');
            onClose();
          },
        },
        {
          label: 'Legal Document Generator',
          desc: 'Draft FIR complaints, rental notices, affidavits, and RTI forms',
          icon: <FileText size={16} className="text-amber-600" />,
          action: () => {
            router.push('/documents');
            onClose();
          },
        },
        {
          label: 'My Cases Vault & Progress',
          desc: 'Track active case roadmaps, evidence, and saved drafts',
          icon: <FolderOpen size={16} className="text-emerald-600" />,
          action: () => {
            router.push('/dashboard');
            onClose();
          },
        },
      ],
    },
    {
      category: 'Popular Legal Topics',
      items: [
        {
          label: 'Cyber Fraud & Online Scam (Helpline 1930)',
          desc: 'Report financial fraud, bank OTP theft, or online phishing',
          icon: <Lock size={16} className="text-red-600" />,
          action: () => {
            router.push('/chat?q=Cyber+Fraud+1930+Helpline');
            onClose();
          },
        },
        {
          label: 'Rental Deposit & Tenant Eviction Dispute',
          desc: 'Model Tenancy Act, rent agreements & security deposit refund',
          icon: <Building2 size={16} className="text-royal" />,
          action: () => {
            router.push('/chat?q=Rent+Deposit+Tenant+Dispute');
            onClose();
          },
        },
        {
          label: 'Women Protection (POSH & Domestic Violence)',
          desc: 'POSH workplace committees & DV Act 2005 legal provisions',
          icon: <Shield size={16} className="text-pink-600" />,
          action: () => {
            router.push('/chat?q=Women+POSH+Domestic+Violence');
            onClose();
          },
        },
        {
          label: 'Police Complaint & FIR Rights (CrPC / BNSS)',
          desc: 'Zero FIR, police station jurisdiction & complaint rights',
          icon: <Gavel size={16} className="text-purple-600" />,
          action: () => {
            router.push('/chat?q=Police+FIR+CrPC+BNSS');
            onClose();
          },
        },
      ],
    },
  ];

  const filteredGroups = allActions
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.desc.toLowerCase().includes(query.toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-navy-deeper/70 p-4 pt-16 backdrop-blur-md animate-in fade-in duration-150 sm:pt-24">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-line bg-white shadow-2xl transition-all dark:border-slate-800 dark:bg-[#0B1331]">
        {/* Search Header */}
        <div className="flex items-center gap-3 border-b border-line bg-slate-50/70 px-4 py-3.5 dark:border-slate-800 dark:bg-slate-900">
          <Search size={18} className="shrink-0 text-bodytext" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filteredGroups[0]?.items[0]) {
                filteredGroups[0].items[0].action();
              }
            }}
            placeholder="Type to search commands, legal topics, or acts... (Press Enter to launch)"
            className="flex-1 bg-transparent text-sm font-medium text-navy-text outline-none placeholder:text-bodytext/70 dark:text-white"
            autoFocus
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-bodytext transition hover:bg-soft dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] space-y-4 overflow-y-auto p-3">
          {filteredGroups.length === 0 ? (
            <div className="space-y-2 py-8 text-center">
              <p className="text-xs font-medium text-bodytext">No direct matching commands found for "{query}".</p>
              <button
                onClick={() => {
                  router.push(`/chat?q=${encodeURIComponent(query)}`);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-royal px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-bright"
              >
                <span>Ask AI Chat: "{query}"</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            filteredGroups.map((group, idx) => (
              <div key={idx} className="space-y-1">
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-bodytext dark:text-slate-500">
                  {group.category}
                </p>
                {group.items.map((item, i) => (
                  <button
                    key={i}
                    onClick={item.action}
                    className="group flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-soft dark:hover:bg-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-soft dark:border-slate-800 dark:bg-slate-800">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-navy-text transition group-hover:text-royal dark:text-white">
                          {item.label}
                        </p>
                        <p className="line-clamp-1 text-[11px] text-bodytext dark:text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-line transition group-hover:translate-x-0.5 group-hover:text-royal dark:text-slate-600" />
                  </button>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-line bg-slate-50/50 px-4 py-2.5 text-[11px] text-bodytext dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <span>Tip: Press <kbd className="rounded bg-line px-1 font-mono text-navy-text dark:bg-slate-800 dark:text-slate-300">Enter</kbd> to execute selection</span>
          <span className="font-mono">LegalSathi AI v1.0</span>
        </div>
      </div>
    </div>
  );
}
