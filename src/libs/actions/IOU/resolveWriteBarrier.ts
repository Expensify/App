import type {WriteReadyBarrier} from '@libs/API';
import {acquireSearchWriteBarrier, consumePendingSearchWrite, consumePendingSearchWriteForGeneration, getPendingSearchWriteGeneration, hasPendingSearchWrite} from '@libs/pendingSearchWrite';
import {addOptimization} from '@libs/telemetry/submitFollowUpAction';

import CONST from '@src/CONST';

import type {OnyxKey} from 'react-native-onyx';

/**
 * An already-satisfied barrier: `API.writeWhenReady` with this behaves like `API.write`, one microtask
 * later. Used so a call site stays a single `API.writeWhenReady` call instead of branching between the
 * two APIs, which `no-multiple-api-calls` would flag.
 */
const IMMEDIATE: WriteReadyBarrier = () => Promise.resolve();

type ResolveWriteBarrierParams = {
    /**
     * Barrier handed down by whichever view triggered the navigation (see `API.armTransitionBarrier`).
     * Wins over Search's, because the view knows which transition this write is actually racing.
     */
    writeBarrier?: WriteReadyBarrier;

    /**
     * An Onyx key the write creates via optimistic data. Published to Search so its placeholder knows
     * when the optimistic updates landed. Ignored unless the write ends up waiting for Search.
     */
    optimisticWatchKey?: OnyxKey;

    /**
     * Retries must not wait for Search: the layout that would have released them already happened, so
     * the write would sit until its safety timeout.
     */
    isRetry?: boolean;
};

/**
 * Picks what a submit write waits on before applying its optimistic data, and records the deferral for
 * the submit-expense telemetry span.
 *
 * Deliberately returns a barrier instead of performing the write: the decision stays visible at the
 * call site, and there is no shared registry deciding write timing behind the action's back.
 */
function resolveWriteBarrier({writeBarrier, optimisticWatchKey, isRetry = false}: ResolveWriteBarrierParams = {}): WriteReadyBarrier {
    if (writeBarrier) {
        addOptimization(CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DEFERRED_WRITE);

        const searchGeneration = getPendingSearchWriteGeneration();
        if (searchGeneration === undefined) {
            return writeBarrier;
        }

        // The explicit barrier wins over Search's, but the signal Search raised is still up. This write
        // still has to count as the consumer it was waiting for - otherwise `flushPendingSearchWrite`
        // keeps the signal pending for a consumer that will never arrive, and Search sits on its
        // skeleton until its own safety timeout instead of releasing immediately.
        //
        // Captured by generation rather than re-checking `hasPendingSearchWrite()` at consume time: by
        // the time this settles or aborts, a different submission could have raised its own signal, and
        // consuming that one instead would clear a skeleton that has nothing to do with this write.
        //
        // Consumed on abort too, not only when the returned promise settles: writeWhenReady's own
        // release paths (safety timeout, app background) abort `signal`, and the default
        // TransitionTracker barrier responds to that by leaving its own promise permanently pending -
        // so on that path the write goes out via the abort, and this promise never settles to run a
        // `finally`. Guarded so the two paths can't double-consume. Not `acquireSearchWriteBarrier`:
        // this write isn't waiting on Search's layout, so its watch key must not be published either.
        return async (signal) => {
            let hasConsumed = false;
            const consumeOnce = () => {
                if (hasConsumed) {
                    return;
                }
                hasConsumed = true;
                consumePendingSearchWriteForGeneration(searchGeneration);
            };

            signal.addEventListener('abort', consumeOnce);
            try {
                return await writeBarrier(signal);
            } finally {
                consumeOnce();
            }
        };
    }

    // Search raises its signal when the submission starts, which can be several screens earlier than
    // this call - so an action that was given no barrier still has to check for it.
    if (hasPendingSearchWrite()) {
        if (isRetry) {
            // Still consume the signal even though the retry bypasses it - otherwise a retry that is the
            // only write associated with a pending signal leaves `flushPendingSearchWrite` waiting for a
            // consumer that will never arrive.
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
