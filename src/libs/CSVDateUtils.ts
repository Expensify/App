import {addDays, format, isValid, parse} from 'date-fns';
import CONST from '@src/CONST';

/**
 * Common date formats to try when parsing CSV dates. Order matters: more
 * specific / more common formats are tried first.
 */
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

/**
 * Parses a date string from a variety of common CSV formats and returns it in
 * `yyyy-MM-dd`. Returns null when the input cannot be parsed as a date.
 *
 * The yyyy-MM-dd format is tried via `date-fns.parse` before falling back to
 * the native Date constructor so that bare ISO dates (e.g. `2024-01-15`) are
 * interpreted in the local timezone instead of being shifted by UTC midnight
 * in zones west of UTC.
 */
function parseCSVDate(input: string): string | null {
    if (!input || typeof input !== 'string') {
        return null;
    }

    const trimmedInput = input.trim();

    // Try the explicit formats first. The native `Date` constructor parses
    // bare ISO dates (e.g. "2024-01-15") as UTC midnight, which would shift to
    // the previous day in any zone west of UTC once formatted back. The
    // format list starts with `yyyy-MM-dd` so those inputs are interpreted in
    // local time and round-trip cleanly.
    for (const dateFormat of CSV_DATE_FORMATS) {
        const parsedDate = parse(trimmedInput, dateFormat, new Date());
        if (isValid(parsedDate)) {
            return format(parsedDate, CONST.DATE.FNS_FORMAT_STRING);
        }
    }

    // Fall back to the native Date constructor for anything else (ISO 8601
    // date-time strings, RFC 2822, etc).
    let date = new Date(trimmedInput);
    if (isValid(date) && !Number.isNaN(date.getTime())) {
        return format(date, CONST.DATE.FNS_FORMAT_STRING);
    }

    // If still unparsed, try just the first 10 characters in case the input
    // is a longer string with a date prefix.
    if (trimmedInput.length > 10) {
        const shortInput = trimmedInput.substring(0, 10);
        for (const dateFormat of CSV_DATE_FORMATS) {
            const parsedDate = parse(shortInput, dateFormat, new Date());
            if (isValid(parsedDate)) {
                return format(parsedDate, CONST.DATE.FNS_FORMAT_STRING);
            }
        }
        date = new Date(shortInput);
        if (isValid(date) && !Number.isNaN(date.getTime())) {
            return format(date, CONST.DATE.FNS_FORMAT_STRING);
        }
    }

    // Maybe it's an Excel serial date number. Excel stores dates serialized
    // from January 1st 1900 (with 1/1/1900 being 1), and incorrectly treats
    // 1900 as a leap year, so we subtract 2 days when converting.
    if (/^\d+$/.test(trimmedInput)) {
        const inputInt = parseInt(trimmedInput, 10);
        if (inputInt > 0 && inputInt < 100000) {
            const excelEpoch = new Date(1900, 0, 1);
            const parsedDate = addDays(excelEpoch, inputInt - 2);
            if (isValid(parsedDate)) {
                return format(parsedDate, CONST.DATE.FNS_FORMAT_STRING);
            }
        }
    }

    return null;
}

export default parseCSVDate;
