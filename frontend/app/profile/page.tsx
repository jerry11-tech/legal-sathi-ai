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
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Update failed');
      setMsg('Profile updated successfully!');
      setUser(data.user);
      localStorage.setItem('legalsathi_user', JSON.stringify(data.user));
    } catch (err) {
      setErrMsg((err as Error).message);
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Password change failed');
      setMsg('Password updated successfully!');
      setPwdData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setErrMsg((err as Error).message);
    }
  };

  const handleDeleteAccount = async () => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete your account? This action is permanent.')) return;
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/auth/profile/delete?token=${encodeURIComponent(token)}`,
        { method: 'DELETE' }
      );
      localStorage.removeItem('legalsathi_token');
      localStorage.removeItem('legalsathi_user');
      router.push('/');
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6 text-slate-900">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold">User Profile & Account</h1>
            <p className="text-xs text-slate-500">Manage your personal information, language preferences, and security</p>
          </div>
        </div>
      </div>

      {msg && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
          ✓ {msg}
        </div>
      )}

      {errMsg && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-800">
          ⚠️ {errMsg}
        </div>
      )}

      {/* User Header Avatar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
        <div className="h-20 w-20 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-md">
          {user?.first_name?.[0]?.toUpperCase() || 'U'}{user?.last_name?.[0]?.toUpperCase() || ''}
        </div>
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-xl font-bold">{user?.first_name} {user?.last_name}</h2>
          <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
            <Mail size={14} /> {user?.email}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-[11px] font-bold">
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-blue-700">Role: {user?.role}</span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-emerald-700">Verified Account</span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 border-b pb-3">Personal Information</h3>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">First Name</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Last Name</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 9876543210"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Preferred Language</label>
              <select
                value={formData.preferred_language}
                onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="en">English</option>
                <option value="hi">Hindi (हिंदी)</option>
                <option value="mr">Marathi (मराठी)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
          >
            Save Profile Changes
          </button>
        </form>
      </div>

      {/* Security & Password Change */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 border-b pb-3">Security & Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Current Password</label>
            <input
              type="password"
              required
              value={pwdData.old_password}
              onChange={(e) => setPwdData({ ...pwdData, old_password: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">New Password</label>
            <input
              type="password"
              required
              value={pwdData.new_password}
              onChange={(e) => setPwdData({ ...pwdData, new_password: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={pwdData.confirm_password}
              onChange={(e) => setPwdData({ ...pwdData, confirm_password: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Account Deletion Danger Zone */}
      <div className="rounded-3xl border border-red-200 bg-red-50/50 p-6 space-y-3">
        <h3 className="text-sm font-bold text-red-700 flex items-center gap-2">
          <Trash2 size={16} /> Danger Zone
        </h3>
        <p className="text-xs text-red-600">
          Deleting your account will purge all your saved case roadmaps, generated document drafts, and chat history.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 transition"
        >
          Delete My Account Permanently
        </button>
      </div>
    </div>
  );
}
