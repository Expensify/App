import type {OnyxKey} from 'react-native-onyx';

import type {WriteReadyBarrier} from './API';

import {SAFETY_TIMEOUT_MS} from './API/writeWhenReady';

/**
 * Search's own write-readiness signal.
 *
 * Search does not release its deferred writes on a navigation transition - it releases them when the
 * real list content (not the skeleton) lays out, or from focus/unmount fallbacks. So it cannot use
 * `API.createTransitionBarrier`; it owns a barrier and resolves it from those lifecycle points.
 *
 * This is deliberately NOT a write registry: it never calls `write()`/`writeWhenReady()` and never
 * decides whether a write is deferred. Call sites decide, and pass `barrier` down to the action.
 *
 * The state is module-level rather than plumbed because the two moments are separated by a navigation:
 * a global-create submit marks the signal from the confirmation step (see
 * `markPendingSearchWriteIfGlobalCreate`), and the write is built later, in a different component tree,
 * after Search has mounted. There is no call chain to thread a barrier through.
 *
 * Note: Search has its own 10s timeout (`clearOptimisticTracking`) for the UI-level optimistic item
 * cache. The two timeouts serve different layers:
 *   - `SAFETY_TIMEOUT_MS` (here and in writeWhenReady): guarantees the API write executes.
 *   - 10s (Search): guarantees the skeleton/ghost-row UI clears if the optimistic item never reaches
 *     sortedData (e.g. empty list, API failure, offline).
 */

type PendingSearchWrite = {
    /**
     * Shared by every write marked under this signal, so a split's writes all release together.
     *
     * The promise is created here, at mark time, rather than when a write attaches: a flush can arrive
     * before the write is even built (Search laying out faster than the dismiss transition), and a
     * lazily-created promise would miss that release and sit until the safety timeout.
     */
    barrier: WriteReadyBarrier;

    /** Resolves `barrier`. */
    release: () => void;

    /** Guards against a superseded signal's cleanup clearing a newer one. */
    generation: number;

    /** How many writes have taken this barrier. */
    consumerCount: number;

    /** Set when a flush arrives before any write has taken the barrier. */
    isFlushRequested: boolean;

    safetyTimeoutID: ReturnType<typeof setTimeout>;
};

let pending: PendingSearchWrite | undefined;
let generationCounter = 0;

/**
 * An Onyx key the pending write creates via optimistic data. Search subscribes to it to know when the
 * optimistic updates landed.
 *
 * Kept after the signal clears, and only reset by the next `markPendingSearchWrite`, because Search
 * resolves it lazily (`resolveWatchKey`) - often after the write has already gone out.
 */
let watchKey: OnyxKey | undefined;

function clearPending(generation: number) {
    if (pending?.generation !== generation) {
        return;
    }
    clearTimeout(pending.safetyTimeoutID);
    // Release any write already waiting on `pending.barrier` - otherwise it sits until its own
    // writeWhenReady safety timeout instead of releasing here, alongside the signal coming down.
    pending.release();
    pending = undefined;
}

/**
 * Raise the signal and open the barrier gate.
 *
 * Called at the point the submission starts, not when the write is built: `hasPendingSearchWrite` has
 * consumers that read it before any write exists (the skeleton, and `useSearchPageSetup`'s
 * `skipWaitForWrites`), so the signal has to be up from the moment the submission is committed to.
 *
 * Idempotent: a second call while a signal is up keeps the existing barrier, so concurrent writes
 * share one release point.
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

    // Self-clearing so a submission that never reaches a Search release point cannot leave the
    // skeleton up forever. Bounded by the same timeout writeWhenReady uses to force the write out.
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

/**
 * The barrier a write should wait on.
 *
 * With nothing marked it returns an already-resolved barrier, so the write goes out immediately. That
 * keeps every call site down to a single `API.writeWhenReady`, instead of branching between it and
 * `API.write`.
 *
 * `optimisticWatchKey` is published only when a signal is actually up, since it exists for the
 * skeleton that the signal drives.
 */
function acquireSearchWriteBarrier(optimisticWatchKey?: OnyxKey): WriteReadyBarrier {
    if (!pending) {
        return () => Promise.resolve();
    }

    setSearchWriteWatchKey(optimisticWatchKey);
    return consumePendingSearchWrite();
}

/**
 * Counts a write against the pending signal and returns its barrier, without touching the watch key -
 * split out of `acquireSearchWriteBarrier` so a write that bypasses Search's barrier (an explicit
 * barrier already won) can still be accounted for, without publishing a watch key for a signal it is
 * not actually waiting on.
 */
function consumePendingSearchWrite(): WriteReadyBarrier {
    if (!pending) {
        return () => Promise.resolve();
    }

    const {barrier, generation, isFlushRequested} = pending;
    pending.consumerCount += 1;

    // Search flushed before this write existed, so it has nothing left to wait for. The signal was
    // held up until now (see flushPendingSearchWrite) and comes down here, once there is a write to
    // hand the release to.
    if (isFlushRequested) {
        clearPending(generation);
    }

    return barrier;
}

/**
 * Release the pending writes. Called by Search when real content lays out, and from its focus/unmount
 * fallbacks.
 *
 * The signal is cleared synchronously, before the barrier's consumers run: callers such as
 * `Search/index.tsx` check `hasPendingSearchWrite()` right after flushing to decide whether to issue
 * their own search, and would double-fire if the flag outlived the flush.
 */
function flushPendingSearchWrite() {
    if (!pending) {
        return;
    }

    const {release, generation, consumerCount} = pending;
    release();

    // Nothing has taken the barrier yet, so the write this signal was raised for is still coming. The
    // signal has to stay up until it arrives: it is what keeps the skeleton in place and what stops
    // Search from issuing a redundant query for data the optimistic write is about to provide.
    if (consumerCount === 0) {
        pending.isFlushRequested = true;
        return;
    }

    clearPending(generation);
}

/** Publish the Onyx key the pending write will create optimistically. */
function setSearchWriteWatchKey(key: OnyxKey | undefined) {
    if (!key) {
        return;
    }
    watchKey = key;
}

function getSearchWriteWatchKey(): OnyxKey | undefined {
    return watchKey;
}

/**
 * Only for use in tests. Exported from production code (rather than a test helper) so jest.mock can
 * auto-resolve it alongside the other exports. Gated behind __DEV__ so it is a no-op in production
 * (the bundler dead-code eliminates the branch).
 */
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
    acquireSearchWriteBarrier,
    consumePendingSearchWrite,
    flushPendingSearchWrite,
    setSearchWriteWatchKey,
    getSearchWriteWatchKey,
    resetForTesting,
};
