export type RegionKey = 'all' | 'uk_ireland' | 'usa' | 'australia';

export interface TimezoneConfig {
  id: string;
  region: 'master' | 'uk_ireland' | 'usa' | 'australia';
  label: string;
  country: string;
  flag: string;
  iana: string;
  city: string;
  description?: string;
  hasDst: boolean;
}

export interface ConvertedTimeInfo {
  iana: string;
  label: string;
  country: string;
  flag: string;
  city: string;
  timeString12: string; // e.g. "01:00 PM"
  timeString24: string; // e.g. "13:00"
  secondsString: string; // e.g. ":45"
  dateString: string; // e.g. "23 Sep 2026"
  fullDateString: string; // e.g. "Wednesday, 23 September 2026"
  dayOfWeek: string; // e.g. "Wednesday"
  utcOffsetString: string; // e.g. "UTC +1:00"
  offsetMinutes: number; // e.g. 60
  diffMinutesFromColombo: number; // e.g. -270
  diffText: string; // e.g. "4 hours 30 minutes behind Sri Lanka"
  shortDiffText: string; // e.g. "4h 30m behind"
  isAhead: boolean;
  isBehind: boolean;
  isSameTime: boolean;
  dayDifference: number; // -1, 0, or +1
  dayDiffBadge: string; // "-1 DAY", "SAME DAY", "+1 DAY"
  timeZoneAbbr: string; // e.g. "BST", "GMT", "EDT", "EST", "AEDT"
  isDstActive: boolean;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  isAwake: boolean;
  localHour24: number;
  localMinute: number;
}

export interface FacebookPage {
  id: string;
  name: string;
  timezoneId: string; // matches TimezoneConfig.id
  notes?: string;
  category?: string;
  createdAt: number;
}

export interface SchedulePreset {
  id: string;
  sriLankaTime: string; // "HH:MM" e.g. "07:30"
  label: string;
}

export interface AudienceSettings {
  morningStart: number; // 6
  afternoonStart: number; // 12
  eveningStart: number; // 17
  nightStart: number; // 22
  awakeStart: number; // 7
  awakeEnd: number; // 23
}
