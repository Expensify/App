import {buildClearedPendingNewTransactionFlags, buildPendingNewTransactionFlagKey, parsePendingNewTransactionFlagKey} from '@libs/PendingNewTransactionFlags';

describe('PendingNewTransactionFlags', () => {
    it('round-trips a transaction ID and its stamp', () => {
        // Given a flag written for a transaction at a known time
        const flagKey = buildPendingNewTransactionFlagKey('tx1', 1700000000000);

        // When its key is read back
        // Then the same transaction and time come back: the row to highlight and when its highlight expires
        expect(parsePendingNewTransactionFlagKey(flagKey)).toEqual({transactionID: 'tx1', flaggedAt: 1700000000000});
    });

    it('round-trips a transaction ID that itself contains the separator', () => {
        // Given a flag for a transaction whose ID contains colons
        const flagKey = buildPendingNewTransactionFlagKey('tx:with:colons', 1700000000000);

        // When its key is read back
        // Then the whole ID comes back, not a fragment that matches no row
        expect(parsePendingNewTransactionFlagKey(flagKey)).toEqual({transactionID: 'tx:with:colons', flaggedAt: 1700000000000});
    });

    it('gives two writes for the same transaction different keys, so one sweep cannot clear the other', () => {
        // Given the same transaction flagged twice at different times
        // When a key is built for each write
        // Then the keys differ, so sweeping the first leaves the second in place
        expect(buildPendingNewTransactionFlagKey('tx1', 1000)).not.toBe(buildPendingNewTransactionFlagKey('tx1', 2000));
    });

    it('does not parse a key with no stamp or a non-numeric one', () => {
        // Given keys with no time, or with one that is not a number
        // When they are read
        // Then neither yields a flag, so it is swept rather than highlighted
        expect(parsePendingNewTransactionFlagKey('tx1')).toBeUndefined();
        expect(parsePendingNewTransactionFlagKey('tx1:notANumber')).toBeUndefined();
    });

    it('maps every key to null so an Onyx merge removes exactly those entries', () => {
        // Given two flags to sweep
        const firstFlagKey = 'tx1:1000';
        const secondFlagKey = 'tx2:2000';

        // When the clearing update is built for them
        // Then each maps to null, which a merge deletes outright
        expect(buildClearedPendingNewTransactionFlags([firstFlagKey, secondFlagKey])).toEqual({[firstFlagKey]: null, [secondFlagKey]: null});

        // When it is built for no flags
        // Then it clears nothing
        expect(buildClearedPendingNewTransactionFlags([])).toEqual({});
    });
});
