import {
    buildNewTransactionFlagForReportTable,
    deletePendingNewTransactionIDs,
    flagNewTransactionForChatPreview,
    wasReportShowingRowsWhenActionBegan,
} from '@libs/actions/IOU/PendingNewTransactions';

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
        // Given a report carrying one flag
        await Onyx.set(METADATA_KEY, {pendingNewTransactionIDs: {[FLAG_A_EARLY]: true}});
        await waitForBatchedUpdates();

        // When the sweep for that flag runs
        deletePendingNewTransactionIDs(REPORT_ID, [FLAG_A_EARLY]);
        await waitForBatchedUpdates();

        // Then the flag is removed outright rather than left as a tombstone
        expect((await readFlags())?.[FLAG_A_EARLY]).toBeUndefined();
    });

    it('leaves a flag written after the sweep was armed untouched, so its highlight is not stolen', async () => {
        // Given a report carrying a flag whose sweep is due
        await Onyx.set(METADATA_KEY, {pendingNewTransactionIDs: {[FLAG_A_EARLY]: true}});
        await waitForBatchedUpdates();

        // When the same transaction is flagged again just before that sweep runs
        await Onyx.merge(METADATA_KEY, {pendingNewTransactionIDs: {[FLAG_A_LATE]: true}});
        deletePendingNewTransactionIDs(REPORT_ID, [FLAG_A_EARLY]);
        await waitForBatchedUpdates();

        // Then only the earlier flag is cleared, so the new one still gets its highlight
        const flags = await readFlags();
        expect(flags?.[FLAG_A_EARLY]).toBeUndefined();
        expect(flags?.[FLAG_A_LATE]).toBe(true);
    });

    it('leaves a flag written while the sweep is in flight untouched', async () => {
        // Given a report carrying one flag
        await Onyx.set(METADATA_KEY, {pendingNewTransactionIDs: {[FLAG_A_EARLY]: true}});
        await waitForBatchedUpdates();

        // When its sweep starts and the same transaction is flagged again before the sweep lands
        deletePendingNewTransactionIDs(REPORT_ID, [FLAG_A_EARLY]);
        Onyx.merge(METADATA_KEY, {pendingNewTransactionIDs: {[FLAG_A_LATE]: true}});
        await waitForBatchedUpdates();

        // Then the sweep clears only the flag it was for, and the new one survives
        const flags = await readFlags();
        expect(flags?.[FLAG_A_EARLY]).toBeUndefined();
        expect(flags?.[FLAG_A_LATE]).toBe(true);
    });

    it('clears several instances at once and leaves unrelated ones alone', async () => {
        // Given a report carrying flags for three transactions
        await Onyx.set(METADATA_KEY, {pendingNewTransactionIDs: {[FLAG_A_EARLY]: true, [FLAG_B]: true, [FLAG_C]: true}});
        await waitForBatchedUpdates();

        // When one sweep clears two of them
        deletePendingNewTransactionIDs(REPORT_ID, [FLAG_A_EARLY, FLAG_B]);
        await waitForBatchedUpdates();

        // Then those two are gone and the one it did not name remains
        const flags = await readFlags();
        expect(flags?.[FLAG_A_EARLY]).toBeUndefined();
        expect(flags?.[FLAG_B]).toBeUndefined();
        expect(flags?.[FLAG_C]).toBe(true);
    });
});

describe('flagNewTransactionForChatPreview', () => {
    const CHAT_REPORT_ID = 'chat-rail-1';
    const CHAT_METADATA_KEY = `${ONYXKEYS.COLLECTION.REPORT_METADATA}${CHAT_REPORT_ID}` as const;
    const FLAGGED_AT = 1700000000000;
    let dateNowSpy: jest.SpyInstance;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(FLAGGED_AT);
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        dateNowSpy.mockRestore();
    });

    it("flags the transaction in the chat's own metadata, since that is the rail the preview in that chat reads", async () => {
        // Given an expense that has just landed in a chat the user is being returned to
        // When the chat preview's rail is written
        flagNewTransactionForChatPreview({chatReportID: CHAT_REPORT_ID, transactionID: 'txA'});
        await waitForBatchedUpdates();

        // Then the chat holds one flag, keyed by the instance this write created
        expect((await getOnyxValue(CHAT_METADATA_KEY))?.pendingNewTransactionIDs).toEqual({[`txA:${FLAGGED_AT}`]: true});
    });

    it('keeps an earlier flag on the same chat, so two expenses added in a row both highlight', async () => {
        // Given a chat already carrying a flag from an earlier add
        await Onyx.set(CHAT_METADATA_KEY, {pendingNewTransactionIDs: {[FLAG_B]: true}});
        await waitForBatchedUpdates();

        // When a second expense is flagged for the same chat
        flagNewTransactionForChatPreview({chatReportID: CHAT_REPORT_ID, transactionID: 'txA'});
        await waitForBatchedUpdates();

        // Then both instances are on the rail
        expect((await getOnyxValue(CHAT_METADATA_KEY))?.pendingNewTransactionIDs).toEqual({[FLAG_B]: true, [`txA:${FLAGGED_AT}`]: true});
    });
});

