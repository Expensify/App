import {act, renderHook, waitFor} from '@testing-library/react-native';
import fs from 'fs';
import path from 'path';
import React from 'react';
import Onyx from 'react-native-onyx';
import useAgentZeroStatusIndicator from '@hooks/useAgentZeroStatusIndicator';
import {clearAgentZeroProcessingIndicator, subscribeToReportReasoningEvents, unsubscribeFromReportReasoningChannel} from '@libs/actions/Report';
import ConciergeReasoningStore from '@libs/ConciergeReasoningStore';
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
    // eslint-disable-next-line @typescript-eslint/naming-convention
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
        const POLL_INTERVAL_MS = 30000;
        const MAX_POLL_DURATION_MS = 120000;
        let pollIntervalId: ReturnType<typeof setInterval> | null;
        let safetyTimerId: ReturnType<typeof setTimeout> | null;
        let originalSetInterval: typeof setInterval;
        let originalClearInterval: typeof clearInterval;
        let originalSetTimeout: typeof setTimeout;
        let originalClearTimeout: typeof clearTimeout;

        beforeEach(() => {
            pollIntervalId = null;
            safetyTimerId = null;
            originalSetInterval = global.setInterval;
            originalClearInterval = global.clearInterval;
            originalSetTimeout = global.setTimeout;
            originalClearTimeout = global.clearTimeout;

            jest.spyOn(global, 'setInterval').mockImplementation(((callback: () => void, ms?: number) => {
                if (ms === POLL_INTERVAL_MS) {
                    const id = originalSetInterval(() => {}, 999999);
                    pollIntervalId = id;
                    return id;
                }
                return originalSetInterval(callback, ms);
            }) as typeof setInterval);

            jest.spyOn(global, 'clearInterval').mockImplementation((id) => {
                if (id !== undefined && id !== null && id === pollIntervalId) {
                    pollIntervalId = null;
                    originalClearInterval(id);
                    return;
                }
                originalClearInterval(id);
            });

            jest.spyOn(global, 'setTimeout').mockImplementation(((callback: () => void, ms?: number) => {
                if (ms === MAX_POLL_DURATION_MS) {
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

        it('should clear optimistic state when server SET and CLEAR arrive sequentially', async () => {
            // Given a Concierge chat where the user triggered optimistic waiting
            const isConciergeChat = true;

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));
            await waitForBatchedUpdates();

            // User sends message -> optimistic waiting state
            act(() => {
                result.current.kickoffWaitingIndicator();
            });
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(true);
            expect(result.current.statusLabel).toBe('Thinking...');

            // When the server SET arrives, it clears optimistic state and shows server label
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: 'Concierge is looking up categories...',
            });
            await waitForBatchedUpdates();

            // Then server CLEAR arrives (processing complete)
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: '',
            });
            await waitForBatchedUpdates();

            // The indicator should be fully cleared (normal path, no polling needed)
            // The polling should also have been cancelled
            await waitFor(() => {
                expect(result.current.isProcessing).toBe(false);
            });
            expect(result.current.statusLabel).toBe('');
            expect(pollIntervalId).toBeNull();
            expect(safetyTimerId).toBeNull();
        });
    });

    describe('server label transitions', () => {
        it('should clear optimistic state when server CLEAR arrives after a visible SET', async () => {
            // Given a Concierge chat where the user triggered optimistic waiting
            const isConciergeChat = true;

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));
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

            // And then clears it (processing complete)
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: '',
            });

            // Then the indicator should be fully cleared
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(false);
            expect(result.current.statusLabel).toBe('');
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

        it('should clear optimistic state when server completes after kickoff', async () => {
            // Given a Concierge chat where user triggered optimistic waiting
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

            // When the final response arrives → backend clears indicator
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: '',
            });

            // Then all processing state should be cleared
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(false);
            expect(result.current.statusLabel).toBe('');
        });
    });

    describe('safety timeout (polling pattern)', () => {
        // We spy on setInterval/clearInterval and setTimeout/clearTimeout to capture
        // the polling and safety timer callbacks rather than using jest.useFakeTimers(),
        // which interferes with Onyx's async batching.
        //
        // Polling: every 30s → getNewerActions, 120s safety → hard clear
        const POLL_INTERVAL_MS = 30000;
        const MAX_POLL_DURATION_MS = 120000;
        let pollCallback: (() => void) | null;
        let safetyCallback: (() => void) | null;
        let pollIntervalId: ReturnType<typeof setInterval> | null;
        let safetyTimerId: ReturnType<typeof setTimeout> | null;
        let originalSetInterval: typeof setInterval;
        let originalClearInterval: typeof clearInterval;
        let originalSetTimeout: typeof setTimeout;
        let originalClearTimeout: typeof clearTimeout;

        beforeEach(() => {
            pollCallback = null;
            safetyCallback = null;
            pollIntervalId = null;
            safetyTimerId = null;
            originalSetInterval = global.setInterval;
            originalClearInterval = global.clearInterval;
            originalSetTimeout = global.setTimeout;
            originalClearTimeout = global.clearTimeout;

            // Intercept setInterval to capture the 30s polling callback
            jest.spyOn(global, 'setInterval').mockImplementation(((callback: () => void, ms?: number) => {
                if (ms === POLL_INTERVAL_MS) {
                    const id = originalSetInterval(() => {}, 999999);
                    pollCallback = callback;
                    pollIntervalId = id;
                    return id;
                }
                return originalSetInterval(callback, ms);
            }) as typeof setInterval);

            jest.spyOn(global, 'clearInterval').mockImplementation((id) => {
                if (id !== undefined && id !== null && id === pollIntervalId) {
                    pollIntervalId = null;
                    pollCallback = null;
                    originalClearInterval(id);
                    return;
                }
                originalClearInterval(id);
            });

            // Intercept setTimeout to capture the 120s safety callback
            jest.spyOn(global, 'setTimeout').mockImplementation(((callback: () => void, ms?: number) => {
                if (ms === MAX_POLL_DURATION_MS) {
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

        it('should poll every 30s and auto-clear after 120s safety timeout', async () => {
            // Given a Concierge chat where the server sets a processing indicator
            const isConciergeChat = true;
            const serverLabel = 'Concierge is looking up categories...';

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: serverLabel,
            });

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));
            await waitForBatchedUpdates();

            // Verify processing is active and polling was started
            expect(result.current.isProcessing).toBe(true);
            expect(result.current.statusLabel).toBe(serverLabel);
            expect(pollCallback).not.toBeNull();
            expect(safetyCallback).not.toBeNull();

            // When the poll fires at 30s — fetches newer actions, indicator stays
            act(() => {
                pollCallback?.();
            });
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(true);

            // When another poll fires at 60s — fetches newer actions, indicator stays
            act(() => {
                pollCallback?.();
            });
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(true);

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
            const isConciergeChat = true;

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));
            await waitForBatchedUpdates();

            // User sends message -> optimistic waiting state
            act(() => {
                result.current.kickoffWaitingIndicator();
            });
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(true);
            expect(result.current.statusLabel).toBe('Thinking...');
            expect(pollCallback).not.toBeNull();

            // When a poll fires — fetches newer actions, indicator stays
            act(() => {
                pollCallback?.();
            });
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(true);

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

        it('should cancel polling when indicator clears normally', async () => {
            // Given a Concierge chat with an active processing indicator
            const isConciergeChat = true;
            const serverLabel = 'Concierge is looking up categories...';

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: serverLabel,
            });

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(true);
            expect(pollCallback).not.toBeNull();

            // When the server clears the indicator normally (before safety timeout)
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: '',
            });
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(false);

            // Then polling should have been cancelled
            expect(pollIntervalId).toBeNull();
            expect(safetyTimerId).toBeNull();
        });

        it('should reset polling when a new server label arrives', async () => {
            // Given a Concierge chat with an active processing indicator
            const isConciergeChat = true;
            const serverLabel1 = 'Concierge is looking up categories...';

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: serverLabel1,
            });

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(true);
            expect(pollCallback).not.toBeNull();

            // When a new label arrives (still processing), polling should reset
            const serverLabel2 = 'Concierge is preparing your response...';
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: serverLabel2,
            });
            await waitForBatchedUpdates();

            // Then polling should still be active (was reset with new interval)
            expect(pollCallback).not.toBeNull();
            expect(result.current.isProcessing).toBe(true);
        });
    });

    describe('reconnect reset', () => {
        it('should keep indicator on network reconnect and restart polling', async () => {
            // Given a Concierge chat with an active processing indicator
            const isConciergeChat = true;
            const serverLabel = 'Concierge is looking up categories...';

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: serverLabel,
            });

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(true);

            // When the network goes offline
            await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: true});
            await waitForBatchedUpdates();

            // The indicator is hidden while offline (original design: !isOffline in isProcessing)
            expect(result.current.isProcessing).toBe(false);

            // When the network reconnects
            await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
            await waitForBatchedUpdates();

            // The indicator reappears (server NVP still has processing state)
            // onReconnect fetches newer actions and restarts polling, but does NOT clear the indicator
            await waitFor(() => {
                expect(result.current.isProcessing).toBe(true);
            });
            expect(result.current.statusLabel).toBe(serverLabel);
        });

        it('should clear stale NVP on reconnect when only optimistic state was active', async () => {
            // Regression test: when reconnecting with only optimistic state (no serverLabel),
            // the NVP may have been set by the server and the CLEAR event lost during the
            // Pusher disconnect. On reconnect we proactively clear the stale NVP so the
            // indicator doesn't stay stuck until the 120s safety timeout.
            const isConciergeChat = true;

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));
            await waitForBatchedUpdates();

            // User sends a message while online → optimistic state (no serverLabel yet)
            act(() => {
                result.current.kickoffWaitingIndicator();
            });
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(true);

            // Go offline, then reconnect
            await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: true});
            await waitForBatchedUpdates();
            await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
            await waitForBatchedUpdates();

            // onReconnect proactively clears the NVP locally because optimistic state was active.
            // The label-sync effect can also clear via reasoning store cleanup; either way,
            // clearAgentZeroProcessingIndicator must have been invoked for this reportID.
            await waitFor(() => {
                expect(mockClearAgentZeroProcessingIndicator).toHaveBeenCalledWith(reportID);
            });
            expect(result.current.isProcessing).toBe(false);
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
            const isConciergeChat = true;

            // Simulate the Concierge DM state: the latest existing action is from Concierge.
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                [priorConciergeActionID]: buildConciergeAction(priorConciergeActionID, '2024-01-01 00:00:00.000', 'Previous Concierge reply'),
            });

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));
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
            const isConciergeChat = true;

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                [priorConciergeActionID]: buildConciergeAction(priorConciergeActionID, '2024-01-01 00:00:00.000', 'Previous Concierge reply'),
            });

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));
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
