import {buildClearedPendingNewTransactionFlags, buildPendingNewTransactionFlagKey, parsePendingNewTransactionFlagKey} from '@libs/PendingNewTransactionFlags';

describe('PendingNewTransactionFlags', () => {
    it('round-trips a transaction ID and its stamp', () => {
        const flagKey = buildPendingNewTransactionFlagKey('tx1', 1700000000000);

        expect(parsePendingNewTransactionFlagKey(flagKey)).toEqual({transactionID: 'tx1', flaggedAt: 1700000000000});
    });

    it('round-trips a transaction ID that itself contains the separator', () => {
        const flagKey = buildPendingNewTransactionFlagKey('tx:with:colons', 1700000000000);

        expect(parsePendingNewTransactionFlagKey(flagKey)).toEqual({transactionID: 'tx:with:colons', flaggedAt: 1700000000000});
    });

    it('gives two writes for the same transaction different keys, so one sweep cannot clear the other', () => {
        expect(buildPendingNewTransactionFlagKey('tx1', 1000)).not.toBe(buildPendingNewTransactionFlagKey('tx1', 2000));
    });

    it('does not parse a key with no stamp or a non-numeric one', () => {
        expect(parsePendingNewTransactionFlagKey('tx1')).toBeUndefined();
        expect(parsePendingNewTransactionFlagKey('tx1:notANumber')).toBeUndefined();
    });

    it('maps every key to null so an Onyx merge removes exactly those entries', () => {
        const firstFlagKey = 'tx1:1000';
        const secondFlagKey = 'tx2:2000';

        expect(buildClearedPendingNewTransactionFlags([firstFlagKey, secondFlagKey])).toEqual({[firstFlagKey]: null, [secondFlagKey]: null});
        expect(buildClearedPendingNewTransactionFlags([])).toEqual({});
    });
});
