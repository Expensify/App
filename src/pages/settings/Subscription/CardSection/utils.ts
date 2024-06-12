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

    const current = new Date(start);

    const monthsDiff = differenceInMonths(current, start);
    const nextBillingDate = addDays(addMonths(start, monthsDiff + 1), 1);

    return format(nextBillingDate, CONST.DATE.MONTH_DAY_YEAR_FORMAT);
}

export default getNextBillingDate;
