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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl text-center space-y-5">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          title="Close"
        >
          <X size={18} />
        </button>

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-xs border border-blue-100">
          <Sparkles size={28} />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-slate-900">Continue Your Legal Journey</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            You have used all 5 free legal questions. Create a free LegalSathi AI account to continue chatting, generate legal documents, upload files, save your conversations, and access personalized legal guidance.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-600 font-semibold space-y-1 text-left border border-slate-100">
          <p className="flex items-center gap-1.5"><span className="text-emerald-500 font-bold">✓</span> Unlimited AI legal chats</p>
          <p className="flex items-center gap-1.5"><span className="text-emerald-500 font-bold">✓</span> Save chats & case history</p>
          <p className="flex items-center gap-1.5"><span className="text-emerald-500 font-bold">✓</span> Generate FIR, Notice & RTI document drafts</p>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <Link
            href="/register"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 transition"
          >
            <UserPlus size={16} /> Create Free Account
          </Link>
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            Login
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 py-1 transition"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
