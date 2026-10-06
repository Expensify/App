import {format, isValid, parse} from 'date-fns';

/**
 * Card feeds send the posted date in different formats, for example `yyyyMMdd` (Plaid), `yyyyMMddHHmmss` (Amex),
 * or `yyyy-MM-dd` with an optional time. Only the date part is used.
 */
const POSTED_DATE_REGEX = /^(\d{4})(\d{2})(\d{2})(?:\d{6})?$|^(\d{4})-(\d{2})-(\d{2})(?:[ T].*)?$/;

/**
 * Return the card posted date formatted as `yyyy-MM-dd`, or an empty string if it is missing or invalid.
 */
function getFormattedPostedDate(posted?: string): string {
    if (!posted) {
        return '';
    }
    const match = POSTED_DATE_REGEX.exec(posted);
    if (!match) {
        return '';
    }
    const [year, month, day] = match[1] ? match.slice(1, 4) : match.slice(4, 7);
    const parsedDate = parse(`${year}-${month}-${day}`, 'yyyy-MM-dd', new Date());
    if (!isValid(parsedDate)) {
        return '';
    }
    return format(parsedDate, 'yyyy-MM-dd');
}

export default getFormattedPostedDate;
