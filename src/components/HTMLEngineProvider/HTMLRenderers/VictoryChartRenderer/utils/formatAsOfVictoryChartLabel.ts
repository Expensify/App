import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';

const AS_OF_LABEL_PATTERN = /^As of:\s*(.+)$/i;

const MONTH_NAME_TO_INDEX: Record<string, number> = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
};

/** Matches Concierge chart timestamps emitted via gmdate(EXP_CHAT_COMMENT_DATETIME). */
const SERVER_AS_OF_WITH_YEAR_PATTERN = /^([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})\s+at\s+(\d{1,2}):(\d{2})\s+(AM|PM)$/i;
const SERVER_AS_OF_WITHOUT_YEAR_PATTERN = /^([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{1,2}):(\d{2})\s+(AM|PM)$/i;

const CHART_AS_OF_DISPLAY_FORMAT = `MMM d, yyyy 'at' ${CONST.DATE.LOCAL_TIME_FORMAT}`;

function stripTrailingTimezoneAbbreviation(text: string): string {
    const trimmedText = text.trim();

    return trimmedText
        .replace(/\s+GMT(?:\s*[+-]?\d{1,2}(?::\d{2})?)?$/i, '')
        .replace(/\s+([A-Z]{2,5})(?:[+-]\d{1,2})?$/i, (match, abbreviation) => {
            const normalizedAbbreviation = abbreviation.toUpperCase();
            if (normalizedAbbreviation === 'AM' || normalizedAbbreviation === 'PM') {
                return match;
            }

            return '';
        })
        .trim();
}

function parseMeridiemHour(hour: number, meridiem: string): number {
    const normalizedMeridiem = meridiem.toUpperCase();
    if (normalizedMeridiem === 'PM' && hour !== 12) {
        return hour + 12;
    }
    if (normalizedMeridiem === 'AM' && hour === 12) {
        return 0;
    }
    return hour;
}

function buildUtcDateFromParts(monthName: string, day: number, year: number, hour: number, minute: number, meridiem: string): Date | null {
    const monthIndex = MONTH_NAME_TO_INDEX[monthName];
    if (monthIndex === undefined) {
        return null;
    }

    return new Date(Date.UTC(year, monthIndex, day, parseMeridiemHour(hour, meridiem), minute, 0));
}

/**
 * Parses a Concierge chart "As of" datetime string as UTC.
 * Server-side chart labels use gmdate(), so wall-clock components are UTC.
 */
function parseUtcAsOfDateTime(sourceText: string): Date | null {
    const normalizedText = stripTrailingTimezoneAbbreviation(sourceText);

    const withYearMatch = normalizedText.match(SERVER_AS_OF_WITH_YEAR_PATTERN);
    if (withYearMatch) {
        const [, monthName, day, year, hour, minute, meridiem] = withYearMatch;
        const utcDate = buildUtcDateFromParts(monthName, Number(day), Number(year), Number(hour), Number(minute), meridiem);
        if (Number.isNaN(utcDate?.getTime())) {
            return null;
        }
        return utcDate;
    }

    const withoutYearMatch = normalizedText.match(SERVER_AS_OF_WITHOUT_YEAR_PATTERN);
    if (withoutYearMatch) {
        const [, monthName, day, hour, minute, meridiem] = withoutYearMatch;
        const utcDate = buildUtcDateFromParts(monthName, Number(day), new Date().getUTCFullYear(), Number(hour), Number(minute), meridiem);
        if (Number.isNaN(utcDate?.getTime())) {
            return null;
        }
        return utcDate;
    }

    return null;
}

function formatAsOfDateTimeForTimezone(utcDate: Date, viewerTimezone: SelectedTimezone): string {
    return DateUtils.formatInTimeZoneWithFallback(utcDate, viewerTimezone, CHART_AS_OF_DISPLAY_FORMAT);
}

/**
 * Rewrites a `<victorylabel>` "As of: ..." string in the viewer's timezone.
 * Returns the original text when the label does not match or cannot be parsed.
 */
function getLocalizedAsOfVictoryChartLabelText(text: string, viewerTimezone?: SelectedTimezone): string {
    if (!viewerTimezone) {
        return text;
    }

    const match = text.match(AS_OF_LABEL_PATTERN);
    if (!match) {
        return text;
    }

    const utcDate = parseUtcAsOfDateTime(match[1]);
    if (!utcDate) {
        return text;
    }

    return `As of: ${formatAsOfDateTimeForTimezone(utcDate, viewerTimezone)}`;
}

export {AS_OF_LABEL_PATTERN, formatAsOfDateTimeForTimezone, getLocalizedAsOfVictoryChartLabelText, parseUtcAsOfDateTime};
