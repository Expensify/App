import Log from '@libs/Log';

import CONST from '@src/CONST';

type TransitionHandle = symbol;

type TransitionKind = 'navigation' | 'other';

type CancelHandle = {cancel: () => void};

type RunAfterTransitionsOptions = {
    /** The function to invoke once all active transitions have completed. */
    callback: () => void | Promise<void>;

    /** If true, the callback fires synchronously regardless of any active transitions. Defaults to false. */
    runImmediately?: boolean;

    /** Wait for a transition before the callback (next-to-start if none active, else active-to-end). `true` = any; `'navigation'` = navigation only. Defaults to false. */
    waitForUpcomingTransition?: boolean | 'navigation';
};

const activeTransitions = new Map<TransitionHandle, {timeout: ReturnType<typeof setTimeout>; kind: TransitionKind}>();
let activeNavigationCount = 0;

let pendingCallbacks: Array<() => void | Promise<void>> = [];

let nextTransitionStartResolve: (() => void) | null = null;
let promiseForNextTransitionStart = new Promise<void>((resolve) => {
    nextTransitionStartResolve = resolve;
});

let nextNavigationTransitionStartResolve: (() => void) | null = null;
let promiseForNextNavigationTransitionStart = new Promise<void>((resolve) => {
    nextNavigationTransitionStartResolve = resolve;
});

function runCallback(callback: () => void | Promise<void>): void {
    try {
        const result = callback();
        if (result instanceof Promise) {
            result.catch((error) => {
                Log.warn('[TransitionTracker] A pending async callback threw an error', {error});
            });
        }
    } catch (error) {
        Log.warn('[TransitionTracker] A pending callback threw an error', {error});
    }
}

/**
 * Invokes and removes all pending callbacks.
 * Each callback is isolated so that one exception does not prevent the rest from running.
 */
function flushCallbacks(): void {
    const callbacks = pendingCallbacks;
    pendingCallbacks = [];
    for (const callback of callbacks) {
        runCallback(callback);
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
 * Pass `'navigation'` for screen transitions; default `'other'` covers keyboard / modal / layout and doesn't signal `waitForUpcomingTransition`.
 */
function startTransition(kind: TransitionKind = 'other'): TransitionHandle {
    const handle: TransitionHandle = Symbol('transition');

    // Resolves on every start so legacy `waitForUpcomingTransition: true` callers see modal / keyboard / layout transitions.
    const resolveAny = nextTransitionStartResolve;
    if (resolveAny) {
        nextTransitionStartResolve = null;
        promiseForNextTransitionStart = new Promise<void>((r) => {
            nextTransitionStartResolve = r;
        });
        resolveAny();
    }

    if (kind === 'navigation') {
        const resolveNav = nextNavigationTransitionStartResolve;
        if (resolveNav) {
            nextNavigationTransitionStartResolve = null;
            promiseForNextNavigationTransitionStart = new Promise<void>((r) => {
                nextNavigationTransitionStartResolve = r;
            });
            resolveNav();
        }
        activeNavigationCount += 1;
    }

    const timeout = setTimeout(() => {
        const entry = activeTransitions.get(handle);
        activeTransitions.delete(handle);
        if (entry?.kind === 'navigation') {
            activeNavigationCount -= 1;
        }
        decrementAndFlush();
    }, CONST.MAX_TRANSITION_DURATION_MS);

    activeTransitions.set(handle, {timeout, kind});

    return handle;
}

/**
 * Ends the transition identified by {@link handle}.
 * Clears the corresponding safety timeout since the transition ended normally.
 * When no active transitions remain, flushes all pending callbacks.
 * If the handle is unknown (already ended or already expired via safety timeout), this is a no-op.
 */
function endTransition(handle: TransitionHandle): void {
    const entry = activeTransitions.get(handle);
    if (!entry) {
        return;
    }

    clearTimeout(entry.timeout);
    activeTransitions.delete(handle);
    if (entry.kind === 'navigation') {
        activeNavigationCount -= 1;
    }
    decrementAndFlush();
}

/**
 * Schedules a callback to run after all transitions complete. If no transitions are active
 * or `runImmediately` is true, the callback fires synchronously. `runImmediately` overrides `waitForUpcomingTransition`.
 *
 * @param options - Options object.
 * @param options.callback - The function to invoke once transitions finish.
 * @param options.runImmediately - If true, the callback fires synchronously regardless of active transitions. Defaults to false.
 * @param options.waitForUpcomingTransition - Wait for a transition before the callback: the upcoming one if none is active yet, else the active one to end. Defaults to false.
 * @returns A handle with a `cancel` method to prevent the callback from firing.
 */
function runAfterTransitions({callback, runImmediately = false, waitForUpcomingTransition = false}: RunAfterTransitionsOptions): CancelHandle {
    if (runImmediately) {
        runCallback(callback);
        return {cancel: () => {}};
    }
    const waitForNavigationOnly = waitForUpcomingTransition === 'navigation';
    // Gate on nav-active only: a concurrent non-nav transition ending would otherwise flush callbacks before the upcoming navigation. Web fires transitionStart before the nav state event, so a mid-flight nav must still take the active-end path.
    if (waitForUpcomingTransition && activeNavigationCount === 0) {
        let cancelled = false;
        let innerHandle: CancelHandle | null = null;

        let transitionStartTimeoutId!: ReturnType<typeof setTimeout>;
        let didTimeout = false;
        const transitionStartTimeout = new Promise<void>((resolve) => {
            transitionStartTimeoutId = setTimeout(() => {
                didTimeout = true;
                resolve();
            }, CONST.MAX_TRANSITION_START_WAIT_MS);
        });
        const startPromise = waitForNavigationOnly ? promiseForNextNavigationTransitionStart : promiseForNextTransitionStart;

        (async () => {
            await Promise.race([startPromise, transitionStartTimeout]);
            clearTimeout(transitionStartTimeoutId);

            if (didTimeout && !cancelled) {
                Log.info('[TransitionTracker] waitForUpcomingTransition timed out before a transition started', false, {timeoutMs: CONST.MAX_TRANSITION_START_WAIT_MS});
            }

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

    if (activeTransitions.size === 0) {
        runCallback(callback);
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
