'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Mail, Shield, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [tokenPreview, setTokenPreview] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/auth/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Remainder': 'true' },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();
      setStatusMsg(data.message || 'Password reset link dispatched.');
      if (data.token_preview) {
        setTokenPreview(data.token_preview);
      }
    } catch {}
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-navy-deeper">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-line bg-white p-6 shadow-panel sm:p-8 dark:border-slate-800 dark:bg-[#0B1331]">
        <div className="space-y-2 text-center">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-white shadow-soft">
              <Shield size={18} />
            </span>
            <span className="text-xl font-bold text-navy-text dark:text-white">LegalSathi AI</span>
          </Link>
          <h2 className="text-xl font-extrabold text-navy-text dark:text-white">Reset Your Password</h2>
          <p className="text-xs text-bodytext dark:text-slate-400">
            Enter your account email to receive a password reset link (expires in 30 mins).
          </p>
        </div>

        {statusMsg ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center space-y-3">
            <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
            <p className="text-xs font-bold text-emerald-800">{statusMsg}</p>
            {tokenPreview && (
              <div className="pt-2">
                <Link
                  href={`/reset-password?token=${tokenPreview}`}
                  className="inline-block rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                >
                  Simulate Reset Email Link
                </Link>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-navy-text dark:text-slate-300">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-line bg-slate-50 px-3.5 py-2.5 pl-9 text-xs text-navy-text outline-none transition focus:border-royal focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:bg-[#0B1331]"
                />
                <Mail size={16} className="absolute left-3 top-2.5 text-bodytext/70" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-royal py-3 text-xs font-bold text-white shadow-md transition hover:bg-bright disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Send Reset Link
            </button>
          </form>
        )}

        <div className="border-t border-line pt-3 text-center text-xs text-bodytext dark:border-slate-800">
          <Link href="/login" className="font-semibold text-royal hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