describe('wasReportShowingRowsWhenActionBegan', () => {
    it("answers every add of one run from the first add's reading, since by the second the report holds the first", () => {
        // Given a report that was empty when the action began
        const isShowingRowsNow = jest.fn<boolean, []>().mockReturnValueOnce(false).mockReturnValue(true);

        // When two adds in the same run ask about it
        const first = wasReportShowingRowsWhenActionBegan('report-run-1', isShowingRowsNow);
        const second = wasReportShowingRowsWhenActionBegan('report-run-1', isShowingRowsNow);

        // Then both get the first reading, and the report was read once
        expect([first, second]).toEqual([false, false]);
        expect(isShowingRowsNow).toHaveBeenCalledTimes(1);
    });

    it('reads the report again in a later run, which is a different action', async () => {
        // Given a report answered in one run
        const isShowingRowsNow = jest.fn<boolean, []>().mockReturnValueOnce(false).mockReturnValue(true);
        expect(wasReportShowingRowsWhenActionBegan('report-run-2', isShowingRowsNow)).toBe(false);

        // When the run ends
        await Promise.resolve();

        // Then the next add reads the report as it now stands
        expect(wasReportShowingRowsWhenActionBegan('report-run-2', isShowingRowsNow)).toBe(true);
        expect(isShowingRowsNow).toHaveBeenCalledTimes(2);
    });

    it('answers each report of one run separately, since a run that splits reports fills more than one', () => {
        // Given two destinations in one run, only one of which was showing rows
        const isShowingRowsNow = jest.fn<boolean, []>().mockReturnValueOnce(true).mockReturnValueOnce(false);

        // When each is asked about, then asked again
        const firstReport = wasReportShowingRowsWhenActionBegan('report-run-3a', isShowingRowsNow);
        const secondReport = wasReportShowingRowsWhenActionBegan('report-run-3b', isShowingRowsNow);

        // Then neither inherits the other's answer
        expect([firstReport, secondReport]).toEqual([true, false]);
        expect(wasReportShowingRowsWhenActionBegan('report-run-3a', isShowingRowsNow)).toBe(true);
        expect(wasReportShowingRowsWhenActionBegan('report-run-3b', isShowingRowsNow)).toBe(false);
        expect(isShowingRowsNow).toHaveBeenCalledTimes(2);
    });
});

describe('buildNewTransactionFlagForReportTable', () => {
    const EXPENSE_REPORT_ID = 'expense-rail-1';
    const WRITTEN_AT = 1000;
    const LATER = 2000;
    const WRITTEN_FLAG = `txA:${WRITTEN_AT}`;

    it('rolls back the instance it wrote, even though the clock moved on between the two updates', () => {
        // Given a clock that would stamp a second key differently
        const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValueOnce(WRITTEN_AT).mockReturnValueOnce(LATER);

        // When the optimistic write and its rollback are built together
        const {optimisticUpdate, failureUpdate} = buildNewTransactionFlagForReportTable({expenseReportID: EXPENSE_REPORT_ID, transactionID: 'txA'});

        // Then both name the expense report's rail, and the rollback clears the one key the write added
        const expectedKey = `${ONYXKEYS.COLLECTION.REPORT_METADATA}${EXPENSE_REPORT_ID}`;
        expect(optimisticUpdate).toEqual(expect.objectContaining({key: expectedKey, value: {pendingNewTransactionIDs: {[WRITTEN_FLAG]: true}}}));
        expect(failureUpdate).toEqual(expect.objectContaining({key: expectedKey, value: {pendingNewTransactionIDs: {[WRITTEN_FLAG]: null}}}));

        dateNowSpy.mockRestore();
    });
});
