import React, { useState } from 'react';
import { Copy, Check, Sun, Moon, Sunrise, Sunset, Clock, Share2, Info } from 'lucide-react';
import { ConvertedTimeInfo, FacebookPage } from '../types';

interface TimezoneCardProps {
  info: ConvertedTimeInfo;
  timeFormat: '12h' | '24h';
  showSeconds: boolean;
  assignedPages: FacebookPage[];
  onManagePagesForTz: (iana: string) => void;
}

export const TimezoneCard: React.FC<TimezoneCardProps> = ({
  info,
  timeFormat,
  showSeconds,
  assignedPages,
  onManagePagesForTz,
}) => {
  const [copied, setCopied] = useState(false);

  const displayTime = timeFormat === '12h' ? info.timeString12 : info.timeString24;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Prompt specification: "UK London — 1:00 PM, 23 September 2026"
    const textToCopy = `${info.label.replace('—', '').replace(/\s+/g, ' ').trim()} — ${displayTime}, ${info.dateString}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Time of day visual icon and styling
  const getTimeOfDayConfig = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'morning':
        return {
          label: 'MORNING',
          icon: <Sunrise className="h-3.5 w-3.5 text-amber-500" />,
          badgeClass: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/40',
        };
      case 'afternoon':
        return {
          label: 'DAYTIME',
          icon: <Sun className="h-3.5 w-3.5 text-emerald-500" />,
          badgeClass: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40',
        };
      case 'evening':
        return {
          label: 'EVENING',
          icon: <Sunset className="h-3.5 w-3.5 text-orange-500" />,
          badgeClass: 'bg-orange-50 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200 dark:border-orange-800/40',
        };
      case 'night':
      default:
        return {
          label: 'NIGHT',
          icon: <Moon className="h-3.5 w-3.5 text-indigo-400" />,
          badgeClass: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40',
        };
    }
  };

  const todConfig = getTimeOfDayConfig(info.timeOfDay);

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      {/* Top Header: Flag, Label, Copy button */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl select-none" role="img" aria-label={info.country}>
              {info.flag}
            </span>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                {info.label}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                <span>{info.iana}</span>
                {info.timeZoneAbbr && (
                  <>
                    <span>·</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {info.timeZoneAbbr}
                    </span>
                  </>
                )}
                <span>·</span>
                <span>{info.utcOffsetString}</span>
              </div>
            </div>
          </div>

          {/* Quick Copy Button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors border ${
              copied
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750'
            }`}
            title="Copy timezone and time"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-500" />
                <span>COPIED</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 opacity-70" />
                <span>COPY</span>
              </>
            )}
          </button>
        </div>

        {/* Digital Clock Display */}
        <div className="my-4">
          <div className="flex items-baseline gap-1 font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">
            <span>{displayTime}</span>
            {showSeconds && (
              <span className="text-xl font-normal text-slate-400 dark:text-slate-500">
                {info.secondsString}
              </span>
            )}
          </div>

          {/* Date, Day, and Relative Day Badge */}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {info.dayOfWeek}, {info.dateString}
            </span>

            {/* Relative day highlight */}
            {info.dayDifference !== 0 ? (
              <span
                className={`rounded px-1.5 py-0.5 text-[11px] font-bold font-mono tracking-wide ${
                  info.dayDifference > 0
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800'
                    : 'bg-purple-100 text-purple-900 border border-purple-300 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800'
                }`}
              >
                {info.dayDiffBadge}
              </span>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                · Same day
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info: Difference from Sri Lanka, Time of Day, Awake Status, Assigned Pages */}
      <div className="border-t border-slate-100 pt-3 dark:border-slate-800/80 space-y-2.5">
        {/* Difference from Sri Lanka */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Difference:</span>
          <span
            className={`font-medium ${
              info.isBehind
                ? 'text-slate-700 dark:text-slate-300'
                : info.isAhead
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {info.diffText}
          </span>
        </div>

        {/* Visual Indicators: Time of Day + Awake/Asleep */}
        <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
          {/* Time of Day */}
          <div
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wider ${todConfig.badgeClass}`}
          >
            {todConfig.icon}
            <span>{todConfig.label}</span>
          </div>

          {/* Awake/Asleep status */}
          <div
            className={`inline-flex items-center gap-1 text-[11px] font-medium ${
              info.isAwake
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-indigo-600 dark:text-indigo-400'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                info.isAwake ? 'bg-emerald-500' : 'bg-indigo-400'
              }`}
            />
            <span>
              {info.isAwake ? 'Facebook audience is likely awake' : 'Facebook audience is likely asleep'}
            </span>
          </div>
        </div>

        {/* Assigned Pages (if any) */}
        {assignedPages.length > 0 && (
          <div className="mt-2 rounded-lg bg-blue-50/70 p-2 text-xs border border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/40">
            <div className="flex items-center justify-between text-[11px] font-semibold text-blue-900 dark:text-blue-300">
              <span className="flex items-center gap-1">
                <Share2 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                <span>Assigned Facebook Pages ({assignedPages.length})</span>
              </span>
              <button
                onClick={() => onManagePagesForTz(info.iana)}
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Manage
              </button>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {assignedPages.map((page) => (
                <span
                  key={page.id}
                  className="rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-medium text-blue-900 shadow-xs dark:bg-slate-800 dark:text-blue-200"
                  title={page.notes || page.name}
                >
                  {page.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
