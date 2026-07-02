import Onyx from 'react-native-onyx';
import * as NetworkState from '@libs/NetworkState';
import {clear as clearPersistedRequests, save as savePersistedRequest, updateOngoingRequest} from '@userActions/PersistedRequests';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import * as SequentialQueue from '../../src/libs/Network/SequentialQueue';
import type Request from '../../src/types/onyx/Request';
import type {MockFetch} from '../utils/TestHelper';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Mock ActiveClientManager so we control leadership: start as a follower, and let promoteToLeader() flip us to leader.
const mockLeaderState = {isLeader: false};
const mockIsClientTheLeader = jest.fn(() => mockLeaderState.isLeader);
const mockPromoteToLeader = jest.fn(() => {
    mockLeaderState.isLeader = true;
});
jest.mock('@libs/ActiveClientManager', () => ({
    init: jest.fn(),
    isReady: jest.fn(() => Promise.resolve()),
    isClientTheLeader: () => mockIsClientTheLeader(),
    promoteToLeader: () => mockPromoteToLeader(),
}));

const request: Request<'userMetadata'> = {
    command: 'ReconnectApp',
    successData: [{key: 'userMetadata', onyxMethod: 'set', value: {accountID: 1234}}],
    failureData: [{key: 'userMetadata', onyxMethod: 'set', value: {}}],
};

let mockFetch: MockFetch;

beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
});

beforeEach(() => {
    jest.useFakeTimers();
    mockFetch = TestHelper.createGlobalFetchMock();
    global.fetch = mockFetch;
    jest.spyOn(NetworkState, 'getIsOffline').mockReturnValue(false);
    mockLeaderState.isLeader = false;
    mockIsClientTheLeader.mockClear();
    mockPromoteToLeader.mockClear();
    return Onyx.clear().then(() => SequentialQueue.clearQueueFlushedData());
});

afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
});

describe('SequentialQueue leader-election recovery', () => {
    it('self-promotes and flushes when stuck as a non-leader with queued work', async () => {
        // A request is persisted but this tab is not the leader, so flush() bails and arms the safety-net timer.
        savePersistedRequest(request);
        await waitForBatchedUpdates();
        SequentialQueue.flush();

        // Before the timeout elapses we must NOT have self-promoted.
        expect(mockPromoteToLeader).not.toHaveBeenCalled();

        // After the timeout, with the queue still stuck, we self-promote to recover.
        jest.advanceTimersByTime(CONST.NETWORK.STUCK_QUEUE_LEADER_PROMOTION_TIMEOUT_MS);

        expect(mockPromoteToLeader).toHaveBeenCalledTimes(1);
        expect(mockLeaderState.isLeader).toBe(true);
    });

    it('does not self-promote if it becomes the leader before the timeout', async () => {
        savePersistedRequest(request);
        await waitForBatchedUpdates();
        SequentialQueue.flush();

        // Leadership is acquired through the normal path (e.g. ActiveClientManager re-adds us) before the timer fires.
        mockLeaderState.isLeader = true;

        jest.advanceTimersByTime(CONST.NETWORK.STUCK_QUEUE_LEADER_PROMOTION_TIMEOUT_MS);

        expect(mockPromoteToLeader).not.toHaveBeenCalled();
    });

    it('does not self-promote while a request is already in flight (avoids duplicate writes)', async () => {
        // A live leader in another tab has a request in flight that outlasts the timeout (e.g. slow upload).
        // Promoting here would re-issue the same ongoing request as a duplicate, so we must not.
        updateOngoingRequest(request);
        await waitForBatchedUpdates();
        SequentialQueue.flush();

        jest.advanceTimersByTime(CONST.NETWORK.STUCK_QUEUE_LEADER_PROMOTION_TIMEOUT_MS);

        expect(mockPromoteToLeader).not.toHaveBeenCalled();
    });

    it('does not self-promote if the queue drained before the timeout', async () => {
        savePersistedRequest(request);
        await waitForBatchedUpdates();
        SequentialQueue.flush();

        // The shared queue is emptied by the real leader in another tab before our timer fires.
        clearPersistedRequests();
        await waitForBatchedUpdates();

        jest.advanceTimersByTime(CONST.NETWORK.STUCK_QUEUE_LEADER_PROMOTION_TIMEOUT_MS);

        expect(mockPromoteToLeader).not.toHaveBeenCalled();
    });
});
