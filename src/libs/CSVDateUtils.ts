import CONST from '@src/CONST';

import {addDays, format, isValid, parse} from 'date-fns';

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

    // Native Date parsing runs before the date-fns formats because the `yyyy` token matches 1-4 digits, so date-fns would read
    // 01/20/24 as the year 24. `new Date()` maps two-digit years to 19xx or 20xx instead.
    let date = new Date(trimmedInput);
    if (isValid(date) && !Number.isNaN(date.getTime())) {
        return format(date, CONST.DATE.FNS_FORMAT_STRING);
    }

    for (const dateFormat of CSV_DATE_FORMATS) {
        const parsedDate = parse(trimmedInput, dateFormat, new Date());
        if (isValid(parsedDate)) {
            return format(parsedDate, CONST.DATE.FNS_FORMAT_STRING);
        }
    }

    // If the date didn't parse, try taking just the first 10 characters
    if (trimmedInput.length > 10) {
        const shortInput = trimmedInput.substring(0, 10);

        const shortISODate = parseISODateOnly(shortInput);
        if (shortISODate) {
            return shortISODate;
        }

        date = new Date(shortInput);
        if (isValid(date) && !Number.isNaN(date.getTime())) {
            return format(date, CONST.DATE.FNS_FORMAT_STRING);
        }

        for (const dateFormat of CSV_DATE_FORMATS) {
            const parsedDate = parse(shortInput, dateFormat, new Date());
            if (isValid(parsedDate)) {
                return format(parsedDate, CONST.DATE.FNS_FORMAT_STRING);
            }
        }
    }

    return null;
}

export default parseCSVDate;
