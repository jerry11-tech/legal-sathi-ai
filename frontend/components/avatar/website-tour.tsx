'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle, X } from 'lucide-react';
import LegalSathiAvatar from './legalsathi-avatar';

export type TourStep = {
  title: string;
  description: string;
  targetQuery?: string;
};

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to LegalSathi AI',
    description:
      'LegalSathi is your AI legal assistant. We provide free legal information, document generation, and step-by-step guidance under Indian Law.',
  },
  {
    title: 'AI Legal Consultation (/chat)',
    description:
      'Describe any legal issue in your own words. Ask about Women’s Rights, POCSO, Senior Citizens, Landlord Disputes, Cyber Crimes, or Consumer Rights.',
    targetQuery: 'chat',
  },
  {
    title: 'Document Generator (/documents)',
    description:
      'Generate automated legal notices, police complaints (FIRs), rental notices, and consumer dispute templates instantly.',
  },
  {
    title: 'Personalized Dashboard (/dashboard)',
    description:
      'Revisit your previous legal consultations, saved document drafts, and legal stats anytime.',
  },
  {
    title: 'Emergency Helplines',
    description:
      'In an emergency, contact official helplines immediately: Women (1091), Child (1098), Cyber Crime (1930), Senior Citizens (14567).',
  },
];

interface WebsiteTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WebsiteTour({ isOpen, onClose }: WebsiteTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onClose();
      setCurrentStep(0);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl transition-all">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4">
          <LegalSathiAvatar state="waving" size="md" className="shrink-0 mt-1" />
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
              <HelpCircle size={14} />
              Website Tour ({currentStep + 1} of {TOUR_STEPS.length})
            </div>
            <h3 className="mt-1 text-lg font-bold text-slate-900 leading-snug">
              {step.title}
            </h3>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          {step.description}
        </p>

        {/* Progress dots */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === currentStep ? 'w-6 bg-blue-600' : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                <ChevronLeft size={14} /> Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700 transition"
            >
              {currentStep === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next'}
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
