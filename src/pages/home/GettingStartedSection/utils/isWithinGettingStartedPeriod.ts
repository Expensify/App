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

    // `firstDayFreeTrial` is a UTC DB-time string ("YYYY-MM-DD HH:mm:ss", no timezone). Parse it as UTC
    // via the repo convention (`fromZonedTime(..., 'UTC')`, as in DateUtils). `new Date(str)` would parse
    // it as LOCAL time, so for users west of UTC the trial start lands in the future for the first several
    // hours after signup → elapsed < 0 → the Getting Started section was wrongly hidden.
    const trialStartMs = fromZonedTime(firstDayFreeTrial, 'UTC').getTime();
    if (Number.isNaN(trialStartMs)) {
        return false;
    }

    const elapsed = Date.now() - trialStartMs;
    return elapsed >= 0 && elapsed <= SIXTY_DAYS_MS;
}

export default isWithinGettingStartedPeriod;
