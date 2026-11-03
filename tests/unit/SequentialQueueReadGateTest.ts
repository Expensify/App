import * as NetworkState from '@libs/NetworkState';

import ONYXKEYS from '@src/ONYXKEYS';
import type Request from '@src/types/onyx/Request';

import Onyx from 'react-native-onyx';

import type {MockFetch} from '../utils/TestHelper';

import * as SequentialQueue from '../../src/libs/Network/SequentialQueue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/ActiveClientManager', () => ({
    isClientTheLeader: jest.fn(() => true),
    isReady: jest.fn(() => Promise.resolve()),
    init: jest.fn(),
}));

// Kept apart from SequentialQueueTest so no pushed request has moved the shared gate before a test starts.

const request: Request<'userMetadata'> = {
    command: 'ReconnectApp',
    successData: [{key: 'userMetadata', onyxMethod: 'set', value: {accountID: 1234}}],
    failureData: [{key: 'userMetadata', onyxMethod: 'set', value: {}}],
};

let mockFetch: MockFetch;
let offlineSpy: jest.SpyInstance<boolean, []>;
let networkStateListeners: Array<() => void>;

beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
});

beforeEach(() => {
    mockFetch = TestHelper.createGlobalFetchMock();
    global.fetch = mockFetch;
    offlineSpy = jest.spyOn(NetworkState, 'getIsOffline').mockReturnValue(false);
    networkStateListeners = [];
    jest.spyOn(NetworkState, 'subscribe').mockImplementation((callback) => {
        networkStateListeners.push(callback);
        return () => {
            networkStateListeners = networkStateListeners.filter((listener) => listener !== callback);
        };
    });
    return Onyx.clear().then(waitForBatchedUpdates);
});

afterEach(() => {
    jest.restoreAllMocks();
    SequentialQueue.resetQueue();
});

/** Flips the network and notifies the listeners `waitForIdle()` subscribes to, the way NetworkState would. */
function setOffline(isOffline: boolean) {
    offlineSpy.mockReturnValue(isOffline);
    for (const listener of [...networkStateListeners]) {
        listener();
    }
}

/** Starts a READ-style wait on the gate. `hasResolved` lets a test assert the wait has *not* settled yet. */
function trackIdle() {
    const state = {hasResolved: false};
    SequentialQueue.waitForIdle().then(() => {
        state.hasResolved = true;
    });
    return state;
}

