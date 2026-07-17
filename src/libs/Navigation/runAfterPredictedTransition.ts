import CONST from '@src/CONST';

import {findFocusedRoute} from '@react-navigation/native';

import type {CancelHandle} from './TransitionTracker';

import navigationRef from './navigationRef';
import TransitionTracker from './TransitionTracker';

// Action types to ignore when predicting an upcoming visual transition. SET_PARAMS/REPLACE_PARAMS/PRELOAD
// never move the focused route. JUMP_TO can, but only Onyx tab navigators use it and they do not emit
// transitionStart/transitionEnd, so waiting on TransitionTracker would never settle.
const ACTION_TYPES_WITHOUT_TRANSITION: ReadonlySet<string> = new Set(['SET_PARAMS', 'REPLACE_PARAMS', 'PRELOAD', 'JUMP_TO']);

/**
 * True after a navigable `__unsafe_action__` until we either confirm/deny a focus move, the
 * prediction window expires, or a real transition starts.
 */
let isTransitionPending = false;

/**
 * Timeout that clears a pending prediction. While awaiting a focus-key change it uses
 * {@link CONST.NAVIGATION_PREDICTION_WINDOW_MS}, after a confirmed focus move it uses
 * {@link CONST.MAX_TRANSITION_START_WAIT_MS} as a safety net until transitionStart clears it.
 */
let pendingClearTimeout: ReturnType<typeof setTimeout> | null = null;

/** Last known focused route key from a hydrated `state` event (undefined until first valid key). */
let lastFocusedRouteKey: string | undefined;

/**
 * True once a pending action was followed by a focused-route key change. Callers should wait for
 * the upcoming transition (`waitForUpcomingTransition: true`).
 */
let hasConfirmedFocusMove = false;

/**
 * Callbacks waiting for the current prediction to settle. Each receives `shouldWait`:
 * true - confirmed focus move, wait for the upcoming transition
 * false - no transition expected (idle, false alarm, window expired, or transition already started)
 */
let settleWaiters: Array<(shouldWait: boolean) => void> = [];

/** Invokes and clears every waiter with the settled `shouldWait` value. */
function notifySettle(shouldWait: boolean): void {
    const waiters = settleWaiters;
    settleWaiters = [];
    for (const onSettled of waiters) {
        onSettled(shouldWait);
    }
}

/**
 * Resets all prediction state and wakes waiters with `shouldWait = false`.
 * Used for false alarms, window expiry with no focus move, and when a real transitionStart makes prediction moot.
 */
function clearPending(): void {
    if (pendingClearTimeout) {
        clearTimeout(pendingClearTimeout);
        pendingClearTimeout = null;
    }
    isTransitionPending = false;
    hasConfirmedFocusMove = false;
    notifySettle(false);
}

/**
 * Container `state` events can carry a partial root state with route keys omitted.
 * Read the hydrated focused key from the ref instead of `event.data.state`.
 */
function getHydratedFocusedRouteKey(): string | undefined {
    if (!navigationRef.isReady()) {
        return undefined;
    }

    return navigationRef.getCurrentRoute()?.key ?? findFocusedRoute(navigationRef.getRootState())?.key;
}

/**
 * Confirms an upcoming visual transition after a focused-route key change.
 * Keeps prediction pending until transitionStart (or max wait) clears it.
 */
function confirmFocusMove(focusedRouteKey: string): void {
    lastFocusedRouteKey = focusedRouteKey;
    hasConfirmedFocusMove = true;
    notifySettle(true);
    if (pendingClearTimeout) {
        clearTimeout(pendingClearTimeout);
    }
    pendingClearTimeout = setTimeout(clearPending, CONST.MAX_TRANSITION_START_WAIT_MS);
}

/**
 * Prediction-window timer callback. Re-checks the hydrated ref before clearing: the sync store may
 * already show a new focused key while the container `state` effect is still delayed.
 */
function onPredictionWindowExpired(): void {
    pendingClearTimeout = null;
    if (!isTransitionPending || hasConfirmedFocusMove) {
        return;
    }

    const focusedRouteKey = getHydratedFocusedRouteKey();
    if (focusedRouteKey !== undefined && focusedRouteKey !== lastFocusedRouteKey) {
        confirmFocusMove(focusedRouteKey);
        return;
    }

    clearPending();
}

/**
 * Resolves whether callers should wait for an upcoming transition.
 * Idle - settle immediately with false.
 * Already confirmed - settle immediately with true.
 * Pending but unconfirmed - queue until confirm, clear, or timeout.
 */
function whenPredictionSettled(onSettled: (shouldWait: boolean) => void): void {
    if (!isTransitionPending) {
        onSettled(false);
        return;
    }
    if (hasConfirmedFocusMove) {
        onSettled(true);
        return;
    }
    settleWaiters.push(onSettled);
}

// Phase 1: a navigable action opens a short prediction window.
navigationRef.addListener('__unsafe_action__', (event) => {
    if (event.data.noop || ACTION_TYPES_WITHOUT_TRANSITION.has(event.data.action.type)) {
        return;
    }

    isTransitionPending = true;
    // Already confirmed for a prior action in this window - keep that decision, do not restart the short timer.
    if (hasConfirmedFocusMove) {
        return;
    }

    if (pendingClearTimeout) {
        clearTimeout(pendingClearTimeout);
    }
    // If no focus move is visible within this window (via state event or hydrated-ref recheck), clear.
    pendingClearTimeout = setTimeout(onPredictionWindowExpired, CONST.NAVIGATION_PREDICTION_WINDOW_MS);
});

// Phase 2: confirm or deny the pending prediction by comparing focused route keys.
navigationRef.addListener('state', () => {
    const focusedRouteKey = getHydratedFocusedRouteKey();

    // Missing keys are inconclusive - do not confirm a focus move or clear a pending prediction.
    if (focusedRouteKey === undefined) {
        return;
    }

    const didFocusedRouteChange = focusedRouteKey !== lastFocusedRouteKey;
    lastFocusedRouteKey = focusedRouteKey;

    if (!isTransitionPending || hasConfirmedFocusMove) {
        return;
    }

    // Action ran but focus did not move - no visual transition expected.
    if (!didFocusedRouteChange) {
        clearPending();
        return;
    }

    confirmFocusMove(focusedRouteKey);
});

// Phase 3: a real transition started - prediction state is obsolete.
TransitionTracker.onTransitionStart(clearPending);

/**
 * Heuristic-aware drop-in for `TransitionTracker.runAfterTransitions({callback, waitForUpcomingTransition: true})`.
 * Call this right after or right before the navigation call whose transition should be waited on.
 *
 * ponytail: best-effort guess based on actions dispatched through `navigationRef` shortly around this call,
 * not a guarantee. A transition from a disconnected call stack (native gesture, unrelated code) is invisible
 * here, same as calling `TransitionTracker.runAfterTransitions` with no `waitForUpcomingTransition`.
 */
export default function runAfterPredictedTransition(callback: () => void | Promise<void>): CancelHandle {
    let cancelled = false;
    let innerHandle: CancelHandle | null = null;

    // Yield one macrotask so a navigation dispatch in the same press handler can register first.
    setTimeout(() => {
        whenPredictionSettled((shouldWait) => {
            if (cancelled) {
                return;
            }
            innerHandle = TransitionTracker.runAfterTransitions({
                callback,
                waitForUpcomingTransition: shouldWait,
            });
        });
    }, 0);

    return {
        cancel: () => {
            cancelled = true;
            innerHandle?.cancel();
        },
    };
}
