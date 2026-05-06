import {act, renderHook} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import Pusher from '@libs/Pusher';
import {AgentZeroStatusProvider, useAgentZeroStatus} from '@pages/inbox/AgentZeroStatusContext';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Pusher');

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
    return React.createElement(AgentZeroStatusProvider, {reportID}, children);
}

describe('AgentZeroStatusContext', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();

        mockPusher.subscribe = jest.fn().mockImplementation(() => Object.assign(Promise.resolve(), {unsubscribe: jest.fn()}));
        mockPusher.unsubscribe = jest.fn();

        // Mark this report as Concierge by default
        await Onyx.merge(ONYXKEYS.CONCIERGE_REPORT_ID, reportID);
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    describe('basic functionality', () => {
        it('should short-circuit for non-Concierge chat — default state, no Pusher subscription', async () => {
            // Given a regular chat (not Concierge)
            await Onyx.merge(ONYXKEYS.CONCIERGE_REPORT_ID, '999');

            // When we render the hook
            const {result} = renderHook(() => useAgentZeroStatus(), {wrapper});

            // Then it should return default state with no processing indicator
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(false);
            expect(result.current.statusLabel).toBe('');
            expect(result.current.reasoningHistory).toEqual([]);

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
    });
});
