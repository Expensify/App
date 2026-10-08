import CONST from '@src/CONST';

import {addDays, format, isValid, parse} from 'date-fns';

// Common date formats to try when parsing CSV dates
// Order matters - more specific/common formats first
const CSV_DATE_FORMATS = [
    // Two-digit years come first because `yyyy` matches 1-4 digits and would read 01/20/24 as the year 24. `yy` reads at
    // most two digits and maps them into the 100 years around today, so 01/20/2024 still falls through to `MM/dd/yyyy`.
    'MM/dd/yy', // US two-digit year: 11/02/25
    'dd/MM/yy', // European two-digit year: 02/11/25
    'MM-dd-yy', // US two-digit year with dashes: 11-02-25
    'dd-MM-yy', // European two-digit year with dashes: 02-11-25
    'MMM d, yy', // Month name with two-digit year: Nov 2, 25
    'MMMM d, yy', // Full month with two-digit year: November 2, 25
    'd MMM yy', // European with month name and two-digit year: 2 Nov 25
    'yyyy-MM-dd', // ISO format: 2025-11-02
    'MM/dd/yyyy', // US format: 11/02/2025
    'dd/MM/yyyy', // European format: 02/11/2025
    'M/d/yyyy', // US short: 1/2/2025
    'd/M/yyyy', // European short: 2/1/2025
    'MM-dd-yyyy', // US with dashes: 11-02-2025
    'dd-MM-yyyy', // European with dashes: 02-11-2025
    'yyyy/MM/dd', // Alternative ISO: 2025/11/02
    'MMM d, yyyy', // Month name: Nov 2, 2025
    'MMMM d, yyyy', // Full month: November 2, 2025
    'd MMM yyyy', // European with month name: 2 Nov 2025
    'dd MMM yyyy', // European with month name: 02 Nov 2025
    'yyyyMMdd', // Compact: 20251102
];

// Month and day bounds match what `new Date()` accepts, so values it rejected (such as 2026-13-01) are still rejected
const ISO_DATE_ONLY_REGEX = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

/**
 * Parses a bare yyyy-MM-dd string in the local time zone. `new Date()` reads it as UTC midnight, which formats back to the
 * previous day for anyone west of UTC. Days past the end of the month roll over the same way `new Date()` does.
 */
function parseISODateOnly(input: string): string | null {
    const isoMatch = ISO_DATE_ONLY_REGEX.exec(input);
    if (!isoMatch) {
        return null;
    }

    const [, year, month, day] = isoMatch;

    // setFullYear is used instead of the Date constructor, which maps years 0-99 to 1900-1999
    const date = new Date(0, 0, 1);
    date.setFullYear(Number(year), Number(month) - 1, Number(day));
    return format(date, CONST.DATE.FNS_FORMAT_STRING);
}

/**
 * Parses the input with the first matching CSV_DATE_FORMATS entry. This runs before `new Date()` so that web and native
 * agree: Hermes's `new Date()` rejects strings such as 01/20/24, which V8 accepts.
 */
function parseWithDateFormats(input: string): string | null {
    for (const dateFormat of CSV_DATE_FORMATS) {
        const parsedDate = parse(input, dateFormat, new Date());

        // A year below 1000 means `yyyy` matched a short year, so skip it rather than save a date in the first millennium
        if (isValid(parsedDate) && parsedDate.getFullYear() >= 1000) {
            return format(parsedDate, CONST.DATE.FNS_FORMAT_STRING);
        }
    }
    return null;
}

/**
 * Parses the input with `new Date()`, for formats that CSV_DATE_FORMATS does not cover
 */
function parseWithNativeDate(input: string): string | null {
    const date = new Date(input);
    if (isValid(date) && !Number.isNaN(date.getTime())) {
        return format(date, CONST.DATE.FNS_FORMAT_STRING);
    }
    return null;
}

/**
 * Parses a date string from various formats and returns it in yyyy-MM-dd format
 */
function parseCSVDate(input: string): string | null {
    if (!input || typeof input !== 'string') {
        return null;
    }

    const trimmedInput = input.trim();

    const isoDate = parseISODateOnly(trimmedInput);
    if (isoDate) {
        return isoDate;
    }

    // Convert 5-digit Excel serials before new Date() treats them as years. We subtract 2 because Excel counts from 1900-01-01 and treats 1900 as a leap year.
    if (/^\d{5}$/.test(trimmedInput)) {
        const inputInt = parseInt(trimmedInput, 10);
        if (inputInt > 0) {
            const excelEpoch = new Date(1900, 0, 1); // January 1, 1900
            const parsedDate = addDays(excelEpoch, inputInt - 2);
            if (isValid(parsedDate)) {
                return format(parsedDate, CONST.DATE.FNS_FORMAT_STRING);
            }
        }
    }

    const formattedDate = parseWithDateFormats(trimmedInput) ?? parseWithNativeDate(trimmedInput);
    if (formattedDate) {
        return formattedDate;
    }

    // If the date didn't parse, try taking just the first 10 characters
    if (trimmedInput.length > 10) {
        const shortInput = trimmedInput.substring(0, 10);
        const shortDate = parseISODateOnly(shortInput) ?? parseWithDateFormats(shortInput) ?? parseWithNativeDate(shortInput);
        if (shortDate) {
            return shortDate;
        }
    }

    // In a two-digit-year date followed by a time, such as 01/20/24 10:30, the first 10 characters include part of the
    // time, so try the text before the first space too. `new Date()` is skipped here because V8 reads a lone number such
    // as 2 as a date in 2001.
    const spaceIndex = trimmedInput.indexOf(' ');
    if (spaceIndex > 0) {
        return parseWithDateFormats(trimmedInput.substring(0, spaceIndex));
    }

    return null;
}

export default parseCSVDate;
