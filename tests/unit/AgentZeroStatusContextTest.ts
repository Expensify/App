import {act, renderHook, waitFor} from '@testing-library/react-native';
import fs from 'fs';
import path from 'path';
import React from 'react';
import Onyx from 'react-native-onyx';
import useAgentZeroStatusIndicator from '@hooks/useAgentZeroStatusIndicator';
import {clearAgentZeroProcessingIndicator, subscribeToReportReasoningEvents, unsubscribeFromReportReasoningChannel} from '@libs/actions/Report';
import AgentZeroOptimisticStore from '@libs/AgentZeroOptimisticStore';
import ConciergeReasoningStore from '@libs/ConciergeReasoningStore';
import {setForceOffline} from '@libs/NetworkState';
import {AgentZeroStatusProvider, useAgentZeroStatus, useAgentZeroStatusActions} from '@pages/inbox/AgentZeroStatusContext';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockTranslate = jest.fn((key: string) => {
    if (key === 'common.thinking') {
        return 'Thinking...';
    }
    return key;
});

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: mockTranslate,
    }),
}));

jest.mock('@libs/actions/Report', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = jest.requireActual<typeof import('@libs/actions/Report')>('@libs/actions/Report');
    return {
        ...actual,
        clearAgentZeroProcessingIndicator: jest.fn(),
        getNewerActions: jest.fn(),
        subscribeToReportReasoningEvents: jest.fn(),
        unsubscribeFromReportReasoningChannel: jest.fn(),
    };
});

const mockClearAgentZeroProcessingIndicator = clearAgentZeroProcessingIndicator as jest.MockedFunction<typeof clearAgentZeroProcessingIndicator>;
const mockSubscribeToReportReasoningEvents = subscribeToReportReasoningEvents as jest.MockedFunction<typeof subscribeToReportReasoningEvents>;
const mockUnsubscribeFromReportReasoningChannel = unsubscribeFromReportReasoningChannel as jest.MockedFunction<typeof unsubscribeFromReportReasoningChannel>;

const reportID = '123';

/** Simulates a reasoning event via ConciergeReasoningStore (the real store, since it's not mocked) */
function simulateReasoning(data: {reasoning: string; agentZeroRequestID: string; loopCount: number}) {
    ConciergeReasoningStore.addReasoning(reportID, data);
}

function wrapper({children}: {children: React.ReactNode}) {
    return React.createElement(AgentZeroStatusProvider, {reportID}, children);
}

