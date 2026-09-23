import React, { useState } from 'react';
import { Copy, Check, Clock, Globe, ArrowDownRight, Compass } from 'lucide-react';
import { ConvertedTimeInfo } from '../types';

interface MasterClockCardProps {
  sriLankaInfo: ConvertedTimeInfo;
  timeFormat: '12h' | '24h';
  showSeconds: boolean;
  onToggleSeconds: () => void;
  onScrollToPostingHelper: () => void;
  onScrollToSchedule: () => void;
}

export const MasterClockCard: React.FC<MasterClockCardProps> = ({
  sriLankaInfo,
  timeFormat,
  showSeconds,
  onToggleSeconds,
  onScrollToPostingHelper,
  onScrollToSchedule,
}) => {
  const [copied, setCopied] = useState(false);

  const displayTime = timeFormat === '12h' ? sriLankaInfo.timeString12 : sriLankaInfo.timeString24;

  const handleCopy = () => {
    const textToCopy = `Sri Lanka (Asia/Colombo) — ${displayTime}, ${sriLankaInfo.fullDateString} (${sriLankaInfo.utcOffsetString})`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 p-6 text-white shadow-xl dark:border-blue-900/50">
      {/* Subtle decorative background pattern */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        {/* Left Column: Label, Flag, Status */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl shadow-sm drop-shadow" role="img" aria-label="Sri Lanka flag">
              🇱🇰
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  SRI LANKA
                </h1>
                <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-300 border border-blue-400/30">
                  Master Reference
                </span>
              </div>
              <p className="text-xs font-medium text-blue-200/80">
                Single UTC instant reference for all global audience conversions
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-blue-200/70">
            <span className="flex items-center gap-1 font-mono">
              <Globe className="h-3.5 w-3.5 text-blue-400" />
              <span>Asia/Colombo</span>
            </span>
            <span>·</span>
            <span className="font-mono font-medium text-blue-300">UTC +5:30</span>
            <span>·</span>
            <span>Fixed Standard Time (No DST)</span>
          </div>
        </div>

        {/* Center / Dominant Digital Clock */}
        <div className="flex flex-col items-start lg:items-end">
          <div className="text-[11px] font-bold tracking-widest text-blue-300 uppercase">
            CURRENT MASTER TIME
          </div>

          <div className="flex items-baseline gap-1 py-1 font-mono text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl tabular-nums">
            <span>{displayTime}</span>
            {showSeconds && (
              <span className="text-2xl sm:text-3xl font-normal text-blue-300/80">
                {sriLankaInfo.secondsString}
              </span>
            )}
          </div>

          <div className="text-sm sm:text-base font-semibold text-slate-200">
            {sriLankaInfo.fullDateString}
          </div>
        </div>

        {/* Right / Actions & Quick Links */}
        <div className="flex flex-wrap items-center gap-2 border-t border-blue-800/40 pt-4 lg:flex-col lg:items-end lg:border-t-0 lg:pt-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/30 px-3 py-2 text-xs font-medium text-white transition-colors"
            title="Copy current Sri Lanka time and date"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-blue-300" />
                <span>Copy Master Time</span>
              </>
            )}
          </button>

          <button
            onClick={onToggleSeconds}
            className="rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 px-3 py-2 text-xs font-mono text-slate-300 transition-colors"
            title="Toggle seconds display"
          >
            {showSeconds ? 'Hide Seconds' : 'Show Seconds'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onScrollToPostingHelper}
              className="flex items-center gap-1 rounded-lg bg-blue-500 hover:bg-blue-400 px-3 py-2 text-xs font-semibold text-slate-950 transition-colors shadow-sm"
            >
              <span>Posting Helper</span>
              <ArrowDownRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onScrollToSchedule}
              className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-2 text-xs font-medium text-white transition-colors"
            >
              Daily Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
