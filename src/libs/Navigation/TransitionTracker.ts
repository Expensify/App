import Log from '@libs/Log';
import CONST from '@src/CONST';

type TransitionHandle = symbol;

type CancelHandle = {cancel: () => void};

type RunAfterTransitionsOptions = {
    /** The function to invoke once all active transitions have completed. */
    callback: () => void;

    /** If true, the callback fires synchronously regardless of any active transitions. Defaults to false. */
    runImmediately?: boolean;

    /** If true, waits for the next transition to start before queuing the callback, so it runs after that transition ends.
     *  Useful when a navigation action has just been dispatched but the transition has not yet been registered.
     * Defaults to false. */
    waitForUpcomingTransition?: boolean;
};

const activeTransitions = new Map<TransitionHandle, ReturnType<typeof setTimeout>>();

let pendingCallbacks: Array<() => void> = [];

let nextTransitionStartResolve: (() => void) | null = null;
let promiseForNextTransitionStart = new Promise<void>((resolve) => {
    nextTransitionStartResolve = resolve;
});

/**
 * Invokes and removes all pending callbacks.
 * Each callback is isolated so that one exception does not prevent the rest from running.
 */
function flushCallbacks(): void {
    const callbacks = pendingCallbacks;
    pendingCallbacks = [];
    for (const callback of callbacks) {
        try {
            callback();
        } catch (error) {
            Log.warn('[TransitionTracker] A pending callback threw an error', {error});
        }
    }
}

/**
 * Flushes callbacks when all transitions are idle.
 * Shared by {@link endTransition} (manual) and the auto-timeout.
 */
function decrementAndFlush(): void {
    if (activeTransitions.size !== 0) {
        return;
    }
    flushCallbacks();
}

/**
 * Increments the active transition count and returns a handle that must be passed to {@link endTransition}.
 * Multiple overlapping transitions are tracked independently.
 * Each transition automatically ends after {@link CONST.MAX_TRANSITION_DURATION_MS} as a safety net.
 */
function startTransition(): TransitionHandle {
    const handle: TransitionHandle = Symbol('transition');

    const resolve = nextTransitionStartResolve;
    if (resolve) {
        nextTransitionStartResolve = null;
        promiseForNextTransitionStart = new Promise<void>((r) => {
            nextTransitionStartResolve = r;
        });
        resolve();
    }

    const timeout = setTimeout(() => {
        activeTransitions.delete(handle);
        decrementAndFlush();
    }, CONST.MAX_TRANSITION_DURATION_MS);

    activeTransitions.set(handle, timeout);

    return handle;
}

/**
 * Ends the transition identified by {@link handle}.
 * Clears the corresponding safety timeout since the transition ended normally.
 * When no active transitions remain, flushes all pending callbacks.
 * If the handle is unknown (already ended or already expired via safety timeout), this is a no-op.
 */
function endTransition(handle: TransitionHandle): void {
    const timeout = activeTransitions.get(handle);
    if (timeout === undefined) {
        return;
    }

    clearTimeout(timeout);
    activeTransitions.delete(handle);
    decrementAndFlush();
}

/**
 * Schedules a callback to run after all transitions complete. If no transitions are active
 * or `runImmediately` is true, the callback fires synchronously.
 *
 * @param options - Options object.
 * @param options.callback - The function to invoke once transitions finish.
 * @param options.runImmediately - If true, the callback fires synchronously regardless of active transitions. Defaults to false.
 * @param options.waitForUpcomingTransition - If true, waits for the next transition to start before queuing the callback, so it runs after that transition ends. Use when navigation happens just before this call and the transition is not yet registered. Defaults to false.
 * @returns A handle with a `cancel` method to prevent the callback from firing.
 */
function runAfterTransitions({callback, runImmediately = false, waitForUpcomingTransition = false}: RunAfterTransitionsOptions): CancelHandle {
    if (waitForUpcomingTransition) {
        let cancelled = false;
        let innerHandle: CancelHandle | null = null;

        // Guard against transitionStart never arriving.
        // We race promiseForNextTransitionStart against a fallback timeout.
        // Whichever resolves first wins.
        // Afterwards we clearTimeout so the fallback doesn't keep the timer alive unnecessarily.
        let transitionStartTimeoutId!: ReturnType<typeof setTimeout>;
        const transitionStartTimeout = new Promise<void>((resolve) => {
            transitionStartTimeoutId = setTimeout(resolve, CONST.MAX_TRANSITION_START_WAIT_MS);
        });

        (async () => {
            await Promise.race([promiseForNextTransitionStart, transitionStartTimeout]);
            clearTimeout(transitionStartTimeoutId);

            if (!cancelled) {
                innerHandle = runAfterTransitions({callback});
            }
        })();

        return {
            cancel: () => {
                cancelled = true;
                clearTimeout(transitionStartTimeoutId);
                innerHandle?.cancel();
            },
        };
    }

    if (activeTransitions.size === 0 || runImmediately) {
        callback();
        return {cancel: () => {}};
    }

    pendingCallbacks.push(callback);

    return {
        cancel: () => {
            const idx = pendingCallbacks.indexOf(callback);
            if (idx !== -1) {
                pendingCallbacks.splice(idx, 1);
            }
        },
    };
}

const TransitionTracker = {
    startTransition,
    endTransition,
    runAfterTransitions,
};

export default TransitionTracker;
export type {CancelHandle, TransitionHandle};
