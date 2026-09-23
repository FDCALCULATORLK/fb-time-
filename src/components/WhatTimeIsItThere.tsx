import React, { useState } from 'react';
import { Search, ArrowRight, ArrowDown, Copy, Check, Clock, Globe } from 'lucide-react';
import { ConvertedTimeInfo, TimezoneConfig } from '../types';
import { TARGET_TIMEZONES } from '../data/timezones';

interface WhatTimeIsItThereProps {
  sriLankaInfo: ConvertedTimeInfo;
  convertedMap: Record<string, ConvertedTimeInfo>;
  timeFormat: '12h' | '24h';
}

export const WhatTimeIsItThere: React.FC<WhatTimeIsItThereProps> = ({
  sriLankaInfo,
  convertedMap,
  timeFormat,
}) => {
  const [selectedIana, setSelectedIana] = useState<string>('Europe/London');
  const [copied, setCopied] = useState(false);

  const selectedInfo = convertedMap[selectedIana] || convertedMap['Europe/London'];

  const slTime = timeFormat === '12h' ? sriLankaInfo.timeString12 : sriLankaInfo.timeString24;
  const targetTime = selectedInfo
    ? timeFormat === '12h'
      ? selectedInfo.timeString12
      : selectedInfo.timeString24
    : '';

  const handleCopy = () => {
    if (!selectedInfo) return;
    const text = `Sri Lanka: ${slTime} (${sriLankaInfo.dateString}) → ${selectedInfo.label}: ${targetTime} (${selectedInfo.dateString}, ${selectedInfo.diffText})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>"What Time Is It There?"</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Direct Comparison
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Instantly compare current Sri Lanka master time with any target Facebook audience location.
          </p>
        </div>

        {/* Location Selector */}
        <div className="w-full sm:w-72">
          <label htmlFor="comparison-tz-select" className="sr-only">
            Select Location
          </label>
          <div className="relative">
            <select
              id="comparison-tz-select"
              value={selectedIana}
              onChange={(e) => setSelectedIana(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <optgroup label="United Kingdom & Ireland">
                <option value="Europe/London">🇬🇧 UK — London</option>
                <option value="Europe/Dublin">🇮🇪 Ireland — Dublin</option>
              </optgroup>
              <optgroup label="United States">
                <option value="America/New_York">🇺🇸 US Eastern (New York)</option>
                <option value="America/Chicago">🇺🇸 US Central (Chicago)</option>
                <option value="America/Denver">🇺🇸 US Mountain (Denver)</option>
                <option value="America/Los_Angeles">🇺🇸 US Pacific (Los Angeles)</option>
                <option value="America/Anchorage">🇺🇸 US Alaska (Anchorage)</option>
                <option value="Pacific/Honolulu">🇺🇸 US Hawaii (Honolulu)</option>
              </optgroup>
              <optgroup label="Australia">
                <option value="Australia/Sydney">🇦🇺 Australia Eastern (Sydney)</option>
                <option value="Australia/Melbourne">🇦🇺 Australia Eastern (Melbourne)</option>
                <option value="Australia/Brisbane">🇦🇺 Australia Eastern (Brisbane)</option>
                <option value="Australia/Adelaide">🇦🇺 Australia Central (Adelaide)</option>
                <option value="Australia/Darwin">🇦🇺 Australia Central (Darwin)</option>
                <option value="Australia/Perth">🇦🇺 Australia Western (Perth)</option>
                <option value="Australia/Lord_Howe">🇦🇺 Australia — Lord Howe</option>
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      {selectedInfo && (
        <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/80 p-5 dark:border-slate-800/80 dark:bg-slate-850/50">
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-7">
            {/* Sri Lanka Reference Column (3 cols) */}
            <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-xs dark:border-blue-900/30 dark:bg-slate-900 md:col-span-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🇱🇰</span>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    MASTER TIME
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    Sri Lanka (Colombo)
                  </div>
                </div>
              </div>

              <div className="mt-3 font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">
                {slTime}
              </div>

              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {sriLankaInfo.fullDateString} · {sriLankaInfo.utcOffsetString}
              </div>
            </div>

            {/* Center Arrow / Delta (1 col) */}
            <div className="flex flex-col items-center justify-center text-center md:col-span-1 py-1">
              <div className="hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                <ArrowRight className="h-5 w-5" />
              </div>
              <div className="flex md:hidden h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                <ArrowDown className="h-4 w-4" />
              </div>
              <div className="mt-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">
                {selectedInfo.shortDiffText}
              </div>
            </div>

            {/* Target Location Column (3 cols) */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 md:col-span-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedInfo.flag}</span>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      TARGET AUDIENCE
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {selectedInfo.label}
                    </div>
                  </div>
                </div>

                {/* Day Badge */}
                <span
                  className={`rounded px-2 py-0.5 text-xs font-bold font-mono ${
                    selectedInfo.dayDifference !== 0
                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {selectedInfo.dayDifference === 0
                    ? 'Same day'
                    : selectedInfo.dayDifference > 0
                    ? `+${selectedInfo.dayDifference} DAY (Next day)`
                    : `${selectedInfo.dayDifference} DAY (Previous day)`}
                </span>
              </div>

              <div className="mt-3 font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400 tabular-nums">
                {targetTime}
              </div>

              <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>
                  {selectedInfo.dayOfWeek}, {selectedInfo.dateString} · {selectedInfo.utcOffsetString}
                </span>
                <span
                  className={`font-semibold ${
                    selectedInfo.isAwake
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  {selectedInfo.isAwake ? '● Audience Awake' : '○ Audience Asleep'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/60 pt-3 dark:border-slate-800">
            <div className="text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-white">
                {selectedInfo.diffText}
              </span>
              {' · '}
              <span>Timezone: {selectedInfo.iana} {selectedInfo.timeZoneAbbr ? `(${selectedInfo.timeZoneAbbr})` : ''}</span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied Comparison</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Comparison Text</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
