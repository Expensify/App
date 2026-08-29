import * as NetworkState from '@libs/NetworkState';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import * as SequentialQueue from '../../src/libs/Network/SequentialQueue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/ActiveClientManager', () => ({
    isClientTheLeader: jest.fn(() => true),
    isReady: jest.fn(() => Promise.resolve()),
    init: jest.fn(),
}));

// `waitForIdle()` hands back a module-level promise, so every test here shares one gate. Each releases what
// it claims, and this lives apart from SequentialQueueTest so no pushed request has moved the gate first.

let offlineSpy: jest.SpyInstance<boolean, []>;

beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
});

beforeEach(() => {
    offlineSpy = jest.spyOn(NetworkState, 'getIsOffline').mockReturnValue(false);
});

afterEach(() => {
    offlineSpy.mockRestore();
    // The gate is module state, and a handed-off claim is deliberately not releasable, so reset rather
    // than leaving the next test to start behind a gate this one left pending.
    SequentialQueue.resetQueue();
});

/** Starts a READ-style wait on the gate. `hasResolved` lets a test assert the wait has *not* settled yet. */
function trackIdle() {
    const state = {hasResolved: false};
    SequentialQueue.waitForIdle().then(() => {
        state.hasResolved = true;
    });
    return state;
}

describe('SequentialQueue.claimReadGateForDeferredWrite', () => {
    it('parks a READ until the claim is released', async () => {
        // Given a deferred write that has claimed the gate before reaching the queue
        const claim = SequentialQueue.claimReadGateForDeferredWrite();

        // When a READ consults the gate in that same window
        const idle = trackIdle();
        await waitForBatchedUpdates();

        // Then it waits, exactly as it would behind a queued write
        expect(idle.hasResolved).toBe(false);

        // When the write never reaches the queue and the claim is given back
        claim.release();
        await waitForBatchedUpdates();

        // Then the READ proceeds
        expect(idle.hasResolved).toBe(true);
    });

    it('keeps the gate pending after a hand off, leaving it to the queue drain', async () => {
        // Given a deferred write whose write() call has just pushed onto the queue
        const claim = SequentialQueue.claimReadGateForDeferredWrite();
        const idle = trackIdle();

        // When it hands the gate over
        claim.handOff();
        await waitForBatchedUpdates();

        // Then the READ stays parked: handing over means the queue owns the gate now, and only the drain
        // should free it - releasing here would let READs through while the write is still in flight
        expect(idle.hasResolved).toBe(false);

        claim.release();
        await waitForBatchedUpdates();
        expect(idle.hasResolved).toBe(false);
    });

    it('survives a flush() that finds the queue empty while the write is still deferred', async () => {
        // Given a deferred write holding the gate, with nothing pushed yet
        const claim = SequentialQueue.claimReadGateForDeferredWrite();
        const idle = trackIdle();

        // When something else flushes in that window and finds no requests, because the deferred write
        // has not been pushed
        SequentialQueue.flush();
        await waitForBatchedUpdates();

        // Then the gate survives. Reading an empty queue as "nothing is coming" here would let through
        // exactly the READs this write is meant to be ordered before, which is the whole point of the claim.
        expect(idle.hasResolved).toBe(false);

        claim.release();
        await waitForBatchedUpdates();
        expect(idle.hasResolved).toBe(true);
    });

    it('adopts an existing claim rather than opening a second gate', async () => {
        // Given a claim already held by a deferred write
        const first = SequentialQueue.claimReadGateForDeferredWrite();

        // When a second deferred write claims it too
        const second = SequentialQueue.claimReadGateForDeferredWrite();
        const idle = trackIdle();
        await waitForBatchedUpdates();
        expect(idle.hasResolved).toBe(false);

        // Then both refer to one gate, so releasing it once is enough - the handover leaves no second
        // gate for a READ to be stranded behind
        first.release();
        await waitForBatchedUpdates();
        expect(idle.hasResolved).toBe(true);

        second.release();
    });

    it('is a no-op while offline, matching push() and flush()', async () => {
        // Given the app is offline, where the queue is not running
        offlineSpy.mockReturnValue(true);

        // When a deferred write claims the gate
        const claim = SequentialQueue.claimReadGateForDeferredWrite();
        const idle = trackIdle();
        await waitForBatchedUpdates();

        // Then READs are not parked behind a queue that cannot drain
        expect(idle.hasResolved).toBe(true);

        claim.release();
    });

    it('ignores a release once a later write has opened a new gate', async () => {
        // Given a claim that has already been released
        const stale = SequentialQueue.claimReadGateForDeferredWrite();
        stale.release();
        await waitForBatchedUpdates();

        // When a later write opens a fresh gate and the stale release fires afterwards
        const claim = SequentialQueue.claimReadGateForDeferredWrite();
        const idle = trackIdle();
        stale.release();
        await waitForBatchedUpdates();

        // Then the stale release cannot let through READs waiting on somebody else's write
        expect(idle.hasResolved).toBe(false);

        claim.release();
        await waitForBatchedUpdates();
        expect(idle.hasResolved).toBe(true);
    });
});
