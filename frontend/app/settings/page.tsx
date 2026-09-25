'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, Download, Globe, Lock, Moon, Shield, Sun, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const [theme, setTheme] = useState(() =>
    typeof window !== 'undefined' ? (localStorage.getItem('legalsathi_theme') || 'light') : 'light'
  );
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('legalsathi_lang') ||
        JSON.parse(localStorage.getItem('legalsathi_user') || '{}').preferred_language ||
        'en'
      );
    }
    return 'en';
  });
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [msg, setMsg] = useState('');

  const handleSave = () => {
    localStorage.setItem('legalsathi_lang', language);
    localStorage.setItem('legalsathi_theme', theme);
    const existing = JSON.parse(localStorage.getItem('legalsathi_user') || '{}');
    existing.preferred_language = language;
    localStorage.setItem('legalsathi_user', JSON.stringify(existing));
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
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 text-navy-text sm:px-6 dark:text-slate-100">
      <div className="flex items-center justify-between border-b border-line pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="rounded-xl bg-line p-2 transition hover:bg-soft">
            <ArrowLeft size={18} className="text-navy-text" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-navy-text dark:text-white">Platform & App Settings</h1>
            <p className="text-xs text-bodytext">Configure appearance, language, notification preferences, and privacy</p>
          </div>
        </div>
      </div>

      {msg && (
        <div className="rounded-2xl border border-mint/40 bg-mint/10 p-3 text-xs font-bold text-mint">
          ✓ {msg}
        </div>
      )}

      {/* Preferences Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Appearance & Language */}
        <div className="space-y-4 rounded-3xl border border-line bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-[#0B1331]">
          <h3 className="flex items-center gap-2 border-b border-line pb-2 text-xs font-bold uppercase tracking-wider text-royal dark:border-slate-800">
            <Globe size={16} /> Appearance & Language
          </h3>

          <div>
            <label className="mb-1 block text-xs font-bold text-navy-text dark:text-slate-300">Theme</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${
                  theme === 'light' ? 'border-royal bg-soft text-royal' : 'border-line text-bodytext'
                }`}
              >
                <Sun size={16} /> Light Mode
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${
                  theme === 'dark' ? 'border-royal bg-navy text-white' : 'border-line text-bodytext'
                }`}
              >
                <Moon size={16} /> Dark Mode
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-navy-text dark:text-slate-300">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-xl border border-line bg-soft p-2.5 text-xs text-navy-text outline-none transition focus:border-royal dark:border-slate-800 dark:bg-slate-800/60 dark:text-white"
            >
              <option value="en">English (Official)</option>
              <option value="hi">Hindi (हिंदी)</option>
              <option value="mr">Marathi (मराठी)</option>
            </select>
          </div>
        </div>

        {/* Notifications & Security */}
        <div className="space-y-4 rounded-3xl border border-line bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-[#0B1331]">
          <h3 className="flex items-center gap-2 border-b border-line pb-2 text-xs font-bold uppercase tracking-wider text-royal dark:border-slate-800">
            <Bell size={16} /> Notifications & Security
          </h3>

          <div className="space-y-3 text-xs text-navy-text dark:text-slate-300">
            <label className="flex cursor-pointer items-center justify-between">
              <span>Email Notifications for Saved Cases</span>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
                className="h-4 w-4 rounded border-line bg-soft text-royal focus:ring-royal"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between">
              <span>Security Alert Emails for New Device Logins</span>
              <input
                type="checkbox"
                checked={securityAlerts}
                onChange={(e) => setSecurityAlerts(e.target.checked)}
                className="h-4 w-4 rounded border-line bg-soft text-royal focus:ring-royal"
              />
            </label>
          </div>

          <div className="pt-2">
            <button
              onClick={handleDownloadData}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-line bg-soft py-2.5 text-xs font-bold text-navy-text transition hover:bg-line dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300"
            >
              <Download size={14} /> Download My Data (JSON)
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="rounded-xl bg-royal px-6 py-2.5 text-xs font-bold text-white transition hover:bg-bright"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}