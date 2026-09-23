import React from 'react';
import { Clock, Moon, Sun, Settings, Radio, Calendar, SlidersHorizontal, Share2 } from 'lucide-react';
import { ConvertedTimeInfo } from '../types';

interface HeaderProps {
  sriLankaInfo: ConvertedTimeInfo;
  isSimulatingDst: boolean;
  simulatedDateLabel?: string;
  onResetToLive: () => void;
  onOpenDstModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenPagesModal: () => void;
  pagesCount: number;
  timeFormat: '12h' | '24h';
  onToggleTimeFormat: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sriLankaInfo,
  isSimulatingDst,
  simulatedDateLabel,
  onResetToLive,
  onOpenDstModal,
  onOpenSettingsModal,
  onOpenPagesModal,
  pagesCount,
  timeFormat,
  onToggleTimeFormat,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const displayTime = timeFormat === '12h' ? sriLankaInfo.timeString12 : sriLankaInfo.timeString24;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-extrabold text-lg tracking-wider">
            FB
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                FB TIME HUB
              </span>
              <span className="hidden text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 sm:inline-block">
                Global Page Times
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden md:block">
              Sri Lanka Master Clock → Global Facebook Page Times
            </p>
          </div>
        </div>

        {/* Center/Right Master Clock Pill & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Indicator or Simulating Banner */}
          {isSimulatingDst ? (
            <button
              onClick={onResetToLive}
              className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300 transition-colors"
              title="Click to reset to real-time live clock"
            >
              <Calendar className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline font-mono">DST Test:</span>
              <span className="font-semibold">{simulatedDateLabel || 'Simulated'}</span>
              <span className="text-[10px] text-amber-700 underline dark:text-amber-400 ml-1">Live ↺</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-100/80 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-200">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <span className="font-bold text-rose-600 dark:text-rose-400 text-[11px] tracking-wide">LIVE</span>
              <span className="text-slate-400 dark:text-slate-600">|</span>
              <span className="text-slate-600 dark:text-slate-400 hidden sm:inline">Sri Lanka:</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                {displayTime}
              </span>
            </div>
          )}

          {/* Quick DST Season Verification */}
          <button
            onClick={onOpenDstModal}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors"
            title="Test daylight-saving changes across Jan, Mar, Jun, Sep, Nov"
          >
            <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden lg:inline">DST Checker</span>
          </button>

          {/* Facebook Pages Manager Button */}
          <button
            onClick={onOpenPagesModal}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors"
            title="Manage Facebook Page Assignments"
          >
            <Share2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden md:inline">FB Pages</span>
            <span className="ml-0.5 rounded-full bg-blue-100 px-1.5 py-0.2 text-[10px] font-bold text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
              {pagesCount}
            </span>
          </button>

          {/* 12h / 24h Toggle */}
          <button
            onClick={onToggleTimeFormat}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-mono font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors"
            title={`Switch to ${timeFormat === '12h' ? '24-hour' : '12-hour'} format`}
          >
            {timeFormat}
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettingsModal}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors"
            title="Audience Awake & Timezone Settings"
            aria-label="Settings"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors"
            title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
