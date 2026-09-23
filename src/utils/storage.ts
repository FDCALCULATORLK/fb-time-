import { AudienceSettings, FacebookPage, SchedulePreset } from '../types';
import { DEFAULT_AUDIENCE_SETTINGS, DEFAULT_POST_PRESETS } from '../data/timezones';

const PAGES_STORAGE_KEY = 'fb_time_hub_pages_v1';
const SETTINGS_STORAGE_KEY = 'fb_time_hub_audience_settings_v1';
const TIME_FORMAT_KEY = 'fb_time_hub_time_format_v1';
const SCHEDULE_STORAGE_KEY = 'fb_time_hub_daily_schedule_v1';

export const INITIAL_SAMPLE_PAGES: FacebookPage[] = [
  {
    id: 'page_uk_1',
    name: 'UK Viral News & Trends',
    timezoneId: 'uk_london',
    category: 'News & Media',
    notes: 'Main UK audience page. Peak engagement 6 PM - 9 PM London time.',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'page_us_1',
    name: 'American Lifestyle Daily',
    timezoneId: 'us_eastern',
    category: 'Lifestyle',
    notes: 'US East Coast prime target. Schedule posts for 8 AM and 1 PM EST.',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'page_au_1',
    name: 'Australia Travel & Vibes',
    timezoneId: 'au_eastern_sydney',
    category: 'Travel',
    notes: 'Sydney/Melbourne audience. Post during morning commute (7:30 AM AEDT).',
    createdAt: Date.now() - 86400000 * 1,
  },
];

export function getStoredPages(): FacebookPage[] {
  try {
    const raw = localStorage.getItem(PAGES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_PAGES));
      return INITIAL_SAMPLE_PAGES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SAMPLE_PAGES;
  }
}

export function saveStoredPages(pages: FacebookPage[]): void {
  try {
    localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(pages));
  } catch (err) {
    console.error('Failed to save pages to localStorage', err);
  }
}

export function getStoredAudienceSettings(): AudienceSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_AUDIENCE_SETTINGS;
    return { ...DEFAULT_AUDIENCE_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AUDIENCE_SETTINGS;
  }
}

export function saveStoredAudienceSettings(settings: AudienceSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage', err);
  }
}

export function getStoredTimeFormat(): '12h' | '24h' {
  try {
    const raw = localStorage.getItem(TIME_FORMAT_KEY);
    return raw === '24h' ? '24h' : '12h';
  } catch {
    return '12h';
  }
}

export function saveStoredTimeFormat(format: '12h' | '24h'): void {
  try {
    localStorage.setItem(TIME_FORMAT_KEY, format);
  } catch (err) {
    console.error('Failed to save time format', err);
  }
}

export function getStoredSchedulePresets(): SchedulePreset[] {
  try {
    const raw = localStorage.getItem(SCHEDULE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(DEFAULT_POST_PRESETS));
      return DEFAULT_POST_PRESETS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_POST_PRESETS;
  }
}

export function saveStoredSchedulePresets(presets: SchedulePreset[]): void {
  try {
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(presets));
  } catch (err) {
    console.error('Failed to save schedule presets', err);
  }
}
