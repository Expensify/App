import {format as dateFnsFormat} from 'date-fns';

/**
 * Get ordinal suffix for a day (st, nd, rd, th)
 */
function getOrdinalSuffix(day: number): string {
    if (day >= 11 && day <= 13) {
        return 'th';
    }
    switch (day % 10) {
        case 1:
            return 'st';
        case 2:
            return 'nd';
        case 3:
            return 'rd';
        default:
            return 'th';
    }
}

/**
 * Calculate ISO week number for a given date
 * Uses the "first Thursday" rule: Week 1 is the week containing the year's first Thursday
 */
function calculateISOWeekNumber(date: Date): number {
    // Create a copy to avoid modifying the original date
    const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7 (getUTCDay returns 0 for Sunday)
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const dayNum = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - dayNum);

    // Get first day of year for the Thursday's year (in UTC)
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));

    // Calculate full weeks to nearest Thursday
    const weekNum = Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

    return weekNum;
}

/**
 * Calculate day of year (0-indexed)
 */
function calculateDayOfYear(date: Date): number {
    const year = date.getFullYear();
    const yearStart = new Date(year, 0, 1);
    return Math.floor((date.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Get localized month and day names using date-fns
 */
function getLocalizedNames(date: Date) {
    return {
        fullMonthName: dateFnsFormat(date, 'MMMM'),
        shortMonthName: dateFnsFormat(date, 'MMM'),
        fullDayName: dateFnsFormat(date, 'EEEE'),
        shortDayName: dateFnsFormat(date, 'EEE'),
    };
}

/**
 * Get time components in UTC timezone (to match Classic/OldDot behavior)
 */
function getUTCTimeComponents(date: Date) {
    // Use UTC methods to match Classic behavior
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();

    let hours12 = hours;
    if (hours === 0) {
        hours12 = 12;
    } else if (hours > 12) {
        hours12 = hours - 12;
    }

    const meridiem = hours >= 12 ? 'pm' : 'am';
    const meridiemUpperCase = hours >= 12 ? 'PM' : 'AM';

    return {
        hours,
        minutes,
        seconds,
        hours12,
        meridiem,
        meridiemUpperCase,
    };
}

/**
 * Format date as RFC 2822/RFC 5322 format
 * Example: "Thu, 08 Jan 2025 15:30:45 +0000"
 */
function formatRFC2822(date: Date): string {
    const {shortDayName, shortMonthName} = getLocalizedNames(date);
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();

    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');

    // Get timezone offset in format +0000 or -0500
    const timezoneOffset = -date.getTimezoneOffset();
    const offsetSign = timezoneOffset >= 0 ? '+' : '-';
    const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60)
        .toString()
        .padStart(2, '0');
    const offsetMinutes = (Math.abs(timezoneOffset) % 60).toString().padStart(2, '0');
    const timezoneString = `${offsetSign}${offsetHours}${offsetMinutes}`;

    return `${shortDayName}, ${day} ${shortMonthName} ${year} ${hours}:${minutes}:${seconds} ${timezoneString}`;
}

/**
 * Create token definitions for date formatting
 */
function createDateTokens(date: Date): Array<{token: string; value: string}> {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek; // 1 = Monday, 7 = Sunday
    const dayOfYear = calculateDayOfYear(date);
    const daysInMonth = new Date(year, month, 0).getDate();
    const weekNumber = calculateISOWeekNumber(date);

    // Get localized names
    const {fullMonthName, shortMonthName, fullDayName, shortDayName} = getLocalizedNames(date);

    // Get time components in UTC timezone (to match Classic/OldDot behavior)
    const {hours, minutes, seconds, hours12, meridiem, meridiemUpperCase} = getUTCTimeComponents(date);

    return [
        // Year formats (longest to shortest)
        {token: 'yyyy', value: year.toString()},
        {token: 'YYYY', value: year.toString()},
        {token: 'yy', value: year.toString().slice(-2)},
        {token: 'Y', value: year.toString()},
        {token: 'y', value: year.toString().slice(-2)},

        // Month formats (longest to shortest)
        {token: 'MMMM', value: fullMonthName},
        {token: 'MMM', value: shortMonthName},
        {token: 'MM', value: month.toString().padStart(2, '0')},
        {token: 'M', value: shortMonthName}, // Short textual representation (Jan-Dec)
        {token: 'F', value: fullMonthName},
        {token: 'n', value: month.toString()},

        // Day formats (longest to shortest)
        {token: 'dddd', value: fullDayName},
        {token: 'ddd', value: shortDayName},
        {token: 'dd', value: day.toString().padStart(2, '0')},
        {token: 'd', value: day.toString().padStart(2, '0')},
        {token: 'j', value: day.toString()},
        {token: 'l', value: fullDayName},
        {token: 'D', value: shortDayName},
        {token: 'w', value: dayOfWeek.toString()},
        {token: 'N', value: isoDayOfWeek.toString()},
        {token: 'z', value: dayOfYear.toString()},
        {token: 'W', value: weekNumber.toString().padStart(2, '0')},
        {token: 'S', value: getOrdinalSuffix(day)},

        // Time formats (longest to shortest)
        {token: 'tt', value: meridiemUpperCase},
        {token: 'hh', value: hours12.toString().padStart(2, '0')},
        {token: 'HH', value: hours.toString().padStart(2, '0')},
        {token: 'mm', value: minutes.toString().padStart(2, '0')},
        {token: 'ss', value: seconds.toString().padStart(2, '0')},
        {token: 'H', value: hours.toString().padStart(2, '0')}, // WITH leading zeros (00-23)
        {token: 'h', value: hours12.toString().padStart(2, '0')}, // WITH leading zeros (01-12)
        {token: 'G', value: hours.toString()}, // WITHOUT leading zeros (0-23)
        {token: 'g', value: hours12.toString()}, // WITHOUT leading zeros (1-12)
        {token: 'i', value: minutes.toString().padStart(2, '0')},
        {token: 't', value: daysInMonth.toString()},
        {token: 's', value: seconds.toString().padStart(2, '0')},
        {token: 'A', value: meridiemUpperCase},
        {token: 'a', value: meridiem},

        // Full Date/Time formats
        {token: 'c', value: date.toISOString()}, // ISO 8601: 2025-01-08T15:30:45.123Z
        {token: 'r', value: formatRFC2822(date)}, // RFC 2822: Thu, 08 Jan 2025 15:30:45 +0000
        {token: 'U', value: Math.floor(date.getTime() / 1000).toString()}, // Unix timestamp
    ];
}

/**
 * Apply two-phase token replacement to prevent conflicts
 */
function applyTokenReplacement(format: string, tokens: Array<{token: string; value: string}>): string {
    let result = format;

    // Sort tokens by length (longest first) to prevent conflicts
    const sortedTokens = [...tokens].sort((a, b) => b.token.length - a.token.length);

    // Phase 1: Replace tokens with unique placeholders
    const placeholderMap: Record<string, string> = {};
    for (let i = 0; i < sortedTokens.length; i++) {
        const tokenData = sortedTokens.at(i);
        if (!tokenData) {
            continue;
        }

        const {token, value} = tokenData;
        const placeholder = `###${i.toString().padStart(3, '0')}###`;
        const regex = new RegExp(token.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');

        if (result.includes(token)) {
            result = result.replaceAll(regex, placeholder);
            placeholderMap[placeholder] = value;
        }
    }

    // Phase 2: Replace placeholders with actual values
    for (const [placeholder, value] of Object.entries(placeholderMap)) {
        result = result.replaceAll(new RegExp(placeholder.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    }

    return result;
}

/**
 * Format a date value with comprehensive token-based date format support
 * Supports 40+ date format tokens with localization and timezone handling
 */
function formatDate(dateString: string | undefined, format = 'yyyy-MM-dd'): string {
    if (!dateString) {
        return '';
    }

    try {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) {
            return '';
        }

        // Create tokens for the date
        const tokens = createDateTokens(date);

        // Apply token replacement
        return applyTokenReplacement(format, tokens);
    } catch {
        return '';
    }
}

export {formatDate, getOrdinalSuffix, calculateISOWeekNumber, calculateDayOfYear, getLocalizedNames, getUTCTimeComponents, createDateTokens, applyTokenReplacement};
