'use client';

import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function AccountVerifiedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero p-4 dark:bg-navy-deeper">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-line bg-white p-8 text-center shadow-card dark:border-slate-800 dark:bg-[#0B1331]">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-mint/15 text-mint">
          <CheckCircle2 size={48} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-navy-text dark:text-white">Email Verified Successfully!</h2>
          <p className="text-xs leading-relaxed text-bodytext sm:text-sm">
            Your LegalSathi AI account is now active. You can now save legal consultations, track case roadmaps, and generate document drafts.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 rounded-2xl bg-royal px-6 py-3.5 text-xs font-bold text-white shadow-md shadow-royal/30 transition hover:bg-bright"
          >
            Continue to Login / Dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}