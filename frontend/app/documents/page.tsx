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
    { title: 'Police Complaint (FIR)', type: 'Police Complaint', cat: 'Police & Criminal', desc: 'Formal complaint for theft, assault, or criminal offences.' },
    { title: 'Cyber Crime Complaint', type: 'Cyber Complaint', cat: 'Cyber Crime', desc: 'Report online financial fraud, phishing, or OTP theft.' },
    { title: 'Rental Legal Notice', type: 'Legal Notice to Landlord', cat: 'Rental & Property', desc: 'Demand refund of security deposit or object to illegal eviction.' },
    { title: 'Consumer Forum Claim Notice', type: 'Consumer Complaint Notice', cat: 'Consumer Rights', desc: 'Demand refund / replacement for defective goods or service failure.' },
    { title: 'Copyright Takedown Notice', type: 'Copyright Takedown', cat: 'Cyber Crime', desc: 'Notice to remove unauthorized stolen content or written work.' },
    { title: 'RTI Application Form', type: 'RTI Application', cat: 'RTI & Public', desc: 'Request information from public authorities under RTI Act.' },
  ];

  const filtered = templates.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || t.cat === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Legal Document Center</h1>
          <p className="text-xs sm:text-sm text-slate-500">Google Drive-style document template manager & automated drafting</p>
        </div>
        <button
          onClick={() => router.push('/navigator')}
          className="flex items-center justify-center gap-1.5 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
        >
          <Sparkles size={15} /> Launch Case Navigator
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates (FIR, Rent Notice, Consumer, Cyber)..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex overflow-x-auto gap-1.5 pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t, idx) => (
          <div key={idx} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-blue-300 hover:shadow-md transition space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FileText size={18} />
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                {t.cat}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600">{t.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{t.desc}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-700">Editable Template</span>
              <button
                onClick={() => {
                  if (!isLoggedIn) setShowModal(true);
                  else router.push('/navigator');
                }}
                className="flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
              >
                Use Template ➔
              </button>
            </div>
          </div>
        ))}
      </div>
      <GuestLimitModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
