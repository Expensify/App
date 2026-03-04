import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import usePendingConciergeResponse from '@hooks/usePendingConciergeResponse';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import getOnyxValue from '../../utils/getOnyxValue';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const REPORT_ID = '1';
const REPORT_ACTION_ID = '100';

/** Short delay used for tests where we need the timer to actually fire (ms) */
const SHORT_DELAY = 80;

const fakeConciergeAction = {
    reportActionID: REPORT_ACTION_ID,
    actorAccountID: CONST.ACCOUNT_ID.CONCIERGE,
    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    message: [{html: 'To set up QuickBooks, go to Settings...', text: 'To set up QuickBooks, go to Settings...', type: CONST.REPORT.MESSAGE.TYPE.COMMENT}],
} as ReportAction;

/** Wait for a given number of ms (real timer) */
function delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

describe('usePendingConciergeResponse', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('should move the pending action to REPORT_ACTIONS after the delay', async () => {
        // Given a pending concierge response with a short future delay
        await Onyx.merge(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${REPORT_ID}`, {
            reportAction: fakeConciergeAction,
            displayAfter: Date.now() + SHORT_DELAY,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${REPORT_ID}`, {
            [CONST.ACCOUNT_ID.CONCIERGE]: true,
        });
        await waitForBatchedUpdates();

        renderHook(() => usePendingConciergeResponse(REPORT_ID));
        await waitForBatchedUpdates();

        // When the delay elapses
        await delay(SHORT_DELAY + 50);
        await waitForBatchedUpdates();

        // Then the action should be in REPORT_ACTIONS
        const reportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}` as const);
        expect(reportActions?.[REPORT_ACTION_ID]?.actorAccountID).toBe(CONST.ACCOUNT_ID.CONCIERGE);

        // And the pending response should be cleared
        const pendingResponse = await getOnyxValue(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${REPORT_ID}` as const);
        expect(pendingResponse).toBeUndefined();

        // And the typing indicator should be cleared
        const typingStatus = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${REPORT_ID}` as const);
        expect(typingStatus?.[CONST.ACCOUNT_ID.CONCIERGE]).toBe(false);
    });

    it('should not move the action before the delay elapses', async () => {
        // Given a pending concierge response with a longer delay
        await Onyx.merge(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${REPORT_ID}`, {
            reportAction: fakeConciergeAction,
            displayAfter: Date.now() + SHORT_DELAY,
        });
        await waitForBatchedUpdates();

        const {unmount} = renderHook(() => usePendingConciergeResponse(REPORT_ID));
        await waitForBatchedUpdates();

        // When checked immediately (well before the delay)
        // Then the action should NOT be in REPORT_ACTIONS yet
        const reportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}` as const);
        expect(reportActions?.[REPORT_ACTION_ID]).toBeUndefined();

        // And the pending response should still exist
        const pendingResponse = await getOnyxValue(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${REPORT_ID}` as const);
        expect(pendingResponse).not.toBeUndefined();

        // Clean up to avoid dangling timer
        unmount();
    });

    it('should cancel the timer on unmount and not apply the action', async () => {
        // Given a pending concierge response
        await Onyx.merge(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${REPORT_ID}`, {
            reportAction: fakeConciergeAction,
            displayAfter: Date.now() + SHORT_DELAY,
        });
        await waitForBatchedUpdates();

        const {unmount} = renderHook(() => usePendingConciergeResponse(REPORT_ID));
        await waitForBatchedUpdates();

        // When the hook unmounts before the delay
        unmount();

        // And we wait past the delay
        await delay(SHORT_DELAY + 50);
        await waitForBatchedUpdates();

        // Then the action should NOT be in REPORT_ACTIONS (timer was cleaned up)
        const reportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}` as const);
        expect(reportActions?.[REPORT_ACTION_ID]).toBeUndefined();

        // And the pending response should still exist (nothing consumed it)
        const pendingResponse = await getOnyxValue(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${REPORT_ID}` as const);
        expect(pendingResponse).not.toBeUndefined();
    });

    it('should fire immediately when displayAfter is already in the past', async () => {
        // Given a pending concierge response with a past displayAfter (e.g., user navigated back)
        await Onyx.merge(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${REPORT_ID}`, {
            reportAction: fakeConciergeAction,
            displayAfter: Date.now() - 1000,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${REPORT_ID}`, {
            [CONST.ACCOUNT_ID.CONCIERGE]: true,
        });
        await waitForBatchedUpdates();

        renderHook(() => usePendingConciergeResponse(REPORT_ID));
        await waitForBatchedUpdates();

        // When we wait just one tick (remaining = 0 → setTimeout(fn, 0))
        await delay(50);
        await waitForBatchedUpdates();

        // Then the action should already be in REPORT_ACTIONS
        const reportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}` as const);
        expect(reportActions?.[REPORT_ACTION_ID]?.actorAccountID).toBe(CONST.ACCOUNT_ID.CONCIERGE);

        // And pending response should be cleared
        const pendingResponse = await getOnyxValue(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${REPORT_ID}` as const);
        expect(pendingResponse).toBeUndefined();
    });

    it('should discard stale pending responses instead of displaying them', async () => {
        // Given a pending concierge response from a previous session (well past the stale threshold)
        await Onyx.merge(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${REPORT_ID}`, {
            reportAction: fakeConciergeAction,
            displayAfter: Date.now() - 30_000,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${REPORT_ID}`, {
            [CONST.ACCOUNT_ID.CONCIERGE]: true,
        });
        await waitForBatchedUpdates();

        renderHook(() => usePendingConciergeResponse(REPORT_ID));
        await waitForBatchedUpdates();

        await delay(50);
        await waitForBatchedUpdates();

        // Then the action should NOT be in REPORT_ACTIONS (stale response was discarded)
        const reportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}` as const);
        expect(reportActions?.[REPORT_ACTION_ID]).toBeUndefined();

        // And the pending response should be cleared
        const pendingResponse = await getOnyxValue(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${REPORT_ID}` as const);
        expect(pendingResponse).toBeUndefined();

        // And the typing indicator should be cleared
        const typingStatus = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${REPORT_ID}` as const);
        expect(typingStatus?.[CONST.ACCOUNT_ID.CONCIERGE]).toBe(false);
    });

    it('should do nothing when there is no pending response', async () => {
        // Given no pending concierge response
        renderHook(() => usePendingConciergeResponse(REPORT_ID));
        await waitForBatchedUpdates();

        await delay(SHORT_DELAY + 50);
        await waitForBatchedUpdates();

        // Then REPORT_ACTIONS should remain empty
        const reportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}` as const);
        expect(reportActions).toBeUndefined();
    });
});
