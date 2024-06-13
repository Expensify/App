import {addDays, addMonths, differenceInMonths, format, isValid} from 'date-fns';
import CONST from '@src/CONST';

/**
 * Get the next billing date.
 *
 * @param initialDate - The initial billing date in 'yyyy-MM-dd' format.
 * @returns - The next billing date in 'yyyy-MM-dd' format.
 */
function getNextBillingDate(initialDate: string): string {
    let start = new Date(`${initialDate}T00:00:00`);

    if (!isValid(start)) {
        start = new Date();
    }

    const today = new Date();

    const monthsDiff = differenceInMonths(today, start);

    let nextBillingDate = addDays(addMonths(start, monthsDiff), 1);

    if (nextBillingDate.toUTCString() < today.toUTCString()) {
        nextBillingDate = addMonths(nextBillingDate, 1);
    }

    return format(nextBillingDate, CONST.DATE.MONTH_DAY_YEAR_FORMAT);
}

export default getNextBillingDate;
