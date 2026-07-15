import CONST from '@src/CONST';

import {findFocusedRoute} from '@react-navigation/native';

import type {CancelHandle} from './TransitionTracker';

import navigationRef from './navigationRef';
import TransitionTracker from './TransitionTracker';

// Action types that never move the focused route, so they can never start a visual transition.
const ACTION_TYPES_WITHOUT_TRANSITION: ReadonlySet<string> = new Set(['SET_PARAMS', 'REPLACE_PARAMS', 'PRELOAD', 'JUMP_TO']);

let isTransitionPending = false;
let pendingClearTimeout: ReturnType<typeof setTimeout> | null = null;
let lastFocusedRouteKey: string | undefined;
let hasConfirmedFocusMove = false;
let settleWaiters: Array<(shouldWait: boolean) => void> = [];

function notifySettle(shouldWait: boolean): void {
    const waiters = settleWaiters;
    settleWaiters = [];
    for (const resolve of waiters) {
        resolve(shouldWait);
    }
}

function clearPending(): void {
    if (pendingClearTimeout) {
        clearTimeout(pendingClearTimeout);
        pendingClearTimeout = null;
    }
    isTransitionPending = false;
    hasConfirmedFocusMove = false;
    notifySettle(false);
}

function waitForPredictionSettled(): Promise<boolean> {
    if (!isTransitionPending) {
        return Promise.resolve(false);
    }
    if (hasConfirmedFocusMove) {
        return Promise.resolve(true);
    }
    return new Promise((resolve) => {
        settleWaiters.push(resolve);
    });
}

navigationRef.addListener('__unsafe_action__', (event) => {
    if (event.data.noop || ACTION_TYPES_WITHOUT_TRANSITION.has(event.data.action.type)) {
        return;
    }

    isTransitionPending = true;
    if (hasConfirmedFocusMove) {
        return;
    }

    if (pendingClearTimeout) {
        clearTimeout(pendingClearTimeout);
    }
    pendingClearTimeout = setTimeout(clearPending, CONST.NAVIGATION_PREDICTION_WINDOW_MS);
});

navigationRef.addListener('state', (event) => {
    const focusedRouteKey = event.data.state ? findFocusedRoute(event.data.state)?.key : undefined;
    const didFocusedRouteChange = focusedRouteKey !== lastFocusedRouteKey;
    lastFocusedRouteKey = focusedRouteKey;

    if (!isTransitionPending || hasConfirmedFocusMove) {
        return;
    }

    if (!didFocusedRouteChange) {
        clearPending();
        return;
    }

    hasConfirmedFocusMove = true;
    notifySettle(true);
    if (pendingClearTimeout) {
        clearTimeout(pendingClearTimeout);
    }
    pendingClearTimeout = setTimeout(clearPending, CONST.MAX_TRANSITION_START_WAIT_MS);
});

TransitionTracker.onTransitionStart(clearPending);

function settle(): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, 0);
    });
}

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

    settle()
        .then(() => waitForPredictionSettled())
        .then((shouldWait) => {
            if (cancelled) {
                return;
            }
            innerHandle = TransitionTracker.runAfterTransitions({
                callback,
                waitForUpcomingTransition: shouldWait,
            });
        });

    return {
        cancel: () => {
            cancelled = true;
            innerHandle?.cancel();
        },
    };
}
