import {getTimeForDisplay} from '@libs/PerDiemRequestUtils';

import type {Transaction} from '@src/types/onyx';

import createRandomTransaction from '../utils/collections/transaction';

function buildPerDiemTransaction(start: string, end: string): Transaction {
    const transaction = createRandomTransaction(1);
    return {
        ...transaction,
        comment: {
            ...transaction.comment,
            customUnit: {customUnitID: 'per-diem', attributes: {dates: {start, end}}},
        },
    };
}

describe('PerDiemRequestUtils.getTimeForDisplay', () => {
    it('shows each time with a readable date instead of the machine date', () => {
        // Given a per-diem expense that runs from noon on one day to noon the next, read in UTC as the test runner is
        const transaction = buildPerDiemTransaction('2026-01-22T12:00:00Z', '2026-01-23T12:00:00Z');

        // When its time range is shown on the confirmation page
        // Then each end shows the time and an abbreviated date, rather than the `yyyy-MM-dd` it is stored as
        expect(getTimeForDisplay(transaction, undefined)).toBe('12:00 PM, Jan 22, 2026 - 12:00 PM, Jan 23, 2026');
    });

    it('leaves an end blank when its date cannot be read', () => {
        // Given a per-diem expense whose end date is not a valid date
        const transaction = buildPerDiemTransaction('2026-01-22T12:00:00Z', 'not a date');

        // When its time range is shown
        // Then the unreadable end is blank instead of the confirmation page throwing a RangeError
        expect(getTimeForDisplay(transaction, undefined)).toBe('12:00 PM, Jan 22, 2026 - ');
    });
});
