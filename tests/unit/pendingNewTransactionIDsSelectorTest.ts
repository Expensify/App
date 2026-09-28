import CONST from '@src/CONST';
import {pendingNewTransactionIDsSelector} from '@src/selectors/ReportMetaData';
import type {ReportMetadata} from '@src/types/onyx';

describe('pendingNewTransactionIDsSelector', () => {
    it('classifies a fresh flag as active, a stale one as expired, and drops cleared entries', () => {
        // Given a report carrying a fresh flag, one older than the highlight window, and one already cleared
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

        // When the selector reads it
        // Then the fresh flag highlights, the stale one is swept, and the cleared one is ignored
        expect(pendingNewTransactionIDsSelector(metadata)).toEqual({activeFlagKeys: {fresh: freshKey}, expiredFlagKeys: [staleKey]});
    });

    it('maps a transaction to the flag instance to sweep, so a sweep clears exactly the flag it saw', () => {
        // Given a report carrying one fresh flag
        const flagKey = `tx:${Date.now() - 500}`;
        const metadata: ReportMetadata = {pendingNewTransactionIDs: {[flagKey]: true}};

        // When the selector reads it
        // Then the transaction maps to that exact flag, so its sweep cannot clear a newer one
        expect(pendingNewTransactionIDsSelector(metadata)?.activeFlagKeys.tx).toBe(flagKey);
    });

    it('keeps the newest of two live instances active and sweeps the older one', () => {
        // Given a transaction flagged twice, both within the highlight window
        const now = Date.now();
        const olderKey = `tx:${now - 2000}`;
        const newerKey = `tx:${now - 100}`;
        const metadata: ReportMetadata = {pendingNewTransactionIDs: {[olderKey]: true, [newerKey]: true}};

        // When the selector reads the report
        // Then the newer flag highlights and the older one is swept rather than left behind
        expect(pendingNewTransactionIDsSelector(metadata)).toEqual({activeFlagKeys: {tx: newerKey}, expiredFlagKeys: [olderKey]});
    });

    it('sweeps an unreadable key instead of highlighting it, so it cannot linger past its window', () => {
        // Given a report carrying a flag with no readable time
        const metadata: ReportMetadata = {pendingNewTransactionIDs: {unreadable: true}};

        // When the selector reads it
        // Then it is swept, since with no time it could never expire
        expect(pendingNewTransactionIDsSelector(metadata)).toEqual({activeFlagKeys: {}, expiredFlagKeys: ['unreadable']});
    });

    it('returns undefined when there is nothing to show or sweep', () => {
        // Given a report with no metadata, and one whose only flag was already cleared
        const clearedKey = 'cleared:1000';

        // When the selector reads each
        // Then it returns nothing, so neither report has a highlight or sweep to run
        expect(pendingNewTransactionIDsSelector(undefined)).toBeUndefined();
        expect(pendingNewTransactionIDsSelector({pendingNewTransactionIDs: {[clearedKey]: null}})).toBeUndefined();
    });
});
