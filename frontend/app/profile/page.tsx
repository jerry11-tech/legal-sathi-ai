'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Globe,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Moon,
  Phone,
  Shield,
  Sun,
  Trash2,
  User,
} from 'lucide-react';
import { readApiError } from '@/lib/api-error';

export default function ProfilePage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [errMsg, setErrMsg] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    preferred_language: 'en',
    theme: 'light',
    country: 'India',
    state: 'Delhi',
  });

  const [pwdData, setPwdData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    const t = localStorage.getItem('legalsathi_token');
    if (!t) {
      router.push('/login');
      return;
    }
    setToken(t);
    fetchProfile(t);
  }, [router]);

  const fetchProfile = async (authToken: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/auth/me?token=${encodeURIComponent(authToken)}`,
        { headers: { 'Bypass-Tunnel-Remainder': 'true' } }
      );
      if (res.ok) {
        const u = await res.json();
        setUser(u);
        setFormData({
          first_name: u.first_name || '',
          last_name: u.last_name || '',
          phone: u.phone || '',
          preferred_language: u.preferred_language || 'en',
          theme: u.theme || 'light',
          country: u.country || 'India',
          state: u.state || 'Delhi',
        });
      }
    } catch {}
    setLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setMsg('');
    setErrMsg('');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/auth/profile/update?token=${encodeURIComponent(token)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Remainder': 'true' },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(readApiError((data as any)?.detail) || 'Update failed');
      setMsg('Profile updated successfully!');
      setUser(data.user);
      localStorage.setItem('legalsathi_user', JSON.stringify(data.user));
    } catch (err) {
      setErrMsg((err as Error).message || 'Something went wrong. Please try again.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setMsg('');
    setErrMsg('');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/auth/profile/change-password?token=${encodeURIComponent(token)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Remainder': 'true' },
          body: JSON.stringify(pwdData),
        }
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(readApiError((data as any)?.detail) || 'Password change failed');
      setMsg('Password updated successfully!');
      setPwdData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setErrMsg((err as Error).message || 'Something went wrong. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={24} className="animate-spin text-royal" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 text-navy-text sm:px-6 sm:py-10 lg:px-8 dark:text-slate-100">
      <div className="flex items-center justify-between border-b border-line pb-6 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-soft px-3 py-1 text-xs font-bold text-royal ring-1 ring-royal/25 dark:bg-slate-800 dark:text-blue-300">
            <User size={14} /> Account & Profile Settings
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-navy-text dark:text-white sm:text-3xl">
            User Profile Settings
          </h1>
          <p className="text-xs text-bodytext sm:text-sm dark:text-slate-400">Manage personal details, security credentials, and preferred languages.</p>
        </div>
        <Link href="/dashboard" className="rounded-xl border border-line bg-white px-4 py-2 text-xs font-bold text-navy-text transition hover:bg-soft dark:border-slate-800 dark:bg-[#0B1331] dark:text-slate-300">
          ← Back to Vault
        </Link>
      </div>

      {msg && <div className="rounded-2xl border border-mint/40 bg-mint/10 p-4 text-xs font-bold text-mint">✓ {msg}</div>}
      {errMsg && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-800">⚠️ {errMsg}</div>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card Summary */}
        <div className="space-y-4 rounded-3xl border border-line bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-[#0B1331]">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-royal text-xl font-bold uppercase text-white shadow-md shadow-royal/30">
              {user?.first_name?.[0] || 'U'}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-navy-text dark:text-white">{user?.first_name} {user?.last_name}</h3>
              <p className="text-xs text-bodytext dark:text-slate-400">{user?.email}</p>
              <span className="mt-1 inline-block rounded-full bg-soft px-2.5 py-0.5 text-[10px] font-bold uppercase text-royal dark:bg-slate-800 dark:text-blue-300">
                {user?.role || 'Verified User'}
              </span>
            </div>
          </div>

          <div className="space-y-2 border-t border-line pt-4 text-xs dark:border-slate-800">
            <div className="flex justify-between border-b border-line py-1 dark:border-slate-800">
              <span className="text-bodytext">Phone:</span>
              <span className="font-bold text-navy-text dark:text-slate-200">{user?.phone || 'Not provided'}</span>
            </div>
            <div className="flex justify-between border-b border-line py-1 dark:border-slate-800">
              <span className="text-bodytext">State:</span>
              <span className="font-bold text-navy-text dark:text-slate-200">{user?.state || 'Delhi'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-bodytext">Language:</span>
              <span className="font-bold uppercase text-navy-text dark:text-slate-200">{user?.preferred_language || 'en'}</span>
            </div>
          </div>
        </div>

        {/* Update Form */}
        <div className="space-y-6 rounded-3xl border border-line bg-white p-6 shadow-soft sm:p-8 dark:border-slate-800 dark:bg-[#0B1331] lg:col-span-2">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <h3 className="border-b border-line pb-2 text-base font-bold text-navy-text dark:border-slate-800 dark:text-white">Personal Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-navy-text dark:text-slate-300">First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full rounded-2xl border border-line bg-soft px-4 py-2.5 text-xs text-navy-text outline-none transition focus:border-royal dark:border-slate-800 dark:bg-slate-800/60 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-navy-text dark:text-slate-300">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full rounded-2xl border border-line bg-soft px-4 py-2.5 text-xs text-navy-text outline-none transition focus:border-royal dark:border-slate-800 dark:bg-slate-800/60 dark:text-white"
                />
              </div>
            </div>

            <button type="submit" className="rounded-2xl bg-royal px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-bright">
              Save Profile Changes
            </button>
          </form>

          {/* Change Password */}
          <form onSubmit={handleChangePassword} className="space-y-4 border-t border-line pt-6 dark:border-slate-800">
            <h3 className="border-b border-line pb-2 text-base font-bold text-navy-text dark:border-slate-800 dark:text-white">Change Password</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                type="password"
                placeholder="Current Password"
                value={pwdData.old_password}
                onChange={(e) => setPwdData({ ...pwdData, old_password: e.target.value })}
                className="w-full rounded-2xl border border-line bg-soft px-4 py-2.5 text-xs text-navy-text outline-none transition focus:border-royal dark:border-slate-800 dark:bg-slate-800/60 dark:text-white"
              />
              <input
                type="password"
                placeholder="New Password"
                value={pwdData.new_password}
                onChange={(e) => setPwdData({ ...pwdData, new_password: e.target.value })}
                className="w-full rounded-2xl border border-line bg-soft px-4 py-2.5 text-xs text-navy-text outline-none transition focus:border-royal dark:border-slate-800 dark:bg-slate-800/60 dark:text-white"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={pwdData.confirm_password}
                onChange={(e) => setPwdData({ ...pwdData, confirm_password: e.target.value })}
                className="w-full rounded-2xl border border-line bg-soft px-4 py-2.5 text-xs text-navy-text outline-none transition focus:border-royal dark:border-slate-800 dark:bg-slate-800/60 dark:text-white"
              />
            </div>
            <button type="submit" className="rounded-2xl bg-navy px-6 py-2.5 text-xs font-bold text-white transition hover:bg-navy-dark dark:bg-slate-100 dark:text-navy-text">
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}