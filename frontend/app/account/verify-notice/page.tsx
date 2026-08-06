'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, ShieldCheck, ArrowRight } from 'lucide-react';

export default function VerifyNoticePage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email';
  const token = searchParams.get('token') || '';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
          <Mail size={32} />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900">Verify Your Email</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Please verify your email address before accessing your account. We sent a verification link to:
          </p>
          <p className="text-xs font-bold text-blue-600 break-all pt-1">{email}</p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-600 border border-slate-100 space-y-1">
          <p className="font-semibold text-slate-800">⏱️ Link expires in 24 hours.</p>
          <p>Check your inbox or spam folder for the verification email.</p>
        </div>

        {token && (
          <div className="pt-2">
            <Link
              href={`/account/verify?token=${token}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
            >
              <ShieldCheck size={16} /> Click Here to Simulate Email Verify
            </Link>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-500">
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">
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
