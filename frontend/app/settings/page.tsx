'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, Download, Globe, Lock, Moon, Shield, Sun, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [msg, setMsg] = useState('');

  const handleSave = () => {
    setMsg('Settings updated successfully!');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleDownloadData = () => {
    const data = {
      platform: "LegalSathi AI",
      user: JSON.parse(localStorage.getItem('legalsathi_user') || '{}'),
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legalsathi_user_data_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6 text-slate-900">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Platform & App Settings</h1>
            <p className="text-xs text-slate-500">Configure appearance, language, notification preferences, and privacy</p>
          </div>
        </div>
      </div>

      {msg && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
          ✓ {msg}
        </div>
      )}

      {/* Preferences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance & Language */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 border-b pb-2 flex items-center gap-2">
            <Globe size={16} /> Appearance & Language
          </h3>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Theme</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${
                  theme === 'light' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'
                }`}
              >
                <Sun size={16} /> Light Mode
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${
                  theme === 'dark' ? 'border-blue-600 bg-slate-900 text-white' : 'border-slate-200 text-slate-600'
                }`}
              >
                <Moon size={16} /> Dark Mode
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-blue-500"
            >
              <option value="en">English (Official)</option>
              <option value="hi">Hindi (हिंदी)</option>
              <option value="mr">Marathi (मराठी)</option>
            </select>
          </div>
        </div>

        {/* Notifications & Security */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 border-b pb-2 flex items-center gap-2">
            <Bell size={16} /> Notifications & Security
          </h3>

          <div className="space-y-3 text-xs text-slate-700">
            <label className="flex items-center justify-between cursor-pointer">
              <span>Email Notifications for Saved Cases</span>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span>Security Alert Emails for New Device Logins</span>
              <input
                type="checkbox"
                checked={securityAlerts}
                onChange={(e) => setSecurityAlerts(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>

          <div className="pt-2">
            <button
              onClick={handleDownloadData}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <Download size={14} /> Download My Data (JSON)
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
