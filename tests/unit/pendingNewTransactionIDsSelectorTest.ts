import CONST from '@src/CONST';
import {pendingNewTransactionIDsSelector} from '@src/selectors/ReportMetaData';
import type {ReportMetadata} from '@src/types/onyx';

describe('pendingNewTransactionIDsSelector', () => {
    it('classifies a fresh flag as active, a stale one as expired, and drops cleared entries', () => {
        const now = Date.now();
        const freshFlaggedAt = now - 1000;
        const staleFlaggedAt = now - CONST.PENDING_TRANSACTION_FRESHNESS_WINDOW - 1000;
        const metadata: ReportMetadata = {
            pendingNewTransactionIDs: {
                fresh: freshFlaggedAt,
                stale: staleFlaggedAt,
                cleared: null,
            },
        };

        expect(pendingNewTransactionIDsSelector(metadata)).toEqual({activeFlags: {fresh: freshFlaggedAt}, expiredFlags: {stale: staleFlaggedAt}});
    });

    it('keeps the stamp each flag was written with, so a sweep can tell one instance from the next', () => {
        const flaggedAt = Date.now() - 500;
        const metadata: ReportMetadata = {pendingNewTransactionIDs: {tx: flaggedAt}};

        expect(pendingNewTransactionIDsSelector(metadata)?.activeFlags.tx).toBe(flaggedAt);
    });

    it('keeps a pre-migration boolean flag active so it still delivers its one-shot highlight before being consumed', () => {
        const metadata: ReportMetadata = {pendingNewTransactionIDs: {legacy: true}};

        expect(pendingNewTransactionIDsSelector(metadata)).toEqual({activeFlags: {legacy: true}, expiredFlags: {}});
    });

    it('returns undefined when there is nothing to show or sweep', () => {
        expect(pendingNewTransactionIDsSelector(undefined)).toBeUndefined();
        expect(pendingNewTransactionIDsSelector({pendingNewTransactionIDs: {cleared: null}})).toBeUndefined();
    });
});
