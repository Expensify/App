import {isValid, parse} from 'date-fns';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';

const AS_OF_LABEL_PATTERN = /^As of:\s*(.+)$/i;
const CHART_DISPLAY_FORMAT = `MMM d, yyyy 'at' ${CONST.DATE.LOCAL_TIME_FORMAT}`;

/** Matches server `EXP_CHAT_COMMENT_DATETIME` (`M j, Y \a\t h:i A`) with and without a leading zero on the hour. */
const SERVER_AS_OF_PARSE_FORMATS = ['MMM d, yyyy hh:mm aa', 'MMM d, yyyy h:mm aa'] as const;

/**
 * Parses a Victory chart "As of" datetime label text into a UTC date.
 */
function parseDateAsUTC(sourceText: string): Date | null {
    const normalizedText = sourceText
        .trim()
        .replace(/\s+at\s+/i, ' ')
        .trim();

    for (const formatStr of SERVER_AS_OF_PARSE_FORMATS) {
        const parsed = parse(normalizedText, formatStr, new Date());

        if (!isValid(parsed)) {
            continue;
        }

        return new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), parsed.getHours(), parsed.getMinutes(), parsed.getSeconds()));
    }

    return null;
}

/**
 * Rewrites a `<victorylabel>` "As of: ..." string in the viewer's timezone.
 * Returns the original text when the label does not match or cannot be parsed.
 */
function getLocalizedVictoryChartLabelText(text: string, timezone?: SelectedTimezone): string {
    if (!timezone) {
        return text;
    }

    const match = text.trim().match(AS_OF_LABEL_PATTERN);
    if (!match) {
        return text;
    }

    const utcDate = parseDateAsUTC(match[1]);
    if (!utcDate) {
        return text;
    }

    const localizedDate = DateUtils.formatInTimeZoneWithFallback(utcDate, timezone, CHART_DISPLAY_FORMAT);
    return `As of: ${localizedDate}`;
}

export {getLocalizedVictoryChartLabelText, parseDateAsUTC};
