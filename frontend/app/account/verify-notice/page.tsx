'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, ShieldCheck, Scale, ArrowRight } from 'lucide-react';

export default function VerifyNoticePage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email';
  const token = searchParams.get('token') || '';

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero p-4 sm:p-6 dark:bg-navy-deeper">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-line bg-white p-8 text-center shadow-card dark:border-slate-800 dark:bg-[#0B1331]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-soft text-royal shadow-md">
          <Mail size={32} />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1 text-xs font-bold text-royal dark:bg-slate-800 dark:text-blue-300">
            <Scale size={14} /> Account Security Verification
          </div>
          <h2 className="text-2xl font-black tracking-tight text-navy-text dark:text-white">Verify Your Email</h2>
          <p className="text-xs leading-relaxed text-bodytext dark:text-slate-400">
            Please verify your email address to activate your account. Verification details were sent to:
          </p>
          <p className="break-all pt-1 font-mono text-xs font-bold text-royal dark:text-blue-400">{email}</p>
        </div>

        <div className="space-y-1 rounded-2xl border border-line bg-soft p-4 text-xs text-bodytext dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
          <p className="font-bold text-navy-text dark:text-white">⏱️ Link expires in 24 hours.</p>
          <p className="text-[11px]">Check your inbox or spam folder for the activation email.</p>
        </div>

        {token && (
          <div className="pt-2">
            <Link
              href={`/account/verify?token=${token}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-mint px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-mint/30 transition hover:bg-emerald-700"
            >
              <ShieldCheck size={18} />
              <span>One-Click Auto Verify & Activate</span>
            </Link>
          </div>
        )}

        <div className="flex justify-between border-t border-line pt-4 text-xs text-bodytext dark:border-slate-800 dark:text-slate-400">
          <Link href="/login" className="font-bold text-royal hover:underline dark:text-blue-400">
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