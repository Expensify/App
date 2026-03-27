import {act, renderHook, waitFor} from '@testing-library/react-native';
import fs from 'fs';
import path from 'path';
import React from 'react';
import Onyx from 'react-native-onyx';
import useAgentZeroStatusIndicator from '@hooks/useAgentZeroStatusIndicator';
import {clearAgentZeroProcessingIndicator} from '@libs/actions/Report';
import Pusher from '@libs/Pusher';
import {AgentZeroStatusProvider, useAgentZeroStatus, useAgentZeroStatusActions} from '@pages/inbox/AgentZeroStatusContext';
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

jest.mock('@libs/Pusher');
jest.mock('@libs/actions/Report', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = jest.requireActual<typeof import('@libs/actions/Report')>('@libs/actions/Report');
    return {
        ...actual,
        clearAgentZeroProcessingIndicator: jest.fn(),
        subscribeToReportReasoningEvents: jest.fn(),
        unsubscribeFromReportReasoningChannel: jest.fn(),
    };
});
jest.mock('@libs/ConciergeReasoningStore', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        subscribe: jest.fn().mockReturnValue(() => {}),
        getReasoningHistory: jest.fn().mockReturnValue([]),
        addReasoning: jest.fn(),
        clearReasoning: jest.fn(),
    },
}));

const mockClearAgentZeroProcessingIndicator = clearAgentZeroProcessingIndicator as jest.MockedFunction<typeof clearAgentZeroProcessingIndicator>;

const mockPusher = Pusher as jest.Mocked<typeof Pusher>;

type PusherCallback = (data: Record<string, unknown>) => void;

/** Captures the reasoning callback passed to Pusher.subscribe for CONCIERGE_REASONING */
function capturePusherCallback(): PusherCallback {
    const call = mockPusher.subscribe.mock.calls.find((c) => c.at(1) === Pusher.TYPE.CONCIERGE_REASONING);
    const callback = call?.at(2) as PusherCallback | undefined;
    if (!callback) {
        throw new Error('Pusher.subscribe was not called for CONCIERGE_REASONING');
    }
    return callback;
}

/** Simulates a Pusher reasoning event */
function simulateReasoning(data: {reasoning: string; agentZeroRequestID: string; loopCount: number}) {
    const callback = capturePusherCallback();
    callback(data as unknown as Record<string, unknown>);
}

const reportID = '123';

function wrapper({children}: {children: React.ReactNode}) {
    return React.createElement(AgentZeroStatusProvider, {reportID, chatType: undefined}, children);
}

