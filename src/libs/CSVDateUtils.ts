import CONST from '@src/CONST';
import type Locale from '@src/types/onyx/Locale';

import {addDays, format, isValid, parse} from 'date-fns';
import escapeRegExp from 'lodash/escapeRegExp';

import DateUtils from './DateUtils';
import {registerDerivedIntlCache} from './IntlFormatterCaches';
import memoize from './memoize';

/**
 * Order matters, and it does not follow the reader: a file's field order is the exporting bank's, not the uploader's,
 * so `03/04/2025` is read month-first for everyone rather than swapping the rows a US export sends to a Spanish user.
 * The month-name shapes come last, by which point `toEnglishMonthName` has rewritten the name to English.
 */
const CSV_DATE_FORMATS = [
    'yyyy-MM-dd', // ISO format: 2025-11-02
    'MM/dd/yyyy', // US format: 11/02/2025
    'dd/MM/yyyy', // European format: 02/11/2025
    'M/d/yyyy', // US short: 1/2/2025
    'd/M/yyyy', // European short: 2/1/2025
    'MM-dd-yyyy', // US with dashes: 11-02-2025
    'dd-MM-yyyy', // European with dashes: 02-11-2025
    'dd.MM.yyyy', // European with points: 02.11.2025
    'd.M.yyyy', // European short with points: 2.1.2025
    'yyyy/MM/dd', // Alternative ISO: 2025/11/02
    'MMM d, yyyy', // Month name: Nov 2, 2025
    'MMMM d, yyyy', // Full month: November 2, 2025
    'd MMM yyyy', // European with month name: 2 Nov 2025
    'dd MMM yyyy', // European with month name: 02 Nov 2025
    'd MMMM yyyy', // European with full month: 2 November 2025
    'dd MMMM yyyy', // European with full month: 02 November 2025
    'd. MMMM yyyy', // European with a point after the day: 2. November 2025
    'dd. MMMM yyyy', // European with a point after the day: 02. November 2025
    'yyyyMMdd', // Compact: 20251102
];

/** A date followed by a clock time, so a timestamp can be cut back to its date without guessing where the date ends. */
const TRAILING_TIME_PATTERN = /[T\s]\d{1,2}:\d{2}/;

/**
 * Bounded by letters on both sides, else a name that begins another language's name is spliced into it: `sept` (es) sits
 * inside `September`, and rewriting that leaves a cell no format matches, so the row is dropped. The point after an
 * abbreviation goes with the name, so `15. Jan. 2025` rewrites to a shape the formats above know.
 */
function toMonthNamePattern(name: string): RegExp {
    return new RegExp(`(?<!\\p{L})${escapeRegExp(name)}\\.?(?!\\p{L})`, 'iu');
}

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
        return names.sort(([nameA], [nameB]) => nameB.length - nameA.length).map(([name, englishName]) => [toMonthNamePattern(name), englishName]);
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

/** A cell holds a calendar day, and the engine reads `2024-01-15` as UTC midnight, which formats back as the day before west of UTC. */
function parseKnownFormat(value: string): string | null {
    for (const dateFormat of CSV_DATE_FORMATS) {
        const parsedDate = parse(value, dateFormat, new Date());
        // `yyyy` also matches a two-digit year and reads it literally, so `3/4/25` is the year 25 here and 2025 to the engine below, which is what a spreadsheet means by it.
        if (isValid(parsedDate) && parsedDate.getFullYear() >= 100) {
            return format(parsedDate, CONST.DATE.FNS_FORMAT_STRING);
        }
    }
    return null;
}

/** What precedes the trailing text a statement writes after the date: the clock time, then one word at a time from the end. */
function getTrailingCuts(value: string): string[] {
    const cuts: string[] = [];
    const trailingTime = TRAILING_TIME_PATTERN.exec(value);
    if (trailingTime) {
        cuts.push(value.slice(0, trailingTime.index));
    }
    for (let space = value.lastIndexOf(' '); space > 0; space = value.lastIndexOf(' ', space - 1)) {
        cuts.push(value.slice(0, space));
    }
    return cuts;
}

function parseDateValue(value: string): string | null {
    const knownFormat = parseKnownFormat(value);
    if (knownFormat) {
        return knownFormat;
    }

    // A five-digit Excel serial, before the engine below reads it as a year. Excel counts from 1900-01-01 and treats
    // 1900 as a leap year, hence the two days.
    if (/^\d{5}$/.test(value)) {
        const excelDate = addDays(new Date(1900, 0, 1), parseInt(value, 10) - 2);
        if (isValid(excelDate)) {
            return format(excelDate, CONST.DATE.FNS_FORMAT_STRING);
        }
    }

    // Then whatever else the engine accepts, such as a two-digit year or a timestamp carrying its own offset.
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
    const parsedDate = parseDateValue(normalizedInput);
    if (parsedDate) {
        return parsedDate;
    }

    // Then the cell without what follows the date, cut at its own separators: cutting at a fixed ten characters left `Nov 2, 202`, which the engine read as the year 202.
    for (const cut of getTrailingCuts(normalizedInput)) {
        // Only the shapes above, because a cut is a fragment rather than a cell, and the engine reads a leftover `2` as a date.
        const parsedCut = parseKnownFormat(cut);
        if (parsedCut) {
            return parsedCut;
        }
    }
    return null;
}

export default parseCSVDate;
