'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  FolderOpen,
  Home,
  MessageSquare,
  Search,
  Shield,
  Sparkles,
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
        else {
          // Trigger open via custom event or state
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = [
    {
      label: 'Ask AI Chat',
      desc: 'Start a legal conversation with LegalSathi',
      icon: <MessageSquare size={16} className="text-blue-600" />,
      action: () => {
        router.push(query ? `/chat?q=${encodeURIComponent(query)}` : '/chat');
        onClose();
      },
    },
    {
      label: 'Launch Case Navigator',
      desc: 'Generate a step-by-step action plan & roadmap',
      icon: <Sparkles size={16} className="text-indigo-600" />,
      action: () => {
        router.push('/navigator');
        onClose();
      },
    },
    {
      label: 'Legal Documents & Drafts',
      desc: 'FIR, Legal Notices, Consumer Complaints',
      icon: <FileText size={16} className="text-emerald-600" />,
      action: () => {
        router.push('/documents');
        onClose();
      },
    },
    {
      label: 'My Cases Dashboard',
      desc: 'View active case progress & saved history',
      icon: <FolderOpen size={16} className="text-amber-600" />,
      action: () => {
        router.push('/dashboard');
        onClose();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/50 backdrop-blur-sm p-4 pt-20 animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden transition-all">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 bg-slate-50/50">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                items[0].action();
              }
            }}
            placeholder="Search commands, legal topics, or type a query... (Ctrl + K)"
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
            autoFocus
          />
          <kbd className="hidden sm:inline-block rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-400">
            ESC
          </kbd>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        {/* Command Options List */}
        <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={item.action}
              className="w-full flex items-center justify-between gap-3 rounded-xl p-3 text-left hover:bg-slate-50 transition group"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-white transition">
                  {item.icon}
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                    {item.label}
                  </p>
                  <p className="text-[11px] text-slate-500">{item.desc}</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 group-hover:text-blue-600">
                Jump ➔
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
