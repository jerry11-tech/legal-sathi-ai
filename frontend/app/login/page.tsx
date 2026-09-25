'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail, Scale, Shield, User } from 'lucide-react';
import { readApiError } from '@/lib/api-error';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const reg = searchParams.get('registered');
    const em = searchParams.get('email');
    if (em) setEmail(em);
    if (reg === 'true') {
      setSuccessMsg('Account created successfully! Please sign in with your credentials below.');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember_me: rememberMe }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(readApiError((data as any)?.detail) || `Login failed (${res.status})`);
      }

      // Save token and user info
      localStorage.setItem('legalsathi_token', data.access_token);
      localStorage.setItem('legalsathi_user', JSON.stringify(data.user));

      if (data.user?.role === 'admin') {
        localStorage.setItem('legalsathi_admin_token', data.access_token);
        router.push('/admin/dashboard');
      } else {
        localStorage.removeItem('legalsathi_admin_token');
        router.push('/dashboard');
      }
    } catch (err) {
      setErrorMsg((err as Error).message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-navy-deeper sm:p-6 lg:p-8">
      <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl border border-line bg-white shadow-2xl dark:border-slate-800 dark:bg-[#0B1331] md:grid-cols-2">
        {/* Left Side: Login Form */}
        <div className="flex flex-col justify-between space-y-6 p-6 sm:p-10">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-white shadow-soft">
                <Scale size={18} />
              </span>
              <span className="text-xl font-extrabold tracking-tight text-navy-text dark:text-white">
                LegalSathi <span className="text-royal">AI</span>
              </span>
            </Link>

            <div>
              <h2 className="text-2xl font-black tracking-tight text-navy-text dark:text-white">Welcome Back</h2>
              <p className="mt-1 text-xs text-bodytext dark:text-slate-400">Sign in to your LegalSathi AI account to access saved cases & drafts.</p>
            </div>
          </div>

          {successMsg && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-bold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950 dark:text-emerald-300">
              ✓ {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-bold text-red-800 dark:border-red-900/50 dark:bg-red-950 dark:text-red-300">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-navy-text dark:text-slate-300">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 pl-10 text-xs text-navy-text outline-none transition focus:border-royal focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:bg-[#0B1331]"
                />
                <Mail size={16} className="absolute left-3.5 top-3.5 text-bodytext/70" />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-bold text-navy-text dark:text-slate-300">Password</label>
                <Link href="/forgot-password" className="text-xs font-bold text-royal hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 pl-10 pr-10 text-xs text-navy-text outline-none transition focus:border-royal focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:bg-[#0B1331]"
                />
                <Lock size={16} className="absolute left-3.5 top-3.5 text-bodytext/70" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-bodytext hover:text-navy-text dark:text-slate-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-bodytext dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-royal focus:ring-royal/40"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-royal py-3.5 text-xs font-bold text-white shadow-lg shadow-royal/30 transition hover:bg-bright disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <span>Sign In to Account</span>}
            </button>
          </form>

          <div className="space-y-2 border-t border-line pt-4 text-center dark:border-slate-800">
            <p className="text-xs text-bodytext dark:text-slate-400">
              Don't have an account yet?{' '}
              <Link href="/register" className="font-bold text-royal hover:underline">
                Create Free Account
              </Link>
            </p>
            <Link href="/chat" className="inline-block text-xs font-bold text-bodytext hover:text-navy-text dark:text-slate-400 dark:hover:text-slate-200">
              Continue as Guest (5 free queries) ➔
            </Link>
          </div>
        </div>

        {/* Right Side: Visual Graphic Card */}
        <div className="hidden flex-col justify-between bg-gradient-to-br from-navy-deeper via-navy-dark to-navy-deeper p-8 text-white md:flex">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-bright/30 bg-bright/20 px-3 py-1 text-xs font-bold text-blue-200">
              <Shield size={14} /> Enterprise Security
            </div>
            <h3 className="text-2xl font-black leading-tight">
              AI-Powered Indian Legal Guidance Platform
            </h3>
            <p className="text-xs leading-relaxed text-slate-300">
              Understand Indian statutory provisions, auto-generate legal notice drafts, track case evidence, and receive clear legal explanations.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                <span>Verified citations mapping to official government portals</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                <span>Multilingual support in English, Hindi, and Marathi</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                <span>End-to-end encrypted storage for private case files</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-[11px] text-slate-300 backdrop-blur-md">
            "LegalSathi AI helps users navigate complex Indian laws in plain language with 100% explainable citations."
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={24} className="animate-spin text-royal" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}