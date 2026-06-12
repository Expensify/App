import {isValid} from 'date-fns';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';

const AS_OF_LABEL_PATTERN = /^As of:\s*(.+)$/i;
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

const CHART_AS_OF_DISPLAY_FORMAT = `MMM d, yyyy 'at' ${CONST.DATE.LOCAL_TIME_FORMAT}`;

/**
 * Normalizes a server chart timestamp into a string the Date constructor parses as UTC.
 * Server timestamps are UTC wall-clock values with no timezone suffix, e.g. "Jun 12, 2026 at 8:48 AM".
 * Also supports ISO UTC (future server format), e.g. "2026-06-05T18:47:00Z".
 */
function normalizeToUtcDateString(sourceText: string): string {
    const normalizedText = sourceText.trim().replace(/\s+at\s+/i, ' ').trim();

    if (ISO_TIMESTAMP_PATTERN.test(normalizedText)) {
        return normalizedText;
    }

    return `${normalizedText} UTC`;
}

/**
 * Parses a Concierge chart "As of" datetime string as UTC.
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
function getLocalizedVictoryChartLabelText(text: string, viewerTimezone?: SelectedTimezone): string {
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

export {AS_OF_LABEL_PATTERN, formatAsOfDateTimeForTimezone, getLocalizedVictoryChartLabelText, parseUtcAsOfDateTime};
