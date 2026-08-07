'use client';

import { useState } from 'react';
import { PhoneCall, ShieldAlert, X } from 'lucide-react';

export default function EmergencyHelpline() {
  const [open, setOpen] = useState(false);

  const helplines = [
    { name: 'National Legal Aid (NALSA)', number: '15100', desc: 'Free legal aid & representation for eligible citizens' },
    { name: 'National Cyber Crime Helpline', number: '1930', desc: 'Report financial cyber fraud & online crimes immediately' },
    { name: 'Women Helpline (NCW)', number: '7827170170', desc: 'Support for domestic violence & harassment' },
    { name: 'Childline India', number: '1098', desc: 'Emergency care & protection for children' },
    { name: 'Senior Citizen Helpline (Elder Line)', number: '14567', desc: 'Guidance & assistance for senior citizens' },
  ];

  return (
    <>
      {/* Floating Emergency Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        title="Emergency Legal Helplines"
      >
        <PhoneCall size={18} className="animate-pulse" />
        <span>Emergency Helplines</span>
      </button>

      {/* Emergency Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-red-200 dark:border-red-900/50">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <ShieldAlert size={24} />
                <h3 className="text-lg font-bold">Emergency Legal Helplines</h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Free & official emergency helplines supported across India. Tap any number to dial.
            </p>

            <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {helplines.map((h, i) => (
                <a
                  key={i}
                  href={`tel:${h.number.replace(/\s+/g, '')}`}
                  className="block rounded-xl border border-slate-200 bg-slate-50 p-3.5 transition-colors hover:border-red-300 hover:bg-red-50/50 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-red-900 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{h.name}</span>
                    <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700 dark:bg-red-950 dark:text-red-300">
                      {h.number}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{h.desc}</p>
                </a>
              ))}
            </div>

            <div className="mt-5 text-center">
              <button
                onClick={() => setOpen(false)}
                className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
