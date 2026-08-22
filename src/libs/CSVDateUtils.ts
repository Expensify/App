import CONST from '@src/CONST';

import {addDays, format, isValid, parse} from 'date-fns';

// Common date formats to try when parsing CSV dates
// Order matters - more specific/common formats first
const CSV_DATE_FORMATS = [
    // Two-digit years come first because the `yyyy` token would otherwise read "25" as the year 0025.
    // They cannot swallow a four-digit year, `yy` rejects the leftover digits.
    'MM/dd/yy', // US short year: 11/02/25
    'M/d/yy', // US short: 1/2/25
    'dd/MM/yy', // European short year: 02/11/25
    'MM-dd-yy', // US with dashes: 11-02-25
    'dd-MM-yy', // European with dashes: 02-11-25
    'MMM d, yy', // Month name: Nov 2, 25
    'd MMM yy', // European with month name: 2 Nov 25

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

/**
 * Parses a date string from various formats and returns it in yyyy-MM-dd format
 */
function parseCSVDate(input: string): string | null {
    if (!input || typeof input !== 'string') {
        return null;
    }

    const trimmedInput = input.trim();

    // These parse in local time, so they run first. `new Date('2026-03-02')` reads as UTC midnight
    // and formats back a day early for anyone west of UTC.
    for (const dateFormat of CSV_DATE_FORMATS) {
        const parsedDate = parse(trimmedInput, dateFormat, new Date());
        if (isValid(parsedDate)) {
            return format(parsedDate, CONST.DATE.FNS_FORMAT_STRING);
        }
    }

    // Falls back to native parsing for anything with a time or zone, which the formats above reject
    let date = new Date(trimmedInput);
    if (isValid(date) && !Number.isNaN(date.getTime())) {
        return format(date, CONST.DATE.FNS_FORMAT_STRING);
    }

    // If the date didn't parse, try taking just the first 10 characters
    if (trimmedInput.length > 10) {
        const shortInput = trimmedInput.substring(0, 10);
        date = new Date(shortInput);
        if (isValid(date) && !Number.isNaN(date.getTime())) {
            return format(date, CONST.DATE.FNS_FORMAT_STRING);
        }

        // Also try format parsing on the shortened input
        for (const dateFormat of CSV_DATE_FORMATS) {
            const parsedDate = parse(shortInput, dateFormat, new Date());
            if (isValid(parsedDate)) {
                return format(parsedDate, CONST.DATE.FNS_FORMAT_STRING);
            }
        }
    }

    // If it didn't parse, maybe it's an Excel date number
    // Excel stores dates serialized from January 1st, 1900 (with 1/1/1900 being 1)
    // Excel thinks that 1900 was a leap year and adds an extra day to account for that
    if (/^\d+$/.test(trimmedInput)) {
        const inputInt = parseInt(trimmedInput, 10);
        if (inputInt > 0 && inputInt < 100000) {
            const excelEpoch = new Date(1900, 0, 1); // January 1, 1900
            const parsedDate = addDays(excelEpoch, inputInt - 2);
            if (isValid(parsedDate)) {
                return format(parsedDate, CONST.DATE.FNS_FORMAT_STRING);
            }
        }
    }

    return null;
}

export default parseCSVDate;
