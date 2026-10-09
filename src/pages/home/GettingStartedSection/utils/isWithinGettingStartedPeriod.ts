import CONST from '@src/CONST';

import {fromZonedTime} from 'date-fns-tz';

const SIXTY_DAYS_MS = 60 * CONST.DATE.SECONDS_PER_DAY * CONST.MILLISECONDS_PER_SECOND;

/**
 * Checks if the current date is within 60 days of the onboarding start date. Paid plans pass their trial start date.
 * Free plans such as Submit never start a trial, so they pass their workspace creation time instead.
 * Returns false if no start date is provided.
 */
function isWithinGettingStartedPeriod(onboardingStartDate: string | undefined): boolean {
    if (!onboardingStartDate) {
        return false;
    }

    // These are UTC DB timestamps without a timezone suffix, so parse them as UTC.
    const startMs = fromZonedTime(onboardingStartDate, 'UTC').getTime();
    if (Number.isNaN(startMs)) {
        return false;
    }

    const elapsed = Date.now() - startMs;
    return elapsed >= 0 && elapsed <= SIXTY_DAYS_MS;
}

export default isWithinGettingStartedPeriod;
