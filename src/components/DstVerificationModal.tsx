import React from 'react';
import { X, Calendar, ArrowRight, CheckCircle2, RotateCcw, ShieldCheck } from 'lucide-react';
import { TARGET_TIMEZONES, MASTER_TIMEZONE } from '../data/timezones';
import { getTimezoneAbbreviation, getTimezoneOffsetMinutes, formatUtcOffset } from '../utils/timezone';

interface DstVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSimulationDate: (date: Date, label: string) => void;
  onResetToLive: () => void;
  isSimulating: boolean;
  activeSimulationLabel?: string;
}

interface SeasonPreset {
  id: string;
  label: string;
  monthName: string;
  date: Date;
  description: string;
  highlights: {
    uk: string;
    us: string;
    au: string;
    sl: string;
  };
}

const SEASON_PRESETS: SeasonPreset[] = [
  {
    id: 'january',
    label: 'January (Winter Standard)',
    monthName: 'January 15',
    date: new Date(Date.UTC(2026, 0, 15, 12, 0, 0)),
    description: 'Northern hemisphere in Winter standard time. Southern hemisphere (Australia) in Summer daylight saving.',
    highlights: {
      uk: 'London: GMT (UTC+0)',
      us: 'New York: EST (UTC-5) · LA: PST (UTC-8)',
      au: 'Sydney: AEDT (UTC+11, DST Active) · Lord Howe: (UTC+11:00)',
      sl: 'Sri Lanka: UTC+5:30 (Constant)',
    },
  },
  {
    id: 'march',
    label: 'March (Spring DST Transition)',
    monthName: 'March 30',
    date: new Date(Date.UTC(2026, 2, 30, 12, 0, 0)),
    description: 'US & Europe have just sprung forward into Daylight Saving Time.',
    highlights: {
      uk: 'London: BST (UTC+1, DST Active)',
      us: 'New York: EDT (UTC-4) · LA: PDT (UTC-7)',
      au: 'Sydney: AEDT (UTC+11)',
      sl: 'Sri Lanka: UTC+5:30 (Constant)',
    },
  },
  {
    id: 'june',
    label: 'June (Summer Daylight Saving)',
    monthName: 'June 20',
    date: new Date(Date.UTC(2026, 5, 20, 12, 0, 0)),
    description: 'Northern hemisphere in peak Summer Daylight Saving. Australia in Winter standard time.',
    highlights: {
      uk: 'London: BST (UTC+1, DST Active)',
      us: 'New York: EDT (UTC-4) · LA: PDT (UTC-7)',
      au: 'Sydney: AEST (UTC+10, Standard) · Lord Howe: (UTC+10:30)',
      sl: 'Sri Lanka: UTC+5:30 (Constant)',
    },
  },
  {
    id: 'september',
    label: 'September (Autumn Equinox)',
    monthName: 'September 23',
    date: new Date(Date.UTC(2026, 8, 23, 12, 0, 0)),
    description: 'Late summer/autumn in Northern Hemisphere; early spring in Australia.',
    highlights: {
      uk: 'London: BST (UTC+1)',
      us: 'New York: EDT (UTC-4) · LA: PDT (UTC-7)',
      au: 'Sydney: AEST (UTC+10) (Australian DST begins early October)',
      sl: 'Sri Lanka: UTC+5:30 (Constant)',
    },
  },
  {
    id: 'november',
    label: 'November (Northern Standard Return)',
    monthName: 'November 15',
    date: new Date(Date.UTC(2026, 10, 15, 12, 0, 0)),
    description: 'US and Europe have set clocks back to Standard. Australia has entered Summer Daylight Saving.',
    highlights: {
      uk: 'London: GMT (UTC+0, Standard Return)',
      us: 'New York: EST (UTC-5) · LA: PST (UTC-8)',
      au: 'Sydney: AEDT (UTC+11, DST Active) · Adelaide: ACDT (UTC+10:30)',
      sl: 'Sri Lanka: UTC+5:30 (Constant)',
    },
  },
];

export const DstVerificationModal: React.FC<DstVerificationModalProps> = ({
  isOpen,
  onClose,
  onSelectSimulationDate,
  onResetToLive,
  isSimulating,
  activeSimulationLabel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Daylight-Saving (DST) Transition Verifier
                </h2>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  IANA Compliant
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Test the dashboard across 5 distinct points in the year to verify automatic DST transitions for UK, Ireland, US, and Australia.
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Dashboard Mode:{' '}
              </span>
              {isSimulating ? (
                <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                  Simulating {activeSimulationLabel}
                </span>
              ) : (
                <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                  Live System Clock (Real-Time)
                </span>
              )}
            </div>

            {isSimulating && (
              <button
                onClick={() => {
                  onResetToLive();
                  onClose();
                }}
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Return to Live Clock</span>
              </button>
            )}
          </div>

          {/* Test Presets Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select Seasonal Test Date
            </h3>

            {SEASON_PRESETS.map((preset) => {
              const isCurrentSim = isSimulating && activeSimulationLabel === preset.monthName;

              return (
                <div
                  key={preset.id}
                  className={`rounded-xl border p-4 transition-all ${
                    isCurrentSim
                      ? 'border-blue-500 bg-blue-50/50 shadow-xs dark:border-blue-700 dark:bg-blue-950/30'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-850'
                  }`}
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {preset.label}
                        </span>
                        <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                          ({preset.monthName}, 2026)
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {preset.description}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onSelectSimulationDate(preset.date, preset.monthName);
                        onClose();
                      }}
                      className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors shrink-0 ${
                        isCurrentSim
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
                      }`}
                    >
                      {isCurrentSim ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Active in App</span>
                        </>
                      ) : (
                        <>
                          <span>Apply to Dashboard</span>
                          <ArrowRight className="h-3 w-3" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Highlights Bar */}
                  <div className="mt-3 grid grid-cols-1 gap-2 rounded-lg bg-slate-50 p-2 text-[11px] sm:grid-cols-2 lg:grid-cols-4 dark:bg-slate-900/60 font-mono">
                    <div className="text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-slate-900 dark:text-white">🇬🇧 UK: </span>
                      {preset.highlights.uk}
                    </div>
                    <div className="text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-slate-900 dark:text-white">🇺🇸 US: </span>
                      {preset.highlights.us}
                    </div>
                    <div className="text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-slate-900 dark:text-white">🇦🇺 AU: </span>
                      {preset.highlights.au}
                    </div>
                    <div className="text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-slate-900 dark:text-white">🇱🇰 SL: </span>
                      {preset.highlights.sl}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-slate-100 pt-3 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Browser native Intl.DateTimeFormat with IANA database</span>
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
