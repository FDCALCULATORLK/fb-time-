import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Filter,
  Share2,
  Calendar,
  Clock,
  Sparkles,
  Globe2,
  AlertCircle,
  HelpCircle,
  CheckCircle,
} from 'lucide-react';
import { Header } from './components/Header';
import { MasterClockCard } from './components/MasterClockCard';
import { TimezoneCard } from './components/TimezoneCard';
import { WhatTimeIsItThere } from './components/WhatTimeIsItThere';
import { PostingHelper } from './components/PostingHelper';
import { DailyPostSchedule } from './components/DailyPostSchedule';
import { FacebookPagesManager } from './components/FacebookPagesManager';
import { DstVerificationModal } from './components/DstVerificationModal';
import { SettingsModal } from './components/SettingsModal';

import { AudienceSettings, ConvertedTimeInfo, FacebookPage, RegionKey, SchedulePreset, TimezoneConfig } from './types';
import { MASTER_TIMEZONE, TARGET_TIMEZONES } from './data/timezones';
import { getConvertedTimeInfo } from './utils/timezone';
import {
  getStoredAudienceSettings,
  getStoredPages,
  getStoredSchedulePresets,
  getStoredTimeFormat,
  saveStoredTimeFormat,
} from './utils/storage';

export default function App() {
  // 1. Clock state (1 single UTC instant for all calculations)
  const [currentInstant, setCurrentInstant] = useState<Date>(new Date());
  const [isSimulatingDst, setIsSimulatingDst] = useState<boolean>(false);
  const [simulatedDateLabel, setSimulatedDateLabel] = useState<string | undefined>(undefined);
  const [simulatedDate, setSimulatedDate] = useState<Date | null>(null);

  // 2. Preferences
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>(getStoredTimeFormat);
  const [showSeconds, setShowSeconds] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // 3. User data
  const [pages, setPages] = useState<FacebookPage[]>(getStoredPages);
  const [audienceSettings, setAudienceSettings] = useState<AudienceSettings>(getStoredAudienceSettings);
  const [schedulePresets, setSchedulePresets] = useState<SchedulePreset[]>(getStoredSchedulePresets);

  // 4. Modals
  const [isPagesModalOpen, setIsPagesModalOpen] = useState(false);
  const [pagesModalSelectedIana, setPagesModalSelectedIana] = useState<string | undefined>();
  const [isDstModalOpen, setIsDstModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // 5. Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<RegionKey>('all');
  const [filterAssignedOnly, setFilterAssignedOnly] = useState<boolean>(false);

  // Keep dark mode class in sync on <html> element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Real-time ticking interval every second (when not simulating a frozen DST date)
  useEffect(() => {
    if (isSimulatingDst && simulatedDate) {
      setCurrentInstant(simulatedDate);
      return;
    }

    const interval = setInterval(() => {
      setCurrentInstant(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulatingDst, simulatedDate]);

  // Reference instant to use for calculations
  const activeInstant = isSimulatingDst && simulatedDate ? simulatedDate : currentInstant;

  // Master Sri Lanka converted info
  const sriLankaInfo: ConvertedTimeInfo = useMemo(() => {
    return getConvertedTimeInfo(activeInstant, MASTER_TIMEZONE, audienceSettings);
  }, [activeInstant, audienceSettings]);

  // Converted info map for all target timezones from the SAME UTC instant
  const convertedMap = useMemo(() => {
    const map: Record<string, ConvertedTimeInfo> = {};
    for (const tz of TARGET_TIMEZONES) {
      map[tz.iana] = getConvertedTimeInfo(activeInstant, tz, audienceSettings);
    }
    return map;
  }, [activeInstant, audienceSettings]);

  // Map of assigned Facebook pages by timezone ID
  const pagesByTzId = useMemo(() => {
    const map: Record<string, FacebookPage[]> = {};
    for (const page of pages) {
      if (!map[page.timezoneId]) {
        map[page.timezoneId] = [];
      }
      map[page.timezoneId].push(page);
    }
    return map;
  }, [pages]);

  // Filtered target timezones based on search, region, and assigned filter
  const filteredTimezones = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return TARGET_TIMEZONES.filter((tz) => {
      // Region filter
      if (regionFilter !== 'all' && tz.region !== regionFilter) {
        return false;
      }

      // Assigned only filter
      if (filterAssignedOnly) {
        const assigned = pagesByTzId[tz.id] || [];
        if (assigned.length === 0) return false;
      }

      // Search query (city, label, iana, country)
      if (q) {
        const match =
          tz.label.toLowerCase().includes(q) ||
          tz.city.toLowerCase().includes(q) ||
          tz.country.toLowerCase().includes(q) ||
          tz.iana.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [searchQuery, regionFilter, filterAssignedOnly, pagesByTzId]);

  // Group filtered timezones by region for structured section display
  const ukIrelandZones = useMemo(
    () => filteredTimezones.filter((t) => t.region === 'uk_ireland'),
    [filteredTimezones]
  );
  const usaZones = useMemo(
    () => filteredTimezones.filter((t) => t.region === 'usa'),
    [filteredTimezones]
  );
  const australiaZones = useMemo(
    () => filteredTimezones.filter((t) => t.region === 'australia'),
    [filteredTimezones]
  );

  // Quick navigation handlers
  const scrollToPostingHelper = () => {
    document.getElementById('posting-helper')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToSchedule = () => {
    document.getElementById('daily-schedule')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenPagesForTz = (iana: string) => {
    setPagesModalSelectedIana(iana);
    setIsPagesModalOpen(true);
  };

  const handleSelectSimulationDate = (date: Date, label: string) => {
    setIsSimulatingDst(true);
    setSimulatedDate(date);
    setSimulatedDateLabel(label);
    setCurrentInstant(date);
  };

  const handleResetToLive = () => {
    setIsSimulatingDst(false);
    setSimulatedDate(null);
    setSimulatedDateLabel(undefined);
    setCurrentInstant(new Date());
  };

  const handleToggleTimeFormat = () => {
    const next = timeFormat === '12h' ? '24h' : '12h';
    setTimeFormat(next);
    saveStoredTimeFormat(next);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header
        sriLankaInfo={sriLankaInfo}
        isSimulatingDst={isSimulatingDst}
        simulatedDateLabel={simulatedDateLabel}
        onResetToLive={handleResetToLive}
        onOpenDstModal={() => setIsDstModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenPagesModal={() => {
          setPagesModalSelectedIana(undefined);
          setIsPagesModalOpen(true);
        }}
        pagesCount={pages.length}
        timeFormat={timeFormat}
        onToggleTimeFormat={handleToggleTimeFormat}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Container */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 space-y-8">
        {/* Simulation Banner Notice (if active) */}
        {isSimulatingDst && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span>
                <strong>Daylight-Saving Test Mode Active:</strong> Simulating{' '}
                <span className="font-mono font-bold">{simulatedDateLabel}</span>. All
                conversions, offsets, and DST flags represent this seasonal moment.
              </span>
            </div>
            <button
              onClick={handleResetToLive}
              className="rounded-lg bg-amber-600 px-3 py-1 font-semibold text-white hover:bg-amber-700 transition-colors"
            >
              Return to Live Real-Time Clock
            </button>
          </div>
        )}

        {/* 1. MASTER CLOCK CARD (Sri Lanka) */}
        <section aria-label="Sri Lanka Master Clock">
          <MasterClockCard
            sriLankaInfo={sriLankaInfo}
            timeFormat={timeFormat}
            showSeconds={showSeconds}
            onToggleSeconds={() => setShowSeconds(!showSeconds)}
            onScrollToPostingHelper={scrollToPostingHelper}
            onScrollToSchedule={scrollToSchedule}
          />
        </section>

        {/* 2. "WHAT TIME IS IT THERE?" DIRECT COMPARISON */}
        <section aria-label="What Time Is It There Comparison">
          <WhatTimeIsItThere
            sriLankaInfo={sriLankaInfo}
            convertedMap={convertedMap}
            timeFormat={timeFormat}
          />
        </section>

        {/* 3. FACEBOOK POSTING TIME CONVERTER */}
        <section aria-label="Facebook Posting Time Converter">
          <PostingHelper
            currentInstant={activeInstant}
            audienceSettings={audienceSettings}
            timeFormat={timeFormat}
          />
        </section>

        {/* 4. SEARCH & FILTER CONTROLS BAR */}
        <section aria-label="Country Clocks and Filtering" className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                TARGET AUDIENCE CLOCKS
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Simultaneous local times across UK, Ireland, US, and Australian Facebook target markets.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search London, New York, Sydney..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Region Tabs & Filter Switches */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <button
                onClick={() => setRegionFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  regionFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Show All ({TARGET_TIMEZONES.length})
              </button>
              <button
                onClick={() => setRegionFilter('uk_ireland')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  regionFilter === 'uk_ireland'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                🇬🇧/🇮🇪 UK & Ireland
              </button>
              <button
                onClick={() => setRegionFilter('usa')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  regionFilter === 'usa'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                🇺🇸 USA (6 Zones)
              </button>
              <button
                onClick={() => setRegionFilter('australia')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  regionFilter === 'australia'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                🇦🇺 Australia (7 Zones)
              </button>
            </div>

            {/* Assigned Pages Filter Switch */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={filterAssignedOnly}
                onChange={(e) => setFilterAssignedOnly(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700"
              />
              <span className="flex items-center gap-1">
                <Share2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Show Only Zones With Assigned Pages</span>
              </span>
            </label>
          </div>

          {/* If No search match */}
          {filteredTimezones.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              <p className="text-sm font-semibold">No timezones matched your filter criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setRegionFilter('all');
                  setFilterAssignedOnly(false);
                }}
                className="mt-3 text-xs font-semibold text-blue-600 underline dark:text-blue-400"
              >
                Reset Search & Filters
              </button>
            </div>
          )}

          {/* 4A. UK & IRELAND SECTION */}
          {ukIrelandZones.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🇬🇧 🇮🇪</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  UK & IRELAND
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  (GMT in winter / BST & IST in summer)
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {ukIrelandZones.map((tz) => {
                  const info = convertedMap[tz.iana];
                  if (!info) return null;
                  return (
                    <TimezoneCard
                      key={tz.id}
                      info={info}
                      timeFormat={timeFormat}
                      showSeconds={showSeconds}
                      assignedPages={pagesByTzId[tz.id] || []}
                      onManagePagesForTz={handleOpenPagesForTz}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* 4B. UNITED STATES SECTION */}
          {usaZones.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🇺🇸</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  UNITED STATES
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  (Eastern, Central, Mountain, Pacific, Alaska, Hawaii)
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {usaZones.map((tz) => {
                  const info = convertedMap[tz.iana];
                  if (!info) return null;
                  return (
                    <TimezoneCard
                      key={tz.id}
                      info={info}
                      timeFormat={timeFormat}
                      showSeconds={showSeconds}
                      assignedPages={pagesByTzId[tz.id] || []}
                      onManagePagesForTz={handleOpenPagesForTz}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* 4C. AUSTRALIA SECTION */}
          {australiaZones.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🇦🇺</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  AUSTRALIA
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  (Perth, Darwin, Adelaide, Brisbane, Sydney, Melbourne, Lord Howe)
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {australiaZones.map((tz) => {
                  const info = convertedMap[tz.iana];
                  if (!info) return null;
                  return (
                    <TimezoneCard
                      key={tz.id}
                      info={info}
                      timeFormat={timeFormat}
                      showSeconds={showSeconds}
                      assignedPages={pagesByTzId[tz.id] || []}
                      onManagePagesForTz={handleOpenPagesForTz}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* 5. MY DAILY POST TIMES SCHEDULE TABLE */}
        <section aria-label="Daily Post Times Schedule">
          <DailyPostSchedule
            currentInstant={activeInstant}
            audienceSettings={audienceSettings}
            timeFormat={timeFormat}
            schedulePresets={schedulePresets}
            onUpdatePresets={setSchedulePresets}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">FB TIME HUB</span>
            <span>—</span>
            <span>Sri Lanka Master Clock (Asia/Colombo) to Global Facebook Page Audiences</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDstModalOpen(true)}
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Verify DST Transitions
            </button>
            <span>·</span>
            <span>Native Intl IANA Timezone Engine</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <FacebookPagesManager
        isOpen={isPagesModalOpen}
        onClose={() => setIsPagesModalOpen(false)}
        pages={pages}
        onUpdatePages={setPages}
        convertedMap={convertedMap}
        timeFormat={timeFormat}
        initialSelectedIana={pagesModalSelectedIana}
      />

      <DstVerificationModal
        isOpen={isDstModalOpen}
        onClose={() => setIsDstModalOpen(false)}
        onSelectSimulationDate={handleSelectSimulationDate}
        onResetToLive={handleResetToLive}
        isSimulating={isSimulatingDst}
        activeSimulationLabel={simulatedDateLabel}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={audienceSettings}
        onUpdateSettings={setAudienceSettings}
      />
    </div>
  );
}
