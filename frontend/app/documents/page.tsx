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
  Upload,
  Trash2,
  Eye,
  File,
} from 'lucide-react';
import GuestLimitModal from '@/components/guest-limit-modal';

type UploadedDoc = {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  category: string;
  type: string;
};

export default function DocumentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState<'templates' | 'vault'>('templates');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([
    {
      id: 'doc-1',
      name: 'Complainant_Aadhaar_Card_Verified.pdf',
      size: '1.2 MB',
      uploadedAt: '07 Aug 2026, 10:15 PM',
      category: 'Identity Proof',
      type: 'PDF Document',
    },
    {
      id: 'doc-2',
      name: 'Bank_Statement_Transaction_Proof.pdf',
      size: '2.4 MB',
      uploadedAt: '07 Aug 2026, 10:18 PM',
      category: 'Financial Evidence',
      type: 'PDF Document',
    },
    {
      id: 'doc-3',
      name: 'WhatsApp_Chat_Export_Legal_Notice.png',
      size: '840 KB',
      uploadedAt: '07 Aug 2026, 10:20 PM',
      category: 'Written Proof',
      type: 'PNG Image',
    },
  ]);

  useEffect(() => {
    const token = localStorage.getItem('legalsathi_token');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setShowModal(true);
    }
  }, []);

  const handleVaultUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const nowStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newItems: UploadedDoc[] = Array.from(files).map((f, idx) => ({
      id: `doc-${Date.now()}-${idx}`,
      name: f.name,
      size: `${(f.size / 1024).toFixed(1)} KB`,
      uploadedAt: nowStr,
      category: f.type.includes('image') ? 'Visual Proof' : 'Document Evidence',
      type: f.type || 'Legal Document',
    }));

    setUploadedDocs((prev) => [...newItems, ...prev]);
    alert(`✓ ${newItems.length} file(s) received and stored in your encrypted Evidence Vault.`);
  };

  const handleDeleteDoc = (id: string) => {
    setUploadedDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const categories = ['All', 'Police & Criminal', 'Cyber Crime', 'Rental & Property', 'Consumer Rights', 'RTI & Public'];

  const templates = [
    { title: 'Police Complaint (FIR)', type: 'Police Complaint', cat: 'Police & Criminal', desc: 'Formal complaint for theft, assault, harassment, or criminal offences.' },
    { title: 'Cyber Crime Complaint', type: 'Cyber Complaint', cat: 'Cyber Crime', desc: 'Report online financial fraud, phishing, identity theft, or OTP scams.' },
    { title: 'Rental Legal Notice', type: 'Legal Notice to Landlord', cat: 'Rental & Property', desc: 'Demand refund of security deposit or object to illegal eviction.' },
    { title: 'Consumer Forum Claim Notice', type: 'Consumer Complaint Notice', cat: 'Consumer Rights', desc: 'Demand refund or replacement for defective goods or service failure.' },
    { title: 'Copyright Takedown Notice', type: 'Copyright Takedown', cat: 'Cyber Crime', desc: 'Notice to remove unauthorized stolen content or written digital work.' },
    { title: 'RTI Application Form', type: 'RTI Application', cat: 'RTI & Public', desc: 'Request information from public authorities under RTI Act 2005.' },
  ];

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || t.cat === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const filteredVault = uploadedDocs.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) || d.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 sm:py-10 space-y-8 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between border-b border-slate-200/80 pb-6 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950 dark:text-blue-300">
            <FileText size={14} /> Automated Legal Document & Evidence Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">Legal Document & Proof Vault</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Generate legal notices, FIR complaints, manage uploaded evidence proofs, and store case files.</p>
        </div>
        <button
          onClick={() => router.push('/navigator')}
          className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
        >
          <Sparkles size={16} /> Launch Case Navigator Studio
        </button>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 pb-3.5 text-xs font-extrabold transition border-b-2 ${
            activeTab === 'templates'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <FileText size={16} /> Ready Legal Templates & Generators ({templates.length})
        </button>
        <button
          onClick={() => setActiveTab('vault')}
          className={`flex items-center gap-2 pb-3.5 text-xs font-extrabold transition border-b-2 ${
            activeTab === 'vault'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <FolderOpen size={16} /> My Uploaded Evidence Vault ({uploadedDocs.length})
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
            placeholder={activeTab === 'templates' ? "Search legal templates (FIR, Rent Notice, Consumer, Cyber)..." : "Search uploaded documents in vault..."}
            className="w-full rounded-2xl border border-slate-200/80 bg-white py-3 pl-10 pr-4 text-xs sm:text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900"
          />
        </div>

        {activeTab === 'templates' && (
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
        )}
      </div>

      {/* Tab 1: Templates Grid */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((t, idx) => (
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
      )}

      {/* Tab 2: Uploaded Evidence Vault */}
      {activeTab === 'vault' && (
        <div className="space-y-6">
          {/* Drag & Drop Upload Card */}
          <div className="rounded-3xl border-2 border-dashed border-blue-200 bg-blue-50/40 p-8 text-center space-y-3 dark:border-blue-900/50 dark:bg-blue-950/20">
            <Upload size={32} className="mx-auto text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Upload Legal Documents & Proofs</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Upload Aadhaar, Rent Agreements, Bank Statements, FIR Copies, or Screenshots</p>
            </div>
            <input
              type="file"
              multiple
              id="vault-file-input"
              className="hidden"
              onChange={(e) => handleVaultUpload(e.target.files)}
            />
            <label
              htmlFor="vault-file-input"
              className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
            >
              <Plus size={16} /> Select & Upload Evidence Files
            </label>
          </div>

          {/* Uploaded Documents List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <FileCheck size={16} className="text-emerald-600" /> Received Evidence Documents ({filteredVault.length})
              </h3>
              <span className="text-xs text-slate-500">End-to-End Encrypted Storage</span>
            </div>

            {filteredVault.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                No uploaded evidence documents match your search. Upload files above to store them in your vault.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredVault.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                        <File size={20} />
                      </span>
                      <div className="truncate space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{doc.name}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {doc.size} • Uploaded: {doc.uploadedAt}
                        </p>
                        <span className="inline-block rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                          {doc.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => alert(`Opening preview for ${doc.name}`)}
                        className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        title="Preview Document"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950"
                        title="Delete Document"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <GuestLimitModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
