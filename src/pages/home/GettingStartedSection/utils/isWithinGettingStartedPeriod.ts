import CONST from '@src/CONST';

const SIXTY_DAYS_MS = 60 * CONST.DATE.SECONDS_PER_DAY * CONST.MILLISECONDS_PER_SECOND;

/**
 * Checks if the current date is within 60 days of the trial start date.
 * Returns false if no trial start date is provided.
 */
function isWithinGettingStartedPeriod(firstDayFreeTrial: string | undefined): boolean {
    if (!firstDayFreeTrial) {
        return false;
    }

    const trialStartMs = new Date(firstDayFreeTrial).getTime();
    const elapsed = Date.now() - trialStartMs;
    return elapsed >= 0 && elapsed <= SIXTY_DAYS_MS;
}

export default isWithinGettingStartedPeriod;
