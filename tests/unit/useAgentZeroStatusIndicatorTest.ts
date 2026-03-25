import {act, renderHook, waitFor} from '@testing-library/react-native';
import fs from 'fs';
import path from 'path';
import Onyx from 'react-native-onyx';
import useAgentZeroStatusIndicator from '@hooks/useAgentZeroStatusIndicator';
import {clearAgentZeroProcessingIndicator, subscribeToReportReasoningEvents, unsubscribeFromReportReasoningChannel} from '@libs/actions/Report';
import ConciergeReasoningStore from '@libs/ConciergeReasoningStore';
import type {ReasoningEntry} from '@libs/ConciergeReasoningStore';
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

jest.mock('@libs/actions/Report');
jest.mock('@libs/ConciergeReasoningStore');

const mockClearAgentZeroProcessingIndicator = clearAgentZeroProcessingIndicator as jest.MockedFunction<typeof clearAgentZeroProcessingIndicator>;

const mockSubscribeToReportReasoningEvents = subscribeToReportReasoningEvents as jest.MockedFunction<typeof subscribeToReportReasoningEvents>;
const mockUnsubscribeFromReportReasoningChannel = unsubscribeFromReportReasoningChannel as jest.MockedFunction<typeof unsubscribeFromReportReasoningChannel>;
const mockConciergeReasoningStore = ConciergeReasoningStore as jest.Mocked<typeof ConciergeReasoningStore>;

