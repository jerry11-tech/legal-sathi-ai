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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/navigator/cases`, {
        headers: { 'Bypass-Tunnel-Remainder': 'true' },
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
    <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 sm:py-10 space-y-8 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between border-b border-slate-200/80 pb-6 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950 dark:text-blue-300">
            <FolderOpen size={14} /> Enterprise Legal Vault
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            Welcome back, {user?.first_name || 'User'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Track active case roadmaps, evidence checklists, and legal document drafts.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/profile"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <User size={14} /> Profile
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem('legalsathi_token');
              localStorage.removeItem('legalsathi_user');
              router.push('/login');
            }}
            className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950 dark:text-red-300"
          >
            <LogOut size={14} /> Sign Out
          </button>
          <button
            onClick={() => router.push('/navigator')}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
          >
            <Plus size={16} /> New Case Intake
          </button>
        </div>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Active Cases</p>
          <p className="text-3xl font-black text-blue-600 mt-2">{savedCases.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Roadmaps</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">{savedCases.filter((c) => c.progress < 100).length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Drafts Generated</p>
          <p className="text-3xl font-black text-indigo-600 mt-2">{savedCases.length * 2}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Supported Domains</p>
          <p className="text-3xl font-black text-amber-600 mt-2">26+</p>
        </div>
      </div>

      {/* Unified Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm">
          <FolderOpen size={16} /> Saved Cases
        </button>
        <Link
          href="/documents"
          className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition"
        >
          <FileText size={16} /> Uploaded Documents & Templates
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved cases by title or Case ID..."
            className="w-full rounded-2xl border border-slate-200/80 bg-white py-3 pl-10 pr-4 text-xs sm:text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900"
          />
        </div>

        <div className="flex gap-2">
          {['All', 'Critical', 'High', 'Medium'].map((urg) => (
            <button
              key={urg}
              onClick={() => setFilterUrgency(urg)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                filterUrgency === urg
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              {urg}
            </button>
          ))}
        </div>
      </div>

      {/* SaaS Data Table View */}
      <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FolderOpen size={40} className="mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-xs text-slate-500 font-medium dark:text-slate-400">No saved legal cases found matching filters.</p>
            <button
              onClick={() => router.push('/navigator')}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
            >
              Launch Navigator Intake
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase font-bold text-[10px] tracking-wider dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">Case Code</th>
                  <th className="py-3.5 px-4">Title & Legal Domain</th>
                  <th className="py-3.5 px-4">Urgency</th>
                  <th className="py-3.5 px-4">Roadmap Progress</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-850 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{item.case_code}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{item.title}</p>
                      <span className="text-[10px] text-slate-400 font-semibold">{item.category}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          item.urgency.toLowerCase() === 'critical'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : item.urgency.toLowerCase() === 'high'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {item.urgency}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 w-40">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${item.progress}%` }} />
                        </div>
                        <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-400">{item.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => router.push(`/navigator?q=${encodeURIComponent(item.title)}`)}
                        className="rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 transition"
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
