import resolveWriteBarrier, {IMMEDIATE} from '@libs/actions/IOU/resolveWriteBarrier';
import type {WriteReadyBarrier} from '@libs/API';
import {flushPendingSearchWrite, getSearchWriteWatchKey, hasPendingSearchWrite, markPendingSearchWrite, resetForTesting} from '@libs/pendingSearchWrite';
import {addOptimization} from '@libs/telemetry/submitFollowUpAction';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

jest.mock('@libs/telemetry/submitFollowUpAction', () => ({addOptimization: jest.fn()}));

const WATCH_KEY = `${ONYXKEYS.COLLECTION.TRANSACTION}1` as const;

/** Resolves once the barrier releases, so a test can tell "waits" from "goes out now". */
function settled(barrier: WriteReadyBarrier) {
    let isSettled = false;
    Promise.resolve(barrier(new AbortController().signal)).then(() => {
        isSettled = true;
    });
    return () => isSettled;
}

beforeEach(() => {
    jest.clearAllMocks();
    resetForTesting();
});

describe('resolveWriteBarrier', () => {
    it('writes immediately when nothing is pending', async () => {
        // Given no explicit barrier and no pending Search signal
        // When a write barrier is resolved for it
        const barrier = resolveWriteBarrier();
        const isSettled = settled(barrier);
        await Promise.resolve();

        // Then it gets the shared already-resolved barrier, so the write goes out immediately, and no
        // deferral is recorded for the submit-expense telemetry
        expect(barrier).toBe(IMMEDIATE);
        expect(isSettled()).toBe(true);
        expect(addOptimization).not.toHaveBeenCalled();
    });

    it("prefers the caller's barrier over Search's", async () => {
        // Given Search's signal is up and the caller also hands down its own barrier, unresolved
        markPendingSearchWrite();
        let releaseWriteBarrier: () => void = () => {};
        const writeBarrier: WriteReadyBarrier = () =>
            new Promise<void>((resolve) => {
                releaseWriteBarrier = resolve;
            });

        // When a write barrier is resolved with both available
        const barrier = resolveWriteBarrier({writeBarrier, optimisticWatchKey: WATCH_KEY});
        const isSettled = settled(barrier);
        await Promise.resolve();

        // Then the caller's barrier wins - the resolved barrier still waits on it, not on Search - and
        // Search's watch key stays unpublished since the write is not gated on Search's layout
        expect(isSettled()).toBe(false);
        expect(getSearchWriteWatchKey()).toBeUndefined();
        expect(addOptimization).toHaveBeenCalledWith(CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DEFERRED_WRITE);

        // When the caller's barrier releases
        releaseWriteBarrier();
        await Promise.resolve();
        await Promise.resolve();

        // Then the write goes out
        expect(isSettled()).toBe(true);
    });

    it("keeps Search's signal up until the caller's barrier releases, even if Search flushes first", async () => {
        // Given Search's signal is up and the caller's own barrier has not released yet
        markPendingSearchWrite();
        let releaseWriteBarrier: () => void = () => {};
        const writeBarrier: WriteReadyBarrier = () =>
            new Promise<void>((resolve) => {
                releaseWriteBarrier = resolve;
            });

        const barrier = resolveWriteBarrier({writeBarrier, optimisticWatchKey: WATCH_KEY});
        const barrierSettled = Promise.resolve(barrier(new AbortController().signal));

        // When Search flushes before the caller's barrier has released
        flushPendingSearchWrite();

        // Then Search's signal stays up - clearing it here would let Search issue a query before this
        // write's optimistic data actually exists, since the write is still gated on writeBarrier
        expect(hasPendingSearchWrite()).toBe(true);

        // When the caller's barrier then releases
        releaseWriteBarrier();
        await barrierSettled;

        // Then Search's signal comes down too, now that this write is actually going out
        expect(hasPendingSearchWrite()).toBe(false);
    });

    it("waits on Search's signal when no barrier was handed down", async () => {
        // Given Search's signal is up and the caller passed no explicit barrier
        markPendingSearchWrite();

        // When a write barrier is resolved for it
        const isSettled = settled(resolveWriteBarrier({optimisticWatchKey: WATCH_KEY}));
        await Promise.resolve();

        // Then the write waits on Search's barrier and publishes its watch key, since Search's
        // placeholder needs to know when the optimistic update lands
        expect(isSettled()).toBe(false);
        expect(getSearchWriteWatchKey()).toBe(WATCH_KEY);
        expect(addOptimization).toHaveBeenCalledWith(CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DEFERRED_WRITE);

        // When Search later flushes the signal
        flushPendingSearchWrite();
        await Promise.resolve();

        // Then the write is released
        expect(isSettled()).toBe(true);
    });

    it('never waits on Search for a retry', async () => {
        // Given Search's signal is up
        markPendingSearchWrite();

        // When a write barrier is resolved for a retry, with no explicit barrier
        // A retry runs after the layout that would have released it, so waiting would strand the write
        // until its safety timeout - and the flush that ends that wait is what triggered the retry.
        const barrier = resolveWriteBarrier({isRetry: true, optimisticWatchKey: WATCH_KEY});
        const isSettled = settled(barrier);
        await Promise.resolve();

        // Then the retry skips Search entirely and writes immediately
        expect(barrier).toBe(IMMEDIATE);
        expect(isSettled()).toBe(true);
        expect(getSearchWriteWatchKey()).toBeUndefined();
        expect(addOptimization).not.toHaveBeenCalled();
    });

    it('still consumes the pending Search signal on a retry, despite bypassing it', () => {
        // Given Search's signal is up
        markPendingSearchWrite();

        // When a retry resolves a write barrier, bypassing Search
        resolveWriteBarrier({isRetry: true, optimisticWatchKey: WATCH_KEY});

        // When Search then flushes the signal
        flushPendingSearchWrite();

        // Then the signal clears right away - the retry already counted as the consumer it was waiting
        // for, so it does not sit around holding the skeleton up for a consumer that will never arrive
        expect(hasPendingSearchWrite()).toBe(false);
    });

    it("still honours a caller's barrier on a retry", () => {
        // Given a retry with an explicit barrier passed down
        const writeBarrier: WriteReadyBarrier = () => new Promise<void>(() => {});

        // When a write barrier is resolved for it
        // Then the explicit barrier still wins - isRetry only opts out of Search's signal, not out of
        // a barrier the caller actually handed down
        expect(resolveWriteBarrier({writeBarrier, isRetry: true})).toBe(writeBarrier);
    });

    it('does not publish a watch key when there is no signal to drive a skeleton', () => {
        // Given no pending Search signal
        // When a write barrier is resolved with an optimistic watch key anyway
        resolveWriteBarrier({optimisticWatchKey: WATCH_KEY});

        // Then the key is not published, since there is no skeleton for it to drive
        expect(getSearchWriteWatchKey()).toBeUndefined();
    });

    it('puts several writes of one submission on the same barrier', async () => {
        // Given Search's signal is up
        markPendingSearchWrite();

        // When two writes from the same submission (e.g. a split's receipts) each resolve a barrier
        const isFirstSettled = settled(resolveWriteBarrier({optimisticWatchKey: WATCH_KEY}));
        const isSecondSettled = settled(resolveWriteBarrier({optimisticWatchKey: `${ONYXKEYS.COLLECTION.TRANSACTION}2`}));

        // When Search flushes the signal
        flushPendingSearchWrite();
        await Promise.resolve();

        // Then both release together, rather than racing separate barriers
        expect(isFirstSettled()).toBe(true);
        expect(isSecondSettled()).toBe(true);
    });
});
