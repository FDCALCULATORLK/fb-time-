import React, { useState, useMemo } from 'react';
import { Send, Clock, Sparkles, Copy, Check, Filter, Moon, Sun } from 'lucide-react';
import { AudienceSettings, ConvertedTimeInfo, TimezoneConfig } from '../types';
import { TARGET_TIMEZONES, DEFAULT_POST_PRESETS } from '../data/timezones';
import { convertSriLankaTimeToInstant, getConvertedTimeInfo } from '../utils/timezone';

interface PostingHelperProps {
  currentInstant: Date;
  audienceSettings: AudienceSettings;
  timeFormat: '12h' | '24h';
}

export const PostingHelper: React.FC<PostingHelperProps> = ({
  currentInstant,
  audienceSettings,
  timeFormat,
}) => {
  const [selectedPresetTime, setSelectedPresetTime] = useState<string>('07:30');
  const [customTimeInput, setCustomTimeInput] = useState<string>('07:30');
  const [copiedAll, setCopiedAll] = useState(false);
  const [activeRegionFilter, setActiveRegionFilter] = useState<'all' | 'uk_ireland' | 'usa' | 'australia'>('all');

  const activeTime = customTimeInput || selectedPresetTime;

  // Convert entered Sri Lanka time to an exact UTC instant using native timezone calculation
  const calculatedConversions = useMemo(() => {
    try {
      const instant = convertSriLankaTimeToInstant(activeTime, currentInstant);
      return TARGET_TIMEZONES.map((tz) => ({
        tz,
        info: getConvertedTimeInfo(instant, tz, audienceSettings),
      }));
    } catch (err) {
      console.error('Error calculating posting conversions:', err);
      return [];
    }
  }, [activeTime, currentInstant, audienceSettings]);

  // Filter conversions if user wants to see specific region
  const filteredConversions = useMemo(() => {
    if (activeRegionFilter === 'all') return calculatedConversions;
    return calculatedConversions.filter((item) => item.tz.region === activeRegionFilter);
  }, [calculatedConversions, activeRegionFilter]);

  const handlePresetClick = (timeStr: string) => {
    setSelectedPresetTime(timeStr);
    setCustomTimeInput(timeStr);
  };

  const handleCopySummary = () => {
    const lines = [
      `📅 Facebook Post Schedule (Master Sri Lanka: ${activeTime})`,
      '-------------------------------------------------------',
      ...calculatedConversions.map(({ tz, info }) => {
        const time = timeFormat === '12h' ? info.timeString12 : info.timeString24;
        const dayShift = info.dayDifference > 0 ? ' (+1 Day)' : info.dayDifference < 0 ? ' (-1 Day)' : '';
        const awake = info.isAwake ? ' [Awake]' : ' [Asleep]';
        return `${tz.label.padEnd(28)}: ${time}${dayShift} ${info.utcOffsetString}${awake}`;
      }),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  return (
    <div id="posting-helper" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
              <Send className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              FACEBOOK POSTING TIME CONVERTER
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Set your intended Sri Lanka post schedule to calculate simultaneous audience times across all target regions.
          </p>
        </div>

        <button
          onClick={handleCopySummary}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors shadow-xs"
        >
          {copiedAll ? (
            <>
              <Check className="h-4 w-4 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">All Times Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 text-slate-500" />
              <span>Copy Full Schedule Summary</span>
            </>
          )}
        </button>
      </div>

      {/* Input & Quick Presets Control Bar */}
      <div className="mt-6 flex flex-col gap-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20 sm:flex-row sm:items-center sm:justify-between">
        {/* Custom time picker */}
        <div className="flex items-center gap-3">
          <label htmlFor="custom-post-time" className="text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
            🇱🇰 Sri Lanka posting time:
          </label>
          <div className="relative">
            <input
              id="custom-post-time"
              type="time"
              value={customTimeInput}
              onChange={(e) => {
                setCustomTimeInput(e.target.value);
                setSelectedPresetTime(e.target.value);
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-sm font-bold text-slate-900 shadow-xs focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mr-1">
            Quick presets:
          </span>
          {DEFAULT_POST_PRESETS.map((preset) => {
            const isActive = activeTime === preset.sriLankaTime;
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetClick(preset.sriLankaTime)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-750'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Region Filter Chips */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveRegionFilter('all')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              activeRegionFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            All Locations ({calculatedConversions.length})
          </button>
          <button
            onClick={() => setActiveRegionFilter('uk_ireland')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              activeRegionFilter === 'uk_ireland'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            🇬🇧/🇮🇪 UK & Ireland
          </button>
          <button
            onClick={() => setActiveRegionFilter('usa')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              activeRegionFilter === 'usa'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            🇺🇸 United States
          </button>
          <button
            onClick={() => setActiveRegionFilter('australia')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              activeRegionFilter === 'australia'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            🇦🇺 Australia
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          When Sri Lanka posts at <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{activeTime}</span>
        </div>
      </div>

      {/* Converted Grid Results */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {filteredConversions.map(({ tz, info }) => {
          const displayLocalTime = timeFormat === '12h' ? info.timeString12 : info.timeString24;

          return (
            <div
              key={tz.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-850/40 dark:hover:bg-slate-850"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white truncate">
                    <span>{tz.flag}</span>
                    <span className="truncate" title={tz.label}>{tz.label}</span>
                  </div>
                  {info.dayDifference !== 0 && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        info.dayDifference > 0
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          : 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                      }`}
                    >
                      {info.dayDiffBadge}
                    </span>
                  )}
                </div>

                <div className="mt-2 font-mono text-2xl font-extrabold text-blue-600 dark:text-blue-400 tabular-nums">
                  {displayLocalTime}
                </div>

                <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  {info.dateString} · {info.utcOffsetString}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2 text-[11px] dark:border-slate-800">
                <span
                  className={`inline-flex items-center gap-1 font-medium ${
                    info.isAwake
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${info.isAwake ? 'bg-emerald-500' : 'bg-indigo-400'}`} />
                  <span>{info.isAwake ? 'Awake' : 'Asleep'}</span>
                </span>

                <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">
                  {info.shortDiffText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
