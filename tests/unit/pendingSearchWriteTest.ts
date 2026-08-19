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

/** Resolves once the barrier releases, so a test can assert release without an arbitrary wait. */
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
        expect(hasPendingSearchWrite()).toBe(false);

        markPendingSearchWrite();
        acquireSearchWriteBarrier();
        expect(hasPendingSearchWrite()).toBe(true);

        flushPendingSearchWrite();
        expect(hasPendingSearchWrite()).toBe(false);
    });

    it('clears the signal synchronously on flush, before the barrier consumers run', () => {
        markPendingSearchWrite();
        const isSettled = settled(acquireSearchWriteBarrier());

        flushPendingSearchWrite();

        // Search reads the signal right after flushing to decide whether to issue its own search - it
        // must already be down at that point, while the write itself has not gone out yet.
        expect(hasPendingSearchWrite()).toBe(false);
        expect(isSettled()).toBe(false);
    });

    it('releases a barrier that was acquired before the flush', async () => {
        markPendingSearchWrite();
        const isSettled = settled(acquireSearchWriteBarrier());

        flushPendingSearchWrite();
        await Promise.resolve();

        expect(isSettled()).toBe(true);
    });

    it('releases every barrier acquired under one signal together', async () => {
        markPendingSearchWrite();
        // A split submission puts one write per receipt on the same signal.
        const isFirstSettled = settled(acquireSearchWriteBarrier());
        markPendingSearchWrite();
        const isSecondSettled = settled(acquireSearchWriteBarrier());

        flushPendingSearchWrite();
        await Promise.resolve();

        expect(isFirstSettled()).toBe(true);
        expect(isSecondSettled()).toBe(true);
    });

    it('hands out an already-resolved barrier when the flush arrived before the write was built', async () => {
        markPendingSearchWrite();
        flushPendingSearchWrite();

        const isSettled = settled(acquireSearchWriteBarrier());
        await Promise.resolve();

        expect(isSettled()).toBe(true);
    });

    it('holds the signal up when the flush arrives before any write took the barrier', () => {
        markPendingSearchWrite();

        flushPendingSearchWrite();

        // The write is still coming. Dropping the signal here would pull the skeleton out from under it
        // and let Search issue a query for data the optimistic write is about to provide.
        expect(hasPendingSearchWrite()).toBe(true);
    });

    it('drops the held signal once the late write takes the barrier', () => {
        markPendingSearchWrite();
        flushPendingSearchWrite();

        acquireSearchWriteBarrier();

        expect(hasPendingSearchWrite()).toBe(false);
    });

    it('hands out an already-resolved barrier when nothing was marked', async () => {
        const isSettled = settled(acquireSearchWriteBarrier());
        await Promise.resolve();

        expect(isSettled()).toBe(true);
    });

    it('is a no-op to flush with no signal up', () => {
        expect(() => flushPendingSearchWrite()).not.toThrow();
        expect(hasPendingSearchWrite()).toBe(false);
    });

    it('clears the signal after the safety timeout when Search never flushes', () => {
        jest.useFakeTimers();
        try {
            markPendingSearchWrite();

            jest.advanceTimersByTime(SAFETY_TIMEOUT_MS);

            expect(hasPendingSearchWrite()).toBe(false);
        } finally {
            jest.useRealTimers();
        }
    });

    it("does not let a superseded signal's safety timeout clear the current one", () => {
        jest.useFakeTimers();
        try {
            markPendingSearchWrite();
            acquireSearchWriteBarrier();
            jest.advanceTimersByTime(SAFETY_TIMEOUT_MS / 2);
            flushPendingSearchWrite();
            markPendingSearchWrite();

            // The first mark's timer would fire here if flushing had not cancelled it.
            jest.advanceTimersByTime(SAFETY_TIMEOUT_MS / 2);

            expect(hasPendingSearchWrite()).toBe(true);
        } finally {
            jest.useRealTimers();
        }
    });

    describe('watch key', () => {
        it('keeps the key readable after the write was released', () => {
            markPendingSearchWrite();
            setSearchWriteWatchKey(`${ONYXKEYS.COLLECTION.TRANSACTION}1`);
            acquireSearchWriteBarrier();

            flushPendingSearchWrite();

            // Search resolves the key lazily, often after the write has already gone out.
            expect(getSearchWriteWatchKey()).toBe(`${ONYXKEYS.COLLECTION.TRANSACTION}1`);
        });

        it('drops the previous key when a new submission starts', () => {
            markPendingSearchWrite();
            setSearchWriteWatchKey(`${ONYXKEYS.COLLECTION.TRANSACTION}1`);
            acquireSearchWriteBarrier();
            flushPendingSearchWrite();

            markPendingSearchWrite();

            expect(getSearchWriteWatchKey()).toBeUndefined();
        });

        it('ignores an undefined key instead of dropping the current one', () => {
            markPendingSearchWrite();
            setSearchWriteWatchKey(`${ONYXKEYS.COLLECTION.TRANSACTION}1`);

            setSearchWriteWatchKey(undefined);

            expect(getSearchWriteWatchKey()).toBe(`${ONYXKEYS.COLLECTION.TRANSACTION}1`);
        });
    });
});
