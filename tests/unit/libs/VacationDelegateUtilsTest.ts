import {formatVacationDelegateClearDate, getVacationDelegateClearAfter, getVacationDelegateClearDate, isVacationDelegateExpired} from '@libs/VacationDelegateUtils';

describe('VacationDelegateUtils', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2026-09-28T12:00:00Z'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('getVacationDelegateClearAfter', () => {
        it('converts the picked day to the UTC end of that day in the given timezone', () => {
            // Given a day picked in Los Angeles, where Oct 1 ends at 06:59:59 UTC on Oct 2 during daylight saving time
            // When it is converted for the backend
            // Then the delegate stays active for the whole picked day, not just until midnight UTC
            expect(getVacationDelegateClearAfter('2026-10-01', 'America/Los_Angeles')).toBe('2026-10-02 06:59:59');
        });

        it('returns undefined when no day is picked, so the delegate never clears', () => {
            // Given no picked day
            // When it is converted for the backend
            // Then nothing is sent, since the date is optional
            expect(getVacationDelegateClearAfter('', 'America/Los_Angeles')).toBeUndefined();
        });
    });

    describe('getVacationDelegateClearDate', () => {
        it('converts the UTC clear after datetime back into the picked day', () => {
            // Given the datetime the backend stored for a day picked in Los Angeles
            // When it is read back in the same timezone
            // Then it shows the day that was picked, not the next UTC day
            expect(getVacationDelegateClearDate('2026-10-02 06:59:59', 'America/Los_Angeles')).toBe('2026-10-01');
        });
    });

    describe('formatVacationDelegateClearDate', () => {
        it('formats the day for display and ignores an invalid one', () => {
            // Given a valid and an invalid day
            // When they are formatted
            // Then the valid one reads as a short date and the invalid one shows nothing instead of throwing
            expect(formatVacationDelegateClearDate('2026-10-01', undefined)).toBe('Oct 1, 2026');
            expect(formatVacationDelegateClearDate('not a date', undefined)).toBe('');
        });
    });

    describe('isVacationDelegateExpired', () => {
        it('is true only once the clear after datetime has passed', () => {
            // Given the current time is 2026-09-28 12:00 UTC
            // When a time before it, a time after it, and no time are checked
            // Then only the past one counts as expired, so a delegate that never clears stays active
            expect(isVacationDelegateExpired('2026-09-28 11:59:59')).toBe(true);
            expect(isVacationDelegateExpired('2026-09-28 12:00:01')).toBe(false);
            expect(isVacationDelegateExpired(undefined)).toBe(false);
        });
    });
});
