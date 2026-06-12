import {isValid} from 'date-fns';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';

const AS_OF_LABEL_PATTERN = /^As of:\s*(.+)$/i;
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

const CHART_AS_OF_DISPLAY_FORMAT = `MMM d, yyyy 'at' ${CONST.DATE.LOCAL_TIME_FORMAT}`;

function stripTrailingTimezone(text: string): string {
    return text
        .trim()
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

/**
 * Normalizes a server chart timestamp into a string the Date constructor parses as UTC.
 * Supports ISO UTC (future server format) and gmdate-style strings like "Jun 5, 2026 at 06:47 PM".
 */
function normalizeToUtcDateString(sourceText: string): string {
    const withoutTimezone = stripTrailingTimezone(sourceText);
    const withoutAt = withoutTimezone.replace(/\s+at\s+/i, ' ').trim();

    if (ISO_TIMESTAMP_PATTERN.test(withoutAt)) {
        return withoutAt;
    }

    return `${withoutAt} UTC`;
}

/**
 * Parses a Concierge chart "As of" datetime string as UTC.
 * Server-side chart labels use gmdate(), so wall-clock components are UTC.
 */
function parseUtcAsOfDateTime(sourceText: string): Date | null {
    const parsed = new Date(normalizeToUtcDateString(sourceText));

    if (!isValid(parsed)) {
        return null;
    }

    return parsed;
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
