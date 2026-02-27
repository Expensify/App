import CONST from '@src/CONST';

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

let activeCount = 0;

const activeTimeouts: Array<ReturnType<typeof setTimeout>> = [];

let pendingCallbacks: Array<() => void> = [];

let nextTransitionStartResolve: (() => void) | null = null;
let promiseForNextTransitionStart = new Promise<void>((resolve) => {
    nextTransitionStartResolve = resolve;
});

/**
 * Invokes and removes all pending callbacks.
 */
function flushCallbacks(): void {
    const callbacks = pendingCallbacks;
    pendingCallbacks = [];
    for (const callback of callbacks) {
        callback();
    }
}

/**
 * Decrements the active count and flushes callbacks when all transitions are idle.
 * Shared by {@link endTransition} (manual) and the auto-timeout.
 */
function decrementAndFlush(): void {
    activeCount = Math.max(0, activeCount - 1);

    if (activeCount === 0) {
        flushCallbacks();
    }
}

/**
 * Increments the active transition count.
 * Multiple overlapping transitions are counted.
 * Each transition automatically ends after {@link MAX_TRANSITION_DURATION_MS} as a safety net.
 */
function startTransition(): void {
    activeCount += 1;

    const resolve = nextTransitionStartResolve;
    if (resolve) {
        nextTransitionStartResolve = null;
        promiseForNextTransitionStart = new Promise<void>((r) => {
            nextTransitionStartResolve = r;
        });
        resolve();
    }

    const timeout = setTimeout(() => {
        const idx = activeTimeouts.indexOf(timeout);
        if (idx !== -1) {
            activeTimeouts.splice(idx, 1);
        }
        decrementAndFlush();
    }, CONST.MAX_TRANSITION_DURATION_MS);

    activeTimeouts.push(timeout);
}

/**
 * Decrements the active transition count.
 * Clears the corresponding auto-timeout since the transition ended normally.
 * When the count reaches zero, flushes all pending callbacks.
 */
function endTransition(): void {
    const timeout = activeTimeouts.shift();
    if (timeout !== undefined) {
        clearTimeout(timeout);
    }

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

        (async () => {
            await promiseForNextTransitionStart;
            if (!cancelled) {
                innerHandle = runAfterTransitions({callback});
            }
        })();

        return {
            cancel: () => {
                cancelled = true;
                innerHandle?.cancel();
            },
        };
    }

    if (activeCount === 0 || runImmediately) {
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
export type {CancelHandle};
