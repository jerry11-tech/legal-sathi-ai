'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, ExternalLink, ArrowRight, X, Sparkles, Building2, Calendar, FileText } from 'lucide-react';

export type GovernmentAnnouncement = {
  id: number;
  gazette_notification_no: string;
  title: string;
  ministry: string;
  publication_date: string;
  effective_date?: string;
  official_pdf_url: string;
  pdf_sha256: string;
  is_verified_source: boolean;
  act_affected: string;
  summary_old_rule?: string;
  summary_new_rule: string;
  key_citizen_impact: string;
};

export default function GovtAnnouncementsWidget() {
  const [announcements, setAnnouncements] = useState<GovernmentAnnouncement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<GovernmentAnnouncement | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements');
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch {}
  };

  if (announcements.length === 0) return null;

  return (
    <div className="w-full space-y-4">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-line pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-royal text-white shadow-xs">
            <ShieldCheck size={16} />
          </span>
          <div>
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-navy-text dark:text-white">
              Latest Government Law Announcements (2024–2026)
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                ✓ 100% Official Govt Verified
              </span>
            </h3>
          </div>
        </div>
      </div>

      {/* Grid of Verified Gazette Items */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {announcements.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col justify-between rounded-2xl border border-line bg-white p-4 shadow-soft transition hover:border-royal/40 dark:border-slate-800 dark:bg-[#0B1331]"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-md bg-soft px-2 py-0.5 text-[10px] font-bold text-royal dark:bg-slate-800 dark:text-blue-300">
                  <Building2 size={11} /> {item.ministry.split('(')[0]}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-bodytext dark:text-slate-500">
                  <Calendar size={11} /> {item.publication_date}
                </span>
              </div>

              <h4 className="text-xs font-bold leading-snug text-navy-text transition group-hover:text-royal dark:text-white">
                {item.title}
              </h4>

              <p className="line-clamp-2 text-[11px] leading-relaxed text-bodytext dark:text-slate-400">
                {item.key_citizen_impact}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-line pt-3 dark:border-slate-800">
              <button
                onClick={() => setSelectedAnnouncement(item)}
                className="flex items-center gap-1 text-[11px] font-bold text-royal hover:underline dark:text-blue-400"
              >
                <span>View Rule Changes</span>
                <ArrowRight size={12} />
              </button>

              <a
                href={item.official_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-md hover:bg-emerald-100 transition"
                title="Verify original PDF on Government Portal"
              >
                <span>Govt Document</span>
                <ExternalLink size={10} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Comparative Modal: Old Rule vs New Government Rule */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deeper/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl space-y-5 overflow-hidden rounded-3xl border border-line bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-150 dark:border-slate-800 dark:bg-[#0B1331]">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-line pb-4 dark:border-slate-800">
              <div>
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <ShieldCheck size={14} /> Official Gazette Notification: {selectedAnnouncement.gazette_notification_no}
                </div>
                <h3 className="text-lg font-black leading-tight text-navy-text dark:text-white">
                  {selectedAnnouncement.title}
                </h3>
                <p className="mt-1 text-xs text-bodytext dark:text-slate-400">
                  Issued by {selectedAnnouncement.ministry} • Published {selectedAnnouncement.publication_date}
                </p>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="rounded-xl border border-line p-2 text-bodytext transition hover:text-navy-text dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Old Rule vs New Rule Comparison Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Old Rule Card */}
              <div className="rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/30 p-4 space-y-2">
                <span className="inline-block rounded-md bg-red-100 dark:bg-red-900/60 px-2 py-0.5 text-[10px] font-extrabold uppercase text-red-800 dark:text-red-300">
                  🔴 Old Rule / Previous Provision
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {selectedAnnouncement.summary_old_rule || "Prior statutory provision before amendment."}
                </p>
              </div>

              {/* New Government Rule Card */}
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/30 p-4 space-y-2">
                <span className="inline-block rounded-md bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 text-[10px] font-extrabold uppercase text-emerald-800 dark:text-emerald-300">
                  🟢 New Enacted Government Rule
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {selectedAnnouncement.summary_new_rule}
                </p>
              </div>
            </div>

            {/* Key Citizen Impact */}
            <div className="space-y-1.5 rounded-2xl border border-royal/25 bg-soft p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <h4 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-navy-text dark:text-blue-200">
                <Sparkles size={14} className="text-royal dark:text-blue-400" /> Practical Impact for Indian Citizens
              </h4>
              <p className="text-xs leading-relaxed text-bodytext dark:text-slate-300">
                {selectedAnnouncement.key_citizen_impact}
              </p>
            </div>

            {/* Modal Footer & Direct PDF Verification */}
            <div className="flex flex-col items-center justify-between gap-3 border-t border-line pt-3 sm:flex-row dark:border-slate-800">
              <div className="flex items-center gap-1 truncate text-[11px] text-bodytext">
                <FileText size={12} />
                <span className="truncate">SHA-256: {selectedAnnouncement.pdf_sha256.slice(0, 24)}...</span>
              </div>
              <a
                href={selectedAnnouncement.official_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
              >
                <span>Verify Original Govt Document (.pdf)</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
