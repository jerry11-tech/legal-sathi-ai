'use client';

import { RotateCcw, Sliders, X } from 'lucide-react';

export type AvatarSettingsState = {
  size: 'sm' | 'md' | 'lg';
  animations: boolean;
  minimized: boolean;
  hidden: boolean;
};

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AvatarSettingsState;
  onUpdate: (newSettings: Partial<AvatarSettingsState>) => void;
  onReplayTour: () => void;
  onResetOnboarding: () => void;
}

export default function AvatarSettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdate,
  onReplayTour,
  onResetOnboarding,
}: SettingsProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl transition-all">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">LegalSathi Guide Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-sm text-slate-700">
          {/* Avatar Size */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-800">Avatar Size</span>
            <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              {(['sm', 'md', 'lg'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => onUpdate({ size: sz })}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md uppercase transition ${
                    settings.size === sz
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Micro Animations */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-800">Micro Animations</span>
            <button
              onClick={() => onUpdate({ animations: !settings.animations })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                settings.animations ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  settings.animations ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2 border-t border-slate-100">
            <button
              onClick={() => {
                onReplayTour();
                onClose();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
            >
              <RotateCcw size={14} />
              Replay Website Tour
            </button>

            <button
              onClick={() => {
                onResetOnboarding();
                onClose();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Reset Guide Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