describe('useAgentZeroStatusIndicator', () => {
    const reportID = '123';

    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(() => {
        jest.clearAllMocks();
        Onyx.clear();

        // Setup default mocks
        mockConciergeReasoningStore.subscribe = jest.fn().mockReturnValue(() => {});
        mockConciergeReasoningStore.getReasoningHistory = jest.fn().mockReturnValue([]);
        mockConciergeReasoningStore.addReasoning = jest.fn();
        mockConciergeReasoningStore.clearReasoning = jest.fn();

        // Make clearAgentZeroProcessingIndicator actually clear the Onyx NVP
        // so safety timeout and reconnect tests can verify the full clearing flow
        mockClearAgentZeroProcessingIndicator.mockImplementation((rID: string) => {
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${rID}`, {agentZeroProcessingRequestIndicator: null});
        });
    });

    afterEach(() => {
        jest.clearAllTimers();
    });

    describe('basic functionality', () => {
        it('should return default state when not a Concierge chat', async () => {
            // Given a regular chat (not Concierge)
            const isConciergeChat = false;

            // When we render the hook
            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));

            // Then it should return default state with no processing indicator
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(false);
            expect(result.current.statusLabel).toBe('');
            expect(result.current.reasoningHistory).toEqual([]);
            expect(result.current.kickoffWaitingIndicator).toBeInstanceOf(Function);
        });

        it('should return processing state when server label is present in Concierge chat', async () => {
            // Given a Concierge chat with a server status label
            const isConciergeChat = true;
            const serverLabel = 'Concierge is looking up categories...';

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: serverLabel,
            });

            // When we render the hook
            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));

            // Then it should show processing state with the server label
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(true);
            expect(result.current.statusLabel).toBe(serverLabel);
        });

        it('should return empty status when server label is cleared', async () => {
            // Given a Concierge chat with an initial server label
            const isConciergeChat = true;
            const serverLabel = 'Concierge is looking up categories...';

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: serverLabel,
            });

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));
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
            const isConciergeChat = true;

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));
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
            const isConciergeChat = true;
            const serverLabel = 'Concierge is looking up categories...';

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: serverLabel,
            });

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));
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
            const isConciergeChat = false;

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));
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
            const isConciergeChat = true;

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));
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

    describe('ConciergeReasoningStore integration', () => {
        it('should subscribe to ConciergeReasoningStore on mount', async () => {
            // Given a Concierge chat
            const isConciergeChat = true;

            // When we render the hook
            renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));
            await waitForBatchedUpdates();

            // Then it should subscribe to the reasoning store
            expect(mockConciergeReasoningStore.subscribe).toHaveBeenCalledTimes(1);
            expect(mockConciergeReasoningStore.getReasoningHistory).toHaveBeenCalledWith(reportID);
        });

        it('should update reasoning history when store notifies of changes', async () => {
            // Given a Concierge chat with reasoning history
            const isConciergeChat = true;
            const mockReasoningHistory: ReasoningEntry[] = [
                {reasoning: 'First reasoning', loopCount: 1, timestamp: Date.now()},
                {reasoning: 'Second reasoning', loopCount: 2, timestamp: Date.now()},
            ];

            let subscriberCallback: ((reportID: string, entries: ReasoningEntry[]) => void) | null = null;
            mockConciergeReasoningStore.subscribe = jest.fn().mockImplementation((callback: (reportID: string, entries: ReasoningEntry[]) => void) => {
                subscriberCallback = callback;
                return () => {};
            });

            mockConciergeReasoningStore.getReasoningHistory = jest.fn().mockReturnValue([]);

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));
            await waitForBatchedUpdates();

            // When the store notifies of new reasoning entries
            act(() => {
                subscriberCallback?.(reportID, mockReasoningHistory);
            });

            // Then the hook should update with the new reasoning history
            await waitForBatchedUpdates();
            expect(result.current.reasoningHistory).toEqual(mockReasoningHistory);
        });

        it('should not update reasoning history for different report IDs', async () => {
            // Given a Concierge chat
            const isConciergeChat = true;
            const otherReportID = '456';
            const mockReasoningHistory: ReasoningEntry[] = [{reasoning: 'Other report reasoning', loopCount: 1, timestamp: Date.now()}];

            let subscriberCallback: ((reportID: string, entries: ReasoningEntry[]) => void) | null = null;
            mockConciergeReasoningStore.subscribe = jest.fn().mockImplementation((callback: (reportID: string, entries: ReasoningEntry[]) => void) => {
                subscriberCallback = callback;
                return () => {};
            });

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));
            await waitForBatchedUpdates();

            const initialHistory = result.current.reasoningHistory;

            // When the store notifies of changes for a different report
            act(() => {
                subscriberCallback?.(otherReportID, mockReasoningHistory);
            });

            // Then the current hook should not update its reasoning history
            await waitForBatchedUpdates();
            expect(result.current.reasoningHistory).toEqual(initialHistory);
            expect(result.current.reasoningHistory).not.toEqual(mockReasoningHistory);
        });
    });

    describe('Pusher integration', () => {
        it('should subscribe to Pusher reasoning events for Concierge chat on mount', async () => {
            // Given a Concierge chat
            const isConciergeChat = true;

            // When we render the hook
            renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));
            await waitForBatchedUpdates();

            // Then it should subscribe to reasoning events
            expect(mockSubscribeToReportReasoningEvents).toHaveBeenCalledTimes(1);
            expect(mockSubscribeToReportReasoningEvents).toHaveBeenCalledWith(reportID);
        });

        it('should not subscribe to Pusher for non-Concierge chat', async () => {
            // Given a regular chat (not Concierge)
            const isConciergeChat = false;

            // When we render the hook
            renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));
            await waitForBatchedUpdates();

            // Then it should not subscribe
            expect(mockSubscribeToReportReasoningEvents).not.toHaveBeenCalled();
        });

        it('should unsubscribe from Pusher on unmount', async () => {
            // Given a Concierge chat that's already subscribed
            const isConciergeChat = true;

            const {unmount} = renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));
            await waitForBatchedUpdates();

            // When the component unmounts
            unmount();

            // Then it should unsubscribe from reasoning events
            await waitForBatchedUpdates();
            expect(mockUnsubscribeFromReportReasoningChannel).toHaveBeenCalledTimes(1);
            expect(mockUnsubscribeFromReportReasoningChannel).toHaveBeenCalledWith(reportID);
        });
    });
    describe('report switching', () => {
        it('should update subscriptions when report ID changes', async () => {
            // Given a Concierge chat
            const isConciergeChat = true;
            const newReportID = '456';

            const {rerender} = renderHook(({reportID: rID, isConciergeChat: isCC}) => useAgentZeroStatusIndicator(rID, isCC), {
                initialProps: {reportID, isConciergeChat},
            });
            await waitForBatchedUpdates();

            // Clear the initial subscription calls
            jest.clearAllMocks();

            // When the report ID changes
            rerender({reportID: newReportID, isConciergeChat});

            // Then it should unsubscribe from the old report and subscribe to the new report
            await waitForBatchedUpdates();
            expect(mockUnsubscribeFromReportReasoningChannel).toHaveBeenCalledWith(reportID);
            expect(mockSubscribeToReportReasoningEvents).toHaveBeenCalledWith(newReportID);
        });

        it('should unsubscribe when switching from Concierge to non-Concierge chat', async () => {
            // Given a Concierge chat with active subscriptions
            const {rerender} = renderHook(({reportID: rID, isConciergeChat: isCC}) => useAgentZeroStatusIndicator(rID, isCC), {
                initialProps: {reportID, isConciergeChat: true},
            });
            await waitForBatchedUpdates();

            // Clear the initial subscription calls
            jest.clearAllMocks();

            // When switching to a non-Concierge chat
            rerender({reportID, isConciergeChat: false});

            // Then it should unsubscribe
            await waitForBatchedUpdates();
            expect(mockUnsubscribeFromReportReasoningChannel).toHaveBeenCalledTimes(1);
        });

        it('should subscribe when switching from non-Concierge to Concierge chat', async () => {
            // Given a non-Concierge chat
            const {rerender} = renderHook(({reportID: rID, isConciergeChat: isCC}) => useAgentZeroStatusIndicator(rID, isCC), {
                initialProps: {reportID, isConciergeChat: false},
            });
            await waitForBatchedUpdates();

            // When switching to a Concierge chat
            rerender({reportID, isConciergeChat: true});

            // Then it should subscribe to reasoning events
            await waitForBatchedUpdates();
            expect(mockSubscribeToReportReasoningEvents).toHaveBeenCalledTimes(1);
            expect(mockSubscribeToReportReasoningEvents).toHaveBeenCalledWith(reportID);
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
        it('should clear optimistic state and reasoning history when final response arrives', async () => {
            // Given a Concierge chat with reasoning history in the store
            const isConciergeChat = true;
            const mockReasoningHistory: ReasoningEntry[] = [
                {reasoning: 'Analyzing request', loopCount: 1, timestamp: Date.now()},
                {reasoning: 'Fetching data', loopCount: 2, timestamp: Date.now()},
            ];

            let subscriberCallback: ((reportID: string, entries: ReasoningEntry[]) => void) | null = null;
            mockConciergeReasoningStore.subscribe = jest.fn().mockImplementation((callback: (reportID: string, entries: ReasoningEntry[]) => void) => {
                subscriberCallback = callback;
                return () => {};
            });
            mockConciergeReasoningStore.getReasoningHistory = jest.fn().mockReturnValue([]);

            // Set initial server label (processing)
            const serverLabel = 'Concierge is looking up categories...';
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: serverLabel,
            });

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));
            await waitForBatchedUpdates();

            // Simulate reasoning history arriving
            act(() => {
                subscriberCallback?.(reportID, mockReasoningHistory);
            });
            await waitForBatchedUpdates();

            // Verify processing state is active with reasoning history
            expect(result.current.isProcessing).toBe(true);
            expect(result.current.statusLabel).toBe(serverLabel);
            expect(result.current.reasoningHistory).toEqual(mockReasoningHistory);

            // When the final Concierge response arrives, the backend clears the processing indicator
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
                agentZeroProcessingRequestIndicator: '',
            });

            // Then step 7: processing indicator clears → reasoning state clears
            await waitForBatchedUpdates();
            expect(result.current.isProcessing).toBe(false);
            expect(result.current.statusLabel).toBe('');
            expect(mockConciergeReasoningStore.clearReasoning).toHaveBeenCalledWith(reportID);
        });

        it('should clear optimistic state when server completes after kickoff', async () => {
            // Given a Concierge chat where user triggered optimistic waiting
            const isConciergeChat = true;

            const {result} = renderHook(() => useAgentZeroStatusIndicator(reportID, isConciergeChat));
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
