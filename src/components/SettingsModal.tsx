import React, { useState } from 'react';
import { X, SlidersHorizontal, RotateCcw, Check, Info } from 'lucide-react';
import { AudienceSettings } from '../types';
import { DEFAULT_AUDIENCE_SETTINGS } from '../data/timezones';
import { saveStoredAudienceSettings } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AudienceSettings;
  onUpdateSettings: (settings: AudienceSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [formState, setFormState] = useState<AudienceSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formState);
    saveStoredAudienceSettings(formState);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleResetDefaults = () => {
    setFormState(DEFAULT_AUDIENCE_SETTINGS);
    onUpdateSettings(DEFAULT_AUDIENCE_SETTINGS);
    saveStoredAudienceSettings(DEFAULT_AUDIENCE_SETTINGS);
  };

  const formatHour = (hour: number) => {
    const h12 = hour % 12 === 0 ? 12 : hour % 12;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${h12}:00 ${ampm} (${hour.toString().padStart(2, '0')}:00)`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Dashboard & Indicator Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure local time-of-day thresholds and audience awake windows.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="py-4 space-y-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-xs text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300 flex items-start gap-2">
            <Info className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
            <span>
              These indicators provide general scheduling orientation based on local wall-clock hours, not live telemetry.
            </span>
          </div>

          {/* Time of Day Thresholds */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Time of Day Thresholds (24h clock)
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300">
                  🌅 Morning Start (6 AM)
                </label>
                <select
                  value={formState.morningStart}
                  onChange={(e) =>
                    setFormState({ ...formState, morningStart: parseInt(e.target.value, 10) })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {[4, 5, 6, 7, 8].map((h) => (
                    <option key={h} value={h}>
                      {formatHour(h)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300">
                  🟢 Afternoon Start (12 PM)
                </label>
                <select
                  value={formState.afternoonStart}
                  onChange={(e) =>
                    setFormState({ ...formState, afternoonStart: parseInt(e.target.value, 10) })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {[11, 12, 13, 14].map((h) => (
                    <option key={h} value={h}>
                      {formatHour(h)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300">
                  🌆 Evening Start (5 PM)
                </label>
                <select
                  value={formState.eveningStart}
                  onChange={(e) =>
                    setFormState({ ...formState, eveningStart: parseInt(e.target.value, 10) })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {[16, 17, 18, 19].map((h) => (
                    <option key={h} value={h}>
                      {formatHour(h)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300">
                  🌙 Night Start (10 PM)
                </label>
                <select
                  value={formState.nightStart}
                  onChange={(e) =>
                    setFormState({ ...formState, nightStart: parseInt(e.target.value, 10) })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {[20, 21, 22, 23].map((h) => (
                    <option key={h} value={h}>
                      {formatHour(h)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Awake Window */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Facebook Audience Awake Window
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300">
                  Awake From (Morning)
                </label>
                <select
                  value={formState.awakeStart}
                  onChange={(e) =>
                    setFormState({ ...formState, awakeStart: parseInt(e.target.value, 10) })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {[5, 6, 7, 8, 9].map((h) => (
                    <option key={h} value={h}>
                      {formatHour(h)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300">
                  Awake Until (Night)
                </label>
                <select
                  value={formState.awakeEnd}
                  onChange={(e) =>
                    setFormState({ ...formState, awakeEnd: parseInt(e.target.value, 10) })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {[21, 22, 23, 24].map((h) => (
                    <option key={h} value={h}>
                      {formatHour(h)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset to Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                {savedSuccess ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Settings</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
