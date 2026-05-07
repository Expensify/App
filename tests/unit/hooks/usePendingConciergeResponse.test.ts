import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import usePendingConciergeResponse from '@hooks/usePendingConciergeResponse';
import Log from '@libs/Log';
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

/** Long HTML with >100 chars of plain text → tokenizeForReveal emits ≥100 char-level
 *  anchors → the hook's `tokens.length >= 100` gate opts INTO the trickle path. */
const LONG_HTML =
    '<p>To connect Xero to Expensify, go to Settings &gt; Workspaces and select your workspace.</p>' +
    '<ol><li>Click <strong>More features</strong>, then in the <strong>Integrate</strong> section toggle <strong>Accounting</strong>.</li>' +
    '<li>Click <strong>Connect</strong> next to Xero.</li><li>Log in to Xero as an administrator and authorize the connection.</li></ol>';

const fakeLongConciergeAction = {
    ...fakeConciergeAction,
    message: [{html: LONG_HTML, text: LONG_HTML.replaceAll(/<[^>]+>/g, ''), type: CONST.REPORT.MESSAGE.TYPE.COMMENT}],
} as ReportAction;

/** Tuple of (message, sendNow?, parameters?) for Log.info calls — matches the
 *  arg list usePendingConciergeResponse passes. Typing the spy's `.mock.calls`
 *  via this lets the find/filter callbacks access call[0]/[2] without tripping
 *  @typescript-eslint/no-unsafe-member-access. */
