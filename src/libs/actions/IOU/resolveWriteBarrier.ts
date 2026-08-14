import type {WriteReadyBarrier} from '@libs/API';
import {acquireSearchWriteBarrier, hasPendingSearchWrite} from '@libs/pendingSearchWrite';
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
        return writeBarrier;
    }

    // Search raises its signal when the submission starts, which can be several screens earlier than
    // this call - so an action that was given no barrier still has to check for it.
    if (!isRetry && hasPendingSearchWrite()) {
        addOptimization(CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DEFERRED_WRITE);
        return acquireSearchWriteBarrier(optimisticWatchKey);
    }

    return IMMEDIATE;
}

export default resolveWriteBarrier;
export {IMMEDIATE};
