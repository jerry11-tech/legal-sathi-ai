'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, ShieldCheck, Scale, ArrowRight } from 'lucide-react';

export default function VerifyNoticePage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email';
  const token = searchParams.get('token') || '';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-8 text-center shadow-2xl space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 shadow-md">
          <Mail size={32} />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <Scale size={14} /> Account Security Verification
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Verify Your Email</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Please verify your email address to activate your account. Verification details were sent to:
          </p>
          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 break-all pt-1 font-mono">{email}</p>
        </div>

        <div className="rounded-2xl bg-slate-50 dark:bg-slate-850 p-4 text-xs text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 space-y-1">
          <p className="font-bold text-slate-800 dark:text-white">⏱️ Link expires in 24 hours.</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Check your inbox or spam folder for the activation email.</p>
        </div>

        {token && (
          <div className="pt-2">
            <Link
              href={`/account/verify?token=${token}`}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition"
            >
              <ShieldCheck size={18} />
              <span>One-Click Auto Verify & Activate</span>
            </Link>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <Link href="/login" className="font-bold text-blue-600 hover:underline dark:text-blue-400">
            Back to Login
          </Link>
          <Link href="/" className="hover:underline">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
