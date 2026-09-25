'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Bookmark,
  Bell,
  CheckCircle2,
  FileText,
  Filter,
  FolderOpen,
  History,
  LogOut,
  Plus,
  Scale,
  Search,
  Settings,
  Sparkles,
  User,
} from 'lucide-react';
import type { SavedCase } from '../navigator/types';
import GovtAnnouncementsWidget from '@/components/govt-announcements-widget';

export default function DashboardPage() {
  const router = useRouter();
  const [savedCases, setSavedCases] = useState<SavedCase[]>([]);
  const [search, setSearch] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('All');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const uStr = localStorage.getItem('legalsathi_user');
      if (uStr) {
        setUser(JSON.parse(uStr));
      }
    } catch {}
    fetchSavedCases();
  }, []);

  const fetchSavedCases = async () => {
    try {
      const token = localStorage.getItem('legalsathi_token');
      const res = await fetch('/api/navigator/cases', {
        headers: { 
          'Bypass-Tunnel-Remainder': 'true',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSavedCases(data);
      }
    } catch {}
  };

  const filtered = savedCases.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.case_code.toLowerCase().includes(search.toLowerCase());
    const matchesUrgency = filterUrgency === 'All' || c.urgency.toLowerCase() === filterUrgency.toLowerCase();
    return matchesSearch && matchesUrgency;
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 text-navy-text sm:px-6 sm:py-10 lg:px-8 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-soft px-3 py-1 text-xs font-bold text-royal ring-1 ring-royal/25 dark:bg-slate-800 dark:text-blue-300">
            <FolderOpen size={14} /> Enterprise Legal Vault
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-navy-text dark:text-white sm:text-3xl">
            Welcome back, {user?.first_name || 'User'} 👋
          </h1>
          <p className="text-xs text-bodytext sm:text-sm dark:text-slate-400">Track active case roadmaps, evidence checklists, and legal document drafts.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/profile"
            className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-bold text-navy-text transition hover:bg-soft dark:border-slate-800 dark:bg-[#0B1331] dark:text-slate-300"
          >
            <User size={14} /> Profile
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem('legalsathi_token');
              localStorage.removeItem('legalsathi_user');
              router.push('/login');
            }}
            className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950 dark:text-red-300"
          >
            <LogOut size={14} /> Sign Out
          </button>
          <button
            onClick={() => router.push('/navigator')}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-royal px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-bright"
          >
            <Plus size={16} /> New Case Intake
          </button>
        </div>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-[#0B1331]">
          <p className="text-xs font-bold uppercase tracking-wider text-bodytext dark:text-slate-400">Total Active Cases</p>
          <p className="mt-2 text-3xl font-black text-royal">{savedCases.length}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-[#0B1331]">
          <p className="text-xs font-bold uppercase tracking-wider text-bodytext dark:text-slate-400">Active Roadmaps</p>
          <p className="mt-2 text-3xl font-black text-mint">{savedCases.filter((c) => c.progress < 100).length}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-[#0B1331]">
          <p className="text-xs font-bold uppercase tracking-wider text-bodytext dark:text-slate-400">Drafts Generated</p>
          <p className="mt-2 text-3xl font-black text-accentpurple">{savedCases.length * 2}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-[#0B1331]">
          <p className="text-xs font-bold uppercase tracking-wider text-bodytext dark:text-slate-400">Supported Domains</p>
          <p className="mt-2 text-3xl font-black text-amber-600">26+</p>
        </div>
      </div>

      {/* Verified Government Announcements Widget */}
      <GovtAnnouncementsWidget />

      {/* Unified Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-line pb-2 dark:border-slate-800">
        <button className="flex items-center gap-2 rounded-xl bg-royal px-4 py-2 text-xs font-bold text-white shadow-sm">
          <FolderOpen size={16} /> Saved Cases
        </button>
        <Link
          href="/documents"
          className="flex items-center gap-2 rounded-xl bg-line px-4 py-2 text-xs font-semibold text-navy-text transition hover:bg-soft dark:bg-slate-800 dark:text-slate-300"
        >
          <FileText size={16} /> Uploaded Documents & Templates
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3.5 text-bodytext/70" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved cases by title or Case ID..."
            className="w-full rounded-2xl border border-line bg-white py-3 pl-10 pr-4 text-xs text-navy-text outline-none transition focus:border-royal sm:text-sm dark:border-slate-800 dark:bg-[#0B1331] dark:text-white"
          />
        </div>

        <div className="flex gap-2">
          {['All', 'Critical', 'High', 'Medium'].map((urg) => (
            <button
              key={urg}
              onClick={() => setFilterUrgency(urg)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                filterUrgency === urg
                  ? 'bg-royal text-white shadow-sm'
                  : 'border border-line bg-white text-bodytext transition hover:bg-soft dark:border-slate-800 dark:bg-[#0B1331] dark:text-slate-300'
              }`}
            >
              {urg}
            </button>
          ))}
        </div>
      </div>

      {/* SaaS Data Table View */}
      <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-soft dark:border-slate-800 dark:bg-[#0B1331]">
        {filtered.length === 0 ? (
          <div className="space-y-3 p-12 text-center">
            <FolderOpen size={40} className="mx-auto text-line dark:text-slate-700" />
            <p className="text-xs font-medium text-bodytext dark:text-slate-400">No saved legal cases found matching filters.</p>
            <button
              onClick={() => router.push('/navigator')}
              className="rounded-xl bg-royal px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-bright"
            >
              Launch Navigator Intake
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-soft text-[10px] font-bold uppercase tracking-wider text-bodytext dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3.5">Case Code</th>
                  <th className="px-4 py-3.5">Title & Legal Domain</th>
                  <th className="px-4 py-3.5">Urgency</th>
                  <th className="px-4 py-3.5">Roadmap Progress</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line dark:divide-slate-800">
                {filtered.map((item) => (
                  <tr key={item.id} className="transition hover:bg-soft/60 dark:hover:bg-slate-800/60">
                    <td className="px-4 py-3.5 font-mono font-bold text-royal dark:text-blue-400">{item.case_code}</td>
                    <td className="px-4 py-3.5">
                      <p className="line-clamp-1 font-bold text-navy-text dark:text-white">{item.title}</p>
                      <span className="text-[10px] font-semibold text-bodytext">{item.category}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          item.urgency.toLowerCase() === 'critical'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : item.urgency.toLowerCase() === 'high'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-mint/15 text-mint dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {item.urgency}
                      </span>
                    </td>
                    <td className="w-40 px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-line dark:bg-slate-800">
                          <div className="h-full rounded-full bg-royal" style={{ width: `${item.progress}%` }} />
                        </div>
                        <span className="font-mono text-[10px] font-bold text-bodytext dark:text-slate-400">{item.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => router.push(`/navigator?q=${encodeURIComponent(item.title)}`)}
                        className="rounded-xl bg-soft px-3 py-1.5 text-xs font-bold text-royal transition hover:bg-line dark:bg-slate-800 dark:text-blue-300"
                      >
                        Open Case
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}