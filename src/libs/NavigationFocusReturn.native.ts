import type {NavigationState} from '@react-navigation/native';
import type {RefObject} from 'react';
import type {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports -- .native.ts only; the rule guards web bundles from pulling the native stub.
import findNodeHandle from '@src/utils/findNodeHandle';
import Accessibility from './Accessibility';
import fireFocusEvent from './Accessibility/fireFocusEvent';
import compoundParamsKey, {COMPOUND_KEY_DELIMITER} from './compoundParamsKey';
import navigationRef from './Navigation/navigationRef';
// eslint-disable-next-line no-restricted-imports -- focus-return is a sibling primitive to TransitionTracker; the exact transitionEnd signal is what we need to avoid focus-restore races with the OS.
import TransitionTracker from './Navigation/TransitionTracker';
import {diffNavigationState} from './navigationStateDiff';

type TriggerEntry = {ref: RefObject<View | null>};

const TRIGGER_MAP_MAX = 64;
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

function restoreTriggerForRoute(routeKey: string): void {
    const entry = triggerMap.get(routeKey);
    if (!entry) {
        return;
    }
    const view = entry.ref.current;
    // Truthy ref can still point to a detached View; findNodeHandle returns null then.
    if (!view || findNodeHandle(view) == null) {
        return;
    }
    fireFocusEvent(view);
}

function cancelPendingRestore(): void {
    pendingRestore?.cancel();
    pendingRestore = null;
}

function scheduleRestore(routeKey: string): void {
    cancelPendingRestore();
    let cancelled = false;
    const handle = TransitionTracker.runAfterTransitions({
        callback: () => {
            if (cancelled) {
                return;
            }
            restoreTriggerForRoute(routeKey);
            triggerMap.delete(routeKey);
            pendingRestore = null;
        },
    });

    pendingRestore = {
        cancel: () => {
            cancelled = true;
            handle.cancel();
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
        const compoundPrefix = `${key}${COMPOUND_KEY_DELIMITER}`;
        for (const mapKey of triggerMap.keys()) {
            if (mapKey.startsWith(compoundPrefix)) {
                triggerMap.delete(mapKey);
            }
        }
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

/** PUSH_PARAMS reuses the focused key, so `diffNavigationState` reports `noop`; key against `routeKey + params`. */
function notifyPushParamsForward(routeKey: string, prevParams: unknown): void {
    cancelPendingRestore();
    captureTriggerForRoute(compoundParamsKey(routeKey, prevParams));
}

function notifyPushParamsBackward(routeKey: string, targetParams: unknown): void {
    scheduleRestore(compoundParamsKey(routeKey, targetParams));
}

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
    isFocusRestoreInProgress,
    shouldSkipAutoFocusDueToExistingFocus,
    resetForTests,
    setLastPressedTriggerForTests,
    getTriggerMapSizeForTests,
};
