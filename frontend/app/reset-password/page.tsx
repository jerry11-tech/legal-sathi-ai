'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Lock, Shield, CheckCircle2 } from 'lucide-react';
import { readApiError } from '@/lib/api-error';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/auth/reset-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Remainder': 'true' },
          body: JSON.stringify({ token, new_password: newPassword, confirm_password: confirmPassword }),
        }
      );

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(readApiError((data as any)?.detail) || `Password reset failed (${res.status})`);
      }

      setStatusMsg('Password updated successfully! You can now log in.');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setErrorMsg((err as Error).message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-xl font-extrabold text-navy-text dark:text-white">Create New Password</h2>
        </div>

        {errorMsg && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-800">
            ⚠️ {errorMsg}
          </div>
        )}

        {statusMsg ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center space-y-2">
            <CheckCircle2 size={36} className="mx-auto text-emerald-600" />
            <p className="text-xs font-bold text-emerald-800">{statusMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-navy-text dark:text-slate-300">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-line bg-slate-50 px-3.5 py-2.5 pl-9 pr-10 text-xs text-navy-text outline-none transition focus:border-royal focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:bg-[#0B1331]"
                />
                <Lock size={16} className="absolute left-3 top-2.5 text-bodytext/70" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-bodytext hover:text-navy-text dark:text-slate-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-navy-text dark:text-slate-300">Confirm New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-line bg-slate-50 px-3.5 py-2.5 text-xs text-navy-text outline-none transition focus:border-royal focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:bg-[#0B1331]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-royal py-3 text-xs font-bold text-white shadow-md transition hover:bg-bright disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
