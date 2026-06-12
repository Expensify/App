import {isValid} from 'date-fns';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';

const AS_OF_LABEL_PATTERN = /^As of:\s*(.+)$/i;

const CHART_AS_OF_DISPLAY_FORMAT = `MMM d, yyyy 'at' ${CONST.DATE.LOCAL_TIME_FORMAT}`;

/**
 * Parses a Victory chart "As of" datetime label text into a UTC date.
 */
function parseDateAsUTC(sourceText: string): Date | null {
    const normalizedText = sourceText
        .trim()
        .replace(/\s+at\s+/i, ' ')
        .trim();
    const parsed = new Date(`${normalizedText} UTC`);

    if (!isValid(parsed)) {
        return null;
    }

    return parsed;
}

/**
 * Rewrites a `<victorylabel>` "As of: ..." string in the viewer's timezone.
 * Returns the original text when the label does not match or cannot be parsed.
 */
function getLocalizedVictoryChartLabelText(text: string, timezone?: SelectedTimezone): string {
    if (!timezone) {
        return text;
    }

    const match = text.match(AS_OF_LABEL_PATTERN);
    if (!match) {
        return text;
    }

    const utcDate = parseDateAsUTC(match[1]);
    if (!utcDate) {
        return text;
    }

    const localizedDate = DateUtils.formatInTimeZoneWithFallback(utcDate, timezone, CHART_AS_OF_DISPLAY_FORMAT);
    return `As of: ${localizedDate}`;
}

export {AS_OF_LABEL_PATTERN, getLocalizedVictoryChartLabelText, parseDateAsUTC};