describe('AgentZeroStatusContext', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();

        // Clear ConciergeReasoningStore between tests
        ConciergeReasoningStore.clearReasoning(reportID);

        // Clear AgentZeroOptimisticStore between tests so a leftover entry from a prior
        // test doesn't hydrate the next hook mount with unexpected optimistic state.
        AgentZeroOptimisticStore.clear(reportID);

        // Make clearAgentZeroProcessingIndicator actually clear the Onyx NVP
        // so safety timeout and reconnect tests can verify the full clearing flow
        mockClearAgentZeroProcessingIndicator.mockImplementation((rID: string) => {
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${rID}`, {agentZeroProcessingRequestIndicator: null});
            ConciergeReasoningStore.clearReasoning(rID);
        });

        // Mark this report as Concierge by default
        await Onyx.merge(ONYXKEYS.CONCIERGE_REPORT_ID, reportID);
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
        // Ensure each test starts online again; NetworkState is module-level so state leaks.
        setForceOffline(false);
    });

    describe('basic functionality', () => {
        it('should short-circuit for non-Concierge chat — default state, no Pusher subscription', async () => {
            // Given a regular chat (not Concierge)
            await Onyx.merge(ONYXKEYS.CONCIERGE_REPORT_ID, '999');

            // When we render the hook
            const {result} = renderHook(() => ({...useAgentZeroStatus(), ...useAgentZeroStatusActions()}), {wrapper});

            // Then it should return default state with no processing indicator
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(false);
            expect(result.current.statusLabel).toBe('');
            expect(result.current.reasoningHistory).toEqual([]);
            expect(result.current.kickoffWaitingIndicator).toBeInstanceOf(Function);

            // And no reasoning subscription should have been created
            expect(mockSubscribeToReportReasoningEvents).not.toHaveBeenCalled();
        });

        it('should return processing state when server label is present in Concierge chat', async () => {
            // Given a Concierge chat with a server status label
            const serverLabel = 'Concierge is looking up categories...';

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: serverLabel,
            });

            // When we render the hook
            const {result} = renderHook(() => useAgentZeroStatus(), {wrapper});

            // Then it should show processing state with the server label
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(true);
            expect(result.current.statusLabel).toBe(serverLabel);
        });

        it('should return empty status when server label is cleared', async () => {
            // Given a Concierge chat with an initial server label
            const serverLabel = 'Concierge is looking up categories...';

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: serverLabel,
            });

            const {result} = renderHook(() => useAgentZeroStatus(), {wrapper});
            await waitForBatchedUpdates();

            // When the server label is cleared (processing complete)
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: '',
            });

            // Then it should no longer show processing state
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(false);
            expect(result.current.statusLabel).toBe('');
        });
    });

    describe('kickoffWaitingIndicator', () => {
        it('should trigger optimistic waiting state when called in Concierge chat without server label', async () => {
            // Given a Concierge chat with no server label (user about to send a message)
            const {result} = renderHook(() => ({...useAgentZeroStatus(), ...useAgentZeroStatusActions()}), {wrapper});
            await waitForBatchedUpdates();

            // When the user triggers the waiting indicator (e.g., sending a message)
            act(() => {
                result.current.kickoffWaitingIndicator();
            });

            // Then it should show optimistic processing state with waiting label
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(true);
            expect(result.current.statusLabel).toBe('Thinking...');
        });

        it('should not trigger waiting state if server label already exists', async () => {
            // Given a Concierge chat that's already processing with a server label
            const serverLabel = 'Concierge is looking up categories...';

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: serverLabel,
            });

            const {result} = renderHook(() => ({...useAgentZeroStatus(), ...useAgentZeroStatusActions()}), {wrapper});
            await waitForBatchedUpdates();

            const initialLabel = result.current.statusLabel;

            // When kickoff is called while already processing
            act(() => {
                result.current.kickoffWaitingIndicator();
            });

            // Then the server label should remain unchanged
            await waitForBatchedUpdates();
            expect(result.current.statusLabel).toBe(initialLabel);
            expect(result.current.statusLabel).toBe(serverLabel);
        });

        it('should not trigger waiting state in non-Concierge chat', async () => {
            // Given a regular chat (not Concierge)
            await Onyx.merge(ONYXKEYS.CONCIERGE_REPORT_ID, '999');

            const {result} = renderHook(() => ({...useAgentZeroStatus(), ...useAgentZeroStatusActions()}), {wrapper});
            await waitForBatchedUpdates();

            // When kickoff is called
            act(() => {
                result.current.kickoffWaitingIndicator();
            });

            // Then it should not show processing state
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(false);
            expect(result.current.statusLabel).toBe('');
        });

        it('should clear optimistic waiting state after 2-minute timeout when server never responds', async () => {
            jest.useFakeTimers();

            const {result} = renderHook(() => ({...useAgentZeroStatus(), ...useAgentZeroStatusActions()}), {wrapper});
            await waitForBatchedUpdates();

            act(() => {
                result.current.kickoffWaitingIndicator();
            });
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(true);
            expect(result.current.statusLabel).toBe('Thinking...');

            act(() => {
                jest.advanceTimersByTime(120000);
            });
            await waitForBatchedUpdates();

            expect(result.current.isProcessing).toBe(false);
            expect(result.current.statusLabel).toBe('');
        });

        it('should not clear optimistic state before the 2-minute timeout', async () => {
            jest.useFakeTimers();

            const {result} = renderHook(() => ({...useAgentZeroStatus(), ...useAgentZeroStatusActions()}), {wrapper});
            await waitForBatchedUpdates();

            act(() => {
                result.current.kickoffWaitingIndicator();
            });
            await waitForBatchedUpdates();

            act(() => {
                jest.advanceTimersByTime(60000);
            });

            expect(result.current.isProcessing).toBe(true);
            expect(result.current.statusLabel).toBe('Thinking...');
        });

        it('should keep indicator visible while server label is active within the safety window', async () => {
            // Server-label arrival rearms the safety timer (startSafetyTimer is called in
            // the label-sync effect). Indicator stays visible for up to MAX_INDICATOR_DURATION_MS
            // from the last label update; as long as the label keeps updating (or reasoning
            // events stream in), the timer keeps resetting. This test verifies the indicator
            // remains visible in the window following a server-label arrival.
            jest.useFakeTimers();

            const {result} = renderHook(() => ({...useAgentZeroStatus(), ...useAgentZeroStatusActions()}), {wrapper});
            await waitForBatchedUpdates();

            act(() => {
                result.current.kickoffWaitingIndicator();
            });
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(true);

            const serverLabel = 'Concierge is looking up categories...';
            // Don't await — Onyx.merge hangs under fake timers because its internal batching setTimeout never fires.
            // waitForBatchedUpdates() handles this by calling jest.runOnlyPendingTimers().
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: serverLabel,
            });
            await waitForBatchedUpdates();

            act(() => {
                jest.advanceTimersByTime(60000);
            });

            // Don't waitForBatchedUpdates() after — it drains all queued timers
            // (including the future safety timer), which would clear the indicator.
            expect(result.current.isProcessing).toBe(true);
            expect(result.current.statusLabel).toBe(serverLabel);
        });

        it('should clear optimistic waiting state when server label arrives', async () => {
            // Given a Concierge chat with optimistic waiting state
            const {result} = renderHook(() => ({...useAgentZeroStatus(), ...useAgentZeroStatusActions()}), {wrapper});
            await waitForBatchedUpdates();

            act(() => {
                result.current.kickoffWaitingIndicator();
            });
            await waitForBatchedUpdates();

            expect(result.current.statusLabel).toBe('Thinking...');

            // When a server label arrives
            const serverLabel = 'Concierge is looking up categories...';
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: serverLabel,
            });

            // Then it should replace the waiting label with the server label
            await waitForBatchedUpdates();
            await waitFor(() => {
                expect(result.current.statusLabel).toBe(serverLabel);
            });
        });
    });

    describe('reasoning via Pusher', () => {
        it('should update reasoning history when Pusher event arrives', async () => {
            // Given a Concierge chat
            const {result} = renderHook(() => useAgentZeroStatus(), {wrapper});
            await waitForBatchedUpdates();

            // When reasoning data arrives via Pusher
            act(() => {
                simulateReasoning({reasoning: 'First reasoning', agentZeroRequestID: 'req-1', loopCount: 1});
            });
            await waitForBatchedUpdates();

            // Then reasoning history should contain the entry
            expect(result.current.reasoningHistory).toHaveLength(1);
            expect(result.current.reasoningHistory.at(0)?.reasoning).toBe('First reasoning');
        });

        it('should deduplicate reasoning entries with same loopCount and text', async () => {
            // Given a Concierge chat with existing reasoning
            const {result} = renderHook(() => useAgentZeroStatus(), {wrapper});
            await waitForBatchedUpdates();

            act(() => {
                simulateReasoning({reasoning: 'Analyzing...', agentZeroRequestID: 'req-1', loopCount: 1});
            });
            await waitForBatchedUpdates();

            // When a duplicate arrives
            act(() => {
                simulateReasoning({reasoning: 'Analyzing...', agentZeroRequestID: 'req-1', loopCount: 1});
            });
            await waitForBatchedUpdates();

            // Then it should not be added
            expect(result.current.reasoningHistory).toHaveLength(1);
        });

        it('should reset entries when agentZeroRequestID changes', async () => {
            // Given a Concierge chat with reasoning from a previous request
            const {result} = renderHook(() => useAgentZeroStatus(), {wrapper});
            await waitForBatchedUpdates();

            act(() => {
                simulateReasoning({reasoning: 'Old reasoning', agentZeroRequestID: 'req-1', loopCount: 1});
                simulateReasoning({reasoning: 'More old reasoning', agentZeroRequestID: 'req-1', loopCount: 2});
            });
            await waitForBatchedUpdates();
            expect(result.current.reasoningHistory).toHaveLength(2);

            // When a new request starts
            act(() => {
                simulateReasoning({reasoning: 'New reasoning', agentZeroRequestID: 'req-2', loopCount: 1});
            });
            await waitForBatchedUpdates();

            // Then entries should be reset to just the new one
            expect(result.current.reasoningHistory).toHaveLength(1);
            expect(result.current.reasoningHistory.at(0)?.reasoning).toBe('New reasoning');
        });

        it('should ignore empty reasoning strings', async () => {
            // Given a Concierge chat
            const {result} = renderHook(() => useAgentZeroStatus(), {wrapper});
            await waitForBatchedUpdates();

            // When empty reasoning arrives
            act(() => {
                simulateReasoning({reasoning: '  ', agentZeroRequestID: 'req-1', loopCount: 1});
            });
            await waitForBatchedUpdates();

            // Then it should be ignored
            expect(result.current.reasoningHistory).toHaveLength(0);
        });
    });

    describe('Pusher lifecycle', () => {
        it('should subscribe to reasoning events for Concierge chat on mount', async () => {
            renderHook(() => useAgentZeroStatus(), {wrapper});
            await waitForBatchedUpdates();

            expect(mockSubscribeToReportReasoningEvents).toHaveBeenCalledWith(reportID);
        });

        it('should not subscribe to reasoning events for non-Concierge chat', async () => {
            await Onyx.merge(ONYXKEYS.CONCIERGE_REPORT_ID, '999');

            renderHook(() => useAgentZeroStatus(), {wrapper});
            await waitForBatchedUpdates();

            expect(mockSubscribeToReportReasoningEvents).not.toHaveBeenCalled();
        });

        it('should unsubscribe from reasoning events on unmount', async () => {
            const {unmount} = renderHook(() => useAgentZeroStatus(), {wrapper});
            await waitForBatchedUpdates();

            unmount();

            await waitForBatchedUpdates();
            expect(mockUnsubscribeFromReportReasoningChannel).toHaveBeenCalledWith(reportID);
        });
    });

    describe('batched Onyx updates (stuck indicator fix)', () => {
        const MAX_INDICATOR_DURATION_MS = 120000;
        let safetyTimerId: ReturnType<typeof setTimeout> | null;
        let originalSetTimeout: typeof setTimeout;
        let originalClearTimeout: typeof clearTimeout;

        beforeEach(() => {
            safetyTimerId = null;
            originalSetTimeout = global.setTimeout;
            originalClearTimeout = global.clearTimeout;

            jest.spyOn(global, 'setTimeout').mockImplementation(((callback: () => void, ms?: number) => {
                if (ms === MAX_INDICATOR_DURATION_MS) {
                    const id = originalSetTimeout(() => {}, 0);
                    safetyTimerId = id;
                    return id;
                }
                return originalSetTimeout(callback, ms);
            }) as typeof setTimeout);

            jest.spyOn(global, 'clearTimeout').mockImplementation((id) => {
                if (id !== undefined && id !== null && id === safetyTimerId) {
                    safetyTimerId = null;
                    return;
                }
                originalClearTimeout(id);
            });
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should keep optimistic state visible across a server SET and CLEAR flicker', async () => {
            // The server NVP can briefly go truthy→falsy→truthy between processing phases
            // (e.g. "Concierge is thinking..." → brief empty → "Concierge is searching
            // documentation..."). A chat-switch that lands during the brief-empty window
            // used to show nothing because the optimistic counter had already been cleared
            // by the SET handoff. Now we keep the optimistic floor alive through server-label
            // transitions; only authoritative signals (reply detection, 120s safety timeout,
            // or reconnect) clear the optimistic entry.

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID));
            await waitForBatchedUpdates();

            // User sends message -> optimistic waiting state
            act(() => {
                result.current.kickoffWaitingIndicator();
            });
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(true);
            expect(result.current.statusLabel).toBe('Thinking...');

            // Server SET arrives — display switches to server label, but optimistic floor
            // stays alive so we survive a subsequent flicker.
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: 'Concierge is looking up categories...',
            });
            await waitForBatchedUpdates();

            // Server CLEAR arrives without a Concierge reply (brief flicker between phases).
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: '',
            });
            await waitForBatchedUpdates();

            // Indicator must stay visible — optimistic floor picks it back up during the
            // flicker. Authoritative clears (reply detection / safety timeout / reconnect)
            // are the only paths that drop it.
            expect(result.current.isProcessing).toBe(true);
            expect(result.current.statusLabel).toBe('Thinking...');
            expect(safetyTimerId).not.toBeNull();
        });
    });

    describe('server label transitions', () => {
        it('should fall back to the optimistic label when server CLEAR arrives without a reply', async () => {
            // After kickoff, the display prefers the server label once it arrives, but the
            // optimistic counter stays alive as a floor. If the server CLEAR happens without
            // a corresponding Concierge reply (flicker between processing phases), display
            // falls back to the optimistic "Thinking..." label rather than blanking out.

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID));
            await waitForBatchedUpdates();

            // User sends message -> optimistic waiting state
            act(() => {
                result.current.kickoffWaitingIndicator();
            });
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(true);
            expect(result.current.statusLabel).toBe('Thinking...');

            // When the server sets a label (processing started)
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: 'Processing...',
            });
            await waitForBatchedUpdates();

            await waitFor(() => {
                expect(result.current.statusLabel).toBe('Processing...');
            });

            // And then clears it (brief flicker; no Concierge reply action yet)
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: '',
            });

            // Indicator stays visible via the optimistic floor. The displayed label is
            // debounced so it may still read "Processing..." briefly — the important
            // invariant is that isProcessing doesn't flip to false during the flicker.
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(true);
        });
    });

    describe('final response handling', () => {
        it('should clear reasoning history when processing indicator is cleared', async () => {
            // Given a Concierge chat with active reasoning
            const serverLabel = 'Concierge is looking up categories...';
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: serverLabel,
            });

            const {result} = renderHook(() => useAgentZeroStatus(), {wrapper});
            await waitForBatchedUpdates();

            // Simulate reasoning history arriving
            act(() => {
                simulateReasoning({reasoning: 'Analyzing request', agentZeroRequestID: 'req-1', loopCount: 1});
                simulateReasoning({reasoning: 'Fetching data', agentZeroRequestID: 'req-1', loopCount: 2});
            });
            await waitForBatchedUpdates();

            // Verify processing state is active with reasoning history
            expect(result.current.isProcessing).toBe(true);
            expect(result.current.statusLabel).toBe(serverLabel);
            expect(result.current.reasoningHistory).toHaveLength(2);

            // When the final Concierge response arrives, the backend clears the processing indicator
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: '',
            });

            // Then processing indicator and reasoning history should clear
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(false);
            expect(result.current.statusLabel).toBe('');
            expect(result.current.reasoningHistory).toEqual([]);
        });

        it('should clear optimistic state when a Concierge reply arrives alongside server CLEAR', async () => {
            // End-to-end happy path: kickoff → server SET → server CLEAR + new Concierge
            // action. The reply-detection effect clears the optimistic store on the new
            // Concierge action (action ID differs from the baseline captured at kickoff),
            // so both signals go to zero together and the indicator clears. The server
            // CLEAR alone (without a new action) keeps the optimistic floor alive — see
            // the flicker test in the "batched Onyx updates" suite.
            const {result} = renderHook(() => ({...useAgentZeroStatus(), ...useAgentZeroStatusActions()}), {wrapper});
            await waitForBatchedUpdates();

            // User sends message → optimistic waiting state
            act(() => {
                result.current.kickoffWaitingIndicator();
            });
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(true);
            expect(result.current.statusLabel).toBe('Thinking...');

            // Backend starts processing → server label arrives
            const serverLabel = 'Processing your request...';
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: serverLabel,
            });
            await waitForBatchedUpdates();

            await waitFor(() => {
                expect(result.current.statusLabel).toBe(serverLabel);
            });

            // Final Concierge reply lands — new action newer than the baseline captured
            // at kickoff, plus backend clears the server label.
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                replyActionID: {
                    reportActionID: 'replyActionID',
                    actorAccountID: CONST.ACCOUNT_ID.CONCIERGE,
                    created: '2099-01-01 00:00:00.000',
                    message: [{type: 'TEXT', text: 'Done!'}],
                },
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: '',
            });

            // Reply-detection clears both the NVP and the optimistic entry.
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(false);
            expect(result.current.statusLabel).toBe('');
        });
    });

    describe('safety timeout', () => {
        // We spy on setTimeout/clearTimeout to capture the 120s safety timer callback
        // rather than using jest.useFakeTimers(), which interferes with Onyx's async
        // batching.
        const MAX_INDICATOR_DURATION_MS = 120000;
        let safetyCallback: (() => void) | null;
        let safetyTimerId: ReturnType<typeof setTimeout> | null;
        let originalSetTimeout: typeof setTimeout;
        let originalClearTimeout: typeof clearTimeout;

        beforeEach(() => {
            safetyCallback = null;
            safetyTimerId = null;
            originalSetTimeout = global.setTimeout;
            originalClearTimeout = global.clearTimeout;

            // Intercept setTimeout to capture the 120s safety callback
            jest.spyOn(global, 'setTimeout').mockImplementation(((callback: () => void, ms?: number) => {
                if (ms === MAX_INDICATOR_DURATION_MS) {
                    const id = originalSetTimeout(() => {}, 0);
                    safetyCallback = callback;
                    safetyTimerId = id;
                    return id;
                }
                return originalSetTimeout(callback, ms);
            }) as typeof setTimeout);

            jest.spyOn(global, 'clearTimeout').mockImplementation((id) => {
                if (id !== undefined && id !== null && id === safetyTimerId) {
                    safetyTimerId = null;
                    safetyCallback = null;
                    return;
                }
                originalClearTimeout(id);
            });
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should auto-clear after 120s safety timeout when serverLabel is active', async () => {
            // Given a Concierge chat where the server sets a processing indicator
            const serverLabel = 'Concierge is looking up categories...';

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: serverLabel,
            });

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID));
            await waitForBatchedUpdates();

            // Verify processing is active and the safety timer was armed
            expect(result.current.isProcessing).toBe(true);
            expect(result.current.statusLabel).toBe(serverLabel);
            expect(safetyCallback).not.toBeNull();

            // When the safety timeout fires at 120s — should hard-clear the indicator
            act(() => {
                safetyCallback?.();
            });
            await waitForBatchedUpdates();

            // Then the indicator should auto-clear
            await waitFor(() => {
                expect(result.current.isProcessing).toBe(false);
            });
            expect(result.current.statusLabel).toBe('');
        });

        it('should auto-clear optimistic indicator after safety timeout', async () => {
            // Given a Concierge chat where the user triggered optimistic waiting

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID));
            await waitForBatchedUpdates();

            // User sends message -> optimistic waiting state
            act(() => {
                result.current.kickoffWaitingIndicator();
            });
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(true);
            expect(result.current.statusLabel).toBe('Thinking...');
            expect(safetyCallback).not.toBeNull();

            // When the safety timeout fires at 120s — should hard-clear
            act(() => {
                safetyCallback?.();
            });
            await waitForBatchedUpdates();

            // Then the indicator should auto-clear
            await waitFor(() => {
                expect(result.current.isProcessing).toBe(false);
            });
            expect(result.current.statusLabel).toBe('');
        });

        it('should cancel the safety timer when indicator clears normally', async () => {
            // Given a Concierge chat with an active processing indicator
            const serverLabel = 'Concierge is looking up categories...';

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: serverLabel,
            });

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID));
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(true);
            expect(safetyCallback).not.toBeNull();

            // When the server clears the indicator normally (before safety timeout)
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: '',
            });
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(false);

            // Then the safety timer should have been cancelled
            expect(safetyTimerId).toBeNull();
        });

        it('should rearm the safety timer when a new server label arrives', async () => {
            // Given a Concierge chat with an active processing indicator
            const serverLabel1 = 'Concierge is looking up categories...';

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: serverLabel1,
            });

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID));
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(true);
            expect(safetyCallback).not.toBeNull();
            const firstSafetyCallback = safetyCallback;

            // When a new label arrives (still processing), the safety timer should be rearmed
            const serverLabel2 = 'Concierge is preparing your response...';
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: serverLabel2,
            });
            await waitForBatchedUpdates();

            // Then a fresh safety timer is in place (different callback identity, indicator still active)
            expect(safetyCallback).not.toBeNull();
            expect(safetyCallback).not.toBe(firstSafetyCallback);
            expect(result.current.isProcessing).toBe(true);
        });
    });

    describe('reconnect reset', () => {
        it('should keep indicator on network reconnect and rearm the safety timer', async () => {
            // Given a Concierge chat with an active processing indicator
            const serverLabel = 'Concierge is looking up categories...';

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: serverLabel,
            });

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID));
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(true);

            // When the network goes offline
            act(() => setForceOffline(true));
            await waitForBatchedUpdates();

            // The indicator is hidden while offline (original design: !isOffline in isProcessing)
            expect(result.current.isProcessing).toBe(false);

            // When the network reconnects
            act(() => setForceOffline(false));
            await waitForBatchedUpdates();

            // The indicator reappears (server NVP still has processing state).
            // onReconnect fetches newer actions and rearms the safety timer, but does NOT
            // clear the indicator.
            await waitFor(() => {
                expect(result.current.isProcessing).toBe(true);
            });
            expect(result.current.statusLabel).toBe(serverLabel);
        });

        it('should keep optimistic state and rearm the safety timer on reconnect', async () => {
            // Regression test: when the client reconnects while only optimistic state is
            // active (no serverLabel yet), the indicator must stay visible so the safety
            // timer keeps running until the reply arrives via Pusher catch-up or the
            // safety timer fires. The stale NVP is still cleared locally (defensive, in
            // case the server SET+CLEARED during offline).

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID));
            await waitForBatchedUpdates();

            // User sends a message while online → optimistic state (no serverLabel yet)
            act(() => {
                result.current.kickoffWaitingIndicator();
            });
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(true);

            // Go offline, then reconnect
            act(() => setForceOffline(true));
            await waitForBatchedUpdates();
            act(() => setForceOffline(false));
            await waitForBatchedUpdates();

            // Stale NVP is cleared defensively
            await waitFor(() => {
                expect(mockClearAgentZeroProcessingIndicator).toHaveBeenCalledWith(reportID);
            });

            // Indicator stays visible so the safety timer keeps running until reply or timeout
            expect(result.current.isProcessing).toBe(true);
            expect(result.current.statusLabel).toBe('Thinking...');
        });

        it('should clear indicator after reconnect when a Concierge reply finally arrives', async () => {
            // Full recovery path: optimistic state is preserved through reconnect, the safety
            // timer keeps running, and when a new Concierge action lands (via Pusher catch-up
            // or the one-shot onReconnect getNewerActions) the detection effect clears
            // everything.

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID));
            await waitForBatchedUpdates();

            act(() => {
                result.current.kickoffWaitingIndicator();
            });
            await waitForBatchedUpdates();

            act(() => setForceOffline(true));
            await waitForBatchedUpdates();
            act(() => setForceOffline(false));
            await waitForBatchedUpdates();

            await waitFor(() => {
                expect(result.current.isProcessing).toBe(true);
            });

            // A new Concierge action arrives (simulating Pusher catch-up or onReconnect refetch)
            const replyActionID = '999';
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                [replyActionID]: {
                    reportActionID: replyActionID,
                    actorAccountID: CONST.ACCOUNT_ID.CONCIERGE,
                    created: '2099-01-01 00:00:00.000',
                    message: [{type: 'TEXT', text: 'Reply'}],
                },
            });

            await waitFor(() => {
                expect(result.current.isProcessing).toBe(false);
            });
        });
    });

    describe('Concierge DM with pre-existing Concierge actions', () => {
        const priorConciergeActionID = '100';
        const newConciergeActionID = '200';
        const buildConciergeAction = (id: string, created: string, text: string) => ({
            reportActionID: id,
            actorAccountID: CONST.ACCOUNT_ID.CONCIERGE,
            created,
            message: [{type: 'TEXT', text}],
        });

        it('should not clear indicator immediately when the newest action is a pre-existing Concierge reply', async () => {
            // Regression test for the reporter's report: in a Concierge DM, the newest action
            // when the user sends a new message is typically Concierge's previous reply.
            // The Concierge-reply detection effect must not treat that pre-existing action
            // as a "new reply" — otherwise the indicator clears before it can show.

            // Simulate the Concierge DM state: the latest existing action is from Concierge.
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                [priorConciergeActionID]: buildConciergeAction(priorConciergeActionID, '2024-01-01 00:00:00.000', 'Previous Concierge reply'),
            });

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID));
            await waitForBatchedUpdates();

            // When the user sends a new message → optimistic state activates
            act(() => {
                result.current.kickoffWaitingIndicator();
            });
            await waitForBatchedUpdates();

            // Then the indicator should appear and NOT be cleared by the pre-existing Concierge action
            expect(result.current.isProcessing).toBe(true);
            expect(result.current.statusLabel).toBe('Thinking...');
            expect(mockClearAgentZeroProcessingIndicator).not.toHaveBeenCalled();
        });

        it('should clear indicator when a NEW Concierge action arrives after the indicator starts', async () => {
            // Positive case: once a new Concierge reply lands with a different reportActionID
            // than the one captured at indicator activation, the detection effect fires.
            // serverLabel stays falsy here, so the "intermediate action" guard doesn't block.

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                [priorConciergeActionID]: buildConciergeAction(priorConciergeActionID, '2024-01-01 00:00:00.000', 'Previous Concierge reply'),
            });

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID));
            await waitForBatchedUpdates();

            act(() => {
                result.current.kickoffWaitingIndicator();
            });
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(true);

            // When a new Concierge reply action arrives (different reportActionID)
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                [newConciergeActionID]: buildConciergeAction(newConciergeActionID, '2024-01-01 00:00:01.000', 'New Concierge reply'),
            });
            await waitForBatchedUpdates();

            // Then the indicator clears
            await waitFor(() => {
                expect(mockClearAgentZeroProcessingIndicator).toHaveBeenCalledWith(reportID);
            });
        });

        it('should NOT clear indicator when a Concierge action arrives while the server label is still truthy (intermediate)', async () => {
            // Regression test for the "intermediate Concierge action tears down indicator"
            // bug surfaced on PR 85620 ad-hoc testing: during a processing cycle, Concierge
            // can emit intermediate actions (reasoning dumps, status updates) before the
            // final reply. The old reply-detection fired on any newer Concierge action and
            // the indicator flickered out mid-stream. Now we require serverLabel to also be
            // falsy — the server's authoritative "done" signal — before tearing down.

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                [priorConciergeActionID]: buildConciergeAction(priorConciergeActionID, '2024-01-01 00:00:00.000', 'Previous Concierge reply'),
            });

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID));
            await waitForBatchedUpdates();

            act(() => {
                result.current.kickoffWaitingIndicator();
            });
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(true);

            // Server sets the NVP — processing is underway.
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: 'Concierge is searching documentation...',
            });
            await waitForBatchedUpdates();

            // An intermediate Concierge action lands (reasoning dump / status update).
            // Server NVP is still truthy — this is NOT the final reply.
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                [newConciergeActionID]: buildConciergeAction(newConciergeActionID, '2024-01-01 00:00:01.000', 'Intermediate status'),
            });
            await waitForBatchedUpdates();

            // The indicator must stay visible — the guard blocks the tear-down.
            expect(result.current.isProcessing).toBe(true);
            expect(mockClearAgentZeroProcessingIndicator).not.toHaveBeenCalled();
        });
    });

    describe('mount persistence across chat switches', () => {
        it('should keep the thinking indicator after unmount/remount while still processing', async () => {
            // Regression test for the video report on PR 85620: sending a message, switching
            // to another chat, and coming back before Concierge replies caused the indicator
            // to disappear. The optimistic counter used to live in React state scoped to the
            // mounted provider; it now lives in AgentZeroOptimisticStore so it survives a
            // ReportScreen unmount/remount.
            const {result: firstResult, unmount} = renderHook(() => ({...useAgentZeroStatus(), ...useAgentZeroStatusActions()}), {wrapper});
            await waitForBatchedUpdates();

            act(() => {
                firstResult.current.kickoffWaitingIndicator();
            });
            await waitForBatchedUpdates();
            expect(firstResult.current.isProcessing).toBe(true);
            expect(firstResult.current.statusLabel).toBe('Thinking...');

            // User navigates to another chat — ReportScreen unmounts
            unmount();
            await waitForBatchedUpdates();

            // User returns to Concierge — ReportScreen remounts
            const {result: secondResult} = renderHook(() => useAgentZeroStatus(), {wrapper});
            await waitForBatchedUpdates();

            // The indicator should still be showing on remount
            expect(secondResult.current.isProcessing).toBe(true);
            expect(secondResult.current.statusLabel).toBe('Thinking...');
        });

        it('should bump startedAt on each kickoff so the safety window measures from the most recent', () => {
            // Multi-message case: a second kickoff should extend the safety window so that a
            // remount well past 120s from the first kickoff — but within 120s of the second —
            // still restores the indicator. Matches the in-memory behavior where each
            // startPolling call resets the safety timer.
            //
            // Exercised at the store level to avoid fake-timer interaction with the hook's
            // 120s safety timeout (waitForBatchedUpdates drains pending timers and would
            // clear the entry before we could inspect it).
            const nowSpy = jest.spyOn(Date, 'now');
            try {
                nowSpy.mockReturnValue(10_000);
                AgentZeroOptimisticStore.increment(reportID, 'baseline-action');
                const afterFirst = AgentZeroOptimisticStore.getEntry(reportID);
                expect(afterFirst?.count).toBe(1);
                expect(afterFirst?.startedAt).toBe(10_000);
                expect(afterFirst?.baselineActionID).toBe('baseline-action');

                // 60s later, still within the first window → second kickoff.
                nowSpy.mockReturnValue(70_000);
                AgentZeroOptimisticStore.increment(reportID, 'new-baseline-ignored');

                const afterSecond = AgentZeroOptimisticStore.getEntry(reportID);
                expect(afterSecond?.count).toBe(2);
                // startedAt must bump — otherwise an unmount/remount past MAX_AGE_MS from the
                // first kickoff would expire the entry even though the in-memory safety timer
                // was reset on the second kickoff.
                expect(afterSecond?.startedAt).toBe(70_000);
                // Baseline stays fixed at the first kickoff's capture; we still want to detect
                // a Concierge reply that's newer than the *first* optimistic message.
                expect(afterSecond?.baselineActionID).toBe('baseline-action');

                // 90s after the second kickoff (150s from the first): entry is still fresh
                // because isFresh measures from startedAt, which was bumped.
                nowSpy.mockReturnValue(160_000);
                expect(AgentZeroOptimisticStore.getEntry(reportID)?.count).toBe(2);
            } finally {
                nowSpy.mockRestore();
            }
        });

        it('should clear the restored indicator when a Concierge reply arrived during the chat switch', async () => {
            // If Concierge actually replied while the user was on another chat, the newest
            // action on return is the Concierge reply. The reply-detection effect must still
            // fire, which requires the baselineActionID to be restored from the store (not
            // recaptured on remount as the reply itself).
            const priorActionID = '100';
            const replyActionID = '200';
            const buildAction = (id: string, created: string, actorAccountID: number) => ({
                reportActionID: id,
                actorAccountID,
                created,
                message: [{type: 'TEXT', text: 'msg'}],
            });

            // Concierge DM usually has a previous Concierge reply as the newest action.
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                [priorActionID]: buildAction(priorActionID, '2024-01-01 00:00:00.000', CONST.ACCOUNT_ID.CONCIERGE),
            });

            const {result: firstResult, unmount} = renderHook(() => ({...useAgentZeroStatus(), ...useAgentZeroStatusActions()}), {wrapper});
            await waitForBatchedUpdates();

            act(() => {
                firstResult.current.kickoffWaitingIndicator();
            });
            await waitForBatchedUpdates();
            expect(firstResult.current.isProcessing).toBe(true);

            // While the provider is unmounted (user on another chat), the Concierge reply lands
            unmount();
            await waitForBatchedUpdates();
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                [replyActionID]: buildAction(replyActionID, '2024-01-01 00:00:01.000', CONST.ACCOUNT_ID.CONCIERGE),
            });

            // User returns to Concierge
            const {result: secondResult} = renderHook(() => useAgentZeroStatus(), {wrapper});
            await waitForBatchedUpdates();

            // The reply-detection effect should see the new action ID != stored baseline,
            // clear the NVP and optimistic entry, and hide the indicator
            await waitFor(() => {
                expect(mockClearAgentZeroProcessingIndicator).toHaveBeenCalledWith(reportID);
            });
            expect(secondResult.current.isProcessing).toBe(false);
        });
    });

    describe('NVPIndicatorVersionTracker removal', () => {
        it('should NOT use NVPIndicatorVersionTracker (module should not exist)', () => {
            // The NVPIndicatorVersionTracker module was removed as part of the TTL fix.
            // The TTL (lease pattern) handles all failure modes that the version tracker
            // was designed to handle (batching coalescing + missed CLEAR).
            const trackerPath = path.resolve(__dirname, '../../src/libs/NVPIndicatorVersionTracker.ts');
            expect(fs.existsSync(trackerPath)).toBe(false);
        });
    });
});