type LogInfoCall = [string, boolean?, Record<string, unknown>?];

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

        // And the typing state should be left untouched
        const typingStatus = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${REPORT_ID}` as const);
        expect(typingStatus?.[CONST.ACCOUNT_ID.CONCIERGE]).toBe(true);
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
        // Given a pending concierge response from a previous session (well past the hard cap, e.g. app killed and reopened later)
        await Onyx.merge(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${REPORT_ID}`, {
            reportAction: fakeConciergeAction,
            displayAfter: Date.now() - 90_000,
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

        // And the typing state should be left untouched
        const typingStatus = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${REPORT_ID}` as const);
        expect(typingStatus?.[CONST.ACCOUNT_ID.CONCIERGE]).toBe(true);
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

    describe('trickle path (long replies, ≥100 char-level anchors)', () => {
        let logSpy: jest.SpyInstance;

        beforeEach(() => {
            logSpy = jest.spyOn(Log, 'info').mockImplementation(() => {});
        });

        afterEach(() => {
            logSpy.mockRestore();
        });

        it('emits a [ConciergeTrickle] start telemetry log when the gate opens', async () => {
            // Given a long pending Concierge response (passes the tokens.length >= 100 gate)
            await Onyx.merge(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${REPORT_ID}`, {
                reportAction: fakeLongConciergeAction,
                displayAfter: Date.now() + SHORT_DELAY,
            });
            await waitForBatchedUpdates();

            const {unmount} = renderHook(() => usePendingConciergeResponse(REPORT_ID));
            await waitForBatchedUpdates();

            // Wait for the displayAfter delay so startTrickle fires
            await delay(SHORT_DELAY + 50);
            await waitForBatchedUpdates();

            // Then [ConciergeTrickle] start should have fired with token + duration metadata
            const calls = logSpy.mock.calls as LogInfoCall[];
            const startCall = calls.find((call) => call[0] === '[ConciergeTrickle] start');
            expect(startCall).toBeDefined();
            const payload = startCall?.[2] as {reportActionID?: string; tokenCount?: number; durationMs?: number} | undefined;
            expect(payload?.reportActionID).toBe(REPORT_ACTION_ID);
            expect(payload?.tokenCount ?? 0).toBeGreaterThanOrEqual(100);
            expect(payload?.durationMs).toBeGreaterThan(0);

            unmount();
        });

        // Natural-completion (full ~15s trickle + applyPendingConciergeAction → REPORT_ACTIONS)
        // is verified end-to-end by the Playwright ui-verify spec at
        // script/playwright-fixtures/tests/verify-626938.spec.ts (asserts the [complete]
        // log fires and the canonical reply lands). A jest version with fake timers
        // can't drive completion: the hook reads Date.now() for elapsed progress and
        // setInterval-only fake-timer advancement leaves progress stuck at 0.

        it('resumes mid-stage on revisit (displayAfter is in the past, within the hard cap)', async () => {
            // Given a long pending response whose displayAfter is 5s in the past (user navigated away and came back).
            await Onyx.merge(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${REPORT_ID}`, {
                reportAction: fakeLongConciergeAction,
                displayAfter: Date.now() - 5_000,
            });
            await waitForBatchedUpdates();

            const {unmount} = renderHook(() => usePendingConciergeResponse(REPORT_ID));
            // remainingDelay <= 0 → setTimeout(fn, 0). One tick lets startTrickle run.
            await delay(50);
            await waitForBatchedUpdates();

            // The start log should report a non-trivial initialStage and elapsedAtStart >= 5s,
            // proving the trickle resumed at the wall-clock-correct position rather than restarting from char 0.
            const calls = logSpy.mock.calls as LogInfoCall[];
            const startCall = calls.find((call) => call[0] === '[ConciergeTrickle] start');
            expect(startCall).toBeDefined();
            const payload = startCall?.[2] as {initialStage?: number; elapsedAtStart?: number} | undefined;
            expect(payload?.elapsedAtStart ?? 0).toBeGreaterThanOrEqual(4_900);
            expect(payload?.initialStage ?? 0).toBeGreaterThan(1);

            unmount();
        });

        it('completes immediately on revisit if elapsed exceeds the trickle duration but stays under the hard cap', async () => {
            // Given a long pending response whose displayAfter is 20s in the past — past the 15s reveal but inside the 60s cap.
            await Onyx.merge(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${REPORT_ID}`, {
                reportAction: fakeLongConciergeAction,
                displayAfter: Date.now() - 20_000,
            });
            await waitForBatchedUpdates();

            const {unmount} = renderHook(() => usePendingConciergeResponse(REPORT_ID));
            await delay(100);
            await waitForBatchedUpdates();

            // Then the action should land in REPORT_ACTIONS without spinning a 15s reveal.
            const reportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}` as const);
            expect(reportActions?.[REPORT_ACTION_ID]?.actorAccountID).toBe(CONST.ACCOUNT_ID.CONCIERGE);

            // And the pending response should be cleared.
            const pendingResponse = await getOnyxValue(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${REPORT_ID}` as const);
            expect(pendingResponse).toBeUndefined();

            unmount();
        });

        it('discards (does not trickle) on revisit past the hard cap', async () => {
            // Given a long pending response whose displayAfter is 90s in the past — well past the 60s hard cap.
            await Onyx.merge(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${REPORT_ID}`, {
                reportAction: fakeLongConciergeAction,
                displayAfter: Date.now() - 90_000,
            });
            await waitForBatchedUpdates();

            const {unmount} = renderHook(() => usePendingConciergeResponse(REPORT_ID));
            await delay(50);
            await waitForBatchedUpdates();

            // Then no trickle telemetry should have fired and the pending optimistic should be discarded.
            const calls = logSpy.mock.calls as LogInfoCall[];
            const startCall = calls.find((call) => call[0] === '[ConciergeTrickle] start');
            expect(startCall).toBeUndefined();

            const reportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}` as const);
            expect(reportActions?.[REPORT_ACTION_ID]).toBeUndefined();

            const pendingResponse = await getOnyxValue(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${REPORT_ID}` as const);
            expect(pendingResponse).toBeUndefined();

            unmount();
        });

        it('cleans up the interval on unmount mid-trickle', async () => {
            // Given a long pending response
            await Onyx.merge(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${REPORT_ID}`, {
                reportAction: fakeLongConciergeAction,
                displayAfter: Date.now() + SHORT_DELAY,
            });
            await waitForBatchedUpdates();

            const {unmount} = renderHook(() => usePendingConciergeResponse(REPORT_ID));
            await waitForBatchedUpdates();

            // Let the trickle start (past displayAfter) but unmount before completion
            await delay(SHORT_DELAY + 200);
            unmount();
            await waitForBatchedUpdates();

            // Then no completion telemetry should fire after unmount
            const callsBefore = logSpy.mock.calls as LogInfoCall[];
            const completeCallsBefore = callsBefore.filter((call) => call[0] === '[ConciergeTrickle] complete').length;
            await delay(500);
            await waitForBatchedUpdates();
            const callsAfter = logSpy.mock.calls as LogInfoCall[];
            const completeCallsAfter = callsAfter.filter((call) => call[0] === '[ConciergeTrickle] complete').length;

            expect(completeCallsAfter).toBe(completeCallsBefore);

            // And REPORT_ACTIONS should NOT contain the action (trickle was cancelled mid-way)
            const reportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}` as const);
            expect(reportActions?.[REPORT_ACTION_ID]).toBeUndefined();
        });
    });
});