describe('SequentialQueue.claimReadGateForDeferredWrite', () => {
    it('parks a READ until the deferred write settles its claim', async () => {
        // Given a deferred write holding the gate before reaching the queue
        const settleClaim = SequentialQueue.claimReadGateForDeferredWrite();

        // When a READ consults the gate in that window
        const idle = trackIdle();
        await waitForBatchedUpdates();

        // Then it waits, exactly as it would behind a queued write
        expect(idle.hasResolved).toBe(false);

        // When the write never reaches the queue and the claim is settled
        settleClaim();
        await waitForBatchedUpdates();

        // Then the READ proceeds
        expect(idle.hasResolved).toBe(true);
    });

    it('keeps waiting on the queue once the deferred write lands there', async () => {
        // Given a READ parked behind a deferred write
        const settleClaim = SequentialQueue.claimReadGateForDeferredWrite();
        const idle = trackIdle();
        mockFetch.pause();

        // When the write reaches the queue and the claim settles, as writeWhenReady does on the same tick
        SequentialQueue.push(request);
        settleClaim();
        await waitForBatchedUpdates();

        // Then the READ is still parked. The handover has no gap: waitForIdle() only reads the queue's own
        // gate after the claim settles, by which point push() has closed it again for the in-flight write.
        expect(idle.hasResolved).toBe(false);

        // When the queue drains
        await mockFetch.resume();
        await waitForBatchedUpdates();

        // Then the READ proceeds
        expect(idle.hasResolved).toBe(true);
    });

    it('survives unrelated queue activity resolving the queue gate mid-deferral', async () => {
        // Given a deferred write holding the gate, with nothing pushed yet
        const settleClaim = SequentialQueue.claimReadGateForDeferredWrite();
        const idle = trackIdle();

        // When something else flushes in that window and finds no requests, because the deferred write has
        // not been pushed, so it resolves the queue's own gate
        SequentialQueue.flush();
        await waitForBatchedUpdates();

        // Then the claim is untouched. It is a separate gate precisely so that no queue path can read an
        // empty queue as "nothing is coming" and let through the READs this write must be ordered before.
        expect(idle.hasResolved).toBe(false);

        settleClaim();
        await waitForBatchedUpdates();
        expect(idle.hasResolved).toBe(true);
    });

    it('survives an unrelated write draining to completion mid-deferral', async () => {
        // Given a deferred write holding the gate
        const settleClaim = SequentialQueue.claimReadGateForDeferredWrite();

        // When an ordinary write lands during the deferral and runs to completion, so the queue resolves
        // its own gate from the drain path rather than from the empty-queue branch above
        SequentialQueue.push(request);
        await waitForBatchedUpdates();
        await waitForBatchedUpdates();

        // Then a READ firing afterwards still parks. The drain says nothing about the deferred write,
        // which is not on the queue yet - reading it as "all writes are done" is what #99805 was.
        const idle = trackIdle();
        await waitForBatchedUpdates();
        expect(idle.hasResolved).toBe(false);

        settleClaim();
        await waitForBatchedUpdates();
        expect(idle.hasResolved).toBe(true);
    });

    it('waits for every outstanding claim, not just the first one to settle', async () => {
        // Given two deferred writes, each holding the gate
        const settleFirst = SequentialQueue.claimReadGateForDeferredWrite();
        const settleSecond = SequentialQueue.claimReadGateForDeferredWrite();
        const idle = trackIdle();
        await waitForBatchedUpdates();
        expect(idle.hasResolved).toBe(false);

        // When only the first settles
        settleFirst();
        await waitForBatchedUpdates();

        // Then the READ stays parked: the second write is still deferred and would be raced otherwise
        expect(idle.hasResolved).toBe(false);

        // When the second settles too
        settleSecond();
        await waitForBatchedUpdates();

        // Then the READ proceeds
        expect(idle.hasResolved).toBe(true);
    });

    it('does not park READs while offline', async () => {
        // Given the app is offline, where the queue is not running
        setOffline(true);

        // When a deferred write claims the gate and a READ consults it
        SequentialQueue.claimReadGateForDeferredWrite();
        const idle = trackIdle();
        await waitForBatchedUpdates();

        // Then the READ is not parked behind a queue that cannot drain, matching push() and flush()
        expect(idle.hasResolved).toBe(true);
    });

    it('releases a parked READ when the app goes offline mid-deferral', async () => {
        // Given a READ parked behind a deferred write while online
        SequentialQueue.claimReadGateForDeferredWrite();
        const idle = trackIdle();
        await waitForBatchedUpdates();
        expect(idle.hasResolved).toBe(false);

        // When the network drops before the barrier settles
        setOffline(true);
        await waitForBatchedUpdates();

        // Then the READ is let through rather than held for the rest of the deferral
        expect(idle.hasResolved).toBe(true);
    });

    it('parks READs again when the app comes back online mid-deferral', async () => {
        // Given a deferred write claimed while offline, which parks nothing
        setOffline(true);
        const settleClaim = SequentialQueue.claimReadGateForDeferredWrite();

        // When the network comes back while the barrier is still waiting
        setOffline(false);
        const idle = trackIdle();
        await waitForBatchedUpdates();

        // Then the claim applies again: the queue can run now, so a READ must not overtake the write
        expect(idle.hasResolved).toBe(false);

        settleClaim();
        await waitForBatchedUpdates();
        expect(idle.hasResolved).toBe(true);
    });

    it('does not let a claim wiped by resetQueue() settle a later one', async () => {
        // Given a claim that outlives a reset, and a fresh claim taken after it
        const settleStaleClaim = SequentialQueue.claimReadGateForDeferredWrite();
        SequentialQueue.resetQueue();
        const settleClaim = SequentialQueue.claimReadGateForDeferredWrite();
        const idle = trackIdle();

        // When the wiped claim finally settles
        settleStaleClaim();
        await waitForBatchedUpdates();

        // Then it does not decrement the live claim's count. Sharing one counter across a reset would open
        // the gate here while the second write is still deferred.
        expect(idle.hasResolved).toBe(false);

        settleClaim();
        await waitForBatchedUpdates();
        expect(idle.hasResolved).toBe(true);
    });
});
