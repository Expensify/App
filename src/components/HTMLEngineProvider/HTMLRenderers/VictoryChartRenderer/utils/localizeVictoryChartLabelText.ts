import DateUtils from '@libs/DateUtils';
import {translate} from '@libs/Localize';

import type {Locale} from '@src/CONST/LOCALES';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';

import {isValid, parse} from 'date-fns';
import {enUS} from 'date-fns/locale/en-US';

const AS_OF_LABEL_PATTERN = /^As of:\s*(.+)$/i;

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
        // Pinned, because the label is the server's own English string whatever the reader's language.
        const parsed = parse(normalizedText, formatStr, new Date(), {locale: enUS});

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
function getLocalizedVictoryChartLabelText(text: string, timezone: SelectedTimezone | undefined, locale: Locale): string {
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

    // The "As of:" prefix stays as the server rendered it, alongside the other English labels it draws into the chart.
    const day = DateUtils.formatInTimeZoneToMediumDate(utcDate, timezone, locale);
    const time = DateUtils.formatInTimeZoneToShortTime(utcDate, timezone, locale);
    if (!day || !time) {
        return text;
    }
    return `As of: ${day} ${translate(locale, 'common.conjunctionAt')} ${time}`;
}

export {getLocalizedVictoryChartLabelText, parseDateAsUTC};
