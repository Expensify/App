import {addMonths, format, isBefore} from 'date-fns';
import CONST from '@src/CONST';

/**
 * Get the next billing date.
 *
 * @param initialDate - The initial billing date in 'yyyy-MM-dd' format.
 * @returns - The next billing date in 'yyyy-MM-dd' format.
 */
function getNextBillingDate(initialDate: string): string {
    const start = new Date(initialDate);
    let current = new Date(start);

    while (isBefore(current, new Date())) {
        current = addMonths(current, 1);
    }

    return format(current, CONST.DATE.MONTH_DAY_YEAR_FORMAT);
}

export default getNextBillingDate;
