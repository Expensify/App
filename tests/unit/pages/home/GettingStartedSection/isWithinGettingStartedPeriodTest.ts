import DateUtils from '@libs/DateUtils';

import isWithinGettingStartedPeriod from '@pages/home/GettingStartedSection/utils/isWithinGettingStartedPeriod';

import CONST from '@src/CONST';

const SIXTY_DAYS_MS = 60 * CONST.DATE.SECONDS_PER_DAY * CONST.MILLISECONDS_PER_SECOND;
const ONE_DAY_MS = CONST.DATE.SECONDS_PER_DAY * CONST.MILLISECONDS_PER_SECOND;

describe('isWithinGettingStartedPeriod', () => {
    const originalTZ = process.env.TZ;

    afterEach(() => {
        process.env.TZ = originalTZ;
    });

    it('returns true for a west-of-UTC timezone (America/Los_Angeles) when the trial started ~now in UTC', () => {
        // Regression test for #94135: `firstDayFreeTrial` is a UTC DB-time string ("yyyy-MM-dd HH:mm:ss", no
        // timezone). Parsing it with `new Date(str)` treats it as LOCAL time, so for users west of UTC the
        // trial start lands in the future for the first several hours after signup (elapsed < 0), wrongly
        // hiding the "Getting started" section. It must be parsed as UTC.
        process.env.TZ = 'America/Los_Angeles';
        const firstDayFreeTrial = DateUtils.getDBTime(); // current time as a UTC "yyyy-MM-dd HH:mm:ss" string
        expect(isWithinGettingStartedPeriod(firstDayFreeTrial)).toBe(true);
    });

    it('returns false when no trial start date is provided', () => {
        expect(isWithinGettingStartedPeriod(undefined)).toBe(false);
    });

    it('returns true when the trial started within the last 60 days', () => {
        process.env.TZ = 'America/Los_Angeles';
        const thirtyDaysAgo = DateUtils.getDBTime(Date.now() - 30 * ONE_DAY_MS);
        expect(isWithinGettingStartedPeriod(thirtyDaysAgo)).toBe(true);
    });

    it('returns false when the trial started more than 60 days ago', () => {
        process.env.TZ = 'America/Los_Angeles';
        const sixtyOneDaysAgo = DateUtils.getDBTime(Date.now() - (SIXTY_DAYS_MS + ONE_DAY_MS));
        expect(isWithinGettingStartedPeriod(sixtyOneDaysAgo)).toBe(false);
    });
});
