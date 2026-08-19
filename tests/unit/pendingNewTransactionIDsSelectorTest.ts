import CONST from '@src/CONST';
import {pendingNewTransactionIDsSelector} from '@src/selectors/ReportMetaData';
import type {ReportMetadata} from '@src/types/onyx';

describe('pendingNewTransactionIDsSelector', () => {
    it('classifies a fresh flag as active, a stale one as expired, and drops cleared entries', () => {
        const now = Date.now();
        const freshKey = `fresh:${now - 1000}`;
        const staleKey = `stale:${now - CONST.PENDING_TRANSACTION_FRESHNESS_WINDOW - 1000}`;
        const clearedKey = 'cleared:1000';
        const metadata: ReportMetadata = {
            pendingNewTransactionIDs: {
                [freshKey]: true,
                [staleKey]: true,
                [clearedKey]: null,
            },
        };

        expect(pendingNewTransactionIDsSelector(metadata)).toEqual({activeFlagKeys: {fresh: freshKey}, expiredFlagKeys: [staleKey]});
    });

    it('maps a transaction to the flag instance to sweep, so a sweep clears exactly the flag it saw', () => {
        const flagKey = `tx:${Date.now() - 500}`;
        const metadata: ReportMetadata = {pendingNewTransactionIDs: {[flagKey]: true}};

        expect(pendingNewTransactionIDsSelector(metadata)?.activeFlagKeys.tx).toBe(flagKey);
    });

    it('keeps the newest of two live instances active and sweeps the older one', () => {
        const now = Date.now();
        const olderKey = `tx:${now - 2000}`;
        const newerKey = `tx:${now - 100}`;
        const metadata: ReportMetadata = {pendingNewTransactionIDs: {[olderKey]: true, [newerKey]: true}};

        expect(pendingNewTransactionIDsSelector(metadata)).toEqual({activeFlagKeys: {tx: newerKey}, expiredFlagKeys: [olderKey]});
    });

    it('sweeps an unreadable key instead of highlighting it, so it cannot linger past its window', () => {
        const metadata: ReportMetadata = {pendingNewTransactionIDs: {unreadable: true}};

        expect(pendingNewTransactionIDsSelector(metadata)).toEqual({activeFlagKeys: {}, expiredFlagKeys: ['unreadable']});
    });

    it('returns undefined when there is nothing to show or sweep', () => {
        const clearedKey = 'cleared:1000';
        expect(pendingNewTransactionIDsSelector(undefined)).toBeUndefined();
        expect(pendingNewTransactionIDsSelector({pendingNewTransactionIDs: {[clearedKey]: null}})).toBeUndefined();
    });
});
