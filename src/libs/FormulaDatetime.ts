import {format as dateFnsFormat, getDayOfYear, getISOWeek, parseISO} from 'date-fns';

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
 * Get localized month and day names using date-fns
 */
function getLocalizedNames(date: Date) {
    // Report title formulas resolve to a name stored on the report and seen by everyone who opens it, so it must not vary
    // with the language of whoever happened to trigger the computation.
    /* eslint-disable rulesdir/require-locale-for-localized-date-format */
    return {
        fullMonthName: dateFnsFormat(date, 'MMMM'),
        shortMonthName: dateFnsFormat(date, 'MMM'),
        fullDayName: dateFnsFormat(date, 'EEEE'),
        shortDayName: dateFnsFormat(date, 'EEE'),
    };
    /* eslint-enable rulesdir/require-locale-for-localized-date-format */
}

/**
 * Get the hour, minute and second of a date, and their 12-hour forms
 */
function getTimeComponents(date: Date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

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
function formatRFC2822(date: Date, isExactTime: boolean): string {
    const {shortDayName, shortMonthName} = getLocalizedNames(date);
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    // The backend reads a stored date and time as UTC. An exact time shows in the user's time zone, so it has their offset.
    let timezoneString = '+0000';
    if (isExactTime) {
        const timezoneOffset = -date.getTimezoneOffset();
        const offsetSign = timezoneOffset >= 0 ? '+' : '-';
        const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60)
            .toString()
            .padStart(2, '0');
        const offsetMinutes = (Math.abs(timezoneOffset) % 60).toString().padStart(2, '0');
        timezoneString = `${offsetSign}${offsetHours}${offsetMinutes}`;
    }

    return `${shortDayName}, ${day} ${shortMonthName} ${year} ${hours}:${minutes}:${seconds} ${timezoneString}`;
}

/**
 * Create token definitions for date formatting. An exact time is a moment shown in the user's time zone, like the
 * current time. Otherwise the date holds a stored date and time.
 */
function createDateTokens(date: Date, isExactTime: boolean): Array<{token: string; value: string}> {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek; // 1 = Monday, 7 = Sunday
    // Formula day numbers start at 0 on January 1, while date-fns starts at 1
    const dayOfYear = getDayOfYear(date) - 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    const weekNumber = getISOWeek(date);

    // Get localized names
    const {fullMonthName, shortMonthName, fullDayName, shortDayName} = getLocalizedNames(date);

    const {hours, minutes, seconds, hours12, meridiem, meridiemUpperCase} = getTimeComponents(date);

    // The backend reads a stored date and time as UTC, so the ISO and Unix times do too. An exact time is already a moment.
    const moment = isExactTime ? date : new Date(Date.UTC(year, date.getMonth(), day, hours, minutes, seconds, date.getMilliseconds()));

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
        // ISO 8601: 2025-01-08T15:30:45.123Z
        {token: 'c', value: moment.toISOString()},
        // RFC 2822: Thu, 08 Jan 2025 15:30:45 +0000
        {token: 'r', value: formatRFC2822(date, isExactTime)},
        // Unix timestamp
        {token: 'U', value: Math.floor(moment.getTime() / 1000).toString()},
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
function formatDate(value: string | Date | undefined, format = 'yyyy-MM-dd'): string {
    if (!value) {
        return '';
    }

    try {
        // A Date holds the date and time to show in its local parts. parseISO reads a string into local parts:
        // - A date stored without a time zone, like the expense date "2025-01-20" or the report's created time
        //   "2025-01-08 15:30:45", keeps its stored date and time, like the backend. new Date() would read "2025-01-20"
        //   as midnight UTC, which is the previous day west of UTC.
        // - A UTC time, like the current time "2025-01-08T15:30:45.123Z", is an exact moment, so it shows in the user's
        //   time zone.
        const isExactTime = typeof value === 'string' && value.endsWith('Z');
        const date = value instanceof Date ? value : parseISO(value);
        if (Number.isNaN(date.getTime())) {
            return '';
        }

        // Create tokens for the date
        const tokens = createDateTokens(date, isExactTime);

        // Apply token replacement
        return applyTokenReplacement(format, tokens);
    } catch {
        return '';
    }
}

export default formatDate;
