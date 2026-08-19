import resolveWriteBarrier, {IMMEDIATE} from '@libs/actions/IOU/resolveWriteBarrier';
import type {WriteReadyBarrier} from '@libs/API';
import {flushPendingSearchWrite, getSearchWriteWatchKey, markPendingSearchWrite, resetForTesting} from '@libs/pendingSearchWrite';
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
        const barrier = resolveWriteBarrier();
        const isSettled = settled(barrier);
        await Promise.resolve();

        expect(barrier).toBe(IMMEDIATE);
        expect(isSettled()).toBe(true);
        expect(addOptimization).not.toHaveBeenCalled();
    });

    it("prefers the caller's barrier over Search's", async () => {
        markPendingSearchWrite();
        const writeBarrier: WriteReadyBarrier = () => new Promise<void>(() => {});

        const barrier = resolveWriteBarrier({writeBarrier, optimisticWatchKey: WATCH_KEY});

        expect(barrier).toBe(writeBarrier);
        // The view that handed the barrier down owns the readiness signal, so Search's watch key is
        // not published - the write is not gated on Search's layout.
        expect(getSearchWriteWatchKey()).toBeUndefined();
        expect(addOptimization).toHaveBeenCalledWith(CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DEFERRED_WRITE);
    });

    it("waits on Search's signal when no barrier was handed down", async () => {
        markPendingSearchWrite();

        const isSettled = settled(resolveWriteBarrier({optimisticWatchKey: WATCH_KEY}));
        await Promise.resolve();

        expect(isSettled()).toBe(false);
        expect(getSearchWriteWatchKey()).toBe(WATCH_KEY);
        expect(addOptimization).toHaveBeenCalledWith(CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DEFERRED_WRITE);

        flushPendingSearchWrite();
        await Promise.resolve();
        expect(isSettled()).toBe(true);
    });

    it('never waits on Search for a retry', async () => {
        markPendingSearchWrite();

        // A retry runs after the layout that would have released it, so waiting would strand the write
        // until its safety timeout - and the flush that ends that wait is what triggered the retry.
        const barrier = resolveWriteBarrier({isRetry: true, optimisticWatchKey: WATCH_KEY});
        const isSettled = settled(barrier);
        await Promise.resolve();

        expect(barrier).toBe(IMMEDIATE);
        expect(isSettled()).toBe(true);
        expect(getSearchWriteWatchKey()).toBeUndefined();
        expect(addOptimization).not.toHaveBeenCalled();
    });

    it("still honours a caller's barrier on a retry", () => {
        const writeBarrier: WriteReadyBarrier = () => new Promise<void>(() => {});

        // isRetry only opts out of Search's signal, not out of an explicitly passed barrier.
        expect(resolveWriteBarrier({writeBarrier, isRetry: true})).toBe(writeBarrier);
    });

    it('does not publish a watch key when there is no signal to drive a skeleton', () => {
        resolveWriteBarrier({optimisticWatchKey: WATCH_KEY});

        expect(getSearchWriteWatchKey()).toBeUndefined();
    });

    it('puts several writes of one submission on the same barrier', async () => {
        markPendingSearchWrite();

        const isFirstSettled = settled(resolveWriteBarrier({optimisticWatchKey: WATCH_KEY}));
        const isSecondSettled = settled(resolveWriteBarrier({optimisticWatchKey: `${ONYXKEYS.COLLECTION.TRANSACTION}2`}));

        flushPendingSearchWrite();
        await Promise.resolve();

        expect(isFirstSettled()).toBe(true);
        expect(isSecondSettled()).toBe(true);
    });
});
