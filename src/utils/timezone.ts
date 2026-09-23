import { AudienceSettings, ConvertedTimeInfo, TimezoneConfig } from '../types';
import { MASTER_TIMEZONE } from '../data/timezones';

/**
 * Accurately calculate the UTC offset in minutes for any IANA timezone at a specific instant
 * without hardcoding or relying on external APIs.
 */
export function getTimezoneOffsetMinutes(date: Date, timeZone: string): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hourCycle: 'h23',
    });
    const parts = formatter.formatToParts(date);
    const get = (type: string) => {
      const part = parts.find((p) => p.type === type);
      return part ? parseInt(part.value, 10) : 0;
    };
    const year = get('year');
    const month = get('month') - 1;
    const day = get('day');
    const hour = get('hour');
    const minute = get('minute');
    const second = get('second');

    const targetAsUtc = Date.UTC(year, month, day, hour, minute, second);
    const actualUtc = date.getTime();
    return Math.round((targetAsUtc - actualUtc) / 60000);
  } catch (err) {
    console.error(`Error calculating offset for ${timeZone}:`, err);
    return 0;
  }
}

/**
 * Format minutes offset to standard notation, e.g. "UTC +5:30", "UTC -4:00"
 */
export function formatUtcOffset(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  const hours = Math.floor(abs / 60);
  const mins = abs % 60;
  if (mins === 0) {
    return `UTC ${sign}${hours}:00`;
  }
  return `UTC ${sign}${hours}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Retrieve the localized timezone abbreviation (e.g. BST, GMT, EDT, EST, AEDT, AEST)
 */
export function getTimezoneAbbreviation(date: Date, timeZone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short',
    });
    const parts = formatter.formatToParts(date);
    return parts.find((p) => p.type === 'timeZoneName')?.value || '';
  } catch {
    return '';
  }
}

/**
 * Determine if Daylight Saving Time (DST) is active for this timezone at the given date
 */
export function isTimezoneDstActive(date: Date, timeZone: string): boolean {
  try {
    const year = date.getUTCFullYear();
    // Compare January 1 and July 1 offsets
    const janDate = new Date(Date.UTC(year, 0, 15, 12, 0, 0));
    const julDate = new Date(Date.UTC(year, 6, 15, 12, 0, 0));

    const currentOffset = getTimezoneOffsetMinutes(date, timeZone);
    const janOffset = getTimezoneOffsetMinutes(janDate, timeZone);
    const julOffset = getTimezoneOffsetMinutes(julDate, timeZone);

    // If January and July offsets are identical, this zone doesn't observe DST
    if (janOffset === julOffset) {
      return false;
    }

    // Standard time is typically the one with smaller offset in Northern hemisphere
    // or smaller offset in Southern hemisphere
    const maxOffset = Math.max(janOffset, julOffset);
    return currentOffset === maxOffset;
  } catch {
    return false;
  }
}

/**
 * Get date parts (year, month, day, hour, minute, second) in target timezone
 */
export function getTimezoneParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
    weekday: 'long',
  });
  const parts = formatter.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || '';
  const getNum = (type: string) => parseInt(get(type) || '0', 10);

  return {
    year: getNum('year'),
    month: getNum('month'), // 1-indexed
    day: getNum('day'),
    hour24: getNum('hour'),
    minute: getNum('minute'),
    second: getNum('second'),
    weekday: get('weekday'),
  };
}

/**
 * Convert instant to full ConvertedTimeInfo relative to Sri Lanka master clock
 */
export function getConvertedTimeInfo(
  instant: Date,
  tzConfig: TimezoneConfig,
  audienceSettings: AudienceSettings,
): ConvertedTimeInfo {
  // 1. Get Sri Lanka date parts for relative day comparison
  const slParts = getTimezoneParts(instant, MASTER_TIMEZONE.iana);
  const slDateUtc = Date.UTC(slParts.year, slParts.month - 1, slParts.day);
  const slOffsetMinutes = getTimezoneOffsetMinutes(instant, MASTER_TIMEZONE.iana);

  // 2. Get target date parts
  const targetParts = getTimezoneParts(instant, tzConfig.iana);
  const targetDateUtc = Date.UTC(targetParts.year, targetParts.month - 1, targetParts.day);
  const targetOffsetMinutes = getTimezoneOffsetMinutes(instant, tzConfig.iana);

  // 3. Relative day calculation (-1, 0, +1)
  const dayDifference = Math.round((targetDateUtc - slDateUtc) / 86400000);
  let dayDiffBadge = 'Same day';
  if (dayDifference > 0) {
    dayDiffBadge = `+${dayDifference} DAY`;
  } else if (dayDifference < 0) {
    dayDiffBadge = `${dayDifference} DAY`; // e.g. "-1 DAY"
  }

  // 4. Time difference from Sri Lanka (hours & minutes)
  const diffMinutesFromColombo = targetOffsetMinutes - slOffsetMinutes;
  const isAhead = diffMinutesFromColombo > 0;
  const isBehind = diffMinutesFromColombo < 0;
  const isSameTime = diffMinutesFromColombo === 0;

  let diffText = 'Same time as Sri Lanka';
  let shortDiffText = 'Same time';

  if (isBehind) {
    const absDiff = Math.abs(diffMinutesFromColombo);
    const h = Math.floor(absDiff / 60);
    const m = absDiff % 60;
    if (m === 0) {
      diffText = `${h} ${h === 1 ? 'hour' : 'hours'} behind Sri Lanka`;
      shortDiffText = `${h}h behind`;
    } else {
      diffText = `${h} ${h === 1 ? 'hour' : 'hours'} ${m} minutes behind Sri Lanka`;
      shortDiffText = `${h}h ${m}m behind`;
    }
  } else if (isAhead) {
    const absDiff = diffMinutesFromColombo;
    const h = Math.floor(absDiff / 60);
    const m = absDiff % 60;
    if (m === 0) {
      diffText = `${h} ${h === 1 ? 'hour' : 'hours'} ahead of Sri Lanka`;
      shortDiffText = `${h}h ahead`;
    } else {
      diffText = `${h} ${h === 1 ? 'hour' : 'hours'} ${m} minutes ahead of Sri Lanka`;
      shortDiffText = `${h}h ${m}m ahead`;
    }
  }

  // 5. 12-hour and 24-hour formatted time strings
  const hour12 = targetParts.hour24 % 12 === 0 ? 12 : targetParts.hour24 % 12;
  const ampm = targetParts.hour24 >= 12 ? 'PM' : 'AM';
  const timeString12 = `${hour12.toString().padStart(2, '0')}:${targetParts.minute.toString().padStart(2, '0')} ${ampm}`;
  const timeString24 = `${targetParts.hour24.toString().padStart(2, '0')}:${targetParts.minute.toString().padStart(2, '0')}`;
  const secondsString = `:${targetParts.second.toString().padStart(2, '0')}`;

  // Month names
  const dateObj = new Date(Date.UTC(targetParts.year, targetParts.month - 1, targetParts.day));
  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNamesFull = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dateString = `${targetParts.day} ${monthNamesShort[targetParts.month - 1]} ${targetParts.year}`;
  const fullDateString = `${targetParts.weekday}, ${targetParts.day} ${monthNamesFull[targetParts.month - 1]} ${targetParts.year}`;

  // 6. Time of day & Audience awake/asleep status
  const h24 = targetParts.hour24;
  let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' = 'night';
  if (h24 >= audienceSettings.morningStart && h24 < audienceSettings.afternoonStart) {
    timeOfDay = 'morning';
  } else if (h24 >= audienceSettings.afternoonStart && h24 < audienceSettings.eveningStart) {
    timeOfDay = 'afternoon';
  } else if (h24 >= audienceSettings.eveningStart && h24 < audienceSettings.nightStart) {
    timeOfDay = 'evening';
  } else {
    timeOfDay = 'night';
  }

  // Awake check
  const isAwake = h24 >= audienceSettings.awakeStart && h24 < audienceSettings.awakeEnd;

  // 7. Timezone abbreviation and DST status
  const timeZoneAbbr = getTimezoneAbbreviation(instant, tzConfig.iana);
  const isDstActive = isTimezoneDstActive(instant, tzConfig.iana);

  return {
    iana: tzConfig.iana,
    label: tzConfig.label,
    country: tzConfig.country,
    flag: tzConfig.flag,
    city: tzConfig.city,
    timeString12,
    timeString24,
    secondsString,
    dateString,
    fullDateString,
    dayOfWeek: targetParts.weekday,
    utcOffsetString: formatUtcOffset(targetOffsetMinutes),
    offsetMinutes: targetOffsetMinutes,
    diffMinutesFromColombo,
    diffText,
    shortDiffText,
    isAhead,
    isBehind,
    isSameTime,
    dayDifference,
    dayDiffBadge,
    timeZoneAbbr,
    isDstActive,
    timeOfDay,
    isAwake,
    localHour24: targetParts.hour24,
    localMinute: targetParts.minute,
  };
}

/**
 * Given a Sri Lanka wall-clock time string (e.g. "07:30") on a specific reference date,
 * compute the exact UTC instant and return converted info for all target timezones.
 */
export function convertSriLankaTimeToInstant(sriLankaTime: string, referenceInstant: Date): Date {
  const [hStr, mStr] = sriLankaTime.split(':');
  const targetHour = parseInt(hStr || '0', 10);
  const targetMinute = parseInt(mStr || '0', 10);

  // Get current Sri Lanka year, month, day
  const slParts = getTimezoneParts(referenceInstant, MASTER_TIMEZONE.iana);

  // Sri Lanka offset at reference date
  const slOffset = getTimezoneOffsetMinutes(referenceInstant, MASTER_TIMEZONE.iana);

  // Construct UTC timestamp when Sri Lanka reads (year, month, day, targetHour, targetMinute, 0)
  const utcMillis = Date.UTC(slParts.year, slParts.month - 1, slParts.day, targetHour, targetMinute, 0) - slOffset * 60000;
  return new Date(utcMillis);
}
