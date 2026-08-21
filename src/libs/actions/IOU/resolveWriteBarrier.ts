import type {WriteReadyBarrier} from '@libs/API';
import {
    acquireSearchWriteBarrier,
    consumePendingSearchWrite,
    consumePendingSearchWriteForGeneration,
    getPendingSearchWriteGeneration,
    hasPendingSearchWrite,
    restartPendingSearchWriteSafetyTimeoutForGeneration,
} from '@libs/pendingSearchWrite';
import {addOptimization} from '@libs/telemetry/submitFollowUpAction';

import CONST from '@src/CONST';

import type {OnyxKey} from 'react-native-onyx';

import {AppState} from 'react-native';

/** `writeWhenReady` defaults to waiting on any transition (~2s) when no barrier is given,
 *  so this lets no-barrier callers get immediate `write()` behavior without branching to `API.write`. */
const IMMEDIATE: WriteReadyBarrier = () => Promise.resolve();

type ResolveWriteBarrierParams = {
    /** Barrier the caller wants this write to wait on before applying optimistic data (see `API.armTransitionBarrier`). */
    writeBarrier?: WriteReadyBarrier;

    /**
     * Onyx key of this write's optimistic data. Only used when this write also waits on Search's barrier: Search
     * reads it back to tell when the optimistic item has landed in real search results.
     */
    optimisticWatchKey?: OnyxKey;

    /** Retries must not wait for Search - the layout that would have released them already happened. */
    isRetry?: boolean;
};

/**
 * Picks what a submit write waits on before applying its optimistic data: an explicit barrier from the
 * caller, Search's pending-write signal, or neither. Callers pass their own barrier or nothing; whether
 * the write also has to wait on Search's signal is decided here. Records the deferral for the
 * submit-expense telemetry span.
 */
function resolveWriteBarrier({writeBarrier, optimisticWatchKey, isRetry = false}: ResolveWriteBarrierParams = {}): WriteReadyBarrier {
    if (writeBarrier) {
        addOptimization(CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DEFERRED_WRITE);

        const searchGeneration = getPendingSearchWriteGeneration();
        if (searchGeneration === undefined) {
            return writeBarrier;
        }

        // If the app is already in background, writeWhenReady executes immediately without invoking this
        // barrier, so consume Search's pending-write signal now instead of relying on the abort listener below.
        if (AppState.currentState === CONST.APP_STATE.BACKGROUND) {
            consumePendingSearchWriteForGeneration(searchGeneration);
            return writeBarrier;
        }

        // Explicit barrier wins, but this write must still count as Search's consumer or its skeleton
        // row stays up forever (`flushPendingSearchWrite` never gets a consumer to release).
        return async (abortSignal) => {
            // This write waits on `writeBarrier`, not `pending.barrier`, so restart Search's safety
            // timeout from attach time - otherwise it can expire before this write's own timeout does.
            restartPendingSearchWriteSafetyTimeoutForGeneration(searchGeneration);

            let hasConsumed = false;
            const consumeOnce = () => {
                if (hasConsumed) {
                    return;
                }
                hasConsumed = true;
                // Consume by generation, not a live `hasPendingSearchWrite()` check, so a later
                // submission's pending-write signal isn't cleared by mistake.
                consumePendingSearchWriteForGeneration(searchGeneration);
            };

            // writeWhenReady's early-release paths abort `abortSignal` without settling `writeBarrier`,
            // so the abort listener is the only thing that consumes in those cases.
            abortSignal.addEventListener('abort', consumeOnce);
            try {
                return await writeBarrier(abortSignal);
            } finally {
                consumeOnce();
            }
        };
    }

    // Search marks its pending-write signal earlier, before this write is even built (and possibly
    // before a navigation away), so check for it even when no writeBarrier is passed.
    if (hasPendingSearchWrite()) {
        if (isRetry) {
            // Consume anyway - a retry bypassing the signal must not leave flushPendingSearchWrite waiting for it.
            consumePendingSearchWrite();
            return IMMEDIATE;
        }

        addOptimization(CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DEFERRED_WRITE);
        return acquireSearchWriteBarrier(optimisticWatchKey);
    }

    return IMMEDIATE;
}

export default resolveWriteBarrier;
export {IMMEDIATE};
