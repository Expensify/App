import CONST from '@src/CONST';

import {addDays, format, getYear, isValid, parse} from 'date-fns';

// Common date formats to try when parsing CSV dates
// Order matters - more specific/common formats first
const CSV_DATE_FORMATS = [
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
    // Two-digit years are mapped to the century closest to today. The `yyyy` formats above also match them as years 1-99,
    // so these are only reached because those results are rejected by the minimum year check.
    'MM/dd/yy', // US short year: 11/02/25 or 1/2/25
    'dd/MM/yy', // European short year: 02/11/25 or 2/1/25
    'MM-dd-yy', // US short year with dashes: 11-02-25
    'dd-MM-yy', // European short year with dashes: 02-11-25
    'MMM d, yy', // Month name short year: Nov 2, 25
    'd MMM yy', // European with month name short year: 2 Nov 25
];

// Earlier years are never real transaction dates. They come from short years like `26` being read as AD 26, which the backend drops as malformed.
const MIN_CSV_DATE_YEAR = 1900;

/**
 * Formats a parsed date as yyyy-MM-dd, or returns null when it is invalid or has an implausible year
 */
function formatParsedDate(date: Date): string | null {
    if (!isValid(date) || getYear(date) < MIN_CSV_DATE_YEAR) {
        return null;
    }
    return format(date, CONST.DATE.FNS_FORMAT_STRING);
}

/**
 * Tries each of the known CSV date formats in order and returns the first plausible match
 */
function parseWithKnownFormats(input: string): string | null {
    for (const dateFormat of CSV_DATE_FORMATS) {
        const formattedDate = formatParsedDate(parse(input, dateFormat, new Date()));
        if (formattedDate) {
            return formattedDate;
        }
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

    // Try parsing with common date formats using date-fns first. These are parsed in the local time zone, while `new Date()`
    // reads a bare yyyy-MM-dd string as UTC midnight, which formats back to the previous day for anyone west of UTC.
    const formattedDate = parseWithKnownFormats(trimmedInput);
    if (formattedDate) {
        return formattedDate;
    }

    // Convert 5-digit Excel serials before new Date() treats them as years. We subtract 2 because Excel counts from 1900-01-01 and treats 1900 as a leap year.
    if (/^\d{5}$/.test(trimmedInput)) {
        const inputInt = parseInt(trimmedInput, 10);
        if (inputInt > 0) {
            const excelEpoch = new Date(1900, 0, 1); // January 1, 1900
            const formattedSerialDate = formatParsedDate(addDays(excelEpoch, inputInt - 2));
            if (formattedSerialDate) {
                return formattedSerialDate;
            }
        }
    }

    // Fall back to native Date parsing (handles ISO date-times and other formats not listed above)
    const formattedNativeDate = formatParsedDate(new Date(trimmedInput));
    if (formattedNativeDate) {
        return formattedNativeDate;
    }

    // If the date didn't parse, try taking just the first 10 characters
    if (trimmedInput.length > 10) {
        const shortInput = trimmedInput.substring(0, 10);

        // Formats run before native parsing here for the same time zone reason as above
        return parseWithKnownFormats(shortInput) ?? formatParsedDate(new Date(shortInput));
    }

    return null;
}

export default parseCSVDate;
