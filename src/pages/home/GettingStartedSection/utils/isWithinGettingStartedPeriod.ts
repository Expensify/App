import {fromZonedTime} from 'date-fns-tz';
import CONST from '@src/CONST';

import {fromZonedTime} from 'date-fns-tz';

const SIXTY_DAYS_MS = 60 * CONST.DATE.SECONDS_PER_DAY * CONST.MILLISECONDS_PER_SECOND;

/**
 * Checks if the current date is within 60 days of the trial start date.
 * Returns false if no trial start date is provided.
 */
function isWithinGettingStartedPeriod(firstDayFreeTrial: string | undefined): boolean {
    if (!firstDayFreeTrial) {
        return false;
    }

    // Trial dates are UTC DB timestamps without a timezone suffix, so parse them as UTC.
    const trialStartMs = fromZonedTime(firstDayFreeTrial, 'UTC').getTime();
    if (Number.isNaN(trialStartMs)) {
        return false;
    }

    const elapsed = Date.now() - trialStartMs;
    return elapsed >= 0 && elapsed <= SIXTY_DAYS_MS;
}

export default isWithinGettingStartedPeriod;
