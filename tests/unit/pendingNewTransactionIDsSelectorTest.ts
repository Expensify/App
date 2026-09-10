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

    it('returns the same object while the classification is unchanged, so an unrelated metadata write does not re-render subscribers', () => {
        const flagKey = `tx:${Date.now()}`;
        const flags = {[flagKey]: true} as const;

        // The nested flags object survives a merge that touches other fields, so the selector sees the same input.
        const first = pendingNewTransactionIDsSelector({pendingNewTransactionIDs: flags});
        const second = pendingNewTransactionIDsSelector({pendingNewTransactionIDs: flags, isOptimisticReport: true});

        expect(second).toBe(first);
    });

    it('returns a new object once the classification changes, so an expiring flag still reaches subscribers', () => {
        const freshKey = `tx:${Date.now()}`;
        const flags = {[freshKey]: true} as const;
        const first = pendingNewTransactionIDsSelector({pendingNewTransactionIDs: flags});

        const staleFlags = {[`tx:${Date.now() - CONST.PENDING_TRANSACTION_FRESHNESS_WINDOW - 1}`]: true} as const;
        const second = pendingNewTransactionIDsSelector({pendingNewTransactionIDs: staleFlags});

        expect(second).not.toBe(first);
        expect(second?.expiredFlagKeys.length).toBe(1);
    });
});
