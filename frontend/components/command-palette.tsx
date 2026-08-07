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
          icon: <MessageSquare size={16} className="text-blue-600" />,
          action: () => {
            router.push(query ? `/chat?q=${encodeURIComponent(query)}` : '/chat');
            onClose();
          },
        },
        {
          label: 'Launch Case Navigator Studio',
          desc: 'Convert complex legal problems into structured roadmaps & checklists',
          icon: <Sparkles size={16} className="text-indigo-600" />,
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
          icon: <Building2 size={16} className="text-blue-600" />,
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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 backdrop-blur-md p-4 pt-16 sm:pt-24 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xl overflow-hidden transition-all">
        {/* Search Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 px-4 py-3.5 bg-slate-50/70 dark:bg-slate-850">
          <Search size={18} className="text-slate-400 shrink-0" />
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
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {filteredGroups.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs text-slate-500 font-medium">No direct matching commands found for "{query}".</p>
              <button
                onClick={() => {
                  router.push(`/chat?q=${encodeURIComponent(query)}`);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
              >
                <span>Ask AI Chat: "{query}"</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            filteredGroups.map((group, idx) => (
              <div key={idx} className="space-y-1">
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {group.category}
                </p>
                {group.items.map((item, i) => (
                  <button
                    key={i}
                    onClick={item.action}
                    className="w-full flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                          {item.label}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{item.desc}</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                  </button>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 px-4 py-2.5 text-[11px] text-slate-400">
          <span>Tip: Press <kbd className="rounded bg-slate-200 px-1 font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-300">Enter</kbd> to execute selection</span>
          <span className="font-mono">LegalSathi AI v1.0</span>
        </div>
      </div>
    </div>
  );
}
