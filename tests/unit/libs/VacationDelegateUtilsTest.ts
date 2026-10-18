import {
    formatVacationDelegateClearDateTime,
    getActiveVacationDelegate,
    getVacationDelegateClearAfter,
    getVacationDelegateClearDate,
    getVacationDelegateClearDateTime,
    getVacationDelegateLocalClearDateTime,
    isVacationDelegateClearAfterTooSoon,
    isVacationDelegateClearDatePassed,
    isVacationDelegateExpired,
} from '@libs/VacationDelegateUtils';

describe('VacationDelegateUtils', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2026-09-28T12:00:00Z'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('getVacationDelegateLocalClearDateTime', () => {
        it('takes the day from the date and only the time from the time picker value', () => {
            // Given a picked day and a time picker value whose own date is a different day
            // When they are combined
            // Then the result keeps the picked day, since the time picker's date part is meaningless
            expect(getVacationDelegateLocalClearDateTime('2026-10-01', '2026-09-28 17:30:00')).toBe('2026-10-01 17:30:00');
        });

        it('falls back to the end of the day when no time is picked, and to nothing when no day is picked', () => {
            // Given a day without a time, and no day at all
            // When they are combined
            // Then the day ends at 23:59:59 so the delegate covers all of it, and no day means the delegate never clears
            expect(getVacationDelegateLocalClearDateTime('2026-10-01', undefined)).toBe('2026-10-01 23:59:59');
            expect(getVacationDelegateLocalClearDateTime('', '2026-09-28 17:30:00')).toBe('');
        });
    });

    describe('getVacationDelegateClearAfter', () => {
        it('converts the picked day and time to UTC in the given timezone', () => {
            // Given 5:30 PM on Oct 1 picked in Los Angeles, which is 7 hours behind UTC during daylight saving time
            // When it is converted for the backend
            // Then the backend gets the same moment in UTC
            expect(getVacationDelegateClearAfter('2026-10-01', '2026-09-28 17:30:00', 'America/Los_Angeles')).toBe('2026-10-02 00:30:00');
        });

        it('converts a day without a time to the UTC end of that day in the given timezone', () => {
            // Given a day picked in Los Angeles with no time, where Oct 1 ends at 06:59:59 UTC on Oct 2 during daylight saving time
            // When it is converted for the backend
            // Then the delegate stays active for the whole picked day, not just until midnight UTC
            expect(getVacationDelegateClearAfter('2026-10-01', undefined, 'America/Los_Angeles')).toBe('2026-10-02 06:59:59');
        });

        it('returns undefined when no day is picked, so the delegate never clears', () => {
            // Given no picked day
            // When it is converted for the backend
            // Then nothing is sent, since the date is optional
            expect(getVacationDelegateClearAfter('', '2026-09-28 17:30:00', 'America/Los_Angeles')).toBeUndefined();
        });
    });

    describe('getVacationDelegateClearDateTime', () => {
        it('converts the UTC clear after datetime back into the picked day and time', () => {
            // Given the datetime the backend stored for 5:30 PM on Oct 1 picked in Los Angeles
            // When it is read back in the same timezone
            // Then it shows the day and time that were picked, not the UTC ones
            expect(getVacationDelegateClearDateTime('2026-10-02 00:30:00', 'America/Los_Angeles')).toBe('2026-10-01 17:30:00');
            expect(getVacationDelegateClearDateTime(undefined, 'America/Los_Angeles')).toBe('');
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

    describe('formatVacationDelegateClearDateTime', () => {
        it('formats the day and time for display and ignores an invalid one', () => {
            // Given a valid and an invalid datetime
            // When they are formatted
            // Then the valid one reads as a short date with a time and the invalid one shows nothing instead of throwing
            expect(formatVacationDelegateClearDateTime('2026-10-01 17:30:00', undefined)).toBe('Oct 1, 2026 5:30 PM');
            expect(formatVacationDelegateClearDateTime('not a date', undefined)).toBe('');
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

    describe('getActiveVacationDelegate', () => {
        it('returns the delegate only while it is still in effect', () => {
            // Given the current time is 2026-09-28 12:00 UTC
            // When a delegate that clears later, one that never clears, one that already cleared, and no delegate are checked
            // Then only the first two are still in effect, so every screen hides an expired delegate the same way
            expect(getActiveVacationDelegate({delegate: 'jane@example.com', clearAfter: '2026-09-28 12:00:01'})).toBe('jane@example.com');
            expect(getActiveVacationDelegate({delegate: 'jane@example.com'})).toBe('jane@example.com');
            expect(getActiveVacationDelegate({delegate: 'jane@example.com', clearAfter: '2026-09-28 11:59:59'})).toBeUndefined();
            expect(getActiveVacationDelegate(undefined)).toBeUndefined();
        });
    });

    describe('isVacationDelegateClearDatePassed', () => {
        it('reads the clear date in the Profile timezone, not the device timezone', () => {
            // Given it is 2026-10-08 03:00 UTC: still Oct 7 in Los Angeles, already Oct 8 in Tokyo, and Oct 8 on the UTC test device
            jest.setSystemTime(new Date('2026-10-08T03:00:00Z'));

            // When Oct 7 is checked for a user whose Profile timezone is Los Angeles, and for one whose Profile timezone is Tokyo
            // Then it is still open in Los Angeles, even though the device's day has moved on, and it has ended in Tokyo
            expect(isVacationDelegateClearDatePassed('2026-10-07', 'America/Los_Angeles')).toBe(false);
            expect(isVacationDelegateClearDatePassed('2026-10-07', 'Asia/Tokyo')).toBe(true);
            expect(isVacationDelegateClearDatePassed('2026-10-06', 'America/Los_Angeles')).toBe(true);
            expect(isVacationDelegateClearDatePassed('2026-10-08', 'Asia/Tokyo')).toBe(false);
        });

        it('treats a date that does not parse as passed', () => {
            // Given a clear date that isn't a yyyy-MM-dd date
            // When it is checked
            // Then it is rejected, so the form shows the invalid date error instead of building a clearAfter from it
            expect(isVacationDelegateClearDatePassed('not-a-date', 'America/Los_Angeles')).toBe(true);
        });
    });

    describe('isVacationDelegateClearAfterTooSoon', () => {
        it('is true when the clear after datetime is less than one minute from now', () => {
            // Given the current time is 2026-09-28 12:00 UTC
            // When a time 30 seconds ahead, exactly one minute ahead, and no time are checked
            // Then only the one under a minute ahead is too soon, since it could clear while the save request is in flight
            expect(isVacationDelegateClearAfterTooSoon('2026-09-28 12:00:30')).toBe(true);
            expect(isVacationDelegateClearAfterTooSoon('2026-09-28 12:01:00')).toBe(false);
            expect(isVacationDelegateClearAfterTooSoon(undefined)).toBe(false);
        });
    });
});
