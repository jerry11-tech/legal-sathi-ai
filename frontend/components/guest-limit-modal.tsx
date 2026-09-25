'use client';

import Link from 'next/link';
import { Lock, Sparkles, UserPlus, X } from 'lucide-react';

interface GuestLimitModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export default function GuestLimitModal({ isOpen, onClose }: GuestLimitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061D3F]/70 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-line bg-white p-6 text-center shadow-2xl sm:p-8 space-y-5 dark:border-slate-700 dark:bg-[#0B1331]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1 text-bodytext transition hover:bg-soft hover:text-navy-text dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          title="Close"
        >
          <X size={18} />
        </button>

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-royal/20 bg-soft text-royal shadow-xs dark:border-slate-700 dark:bg-slate-800">
          <Sparkles size={28} />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-navy-text dark:text-white">Continue Your Legal Journey</h3>
          <p className="text-xs leading-relaxed text-bodytext dark:text-slate-400 sm:text-sm">
            You have used all 5 free legal questions. Create a free LegalSathi AI account to continue chatting, generate legal documents, upload files, save your conversations, and access personalized legal guidance.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-soft p-3 text-xs font-semibold text-bodytext space-y-1 text-left dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
          <p className="flex items-center gap-1.5"><span className="font-bold text-mint">✓</span> Unlimited AI legal chats</p>
          <p className="flex items-center gap-1.5"><span className="font-bold text-mint">✓</span> Save chats & case history</p>
          <p className="flex items-center gap-1.5"><span className="font-bold text-mint">✓</span> Generate FIR, Notice & RTI document drafts</p>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <Link
            href="/register"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-royal px-4 py-3 text-xs font-bold text-white shadow-md shadow-royal/30 hover:bg-bright transition"
          >
            <UserPlus size={16} /> Create Free Account
          </Link>
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-xs font-bold text-navy-text hover:bg-soft transition dark:border-slate-700 dark:bg-transparent dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Login
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="py-1 text-xs font-semibold text-bodytext transition hover:text-navy-text dark:text-slate-400 dark:hover:text-slate-200"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
