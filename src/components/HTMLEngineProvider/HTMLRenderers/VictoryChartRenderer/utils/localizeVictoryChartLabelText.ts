import {isValid} from 'date-fns';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';

const AS_OF_LABEL_PATTERN = /^As of:\s*(.+)$/i;

const CHART_AS_OF_DISPLAY_FORMAT = `MMM d, yyyy 'at' ${CONST.DATE.LOCAL_TIME_FORMAT}`;

/** Matches server `EXP_CHAT_COMMENT_DATETIME` (`M j, Y \a\t h:i A`). Parsed without `Date` string parsing so results never depend on device timezone. */
const SERVER_AS_OF_WALL_CLOCK_PATTERN = /^([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i;

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

/**
 * Parses a Victory chart "As of" datetime label text into a UTC date.
 */
function parseDateAsUTC(sourceText: string): Date | null {
    const normalizedText = sourceText
        .trim()
        .replace(/\s+at\s+/i, ' ')
        .trim();
    const match = normalizedText.match(SERVER_AS_OF_WALL_CLOCK_PATTERN);

    if (!match) {
        return null;
    }

    const [, monthName, day, year, hour, minute, meridiem] = match;
    const monthIndex = MONTH_NAME_TO_INDEX[monthName];

    if (monthIndex === undefined) {
        return null;
    }

    let hours = Number(hour);
    const minutes = Number(minute);

    if (meridiem.toUpperCase() === 'PM' && hours !== 12) {
        hours += 12;
    } else if (meridiem.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
    }

    const utcDate = new Date(Date.UTC(Number(year), monthIndex, Number(day), hours, minutes));

    if (!isValid(utcDate)) {
        return null;
    }

    return utcDate;
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

    const localizedDate = DateUtils.formatInTimeZoneWithFallback(utcDate, timezone, CHART_AS_OF_DISPLAY_FORMAT);
    return `As of: ${localizedDate}`;
}

export {getLocalizedVictoryChartLabelText, parseDateAsUTC};
