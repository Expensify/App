import {render} from '@testing-library/react-native';

import TransitionTracker from '@libs/Navigation/TransitionTracker';

import DeleteTransactionNavigateBackHandler from '@pages/inbox/DeleteTransactionNavigateBackHandler';

import {setDeleteTransactionNavigateBackUrl} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import type * as Navigation from '@react-navigation/native';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof Navigation>('@react-navigation/native'),
    useIsFocused: jest.fn(() => true),
}));

jest.mock('@libs/Navigation/TransitionTracker', () => ({
    runAfterTransitions: jest.fn(({callback}: {callback: () => void}) => {
        callback();
        return {cancel: jest.fn()};
    }),
}));

const THREAD_REPORT_ID = '1';
const CHAT_REPORT_ID = '2';
const EXPENSE_REPORT_ID = '3';
const IOU_ACTION_ID = '4';
const IOU_ACTION = {
    reportActionID: IOU_ACTION_ID,
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    created: '2026-01-01 00:00:00.000',
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- the backend still sends originalMessage on report actions
    originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, amount: 100, currency: 'USD', IOUTransactionID: '5'},
} as ReportAction;
const REPORT_URL = 'r/123';
const NEXT_REPORT_URL = 'r/456';
const DUPLICATES_REVIEW_URL = 'r/123/duplicates/review';

async function flushClear() {
    await waitForBatchedUpdates();
    await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
    });
    await waitForBatchedUpdates();
}

async function getNavigateBackUrl() {
    return new Promise<string | undefined>((resolve) => {
        const connection = Onyx.connectWithoutView({
            key: ONYXKEYS.RAM_ONLY_PENDING_TRANSACTION_DELETE_URL,
            callback: (value) => {
                connection.unsubscribe();
                resolve(value);
            },
        });
    });
}

