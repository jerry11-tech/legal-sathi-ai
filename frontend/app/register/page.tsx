'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, CheckCircle2, Eye, EyeOff, Globe, Loader2, Lock, Mail, Phone, Scale, Shield, User } from 'lucide-react';
import { readApiError } from '@/lib/api-error';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    otp_code: '',
    password: '',
    confirm_password: '',
    preferred_language: 'en',
    country: 'India',
    state: 'Delhi',
    agree_terms: false,
    agree_privacy: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [otpState, setOtpState] = useState({
    sending: false,
    sent: false,
    seconds: 0,
    devCode: '',
    otsMsg: '',
  });

  // Password strength rules
  const pwd = formData.password;
  const hasMinLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /\d/.test(pwd);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

  const strengthScore = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  const handleSendOtp = async () => {
    setErrorMsg('');
    const phone = formData.phone.trim();
    if (phone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Enter a valid mobile number to receive the OTP.');
      return;
    }
    setOtpState((s) => ({ ...s, sending: true, otsMsg: '' }));
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose: 'register' }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(readApiError((data as any)?.detail) || `Could not send OTP (${res.status})`);
      }
      setOtpState((s) => ({
        ...s,
        sending: false,
        sent: true,
        seconds: (data?.resend_after || 60),
        devCode: data?.dev_code || '',
        otsMsg: 'OTP sent to your mobile number.',
      }));
      const start = Date.now();
      const interval = window.setInterval(() => {
        const left = (data?.resend_after || 60) - Math.floor((Date.now() - start) / 1000);
        if (left <= 0) {
          window.clearInterval(interval);
          setOtpState((s) => ({ ...s, seconds: 0 }));
        } else {
          setOtpState((s) => ({ ...s, seconds: left }));
        }
      }, 1000);
    } catch (err) {
      setOtpState((s) => ({ ...s, sending: false, otsMsg: (err as Error).message }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.phone.trim() || !formData.otp_code.trim()) {
      setErrorMsg('Verify your mobile number with the OTP before registering.');
      return;
    }

    if (!formData.agree_terms || !formData.agree_privacy) {
      setErrorMsg('You must agree to the Terms & Conditions and Privacy Policy.');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(readApiError((data as any)?.detail) || `Registration failed (${res.status})`);
      }

      if (data.access_token) {
        localStorage.setItem('legalsathi_token', data.access_token);
        localStorage.setItem('legalsathi_user', JSON.stringify(data.user));
        router.push('/dashboard');
      } else {
        router.push(`/login?email=${encodeURIComponent(formData.email)}&registered=true`);
      }
    } catch (err) {
      setErrorMsg((err as Error).message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-line bg-slate-50 px-3.5 py-2.5 text-xs text-navy-text outline-none transition focus:border-royal dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:bg-[#0B1331]';

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-navy-deeper sm:p-6 lg:p-8">
      <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl border border-line bg-white shadow-2xl dark:border-slate-800 dark:bg-[#0B1331] md:grid-cols-12">
        {/* Left Visual Banner */}
        <div className="hidden flex-col justify-between bg-gradient-to-br from-navy-deeper via-navy-dark to-navy-deeper p-8 text-white md:col-span-5 md:flex">
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-white shadow-soft">
                <Scale size={18} />
              </span>
              <span className="text-xl font-extrabold tracking-tight text-white">
                LegalSathi <span className="text-bright">AI</span>
              </span>
            </Link>

            <div className="space-y-2">
              <h3 className="text-2xl font-black leading-tight">Create Your Free Account</h3>
              <p className="text-xs leading-relaxed text-slate-300">
                Join thousands of Indian citizens accessing instant legal guidance, RAG statutory citations, and document generation.
              </p>
            </div>

            <div className="space-y-3 border-t border-white/10 pt-4">
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                <span>100% Free Account & Legal Vault</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                <span>Multilingual Support (Hi / Mr / En)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                <span>Automated FIR & Notice Drafting</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-[11px] text-slate-300 backdrop-blur-md">
            🔒 Strictly Private & Encrypted. Your legal inquiries are never shared.
          </div>
        </div>

        {/* Right Registration Form */}
        <div className="space-y-6 p-6 sm:p-8 md:col-span-7">
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-navy-text dark:text-white">Register Free</h2>
            <p className="text-xs text-bodytext dark:text-slate-400">Fill in your details to create your legal intelligence workspace.</p>
          </div>

          {errorMsg && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-bold text-red-800 dark:border-red-900/50 dark:bg-red-950 dark:text-red-300">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-navy-text dark:text-slate-300">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Rahul"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-navy-text dark:text-slate-300">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Sharma"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-navy-text dark:text-slate-300">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rahul@example.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-navy-text dark:text-slate-300">Mobile Number</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpState.sending || otpState.seconds > 0}
                    className="shrink-0 rounded-xl bg-gradient-to-r from-royal to-bright px-3 text-[10px] font-bold text-white shadow-md shadow-royal/30 transition hover:opacity-90 disabled:opacity-40"
                  >
                    {otpState.seconds > 0
                      ? `Resend (${otpState.seconds}s)`
                      : otpState.sending
                        ? 'Sending…'
                        : otpState.sent
                          ? 'Resend OTP'
                          : 'Send OTP'}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2 rounded-2xl border border-line bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
              {otpState.otsMsg && (
                <p className={`text-[11px] ${otpState.devCode ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-bodytext dark:text-slate-400'}`}>
                  {otpState.otsMsg}
                </p>
              )}
              {otpState.devCode && (
                <p className="text-[11px] text-bodytext dark:text-slate-400">
                  Demo mode (no SMS credits connected): your OTP is{' '}
                  <code className="rounded bg-navy px-1.5 py-0.5 font-mono text-xs font-black text-bright">{otpState.devCode}</code>
                </p>
              )}
              <div>
                <label className="mb-1 block text-[11px] font-bold text-navy-text dark:text-slate-300">Enter OTP (sent via SMS)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={formData.otp_code}
                  onChange={(e) => setFormData({ ...formData, otp_code: e.target.value.replace(/\D/g, '') })}
                  placeholder="6-digit code"
                  className={`${inputClass} font-mono text-sm tracking-[0.35em]`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-navy-text dark:text-slate-300">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-bodytext hover:text-navy-text dark:text-slate-400"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Strength Visual Checklist */}
                {formData.password.length > 0 && (
                  <div className="rounded-2xl border border-line bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900 space-y-1 text-[11px]">
                    <p className="mb-1 font-bold text-navy-text dark:text-slate-300">Password Requirements:</p>
                    <div className="grid grid-cols-2 gap-1 font-medium">
                      <span className={hasMinLength ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-bodytext'}>
                        {hasMinLength ? '✓' : '○'} At least 8 characters
                      </span>
                      <span className={hasUpper ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-bodytext'}>
                        {hasUpper ? '✓' : '○'} One uppercase (A-Z)
                      </span>
                      <span className={hasLower ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-bodytext'}>
                        {hasLower ? '✓' : '○'} One lowercase (a-z)
                      </span>
                      <span className={hasNumber ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-bodytext'}>
                        {hasNumber ? '✓' : '○'} One number (0-9)
                      </span>
                      <span className={hasSpecial ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-bodytext'}>
                        {hasSpecial ? '✓' : '○'} One symbol (!@#$%)
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-navy-text dark:text-slate-300">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Checkbox agreements */}
            <div className="space-y-2 pt-2">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-bodytext dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={formData.agree_terms}
                  onChange={(e) => setFormData({ ...formData, agree_terms: e.target.checked })}
                  className="rounded border-slate-300 text-royal focus:ring-royal/40"
                />
                <span>I agree to the Terms of Service & Legal Disclaimer</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-xs text-bodytext dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={formData.agree_privacy}
                  onChange={(e) => setFormData({ ...formData, agree_privacy: e.target.checked })}
                  className="rounded border-slate-300 text-royal focus:ring-royal/40"
                />
                <span>I agree to the Privacy Policy & Security Standard</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-royal py-3.5 text-xs font-bold text-white shadow-lg shadow-royal/30 transition hover:bg-bright disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <span>Create Account</span>}
            </button>
          </form>

          <p className="border-t border-line pt-2 text-center text-xs text-bodytext dark:border-slate-800 dark:text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-royal hover:underline">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}