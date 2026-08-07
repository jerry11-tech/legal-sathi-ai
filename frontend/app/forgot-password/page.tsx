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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
              <Shield size={18} />
            </span>
            <span className="font-bold text-xl text-slate-900">LegalSathi AI</span>
          </Link>
          <h2 className="text-xl font-extrabold text-slate-900">Reset Your Password</h2>
          <p className="text-xs text-slate-500">
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
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 pl-9 text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                />
                <Mail size={16} className="absolute left-3 top-2.5 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Send Reset Link
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-3">
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
