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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('legalsathi_token');
    if (token) {
      setIsLoggedIn(true);
      fetchVaultFiles(token);
    } else {
      setShowModal(true);
    }
  }, []);

  const fetchVaultFiles = async (token: string) => {
    try {
      const res = await fetch('/api/vault/files', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUploadedDocs(data);
      }
    } catch {
      // keep empty list
    }
  };

  const handleVaultUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const token = localStorage.getItem('legalsathi_token');
    if (!token) {
      setShowModal(true);
      return;
    }

    setUploading(true);
    setUploadError('');
    try {
      const newItems: UploadedDoc[] = [];
      for (const f of Array.from(files)) {
        const form = new FormData();
        form.append('file', f);
        form.append('category', f.type.includes('image') ? 'Visual Proof' : 'Document Evidence');
        const res = await fetch('/api/vault/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
        if (res.ok) {
          const data = await res.json();
          newItems.push({
            id: String(data.id),
            name: data.name,
            size: data.size,
            uploadedAt: data.uploadedAt,
            category: data.category,
            type: data.type,
          });
        } else {
          const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
          throw new Error(err.detail || 'Upload failed');
        }
      }
      if (newItems.length > 0) {
        setUploadedDocs((prev) => [...newItems, ...prev]);
        alert(`✓ ${newItems.length} file(s) received and stored in your encrypted Evidence Vault.`);
      }
    } catch (err) {
      setUploadError((err as Error).message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    const token = localStorage.getItem('legalsathi_token');
    if (token) {
      try {
        await fetch(`/api/vault/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // continue removing locally even if the server call fails
      }
    }
    setUploadedDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleDownloadDoc = async (id: string, name: string) => {
    const token = localStorage.getItem('legalsathi_token');
    if (!token) return;
    try {
      const res = await fetch(`/api/vault/download/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        alert('Download failed');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert('Download failed');
    }
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
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 text-navy-text sm:px-6 sm:py-10 lg:px-8 dark:text-white">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-soft px-3 py-1 text-xs font-bold text-royal ring-1 ring-royal/25 dark:bg-slate-800 dark:text-blue-300">
            <FileText size={14} /> Automated Legal Document & Evidence Studio
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-navy-text dark:text-white sm:text-3xl">Legal Document & Proof Vault</h1>
          <p className="text-xs text-bodytext sm:text-sm dark:text-slate-400">Generate legal notices, FIR complaints, manage uploaded evidence proofs, and store case files.</p>
        </div>
        <button
          onClick={() => router.push('/navigator')}
          className="flex items-center justify-center gap-2 rounded-2xl bg-royal px-5 py-3 text-xs font-bold text-white shadow-md transition hover:bg-bright"
        >
          <Sparkles size={16} /> Launch Case Navigator Studio
        </button>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-4 border-b border-line dark:border-slate-800">
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 border-b-2 pb-3.5 text-xs font-extrabold transition ${
            activeTab === 'templates'
              ? 'border-royal text-royal dark:text-blue-400'
              : 'border-transparent text-bodytext hover:text-navy-text dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <FileText size={16} /> Ready Legal Templates & Generators ({templates.length})
        </button>
        <button
          onClick={() => setActiveTab('vault')}
          className={`flex items-center gap-2 border-b-2 pb-3.5 text-xs font-extrabold transition ${
            activeTab === 'vault'
              ? 'border-royal text-royal dark:text-blue-400'
              : 'border-transparent text-bodytext hover:text-navy-text dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <FolderOpen size={16} /> My Uploaded Evidence Vault ({uploadedDocs.length})
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3.5 text-bodytext/70" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={activeTab === 'templates' ? "Search legal templates (FIR, Rent Notice, Consumer, Cyber)..." : "Search uploaded documents in vault..."}
            className="w-full rounded-2xl border border-line bg-white py-3 pl-10 pr-4 text-xs text-navy-text outline-none transition focus:border-royal sm:text-sm dark:border-slate-800 dark:bg-[#0B1331] dark:text-white"
          />
        </div>

        {activeTab === 'templates' && (
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  selectedCategory === cat
                    ? 'bg-royal text-white shadow-sm'
                    : 'border border-line bg-white text-bodytext hover:bg-soft dark:border-slate-800 dark:bg-[#0B1331] dark:text-slate-300'
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
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((t, idx) => (
            <div
              key={idx}
              className="group flex flex-col justify-between rounded-2xl border border-line bg-white p-6 shadow-soft transition hover:border-royal/40 hover:shadow-card dark:border-slate-800 dark:bg-[#0B1331]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-soft text-royal dark:bg-slate-800 dark:text-blue-400">
                    <FileText size={20} />
                  </span>
                  <span className="rounded-full bg-soft px-3 py-1 text-[11px] font-bold text-royal dark:bg-slate-800 dark:text-slate-300">
                    {t.cat}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-navy-text transition group-hover:text-royal dark:text-white">{t.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-bodytext dark:text-slate-400">{t.desc}</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-line pt-6 dark:border-slate-800">
                <span className="flex items-center gap-1 text-[11px] font-bold text-mint">
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
                  className="flex items-center gap-1.5 rounded-xl bg-soft px-3.5 py-2 text-xs font-bold text-royal transition hover:bg-line dark:bg-slate-800 dark:text-blue-300"
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
          <div className="space-y-3 rounded-3xl border-2 border-dashed border-line bg-soft p-8 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <Upload size={32} className="mx-auto text-royal dark:text-blue-400" />
            <div>
              <h3 className="text-sm font-extrabold text-navy-text dark:text-white">Upload Legal Documents & Proofs</h3>
              <p className="mt-1 text-xs text-bodytext dark:text-slate-400">Upload Aadhaar, Rent Agreements, Bank Statements, FIR Copies, or Screenshots</p>
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
              className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-royal px-5 py-3 text-xs font-bold text-white shadow-md transition hover:bg-bright disabled:opacity-60"
            >
              <Plus size={16} /> {uploading ? 'Uploading...' : 'Select & Upload Evidence Files'}
            </label>
            {uploadError && (
              <p className="text-xs font-bold text-red-600 dark:text-red-400">{uploadError}</p>
            )}
          </div>

          {/* Uploaded Documents List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-bodytext dark:text-slate-400">
                <FileCheck size={16} className="text-mint" /> Received Evidence Documents ({filteredVault.length})
              </h3>
              <span className="text-xs text-bodytext">End-to-End Encrypted Storage</span>
            </div>

            {filteredVault.length === 0 ? (
              <div className="rounded-2xl border border-line bg-white p-8 text-center text-xs text-bodytext dark:border-slate-800 dark:bg-[#0B1331] dark:text-slate-400">
                No uploaded evidence documents match your search. Upload files above to store them in your vault.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {filteredVault.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-2xl border border-line bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-[#0B1331]"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint/10 text-mint dark:bg-emerald-950 dark:text-emerald-400">
                        <File size={20} />
                      </span>
                      <div className="space-y-0.5 truncate">
                        <h4 className="truncate text-xs font-bold text-navy-text dark:text-white">{doc.name}</h4>
                        <p className="text-[11px] text-bodytext dark:text-slate-400">
                          {doc.size} • Uploaded: {doc.uploadedAt}
                        </p>
                        <span className="inline-block rounded-full bg-soft px-2 py-0.5 text-[10px] font-semibold text-royal dark:bg-slate-800 dark:text-slate-300">
                          {doc.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => handleDownloadDoc(doc.id, doc.name)}
                        className="rounded-xl border border-line p-2 text-bodytext transition hover:bg-soft dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        title="Download Document"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="rounded-xl border border-red-200 p-2 text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950"
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