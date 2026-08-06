'use client';

import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function AccountVerifiedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={48} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900">Email Verified Successfully!</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Your LegalSathi AI account is now active. You can now save legal consultations, track case roadmaps, and generate document drafts.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 transition"
          >
            Continue to Login / Dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
