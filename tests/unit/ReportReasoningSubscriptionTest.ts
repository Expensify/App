import Onyx from 'react-native-onyx';
import {subscribeToReportReasoningEvents, unsubscribeFromReportReasoningChannel} from '@libs/actions/Report';
import ConciergeReasoningStore from '@libs/ConciergeReasoningStore';
import Pusher from '@libs/Pusher';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Pusher');
jest.mock('@libs/ConciergeReasoningStore');

const mockPusher = Pusher as jest.Mocked<typeof Pusher>;
const mockConciergeReasoningStore = ConciergeReasoningStore as jest.Mocked<typeof ConciergeReasoningStore>;

describe('Report Reasoning Subscription', () => {
    const reportID1 = '123';
    const reportID2 = '456';
    const agentZeroRequestID = 'request-abc';

    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(() => {
        jest.clearAllMocks();
        Onyx.clear();

        // Unsubscribe from any previous subscriptions to ensure clean state
        unsubscribeFromReportReasoningChannel(reportID1);
        unsubscribeFromReportReasoningChannel(reportID2);

        // Clear mocks again after cleanup
        jest.clearAllMocks();

        // Setup default mocks
        mockPusher.subscribe = jest.fn().mockResolvedValue(undefined);
        mockPusher.unsubscribe = jest.fn();
        mockConciergeReasoningStore.addReasoning = jest.fn();
        mockConciergeReasoningStore.clearReasoning = jest.fn();
    });

    afterEach(() => {
        jest.clearAllTimers();
        // Clean up subscriptions after each test
        unsubscribeFromReportReasoningChannel(reportID1);
        unsubscribeFromReportReasoningChannel(reportID2);
    });

    describe('subscribeToReportReasoningEvents', () => {
        it('should subscribe to Pusher concierge reasoning events', async () => {
            // When subscribing to reasoning events for a report
            subscribeToReportReasoningEvents(reportID1);
            await waitForBatchedUpdates();

            // Then it should subscribe to Pusher
            expect(mockPusher.subscribe).toHaveBeenCalledTimes(1);
            expect(mockPusher.subscribe).toHaveBeenCalledWith(expect.stringContaining(reportID1), Pusher.TYPE.CONCIERGE_REASONING, expect.any(Function));
        });

        it('should not subscribe twice to the same report', async () => {
            // When subscribing to the same report twice
            subscribeToReportReasoningEvents(reportID1);
            subscribeToReportReasoningEvents(reportID1);
            await waitForBatchedUpdates();

            // Then it should only subscribe once
            expect(mockPusher.subscribe).toHaveBeenCalledTimes(1);
        });

        it('should allow subscriptions to different reports', async () => {
            // When subscribing to different reports
            subscribeToReportReasoningEvents(reportID1);
            subscribeToReportReasoningEvents(reportID2);
            await waitForBatchedUpdates();

            // Then it should subscribe to both
            expect(mockPusher.subscribe).toHaveBeenCalledTimes(2);
        });

        it('should handle empty reportID gracefully', async () => {
            // When subscribing with empty reportID
            subscribeToReportReasoningEvents('');
            await waitForBatchedUpdates();

            // Then it should not subscribe
            expect(mockPusher.subscribe).not.toHaveBeenCalled();
        });

        it('should handle incoming Pusher events and update store', async () => {
            // Given a subscription with a callback
            type PusherCallback = (data: unknown) => void;
            let pusherCallback: PusherCallback | null = null;
            mockPusher.subscribe = jest.fn().mockImplementation((_channel: string, _eventName: string, callback: PusherCallback) => {
                pusherCallback = callback;
                return Promise.resolve();
            });

            subscribeToReportReasoningEvents(reportID1);
            await waitForBatchedUpdates();

            // When a Pusher reasoning event arrives
            const reasoningEvent = {
                reasoning: 'Checking your expense policy',
                agentZeroRequestID,
                loopCount: 1,
            };

            if (pusherCallback) {
                (pusherCallback as PusherCallback)(reasoningEvent);
            }
            await waitForBatchedUpdates();

            // Then it should add the reasoning to the store
            expect(mockConciergeReasoningStore.addReasoning).toHaveBeenCalledWith(reportID1, {
                reasoning: reasoningEvent.reasoning,
                agentZeroRequestID: reasoningEvent.agentZeroRequestID,
                loopCount: reasoningEvent.loopCount,
            });
        });

        it('should handle Pusher subscription errors gracefully', async () => {
            // Given a Pusher subscription that fails
            const subscriptionError = new Error('Pusher connection failed');
            mockPusher.subscribe = jest.fn().mockRejectedValue(subscriptionError);

            // When subscribing to reasoning events
            subscribeToReportReasoningEvents(reportID1);
            await waitForBatchedUpdates();

            // Then it should not throw and should have attempted to subscribe
            expect(mockPusher.subscribe).toHaveBeenCalledTimes(1);
        });
    });

    describe('unsubscribeFromReportReasoningChannel', () => {
        it('should unsubscribe from Pusher and clear reasoning state', async () => {
            // Given an active subscription
            subscribeToReportReasoningEvents(reportID1);
            await waitForBatchedUpdates();

            // When unsubscribing
            unsubscribeFromReportReasoningChannel(reportID1);
            await waitForBatchedUpdates();

            // Then it should unsubscribe from Pusher and clear reasoning
            expect(mockPusher.unsubscribe).toHaveBeenCalledTimes(1);
            expect(mockPusher.unsubscribe).toHaveBeenCalledWith(expect.stringContaining(reportID1), Pusher.TYPE.CONCIERGE_REASONING);
            expect(mockConciergeReasoningStore.clearReasoning).toHaveBeenCalledWith(reportID1);
        });

        it('should not unsubscribe if not previously subscribed', async () => {
            // When unsubscribing without a prior subscription
            unsubscribeFromReportReasoningChannel(reportID1);
            await waitForBatchedUpdates();

            // Then it should not attempt to unsubscribe
            expect(mockPusher.unsubscribe).not.toHaveBeenCalled();
            expect(mockConciergeReasoningStore.clearReasoning).not.toHaveBeenCalled();
        });

        it('should allow resubscription after unsubscribing', async () => {
            // Given a subscription that was unsubscribed
            subscribeToReportReasoningEvents(reportID1);
            await waitForBatchedUpdates();
            unsubscribeFromReportReasoningChannel(reportID1);
            await waitForBatchedUpdates();

            jest.clearAllMocks();

            // When subscribing again
            subscribeToReportReasoningEvents(reportID1);
            await waitForBatchedUpdates();

            // Then it should subscribe again
            expect(mockPusher.subscribe).toHaveBeenCalledTimes(1);
        });

        it('should handle empty reportID gracefully', async () => {
            // When unsubscribing with empty reportID
            unsubscribeFromReportReasoningChannel('');
            await waitForBatchedUpdates();

            // Then it should not attempt to unsubscribe
            expect(mockPusher.unsubscribe).not.toHaveBeenCalled();
            expect(mockConciergeReasoningStore.clearReasoning).not.toHaveBeenCalled();
        });

        it('should only affect the specific report when unsubscribing', async () => {
            // Given subscriptions to multiple reports
            subscribeToReportReasoningEvents(reportID1);
            subscribeToReportReasoningEvents(reportID2);
            await waitForBatchedUpdates();

            jest.clearAllMocks();

            // When unsubscribing from one report
            unsubscribeFromReportReasoningChannel(reportID1);
            await waitForBatchedUpdates();

            // Then it should only unsubscribe from that report
            expect(mockPusher.unsubscribe).toHaveBeenCalledTimes(1);
            expect(mockPusher.unsubscribe).toHaveBeenCalledWith(expect.stringContaining(reportID1), Pusher.TYPE.CONCIERGE_REASONING);
            expect(mockConciergeReasoningStore.clearReasoning).toHaveBeenCalledWith(reportID1);

            // And the other subscription should still be active
            jest.clearAllMocks();
            subscribeToReportReasoningEvents(reportID2);
            expect(mockPusher.subscribe).not.toHaveBeenCalled(); // Already subscribed
        });
    });

    describe('subscription tracking', () => {
        it('should track subscriptions correctly across multiple operations', async () => {
            // Subscribe to first report
            subscribeToReportReasoningEvents(reportID1);
            await waitForBatchedUpdates();
            expect(mockPusher.subscribe).toHaveBeenCalledTimes(1);

            // Try to subscribe again - should be ignored
            subscribeToReportReasoningEvents(reportID1);
            await waitForBatchedUpdates();
            expect(mockPusher.subscribe).toHaveBeenCalledTimes(1);

            // Subscribe to second report
            subscribeToReportReasoningEvents(reportID2);
            await waitForBatchedUpdates();
            expect(mockPusher.subscribe).toHaveBeenCalledTimes(2);

            // Unsubscribe from first report
            unsubscribeFromReportReasoningChannel(reportID1);
            await waitForBatchedUpdates();
            expect(mockPusher.unsubscribe).toHaveBeenCalledTimes(1);

            // Resubscribe to first report - should work now
            subscribeToReportReasoningEvents(reportID1);
            await waitForBatchedUpdates();
            expect(mockPusher.subscribe).toHaveBeenCalledTimes(3);
        });
    });
});
