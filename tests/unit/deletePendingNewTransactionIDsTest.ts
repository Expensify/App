import {deletePendingNewTransactionIDs} from '@libs/actions/IOU/PendingNewTransactions';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const REPORT_ID = 'report-sweep-1';
const METADATA_KEY = `${ONYXKEYS.COLLECTION.REPORT_METADATA}${REPORT_ID}` as const;

const FLAG_A_EARLY = 'txA:1000';
const FLAG_A_LATE = 'txA:3000';
const FLAG_B = 'txB:1000';
const FLAG_C = 'txC:1000';

const readFlags = async () => (await getOnyxValue(METADATA_KEY))?.pendingNewTransactionIDs;

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
        await Onyx.set(METADATA_KEY, {pendingNewTransactionIDs: {[FLAG_A_EARLY]: true}});
        await waitForBatchedUpdates();

        deletePendingNewTransactionIDs(REPORT_ID, [FLAG_A_EARLY]);
        await waitForBatchedUpdates();

        // Merging null removes the entry outright rather than leaving a tombstone.
        expect((await readFlags())?.[FLAG_A_EARLY]).toBeUndefined();
    });

    it('leaves a flag written after the sweep was armed untouched, so its highlight is not stolen', async () => {
        await Onyx.set(METADATA_KEY, {pendingNewTransactionIDs: {[FLAG_A_EARLY]: true}});
        await waitForBatchedUpdates();

        await Onyx.merge(METADATA_KEY, {pendingNewTransactionIDs: {[FLAG_A_LATE]: true}});
        deletePendingNewTransactionIDs(REPORT_ID, [FLAG_A_EARLY]);
        await waitForBatchedUpdates();

        const flags = await readFlags();
        expect(flags?.[FLAG_A_EARLY]).toBeUndefined();
        expect(flags?.[FLAG_A_LATE]).toBe(true);
    });

    it('leaves a flag written while the sweep is in flight untouched', async () => {
        await Onyx.set(METADATA_KEY, {pendingNewTransactionIDs: {[FLAG_A_EARLY]: true}});
        await waitForBatchedUpdates();

        deletePendingNewTransactionIDs(REPORT_ID, [FLAG_A_EARLY]);
        Onyx.merge(METADATA_KEY, {pendingNewTransactionIDs: {[FLAG_A_LATE]: true}});
        await waitForBatchedUpdates();

        const flags = await readFlags();
        expect(flags?.[FLAG_A_EARLY]).toBeUndefined();
        expect(flags?.[FLAG_A_LATE]).toBe(true);
    });

    it('clears several instances at once and leaves unrelated ones alone', async () => {
        await Onyx.set(METADATA_KEY, {pendingNewTransactionIDs: {[FLAG_A_EARLY]: true, [FLAG_B]: true, [FLAG_C]: true}});
        await waitForBatchedUpdates();

        deletePendingNewTransactionIDs(REPORT_ID, [FLAG_A_EARLY, FLAG_B]);
        await waitForBatchedUpdates();

        const flags = await readFlags();
        expect(flags?.[FLAG_A_EARLY]).toBeUndefined();
        expect(flags?.[FLAG_B]).toBeUndefined();
        expect(flags?.[FLAG_C]).toBe(true);
    });
});
