import type {NavigationState} from '@react-navigation/native';
import type {RefObject} from 'react';
import type {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports -- .native.ts only; the rule guards web bundles from pulling the native stub.
import findNodeHandle from '@src/utils/findNodeHandle';
import Accessibility from './Accessibility';
import fireFocusEvent from './Accessibility/fireFocusEvent';
import {notifyBackButtonMounted, scheduleForwardAutoFocus} from './Accessibility/forwardAutoFocus';
import navigationRef from './Navigation/navigationRef';
// eslint-disable-next-line no-restricted-imports -- focus-return is a sibling primitive to TransitionTracker; the exact transitionEnd signal is what we need to avoid focus-restore races with the OS.
import TransitionTracker from './Navigation/TransitionTracker';
import {diffNavigationState} from './navigationStateDiff';

/** Press-driven capture of the triggering View on forward nav; restore via `AccessibilityInfo.sendAccessibilityEvent` on backward. */

type TriggerEntry = {ref: RefObject<View | null>};

const TRIGGER_MAP_MAX = 64;
// The first focus event can lose to the OS's own window-change auto-focus; a delayed second call lands after the OS settles.
const RESTORE_RETRY_MS = 300;
// A press long before a delayed nav (timer / deeplink / async redirect) shouldn't be captured as that nav's trigger.
const PRESS_TRIGGER_TTL_MS = 3_000;

let lastPressedTrigger: View | null = null;
let lastPressedTriggerAt = 0;
const triggerMap = new Map<string, TriggerEntry>();
let prevState: NavigationState | undefined;
let pendingRestore: {cancel: () => void} | null = null;
let skipNextRestore = false;
let stateUnsubscribe: (() => void) | null = null;

// Delete-then-set so a re-set moves the key to the tail and FIFO eviction drops the truly oldest.
function setTriggerEntry(routeKey: string, entry: TriggerEntry): void {
    triggerMap.delete(routeKey);
    triggerMap.set(routeKey, entry);
    while (triggerMap.size > TRIGGER_MAP_MAX) {
        const oldest = triggerMap.keys().next().value;
        if (oldest === undefined) {
            break;
        }
        triggerMap.delete(oldest);
    }
}

function notifyPressedTrigger(node: View | null): void {
    if (!Accessibility.isScreenReaderEnabledSync()) {
        return;
    }
    lastPressedTrigger = node;
    lastPressedTriggerAt = node ? Date.now() : 0;
}

function captureTriggerForRoute(routeKey: string): void {
    if (!Accessibility.isScreenReaderEnabledSync()) {
        return;
    }
    if (!lastPressedTrigger || Date.now() - lastPressedTriggerAt > PRESS_TRIGGER_TTL_MS) {
        return;
    }
    const ref: RefObject<View | null> = {current: lastPressedTrigger};
    setTriggerEntry(routeKey, {ref});
}

function tryFireFocusEvent(view: View): boolean {
    if (findNodeHandle(view) == null) {
        return false;
    }
    fireFocusEvent(view);
    return true;
}

function restoreTriggerForRoute(routeKey: string): View | null {
    const entry = triggerMap.get(routeKey);
    if (!entry) {
        return null;
    }
    const view = entry.ref.current;
    if (!view) {
        return null;
    }
    return tryFireFocusEvent(view) ? view : null;
}

function cancelPendingRestore(): void {
    pendingRestore?.cancel();
    pendingRestore = null;
}

function scheduleRestore(routeKey: string): void {
    cancelPendingRestore();
    let cancelled = false;
    let retryTimerId: ReturnType<typeof setTimeout> | undefined;
    const handle = TransitionTracker.runAfterTransitions({
        callback: () => {
            if (cancelled) {
                return;
            }
            const view = restoreTriggerForRoute(routeKey);
            if (!view) {
                pendingRestore = null;
                return;
            }
            retryTimerId = setTimeout(() => {
                if (cancelled) {
                    return;
                }
                tryFireFocusEvent(view);
                triggerMap.delete(routeKey);
                pendingRestore = null;
            }, RESTORE_RETRY_MS);
        },
    });

    pendingRestore = {
        cancel: () => {
            cancelled = true;
            handle.cancel();
            if (retryTimerId !== undefined) {
                clearTimeout(retryTimerId);
            }
        },
    };
}

function handleStateChange(newState: NavigationState | undefined): void {
    if (!newState) {
        return;
    }
    const {action, removedKeys} = diffNavigationState(prevState, newState);

    if (action.type === 'forward') {
        skipNextRestore = false;
        cancelPendingRestore();
        captureTriggerForRoute(action.captureKey);
        lastPressedTrigger = null;
        scheduleForwardAutoFocus();
    } else if (action.type === 'backward') {
        if (skipNextRestore) {
            skipNextRestore = false;
            cancelPendingRestore();
        } else {
            scheduleRestore(action.restoreKey);
        }
    } else if (action.type === 'lateral') {
        skipNextRestore = false;
        cancelPendingRestore();
    }

    for (const key of removedKeys) {
        triggerMap.delete(key);
    }
    prevState = newState;
}

function navigationRefHasLiveState(): boolean {
    return typeof navigationRef?.isReady === 'function' && navigationRef.isReady() && typeof navigationRef.getRootState === 'function';
}

function setupNavigationFocusReturn(): void {
    if (!prevState && navigationRefHasLiveState()) {
        prevState = navigationRef.getRootState() ?? prevState;
    }
    // Pre-mount addListener returns a queue-only unsubscribe; gate on `current` so we get a real subscription.
    if (!stateUnsubscribe && navigationRef?.current != null && typeof navigationRef.addListener === 'function') {
        stateUnsubscribe = navigationRef.addListener('state', () => {
            if (typeof navigationRef.getRootState !== 'function') {
                return;
            }
            handleStateChange(navigationRef.getRootState());
        });
    }
}

function teardownNavigationFocusReturn(): void {
    cancelPendingRestore();
    prevState = undefined;
    triggerMap.clear();
    lastPressedTrigger = null;
    lastPressedTriggerAt = 0;
    skipNextRestore = false;
    stateUnsubscribe?.();
    stateUnsubscribe = null;
}

/** Skip the next backward restore; call before a form-submit goBack. */
function skipNextFocusRestore(): void {
    skipNextRestore = true;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
// Web-only stubs (PUSH_PARAMS, list restore-in-progress flag, AUTO-skip guard).
function notifyPushParamsForward(_routeKey: string, _prevParams: unknown): void {}
function notifyPushParamsBackward(_routeKey: string, _targetParams: unknown): void {}
/* eslint-enable @typescript-eslint/no-unused-vars */

function cancelPendingFocusRestore(): void {
    cancelPendingRestore();
}

function isFocusRestoreInProgress(): boolean {
    return false;
}

function shouldSkipAutoFocusDueToExistingFocus(): boolean {
    return false;
}

function resetForTests(): void {
    teardownNavigationFocusReturn();
}

function setLastPressedTriggerForTests(node: View | null): void {
    lastPressedTrigger = node;
    lastPressedTriggerAt = node ? Date.now() : 0;
}

function getTriggerMapSizeForTests(): number {
    return triggerMap.size;
}

export {
    setupNavigationFocusReturn,
    teardownNavigationFocusReturn,
    handleStateChange,
    notifyPressedTrigger,
    notifyPushParamsForward,
    notifyPushParamsBackward,
    cancelPendingFocusRestore,
    skipNextFocusRestore,
    notifyBackButtonMounted,
    isFocusRestoreInProgress,
    shouldSkipAutoFocusDueToExistingFocus,
    resetForTests,
    setLastPressedTriggerForTests,
    getTriggerMapSizeForTests,
};
