import CONST from '@src/CONST';
import type Locale from '@src/types/onyx/Locale';

import {addDays, format, isValid, parse} from 'date-fns';
import escapeRegExp from 'lodash/escapeRegExp';

import DateUtils from './DateUtils';
import {registerDerivedIntlCache} from './IntlFormatterCaches';
import memoize from './memoize';

/** Shapes that read the same in every language: 2025-11-02, 2025/11/02, 20251102. */
const UNAMBIGUOUS_DATE_FORMATS = ['yyyy-MM-dd', 'yyyy/MM/dd', 'yyyyMMdd'];

/** `03/04/2025` is 3 April where the language writes the day first and 4 March where it writes the month first, so the reading follows the uploader. */
const DAY_FIRST_DATE_FORMATS = ['dd/MM/yyyy', 'd/M/yyyy', 'dd-MM-yyyy', 'd-M-yyyy', 'dd.MM.yyyy', 'd.M.yyyy'];
const MONTH_FIRST_DATE_FORMATS = ['MM/dd/yyyy', 'M/d/yyyy', 'MM-dd-yyyy', 'M-d-yyyy'];

/** Shapes carrying a month name, which `toEnglishMonthName` has rewritten to English by the time these are tried. */
const MONTH_NAME_DATE_FORMATS = ['MMM d, yyyy', 'MMMM d, yyyy', 'd MMM yyyy', 'dd MMM yyyy', 'd MMMM yyyy', 'dd MMMM yyyy', 'd. MMMM yyyy', 'dd. MMMM yyyy'];

function getDateFormats(locale: Locale): string[] {
    const [leading, trailing] = DateUtils.isDayBeforeMonth(locale) ? [DAY_FIRST_DATE_FORMATS, MONTH_FIRST_DATE_FORMATS] : [MONTH_FIRST_DATE_FORMATS, DAY_FIRST_DATE_FORMATS];
    return [...UNAMBIGUOUS_DATE_FORMATS, ...leading, ...trailing, ...MONTH_NAME_DATE_FORMATS];
}

/** A date followed by a clock time, so a timestamp can be cut back to its date without guessing where the date ends. */
const TRAILING_TIME_PATTERN = /[T\s]\d{1,2}:\d{2}/;

/**
 * Every month name the uploader's language writes, as a pattern matching it in a cell, paired with the English name
 * date-fns parses. Longest first, so a full name is matched before its abbreviation. Memoized because a file is parsed
 * a row at a time, and dropped with the other derived caches, because the names it reads change when a locale's data lands.
 */
const getEnglishMonthNameByLocalizedName = memoize(
    (locale: Locale): Array<[localizedName: RegExp, englishName: string]> => {
        const names: Array<[string, string]> = [];
        const localizedNames = [...DateUtils.getMonthNames(locale), ...DateUtils.getShortMonthNames(locale)];
        for (const [index, name] of localizedNames.entries()) {
            const englishName = CONST.DATE.ENGLISH_MONTH_NAMES.at(index % CONST.DATE.ENGLISH_MONTH_NAMES.length) ?? '';
            names.push([name, englishName]);
            // A language may abbreviate a month with a trailing point, which the tool that wrote the file may have dropped.
            const withoutPoints = name.replaceAll('.', '');
            if (withoutPoints !== name) {
                names.push([withoutPoints, englishName]);
            }
        }
        // The point after an abbreviation goes with the name, so `15. Jan. 2025` rewrites to a shape the formats above know.
        return names.sort(([nameA], [nameB]) => nameB.length - nameA.length).map(([name, englishName]) => [new RegExp(`${escapeRegExp(name)}\\.?`, 'iu'), englishName]);
    },
    {maxSize: 16, equality: 'shallow'},
);

registerDerivedIntlCache(() => {
    getEnglishMonthNameByLocalizedName.cache.clear();
});

/**
 * Rewrites the month name a cell holds to English, leaving the rest of the cell in place. A cell carries whatever the
 * exporting tool wrote, which is the uploader's language as often as English, while date-fns reads English alone.
 */
function toEnglishMonthName(input: string, locale: Locale): string {
    for (const [localizedName, englishName] of getEnglishMonthNameByLocalizedName(locale)) {
        // Matched against the cell itself rather than a lowercased copy, whose offsets drift from it: `İ` lowercases to two characters.
        const match = localizedName.exec(input);
        if (!match) {
            continue;
        }
        return `${input.slice(0, match.index)}${englishName}${input.slice(match.index + match[0].length)}`;
    }
    return input;
}

function parseDateValue(value: string, dateFormats: string[]): string | null {
    // The known shapes first: a cell holds a calendar day, and the engine reads `2024-01-15` as UTC midnight, which
    // formats back as the day before in every zone west of UTC.
    for (const dateFormat of dateFormats) {
        const parsedDate = parse(value, dateFormat, new Date());
        if (isValid(parsedDate)) {
            return format(parsedDate, CONST.DATE.FNS_FORMAT_STRING);
        }
    }

    // Then whatever else the engine accepts, such as a timestamp carrying its own offset.
    const nativeDate = new Date(value);
    return isValid(nativeDate) ? format(nativeDate, CONST.DATE.FNS_FORMAT_STRING) : null;
}

/**
 * Parses a date cell written in the uploader's language and returns it in yyyy-MM-dd format, or null when no shape matches.
 */
function parseCSVDate(input: string, locale: Locale): string | null {
    if (!input || typeof input !== 'string') {
        return null;
    }

    const normalizedInput = toEnglishMonthName(input.trim(), locale);
    const dateFormats = getDateFormats(locale);
    const parsedDate = parseDateValue(normalizedInput, dateFormats);
    if (parsedDate) {
        return parsedDate;
    }

    // Retry without the clock time, cut at the time itself: cutting at a fixed length left a month name and a two-digit year, which the engine read as the year 20.
    const trailingTime = TRAILING_TIME_PATTERN.exec(normalizedInput);
    const parsedDateOnly = trailingTime ? parseDateValue(normalizedInput.slice(0, trailingTime.index), dateFormats) : null;
    if (parsedDateOnly) {
        return parsedDateOnly;
    }

    // If it didn't parse, maybe it's an Excel date number
    // Excel stores dates serialized from January 1st, 1900 (with 1/1/1900 being 1)
    // Excel thinks that 1900 was a leap year and adds an extra day to account for that
    if (/^\d+$/.test(normalizedInput)) {
        const inputInt = parseInt(normalizedInput, 10);
        if (inputInt > 0 && inputInt < 100000) {
            const excelEpoch = new Date(1900, 0, 1); // January 1, 1900
            const excelDate = addDays(excelEpoch, inputInt - 2);
            if (isValid(excelDate)) {
                return format(excelDate, CONST.DATE.FNS_FORMAT_STRING);
            }
        }
    }

    return null;
}

export default parseCSVDate;
