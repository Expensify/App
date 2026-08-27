import type {OnyxKey} from 'react-native-onyx';

import type {WriteReadyBarrier} from './API';

import {SAFETY_TIMEOUT_MS} from './API/writeWhenReady';

/**
 * Search's own write-readiness signal: releases deferred writes on real-content layout, or a
 * focus/unmount fallback. Call sites read `barrier` and pass it down themselves; nothing here calls
 * `write()`/`writeWhenReady()`. State is module-level because mark (`markPendingWriteForSearchPage`) and consume (Search's
 * mount effect) run independently, not one calling the other, and only one pending write exists at a time.
 *
 * `SAFETY_TIMEOUT_MS` here guarantees the API write itself executes; Search's separate 10s
 * `clearOptimisticTracking` timeout only clears the skeleton/ghost-row UI.
 */

type PendingSearchWrite = {
    /** Resolves when `release` runs. Every write acquired before that shares this one instance. */
    barrier: WriteReadyBarrier;

    /** Resolves `barrier`, unblocking every write waiting on it. */
    release: () => void;

    /**
     * `generationCounter`'s value at the time this object was created.
     * Timeouts/callbacks compare it against the current `pending.generation` before acting, to detect a newer object having replaced this one.
     */
    generation: number;

    /** How many writes have received this object's `barrier`. */
    consumerCount: number;

    /** Set when a flush arrives before any write has received the barrier. */
    isFlushRequested: boolean;

    /** Clears this object automatically if nothing releases it first. */
    safetyTimeoutID: ReturnType<typeof setTimeout>;
};

let pending: PendingSearchWrite | undefined;
let generationCounter = 0;

/** Onyx key the pending write creates optimistically. Persists across reads, only cleared when the next pending write starts. */
let watchKey: OnyxKey | undefined;

function clearPending(generation: number) {
    if (pending?.generation !== generation) {
        return;
    }
    clearTimeout(pending.safetyTimeoutID);
    // Resolve now so a write already waiting on `pending.barrier` doesn't have to wait for its own separate timeout to fire.
    pending.release();
    pending = undefined;
}

/**
 * Sets `pending` to a new object, unless one already exists. Called at submission start, not when the
 * write is built, since `hasPendingSearchWrite` has consumers (the skeleton, `skipWaitForWrites`) that
 * read it before any write exists. Calling it again while one is already pending does nothing, so
 * multiple writes from the same submission end up sharing that one object.
 */
function markPendingSearchWrite() {
    if (pending) {
        return;
    }

    watchKey = undefined;
    generationCounter += 1;
    const generation = generationCounter;

    let release: () => void = () => {};
    const released = new Promise<void>((resolve) => {
        release = resolve;
    });

    // Self-clearing so a submission that never reaches a Search release point doesn't leave the skeleton up forever.
    const safetyTimeoutID = setTimeout(() => clearPending(generation), SAFETY_TIMEOUT_MS);

    pending = {
        barrier: () => released,
        release,
        generation,
        consumerCount: 0,
        isFlushRequested: false,
        safetyTimeoutID,
    };
}

function hasPendingSearchWrite(): boolean {
    return !!pending;
}

function getPendingSearchWriteGeneration(): number | undefined {
    return pending?.generation;
}

/** The barrier function a write should wait on before applying its optimistic data; an already-resolved one when nothing is pending. */
function acquireSearchWriteBarrier(optimisticWatchKey?: OnyxKey): WriteReadyBarrier {
    if (!pending) {
        return () => Promise.resolve();
    }

    setSearchWriteWatchKey(optimisticWatchKey);
    return consumePendingSearchWrite();
}

/** Same as `acquireSearchWriteBarrier`, without recording a watch key, for writes that bypass Search's barrier. */
function consumePendingSearchWrite(): WriteReadyBarrier {
    if (!pending) {
        return () => Promise.resolve();
    }

    const {barrier, generation, isFlushRequested} = pending;
    pending.consumerCount += 1;

    // Search already flushed before this write existed; hand the held-up release down now.
    if (isFlushRequested) {
        clearPending(generation);
    }

    return barrier;
}

/** Same as `consumePendingSearchWrite`, but a no-op if the pending signal is no longer `generation`. */
function consumePendingSearchWriteForGeneration(generation: number) {
    if (pending?.generation !== generation) {
        return;
    }
    consumePendingSearchWrite();
}

/**
 * Restarts the safety timeout for the current pending write, counting `SAFETY_TIMEOUT_MS` from now
 * instead of from when `markPendingSearchWrite` first started it.
 *
 * A write that waits on its own `writeBarrier` (see `resolveWriteBarrier`) can attach well after that
 * point, so without this the timeout could fire, and clear the pending write, before that write is
 * even done waiting.
 */
function restartPendingSearchWriteSafetyTimeoutForGeneration(generation: number) {
    if (pending?.generation !== generation) {
        return;
    }
    clearTimeout(pending.safetyTimeoutID);
    pending.safetyTimeoutID = setTimeout(() => clearPending(generation), SAFETY_TIMEOUT_MS);
}

/** Resolves `pending.barrier`. Clears `pending` right away if a write already consumed it, otherwise flags `isFlushRequested` so the next one to consume it clears it instead. */
function flushPendingSearchWrite() {
    if (!pending) {
        return;
    }

    const {release, generation, consumerCount} = pending;
    release();

    // No write has called consumePendingSearchWrite yet, so keep the signal up until one arrives to hand the release to.
    if (consumerCount === 0) {
        pending.isFlushRequested = true;
        return;
    }

    clearPending(generation);
}

/** Record the Onyx key the pending write will create optimistically. */
function setSearchWriteWatchKey(key: OnyxKey | undefined) {
    if (!key) {
        return;
    }
    watchKey = key;
}

function getSearchWriteWatchKey(): OnyxKey | undefined {
    return watchKey;
}

/** Test-only reset, gated on `__DEV__` so the bundler dead-code eliminates it in production. */
function resetForTesting() {
    if (!__DEV__) {
        return;
    }
    if (pending) {
        clearTimeout(pending.safetyTimeoutID);
    }
    pending = undefined;
    watchKey = undefined;
}

export {
    markPendingSearchWrite,
    hasPendingSearchWrite,
    getPendingSearchWriteGeneration,
    acquireSearchWriteBarrier,
    consumePendingSearchWrite,
    consumePendingSearchWriteForGeneration,
    restartPendingSearchWriteSafetyTimeoutForGeneration,
    flushPendingSearchWrite,
    setSearchWriteWatchKey,
    getSearchWriteWatchKey,
    resetForTesting,
};
