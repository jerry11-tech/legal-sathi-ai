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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/navigator/cases`);
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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Hello {user?.first_name || 'User'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">Welcome to your LegalSathi AI Dashboard · Track active cases, roadmaps & document drafts</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/profile"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <User size={14} /> Profile
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <Settings size={14} /> Settings
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem('legalsathi_token');
              localStorage.removeItem('legalsathi_user');
              router.push('/login');
            }}
            className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition"
          >
            <LogOut size={14} /> Sign Out
          </button>
          <button
            onClick={() => router.push('/navigator')}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
          >
            <Plus size={16} /> New Case Intake
          </button>
        </div>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500">Total Cases</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{savedCases.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500">Active Roadmaps</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{savedCases.filter((c) => c.progress < 100).length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500">Drafts Generated</p>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">{savedCases.length * 2}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500">Supported Domains</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">26+</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved cases by title or Case ID..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex gap-2">
          {['All', 'Critical', 'High', 'Medium'].map((urg) => (
            <button
              key={urg}
              onClick={() => setFilterUrgency(urg)}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                filterUrgency === urg ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {urg}
            </button>
          ))}
        </div>
      </div>

      {/* SaaS Data Table View */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FolderOpen size={36} className="mx-auto text-slate-300" />
            <p className="text-xs text-slate-500 font-medium">No saved legal cases found matching filters.</p>
            <button
              onClick={() => router.push('/navigator')}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
            >
              Launch Navigator
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Case Code</th>
                  <th className="p-4">Legal Issue Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Urgency</th>
                  <th className="p-4">Progress</th>
                  <th className="p-4">Last Updated</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-4 font-bold text-blue-600">{c.case_code}</td>
                    <td className="p-4 max-w-xs font-bold text-slate-900 truncate">"{c.title}"</td>
                    <td className="p-4">{c.category}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          c.urgency === 'Critical'
                            ? 'bg-red-100 text-red-700'
                            : c.urgency === 'High'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {c.urgency}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${c.progress}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-blue-600">{c.progress}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">{c.updated_at}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => router.push('/navigator')}
                        className="rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                      >
                        Open Case ➔
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
