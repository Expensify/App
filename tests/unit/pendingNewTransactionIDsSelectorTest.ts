import CONST from '@src/CONST';
import {pendingNewTransactionIDsSelector} from '@src/selectors/ReportMetaData';
import type {ReportMetadata} from '@src/types/onyx';

describe('pendingNewTransactionIDsSelector', () => {
    it('classifies a fresh flag as active, a stale one as expired, and drops cleared entries', () => {
        const now = Date.now();
        const metadata: ReportMetadata = {
            pendingNewTransactionIDs: {
                fresh: now - 1000,
                stale: now - CONST.PENDING_TRANSACTION_FRESHNESS_WINDOW - 1000,
                cleared: null,
            },
        };

        expect(pendingNewTransactionIDsSelector(metadata)).toEqual({activeIDs: {fresh: true}, expiredIDs: ['stale']});
    });

    it('keeps a pre-migration boolean flag active so it still delivers its one-shot highlight before being consumed', () => {
        const metadata: ReportMetadata = {pendingNewTransactionIDs: {legacy: true}};

        expect(pendingNewTransactionIDsSelector(metadata)).toEqual({activeIDs: {legacy: true}, expiredIDs: []});
    });

    it('returns undefined when there is nothing to show or sweep', () => {
        expect(pendingNewTransactionIDsSelector(undefined)).toBeUndefined();
        expect(pendingNewTransactionIDsSelector({pendingNewTransactionIDs: {cleared: null}})).toBeUndefined();
    });
});