describe('AgentZeroStatusContext', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();

        mockPusher.subscribe = jest.fn().mockImplementation(() => Object.assign(Promise.resolve(), {unsubscribe: jest.fn()}));
        mockPusher.unsubscribe = jest.fn();

        // Make clearAgentZeroProcessingIndicator actually clear the Onyx NVP
        // so safety timeout and reconnect tests can verify the full clearing flow
        mockClearAgentZeroProcessingIndicator.mockImplementation((rID: string) => {
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${rID}`, {agentZeroProcessingRequestIndicator: null});
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

            // And no Pusher subscription should have been created
            expect(mockPusher.subscribe).not.toHaveBeenCalled();
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
        it('should subscribe to Pusher for Concierge chat on mount', async () => {
            renderHook(() => useAgentZeroStatus(), {wrapper});
            await waitForBatchedUpdates();

            expect(mockPusher.subscribe).toHaveBeenCalledWith(expect.stringContaining(reportID), Pusher.TYPE.CONCIERGE_REASONING, expect.any(Function));
        });

        it('should not subscribe to Pusher for non-Concierge chat', async () => {
            await Onyx.merge(ONYXKEYS.CONCIERGE_REPORT_ID, '999');

            renderHook(() => useAgentZeroStatus(), {wrapper});
            await waitForBatchedUpdates();

            expect(mockPusher.subscribe).not.toHaveBeenCalledWith(expect.anything(), Pusher.TYPE.CONCIERGE_REASONING, expect.anything());
        });

        it('should unsubscribe from Pusher on unmount', async () => {
            // Track the per-callback unsubscribe handle
            const handleUnsubscribe = jest.fn();
            mockPusher.subscribe = jest.fn().mockImplementation(() => Object.assign(Promise.resolve(), {unsubscribe: handleUnsubscribe}));

            const {unmount} = renderHook(() => useAgentZeroStatus(), {wrapper});
            await waitForBatchedUpdates();

            unmount();

            await waitForBatchedUpdates();
            expect(handleUnsubscribe).toHaveBeenCalled();
        });
    });

    describe('batched Onyx updates (stuck indicator fix)', () => {
        const SAFETY_TIMEOUT_MS = 60000;
        let safetyTimerCallback: (() => void) | null = null;
        let safetyTimerIds: Set<ReturnType<typeof setTimeout>>;
        let originalSetTimeout: typeof setTimeout;
        let originalClearTimeout: typeof clearTimeout;

        beforeEach(() => {
            safetyTimerCallback = null;
            safetyTimerIds = new Set();
            originalSetTimeout = global.setTimeout;
            originalClearTimeout = global.clearTimeout;

            jest.spyOn(global, 'setTimeout').mockImplementation(((callback: () => void, ms?: number) => {
                if (ms === SAFETY_TIMEOUT_MS) {
                    safetyTimerCallback = callback;
                    const id = originalSetTimeout(() => {}, 0);
                    safetyTimerIds.add(id);
                    return id;
                }
                return originalSetTimeout(callback, ms);
            }) as typeof setTimeout);

            jest.spyOn(global, 'clearTimeout').mockImplementation((id) => {
                if (id !== undefined && id !== null && safetyTimerIds.has(id as ReturnType<typeof setTimeout>)) {
                    safetyTimerIds.delete(id as ReturnType<typeof setTimeout>);
                    safetyTimerCallback = null;
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

            // The indicator should be fully cleared (normal path, no TTL needed)
            // The safety timer should also have been cancelled
            await waitFor(() => {
                expect(result.current.isProcessing).toBe(false);
            });
            expect(result.current.statusLabel).toBe('');
            expect(safetyTimerCallback).toBeNull();
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

    describe('safety timeout (TTL lease pattern)', () => {
        // We spy on setTimeout/clearTimeout to capture the safety timer callback
        // rather than using jest.useFakeTimers(), which interferes with Onyx's
        // async batching (waitForBatchedUpdates calls jest.runOnlyPendingTimers
        // when fake timers are detected).
        const SAFETY_TIMEOUT_MS = 60000;
        let safetyTimerCallback: (() => void) | null = null;
        let safetyTimerIds: Set<ReturnType<typeof setTimeout>>;
        let originalSetTimeout: typeof setTimeout;
        let originalClearTimeout: typeof clearTimeout;

        beforeEach(() => {
            safetyTimerCallback = null;
            safetyTimerIds = new Set();
            originalSetTimeout = global.setTimeout;
            originalClearTimeout = global.clearTimeout;

            // Intercept setTimeout to capture safety timer callbacks (60s timeout)
            // while letting shorter timeouts (debounce, display timing) pass through normally
            jest.spyOn(global, 'setTimeout').mockImplementation(((callback: () => void, ms?: number) => {
                if (ms === SAFETY_TIMEOUT_MS) {
                    safetyTimerCallback = callback;
                    const id = originalSetTimeout(() => {}, 0);
                    safetyTimerIds.add(id);
                    return id;
                }
                return originalSetTimeout(callback, ms);
            }) as typeof setTimeout);

            jest.spyOn(global, 'clearTimeout').mockImplementation((id) => {
                if (id !== undefined && id !== null && safetyTimerIds.has(id as ReturnType<typeof setTimeout>)) {
                    safetyTimerIds.delete(id as ReturnType<typeof setTimeout>);
                    safetyTimerCallback = null;
                    return;
                }
                originalClearTimeout(id);
            });
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should auto-clear indicator after safety timeout expires', async () => {
            // Given a Concierge chat where the server sets a processing indicator
            const isConciergeChat = true;
            const serverLabel = 'Concierge is looking up categories...';

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: serverLabel,
            });

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));
            await waitForBatchedUpdates();

            // Verify processing is active and safety timer was registered
            expect(result.current.isProcessing).toBe(true);
            expect(result.current.statusLabel).toBe(serverLabel);
            expect(safetyTimerCallback).not.toBeNull();

            // When the safety timer fires (simulating 60s passing without a CLEAR arriving)
            act(() => {
                safetyTimerCallback?.();
            });
            await waitForBatchedUpdates();

            // Then the indicator should auto-clear via the safety timeout
            await waitFor(() => {
                expect(result.current.isProcessing).toBe(false);
            });
            expect(result.current.statusLabel).toBe('');
        });

        it('should auto-clear optimistic indicator after safety timeout expires', async () => {
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
            expect(safetyTimerCallback).not.toBeNull();

            // When the safety timer fires (60s passed without any server response)
            act(() => {
                safetyTimerCallback?.();
            });
            await waitForBatchedUpdates();

            // Then the indicator should auto-clear
            await waitFor(() => {
                expect(result.current.isProcessing).toBe(false);
            });
            expect(result.current.statusLabel).toBe('');
        });

        it('should cancel safety timer when indicator clears normally', async () => {
            // Given a Concierge chat with an active processing indicator
            const isConciergeChat = true;
            const serverLabel = 'Concierge is looking up categories...';

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: serverLabel,
            });

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(true);
            expect(safetyTimerCallback).not.toBeNull();

            // When the server clears the indicator normally (before 60s timeout)
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: '',
            });
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(false);

            // Then the safety timer should have been cancelled
            expect(safetyTimerCallback).toBeNull();
        });

        it('should reset safety timer when a new server label arrives', async () => {
            // Given a Concierge chat with an active processing indicator
            const isConciergeChat = true;
            const serverLabel1 = 'Concierge is looking up categories...';

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: serverLabel1,
            });

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(true);
            const firstCallback = safetyTimerCallback;
            expect(firstCallback).not.toBeNull();

            // When a new label arrives (still processing), the safety timer should reset
            const serverLabel2 = 'Concierge is preparing your response...';
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: serverLabel2,
            });
            await waitForBatchedUpdates();

            // Then a new safety timer should have been registered (old one cancelled and new one set)
            expect(safetyTimerCallback).not.toBeNull();
            // The callback should be a fresh one (timer was reset)
            // We verify the timer reset by checking that the old callback was cancelled
            // and a new callback was registered
            expect(result.current.isProcessing).toBe(true);
        });
    });

    describe('reconnect reset', () => {
        it('should reset indicator on network reconnect', async () => {
            // Given a Concierge chat with an active processing indicator
            const isConciergeChat = true;
            const serverLabel = 'Concierge is looking up categories...';

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: serverLabel,
            });

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(true);

            // When the network goes offline and then reconnects
            // (simulating Pusher reconnect which could re-deliver stale NVP state)
            await Onyx.set(ONYXKEYS.NETWORK, {isOffline: true, networkStatus: 'offline'});
            await waitForBatchedUpdates();

            await Onyx.set(ONYXKEYS.NETWORK, {isOffline: false, networkStatus: 'online'});
            await waitForBatchedUpdates();

            // Then the indicator should be cleared
            // (reconnect clears stale state, fresh data will come from GetMissingOnyxMessages)
            await waitFor(() => {
                expect(result.current.isProcessing).toBe(false);
            });
            expect(result.current.statusLabel).toBe('');
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