describe('DeleteTransactionNavigateBackHandler', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${THREAD_REPORT_ID}`, {reportID: THREAD_REPORT_ID, parentReportID: EXPENSE_REPORT_ID, parentReportActionID: IOU_ACTION_ID});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, {reportID: CHAT_REPORT_ID});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_REPORT_ID}`, {reportID: EXPENSE_REPORT_ID, type: CONST.REPORT.TYPE.EXPENSE});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${EXPENSE_REPORT_ID}`, {[IOU_ACTION_ID]: IOU_ACTION});
        await waitForBatchedUpdates();
    });

    it('clears the navigate back URL when the focused screen unmounts', async () => {
        // Given a focused expense screen that was just deleted, so the URL is set while it is still focused
        const {unmount} = render(<DeleteTransactionNavigateBackHandler reportID={THREAD_REPORT_ID} />);
        await Onyx.set(ONYXKEYS.RAM_ONLY_PENDING_TRANSACTION_DELETE_URL, REPORT_URL);
        await waitForBatchedUpdates();

        // When the native stack pops it, it unmounts without ever rendering unfocused
        unmount();
        await flushClear();

        // Then the URL is cleared so it does not leak into the next expense
        expect(await getNavigateBackUrl()).toBeUndefined();
    });

    it('keeps the navigate back URL while the screen stays focused', async () => {
        // Given a focused expense screen with the URL set
        render(<DeleteTransactionNavigateBackHandler reportID={THREAD_REPORT_ID} />);
        await Onyx.set(ONYXKEYS.RAM_ONLY_PENDING_TRANSACTION_DELETE_URL, REPORT_URL);

        // When nothing navigates away
        await flushClear();

        // Then the URL stays, so the deleted expense does not flash Not Found before the pop
        expect(await getNavigateBackUrl()).toBe(REPORT_URL);
    });

    it('keeps the duplicates review URL when the screen unmounts', async () => {
        // Given a focused screen whose URL points to duplicates review, which clears the URL by itself
        const {unmount} = render(<DeleteTransactionNavigateBackHandler reportID={THREAD_REPORT_ID} />);
        await Onyx.set(ONYXKEYS.RAM_ONLY_PENDING_TRANSACTION_DELETE_URL, DUPLICATES_REVIEW_URL);
        await waitForBatchedUpdates();

        // When the screen unmounts
        unmount();
        await flushClear();

        // Then the URL is left for the duplicates review flow
        expect(await getNavigateBackUrl()).toBe(DUPLICATES_REVIEW_URL);
    });

    it('does not clear a newer deletion URL from a remount clear that is still waiting', async () => {
        // Given a screen that remounts without a deletion, so its clear waits for a later transition
        let pendingCallback: (() => void) | undefined;
        let isCancelled = false;
        jest.mocked(TransitionTracker.runAfterTransitions).mockImplementationOnce(({callback}) => {
            pendingCallback = () => {
                callback();
            };
            return {
                cancel: () => {
                    isCancelled = true;
                },
            };
        });
        const {unmount} = render(<DeleteTransactionNavigateBackHandler reportID={THREAD_REPORT_ID} />);
        await waitForBatchedUpdates();
        unmount();

        // When the next expense is deleted before that transition finishes
        setDeleteTransactionNavigateBackUrl(NEXT_REPORT_URL);
        await waitForBatchedUpdates();
        if (!isCancelled) {
            pendingCallback?.();
        }
        await flushClear();

        // Then the stale clear is cancelled and the new URL stays until its own screen leaves
        expect(isCancelled).toBe(true);
        expect(await getNavigateBackUrl()).toBe(NEXT_REPORT_URL);
    });

    it('keeps the navigate back URL when a non transaction thread report unmounts', async () => {
        // Given a chat report screen while a deletion URL is set
        const {unmount} = render(<DeleteTransactionNavigateBackHandler reportID={CHAT_REPORT_ID} />);
        await Onyx.set(ONYXKEYS.RAM_ONLY_PENDING_TRANSACTION_DELETE_URL, REPORT_URL);
        await waitForBatchedUpdates();

        // When that chat unmounts
        unmount();
        await flushClear();

        // Then the URL stays, since only a deleted transaction thread should clear it on unmount
        expect(await getNavigateBackUrl()).toBe(REPORT_URL);
    });

    it('clears the navigate back URL when the parent data loads after the thread', async () => {
        // Given a thread screen that mounts before its parent expense report and action are loaded
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_REPORT_ID}`, null);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${EXPENSE_REPORT_ID}`, null);
        const {unmount} = render(<DeleteTransactionNavigateBackHandler reportID={THREAD_REPORT_ID} />);
        await waitForBatchedUpdates();

        // When the parent data arrives and then the deleted expense is popped
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_REPORT_ID}`, {reportID: EXPENSE_REPORT_ID, type: CONST.REPORT.TYPE.EXPENSE});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${EXPENSE_REPORT_ID}`, {[IOU_ACTION_ID]: IOU_ACTION});
        await Onyx.set(ONYXKEYS.RAM_ONLY_PENDING_TRANSACTION_DELETE_URL, REPORT_URL);
        await waitForBatchedUpdates();
        unmount();
        await flushClear();

        // Then the screen is still treated as a transaction thread and the URL is cleared
        expect(await getNavigateBackUrl()).toBeUndefined();
    });

    it('does not clear a newer deletion URL from a clear whose frame is still queued', async () => {
        // Given an unmount clear that already passed the transition and queued its animation frame
        let queuedFrame: FrameRequestCallback | undefined;
        const requestAnimationFrameSpy = jest.spyOn(global, 'requestAnimationFrame').mockImplementationOnce((callback) => {
            queuedFrame = callback;
            return 1;
        });
        const cancelAnimationFrameSpy = jest.spyOn(global, 'cancelAnimationFrame');
        const {unmount} = render(<DeleteTransactionNavigateBackHandler reportID={THREAD_REPORT_ID} />);
        await Onyx.set(ONYXKEYS.RAM_ONLY_PENDING_TRANSACTION_DELETE_URL, REPORT_URL);
        await waitForBatchedUpdates();
        unmount();
        await waitForBatchedUpdates();
        expect(queuedFrame).toBeDefined();

        // When the next expense is deleted before that frame runs
        setDeleteTransactionNavigateBackUrl(NEXT_REPORT_URL);
        await waitForBatchedUpdates();

        // Then the queued frame is cancelled and the new URL stays
        expect(cancelAnimationFrameSpy).toHaveBeenCalledWith(1);
        expect(await getNavigateBackUrl()).toBe(NEXT_REPORT_URL);
        requestAnimationFrameSpy.mockRestore();
        cancelAnimationFrameSpy.mockRestore();
    });
});
