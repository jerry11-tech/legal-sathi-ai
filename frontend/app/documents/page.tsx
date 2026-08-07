'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  FolderOpen,
  Plus,
  Search,
  Sparkles,
  Shield,
  Download,
  Filter,
  Lock,
  ArrowRight,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';
import GuestLimitModal from '@/components/guest-limit-modal';

export default function DocumentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('legalsathi_token');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setShowModal(true);
    }
  }, []);

  const categories = ['All', 'Police & Criminal', 'Cyber Crime', 'Rental & Property', 'Consumer Rights', 'RTI & Public'];

  const templates = [
    { title: 'Police Complaint (FIR)', type: 'Police Complaint', cat: 'Police & Criminal', desc: 'Formal complaint for theft, assault, harassment, or criminal offences.' },
    { title: 'Cyber Crime Complaint', type: 'Cyber Complaint', cat: 'Cyber Crime', desc: 'Report online financial fraud, phishing, identity theft, or OTP scams.' },
    { title: 'Rental Legal Notice', type: 'Legal Notice to Landlord', cat: 'Rental & Property', desc: 'Demand refund of security deposit or object to illegal eviction.' },
    { title: 'Consumer Forum Claim Notice', type: 'Consumer Complaint Notice', cat: 'Consumer Rights', desc: 'Demand refund or replacement for defective goods or service failure.' },
    { title: 'Copyright Takedown Notice', type: 'Copyright Takedown', cat: 'Cyber Crime', desc: 'Notice to remove unauthorized stolen content or written digital work.' },
    { title: 'RTI Application Form', type: 'RTI Application', cat: 'RTI & Public', desc: 'Request information from public authorities under RTI Act 2005.' },
  ];

  const filtered = templates.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || t.cat === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 space-y-8 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between border-b border-slate-200/80 pb-6 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950 dark:text-blue-300">
            <FileText size={14} /> Automated Legal Document Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">Legal Document Center</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Generate legal notices, affidavits, complaints, and agreements ready for Indian legal standards.</p>
        </div>
        <button
          onClick={() => router.push('/navigator')}
          className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
        >
          <Sparkles size={16} /> Launch Case Navigator Studio
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search legal templates (FIR, Rent Notice, Consumer, Cyber)..."
            className="w-full rounded-2xl border border-slate-200/80 bg-white py-3 pl-10 pr-4 text-xs sm:text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900"
          />
        </div>

        <div className="flex overflow-x-auto gap-2 pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((t, idx) => (
          <div
            key={idx}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs hover:border-blue-300 hover:shadow-lg transition dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <FileText size={20} />
                </span>
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  {t.cat}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition">{t.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{t.desc}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <CheckCircle2 size={13} /> Official Standard
              </span>
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    setShowModal(true);
                  } else {
                    router.push(`/navigator?q=${encodeURIComponent(t.title)}`);
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100 transition dark:bg-blue-950 dark:text-blue-300"
              >
                <span>Draft Now</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <GuestLimitModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
