'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Lock, Mail, Shield, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Remainder': 'true' },
          body: JSON.stringify({ email, password, remember_me: rememberMe }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login failed');

      // Save token and user info
      localStorage.setItem('legalsathi_token', data.access_token);
      localStorage.setItem('legalsathi_user', JSON.stringify(data.user));

      if (data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
              <Shield size={18} />
            </span>
            <span className="font-bold text-xl text-slate-900">LegalSathi AI</span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900">Welcome Back</h2>
          <p className="text-xs sm:text-sm text-slate-500">Sign in to access your saved cases & legal assistant</p>
        </div>

        {errorMsg && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-800">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <Link href="/forgot-password" className="text-xs font-semibold text-blue-600 hover:underline">
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 pl-9 pr-10 text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
              />
              <Lock size={16} className="absolute left-3 top-2.5 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Remember Me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            Sign In
          </button>
        </form>

        <div className="space-y-2 pt-2 border-t border-slate-100 text-center text-xs">
          <p className="text-slate-500">
            Don't have an account?{' '}
            <Link href="/register" className="font-bold text-blue-600 hover:underline">
              Create Account
            </Link>
          </p>
          <p>
            <Link href="/chat" className="text-slate-500 hover:underline">
              Continue as Guest ➔
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
