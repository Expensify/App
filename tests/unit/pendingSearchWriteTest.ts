import {SAFETY_TIMEOUT_MS} from '@libs/API/writeWhenReady';
import {
    acquireSearchWriteBarrier,
    flushPendingSearchWrite,
    getSearchWriteWatchKey,
    hasPendingSearchWrite,
    markPendingSearchWrite,
    resetForTesting,
    setSearchWriteWatchKey,
} from '@libs/pendingSearchWrite';

import ONYXKEYS from '@src/ONYXKEYS';

/** Returns a getter that flips to true once `barrier` settles, so a test can assert release without an arbitrary wait. */
function settled(barrier: ReturnType<typeof acquireSearchWriteBarrier>) {
    let isSettled = false;
    Promise.resolve(barrier(new AbortController().signal)).then(() => {
        isSettled = true;
    });
    return () => isSettled;
}

beforeEach(() => {
    resetForTesting();
});

describe('pendingSearchWrite', () => {
    it('raises and clears the signal', () => {
        // Given no submission has started, so nothing should be gating a write yet
        expect(hasPendingSearchWrite()).toBe(false);

        // When a submission marks the signal and a write acquires its barrier
        markPendingSearchWrite();
        acquireSearchWriteBarrier();
        expect(hasPendingSearchWrite()).toBe(true);

        // When Search flushes it, the normal release point for a real-content layout
        flushPendingSearchWrite();

        // Then the signal comes back down - a signal that outlived its flush would keep gating later,
        // unrelated writes that have nothing to do with this submission
        expect(hasPendingSearchWrite()).toBe(false);
    });

    it('clears the signal synchronously on flush, before the barrier consumers run', () => {
        // Given a write has already acquired the barrier
        markPendingSearchWrite();
        const isSettled = settled(acquireSearchWriteBarrier());

        // When Search flushes the signal
        flushPendingSearchWrite();

        // Then the signal is already down, while the barrier has not resolved yet - Search reads the
        // signal right after flushing to decide whether to issue its own search, and must see it down
        // at that point even though the write itself has not gone out
        expect(hasPendingSearchWrite()).toBe(false);
        expect(isSettled()).toBe(false);
    });

    it('releases a barrier that was acquired before the flush', async () => {
        // Given a write has already acquired the barrier
        markPendingSearchWrite();
        const isSettled = settled(acquireSearchWriteBarrier());

        // When Search flushes the signal
        flushPendingSearchWrite();
        await Promise.resolve();

        // Then the barrier resolves
        expect(isSettled()).toBe(true);
    });

    it('releases every barrier acquired under one signal together', async () => {
        // Given two writes acquired the barrier under the same signal - a split submission puts one
        // write per receipt on the same signal
        markPendingSearchWrite();
        const isFirstSettled = settled(acquireSearchWriteBarrier());
        markPendingSearchWrite();
        const isSecondSettled = settled(acquireSearchWriteBarrier());

        // When Search flushes the signal
        flushPendingSearchWrite();
        await Promise.resolve();

        // Then both barriers resolve together, rather than racing separately
        expect(isFirstSettled()).toBe(true);
        expect(isSecondSettled()).toBe(true);
    });

    it('hands out an already-resolved barrier when the flush arrived before the write was built', async () => {
        // Given Search flushed the signal before any write acquired it
        markPendingSearchWrite();
        flushPendingSearchWrite();

        // When the write is built afterwards and acquires the barrier
        const isSettled = settled(acquireSearchWriteBarrier());
        await Promise.resolve();

        // Then it gets an already-resolved barrier and writes immediately, instead of waiting on a
        // release that already happened
        expect(isSettled()).toBe(true);
    });

    it('holds the signal up when the flush arrives before any write took the barrier', () => {
        // Given a submission marked the signal
        markPendingSearchWrite();

        // When Search flushes before any write has acquired the barrier
        flushPendingSearchWrite();

        // Then the signal stays up - the write is still coming, and dropping the signal here would pull
        // the skeleton out from under it and let Search issue a query for data the optimistic write is
        // about to provide
        expect(hasPendingSearchWrite()).toBe(true);
    });

    it('drops the held signal once the late write takes the barrier', () => {
        // Given the signal was held up by an early flush with no write yet
        markPendingSearchWrite();
        flushPendingSearchWrite();

        // When the late write finally acquires the barrier
        acquireSearchWriteBarrier();

        // Then the signal comes down, since the write it was held up for has now arrived
        expect(hasPendingSearchWrite()).toBe(false);
    });

    it('hands out an already-resolved barrier when nothing was marked', async () => {
        // Given no submission ever marked the signal
        // When a write acquires the barrier anyway
        const isSettled = settled(acquireSearchWriteBarrier());
        await Promise.resolve();

        // Then it gets an already-resolved barrier, so every call site can stay a single
        // `API.writeWhenReady` call instead of branching between it and `API.write`
        expect(isSettled()).toBe(true);
    });

    it('is a no-op to flush with no signal up', () => {
        // Given no signal is up
        // When Search flushes anyway
        // Then nothing throws and the signal stays down
        expect(() => flushPendingSearchWrite()).not.toThrow();
        expect(hasPendingSearchWrite()).toBe(false);
    });

    it('clears the signal after the safety timeout when Search never flushes', () => {
        jest.useFakeTimers();
        try {
            // Given a submission marked the signal
            markPendingSearchWrite();

            // When Search never lays out and the safety timeout elapses
            jest.advanceTimersByTime(SAFETY_TIMEOUT_MS);

            // Then the signal clears itself, so a submission that never reaches a Search release point
            // cannot leave the skeleton up forever
            expect(hasPendingSearchWrite()).toBe(false);
        } finally {
            jest.useRealTimers();
        }
    });

    it("does not let a superseded signal's safety timeout clear the current one", () => {
        jest.useFakeTimers();
        try {
            // Given a first signal that gets flushed and replaced by a second one, partway through the
            // first signal's safety-timeout window
            markPendingSearchWrite();
            acquireSearchWriteBarrier();
            jest.advanceTimersByTime(SAFETY_TIMEOUT_MS / 2);
            flushPendingSearchWrite();
            markPendingSearchWrite();

            // When the first mark's original timer would have fired, if flushing had not cancelled it
            jest.advanceTimersByTime(SAFETY_TIMEOUT_MS / 2);

            // Then the current (second) signal is unaffected - a stale timer clearing the wrong
            // generation would drop a live signal for a submission that hasn't even had a chance to release yet
            expect(hasPendingSearchWrite()).toBe(true);
        } finally {
            jest.useRealTimers();
        }
    });

    describe('watch key', () => {
        it('keeps the key readable after the write was released', () => {
            // Given a watch key was published for a write that then got released
            markPendingSearchWrite();
            setSearchWriteWatchKey(`${ONYXKEYS.COLLECTION.TRANSACTION}1`);
            acquireSearchWriteBarrier();

            // When Search flushes the signal
            flushPendingSearchWrite();

            // Then the key is still readable, since Search resolves it lazily, often after the write has
            // already gone out
            expect(getSearchWriteWatchKey()).toBe(`${ONYXKEYS.COLLECTION.TRANSACTION}1`);
        });

        it('drops the previous key when a new submission starts', () => {
            // Given a completed submission's watch key is still readable
            markPendingSearchWrite();
            setSearchWriteWatchKey(`${ONYXKEYS.COLLECTION.TRANSACTION}1`);
            acquireSearchWriteBarrier();
            flushPendingSearchWrite();

            // When a new submission marks the signal
            markPendingSearchWrite();

            // Then the stale key is dropped, so a later reader cannot mistake it for this new
            // submission's key
            expect(getSearchWriteWatchKey()).toBeUndefined();
        });

        it('ignores an undefined key instead of dropping the current one', () => {
            // Given a watch key is already published
            markPendingSearchWrite();
            setSearchWriteWatchKey(`${ONYXKEYS.COLLECTION.TRANSACTION}1`);

            // When something publishes an undefined key
            setSearchWriteWatchKey(undefined);

            // Then the current key is left untouched
            expect(getSearchWriteWatchKey()).toBe(`${ONYXKEYS.COLLECTION.TRANSACTION}1`);
        });
    });
});
