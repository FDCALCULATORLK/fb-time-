import React, { useState, useMemo } from 'react';
import { Calendar, Plus, Trash2, Copy, Check, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { AudienceSettings, SchedulePreset } from '../types';
import { convertSriLankaTimeToInstant, getConvertedTimeInfo, getTimezoneParts } from '../utils/timezone';
import { MASTER_TIMEZONE, TARGET_TIMEZONES } from '../data/timezones';
import { saveStoredSchedulePresets } from '../utils/storage';

interface DailyPostScheduleProps {
  currentInstant: Date;
  audienceSettings: AudienceSettings;
  timeFormat: '12h' | '24h';
  schedulePresets: SchedulePreset[];
  onUpdatePresets: (presets: SchedulePreset[]) => void;
}

export const DailyPostSchedule: React.FC<DailyPostScheduleProps> = ({
  currentInstant,
  audienceSettings,
  timeFormat,
  schedulePresets,
  onUpdatePresets,
}) => {
  const [newTimeInput, setNewTimeInput] = useState<string>('10:00');
  const [newLabelInput, setNewLabelInput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [australiaCityId, setAustraliaCityId] = useState<string>('au_eastern_sydney');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Key columns defined by prompt:
  // Sri Lanka | UK | Ireland | US Eastern | US Central | US Mountain | US Pacific | US Alaska | US Hawaii | Australia
  const primaryTimezoneIds = useMemo(() => [
    'uk_london',
    'ie_dublin',
    'us_eastern',
    'us_central',
    'us_mountain',
    'us_pacific',
    'us_alaska',
    'us_hawaii',
    australiaCityId,
  ], [australiaCityId]);

  const targetConfigs = useMemo(() => {
    return primaryTimezoneIds.map(id => TARGET_TIMEZONES.find(t => t.id === id)!);
  }, [primaryTimezoneIds]);

  // Compute table rows for each preset
  const tableRows = useMemo(() => {
    return schedulePresets.map((preset) => {
      const instant = convertSriLankaTimeToInstant(preset.sriLankaTime, currentInstant);
      const slInfo = getConvertedTimeInfo(instant, MASTER_TIMEZONE, audienceSettings);

      const columnValues = targetConfigs.map((tz) => {
        const info = getConvertedTimeInfo(instant, tz, audienceSettings);
        return {
          tzId: tz.id,
          label: tz.label,
          flag: tz.flag,
          time12: info.timeString12,
          time24: info.timeString24,
          dayDiff: info.dayDifference,
          dayBadge: info.dayDiffBadge,
          isAwake: info.isAwake,
        };
      });

      return {
        preset,
        slTime12: slInfo.timeString12,
        slTime24: slInfo.timeString24,
        columns: columnValues,
      };
    });
  }, [schedulePresets, currentInstant, audienceSettings, targetConfigs]);

  const handleAddPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimeInput) return;
    const [h, m] = newTimeInput.split(':');
    const hNum = parseInt(h, 10);
    const hour12 = hNum % 12 === 0 ? 12 : hNum % 12;
    const ampm = hNum >= 12 ? 'PM' : 'AM';
    const autoLabel = newLabelInput.trim() || `${hour12}:${m} ${ampm}`;

    const newPreset: SchedulePreset = {
      id: `custom_${Date.now()}`,
      sriLankaTime: newTimeInput,
      label: autoLabel,
    };

    const updated = [...schedulePresets, newPreset].sort((a, b) => a.sriLankaTime.localeCompare(b.sriLankaTime));
    onUpdatePresets(updated);
    saveStoredSchedulePresets(updated);
    setNewLabelInput('');
  };

  const handleDeletePreset = (id: string) => {
    const updated = schedulePresets.filter((p) => p.id !== id);
    onUpdatePresets(updated);
    saveStoredSchedulePresets(updated);
  };

  const handleCopyTable = () => {
    const headers = [
      'Sri Lanka',
      'UK',
      'Ireland',
      'US Eastern',
      'US Central',
      'US Mountain',
      'US Pacific',
      'US Alaska',
      'US Hawaii',
      `Australia (${targetConfigs[targetConfigs.length - 1].city})`,
    ];

    const lines = [
      headers.join('\t'),
      ...tableRows.map((row) => {
        const slTime = timeFormat === '12h' ? row.slTime12 : row.slTime24;
        const targetTimes = row.columns.map((col) => {
          const t = timeFormat === '12h' ? col.time12 : col.time24;
          const shift = col.dayDiff > 0 ? ' (+1d)' : col.dayDiff < 0 ? ' (-1d)' : '';
          return `${t}${shift}`;
        });
        return [slTime, ...targetTimes].join('\t');
      }),
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="daily-schedule" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300">
              <Calendar className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              MY DAILY POST TIMES
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Pre-computed posting timetable from Sri Lanka master reference to your key Facebook markets.
          </p>
        </div>

        {/* Controls: Australia city picker & Copy Table */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <span className="text-[11px] font-medium">AU Column:</span>
            <select
              value={australiaCityId}
              onChange={(e) => setAustraliaCityId(e.target.value)}
              className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="au_eastern_sydney">Sydney (AEDT/AEST)</option>
              <option value="au_eastern_melbourne">Melbourne</option>
              <option value="au_eastern_brisbane">Brisbane (No DST)</option>
              <option value="au_central_adelaide">Adelaide</option>
              <option value="au_central_darwin">Darwin</option>
              <option value="au_western">Perth (AWST)</option>
              <option value="au_lord_howe">Lord Howe</option>
            </select>
          </div>

          <button
            onClick={handleCopyTable}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors shadow-xs"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Table</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Responsive Horizontal Scroll Table */}
      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-slate-100/80 font-bold text-slate-700 dark:bg-slate-800/80 dark:text-slate-200 border-b border-slate-200 dark:border-slate-750">
            <tr>
              <th className="sticky left-0 z-10 bg-slate-100 px-3.5 py-3 dark:bg-slate-800 font-extrabold text-blue-900 dark:text-blue-300">
                🇱🇰 Sri Lanka
              </th>
              <th className="px-3 py-3">🇬🇧 UK</th>
              <th className="px-3 py-3">🇮🇪 Ireland</th>
              <th className="px-3 py-3">🇺🇸 US Eastern</th>
              <th className="px-3 py-3">🇺🇸 US Central</th>
              <th className="px-3 py-3">🇺🇸 US Mountain</th>
              <th className="px-3 py-3">🇺🇸 US Pacific</th>
              <th className="px-3 py-3">🇺🇸 US Alaska</th>
              <th className="px-3 py-3">🇺🇸 US Hawaii</th>
              <th className="px-3 py-3">
                🇦🇺 Australia ({targetConfigs[targetConfigs.length - 1].city})
              </th>
              <th className="px-2 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono dark:divide-slate-800">
            {tableRows.map(({ preset, slTime12, slTime24, columns }) => {
              const displaySlTime = timeFormat === '12h' ? slTime12 : slTime24;

              return (
                <tr
                  key={preset.id}
                  className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors"
                >
                  {/* Master Sri Lanka Column (pinned on mobile scroll) */}
                  <td className="sticky left-0 z-10 bg-white px-3.5 py-3.5 font-bold text-blue-700 dark:bg-slate-900 dark:text-blue-300 shadow-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-extrabold tabular-nums">{displaySlTime}</span>
                      {preset.label && (
                        <span className="text-[10px] font-sans font-medium text-slate-400 dark:text-slate-500">
                          ({preset.label})
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Target Time Columns */}
                  {columns.map((col, idx) => {
                    const displayTime = timeFormat === '12h' ? col.time12 : col.time24;

                    return (
                      <td key={col.tzId + idx} className="px-3 py-3.5 text-slate-800 dark:text-slate-200">
                        <div className="flex flex-col">
                          <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                            {displayTime}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] mt-0.5">
                            {col.dayDiff !== 0 ? (
                              <span
                                className={`font-bold px-1 rounded text-[9px] ${
                                  col.dayDiff > 0
                                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300'
                                }`}
                              >
                                {col.dayBadge}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-sans text-[9px]">Same day</span>
                            )}
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                col.isAwake ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                              }`}
                              title={col.isAwake ? 'Audience is likely awake' : 'Audience is likely asleep'}
                            />
                          </div>
                        </div>
                      </td>
                    );
                  })}

                  {/* Delete row */}
                  <td className="px-2 py-3 text-right">
                    <button
                      onClick={() => handleDeletePreset(preset.id)}
                      className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete slot"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Custom Posting Time Form */}
      <form onSubmit={handleAddPreset} className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800">
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          + Add Sri Lanka schedule time:
        </span>
        <input
          type="time"
          value={newTimeInput}
          onChange={(e) => setNewTimeInput(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-mono font-bold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          required
        />
        <input
          type="text"
          placeholder="Optional label (e.g. Morning Promo)"
          value={newLabelInput}
          onChange={(e) => setNewLabelInput(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Slot</span>
        </button>
      </form>
    </div>
  );
};
