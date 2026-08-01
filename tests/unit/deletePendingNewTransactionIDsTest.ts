import {deletePendingNewTransactionIDs} from '@libs/actions/IOU/PendingNewTransactions';

import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportMetadata} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const REPORT_ID = 'report-sweep-1';
const METADATA_KEY = `${ONYXKEYS.COLLECTION.REPORT_METADATA}${REPORT_ID}` as const;

function readFlags(): Promise<ReportMetadata['pendingNewTransactionIDs']> {
    return new Promise((resolve) => {
        const connection = Onyx.connectWithoutView({
            key: METADATA_KEY,
            callback: (reportMetadata) => {
                Onyx.disconnect(connection);
                resolve(reportMetadata?.pendingNewTransactionIDs);
            },
        });
    });
}

describe('deletePendingNewTransactionIDs', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('clears the flag instance it was scheduled for', async () => {
        await Onyx.set(METADATA_KEY, {pendingNewTransactionIDs: {txA: 1000}});
        await waitForBatchedUpdates();

        deletePendingNewTransactionIDs(REPORT_ID, {txA: 1000});
        await waitForBatchedUpdates();

        // Merging null removes the entry outright rather than leaving a tombstone.
        expect((await readFlags())?.txA).toBeUndefined();
    });

    it('leaves a newer flag for the same transaction untouched, so its highlight is not stolen by a stale sweep', async () => {
        await Onyx.set(METADATA_KEY, {pendingNewTransactionIDs: {txA: 2000}});
        await waitForBatchedUpdates();

        deletePendingNewTransactionIDs(REPORT_ID, {txA: 1000});
        await waitForBatchedUpdates();

        expect((await readFlags())?.txA).toBe(2000);
    });

    it('clears only the instances that still match when a rail holds several flags', async () => {
        await Onyx.set(METADATA_KEY, {pendingNewTransactionIDs: {txA: 1000, txB: 2000}});
        await waitForBatchedUpdates();

        deletePendingNewTransactionIDs(REPORT_ID, {txA: 1000, txB: 1000});
        await waitForBatchedUpdates();

        const flags = await readFlags();
        expect(flags?.txA).toBeUndefined();
        expect(flags?.txB).toBe(2000);
    });

    it('clears a legacy boolean flag it was scheduled for', async () => {
        await Onyx.set(METADATA_KEY, {pendingNewTransactionIDs: {txA: true}});
        await waitForBatchedUpdates();

        deletePendingNewTransactionIDs(REPORT_ID, {txA: true});
        await waitForBatchedUpdates();

        expect((await readFlags())?.txA).toBeUndefined();
    });
});
