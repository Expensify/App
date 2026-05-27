import type {NavigationState} from '@react-navigation/native';
import type {RefObject} from 'react';
import type {View} from 'react-native';
import Accessibility from './Accessibility';
import fireFocusEvent from './Accessibility/fireFocusEvent';
import scheduleRefocus from './Accessibility/scheduleRefocus';
import compoundParamsKey, {COMPOUND_KEY_DELIMITER} from './compoundParamsKey';
import navigationRef from './Navigation/navigationRef';
// eslint-disable-next-line no-restricted-imports -- focus-return is a sibling primitive to TransitionTracker; the exact transitionEnd signal is what we need to avoid focus-restore races with the OS.
import TransitionTracker from './Navigation/TransitionTracker';
import {diffNavigationState} from './navigationStateDiff';

type TriggerEntry = {ref: RefObject<View | null>};

const TRIGGER_MAP_MAX = 64;
// Drop stale presses so a delayed nav (timer / deeplink / async redirect) doesn't capture an unrelated trigger.
const PRESS_TRIGGER_TTL_MS = 3_000;

let lastPressedTriggerRef: RefObject<View | null> | null = null;
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

function notifyPressedTrigger(ref: RefObject<View | null> | null): void {
    if (!Accessibility.isScreenReaderEnabledSync()) {
        return;
    }
    lastPressedTriggerRef = ref;
    lastPressedTriggerAt = ref ? Date.now() : 0;
}

function captureTriggerForRoute(routeKey: string): void {
    if (!Accessibility.isScreenReaderEnabledSync()) {
        return;
    }
    if (!lastPressedTriggerRef || Date.now() - lastPressedTriggerAt > PRESS_TRIGGER_TTL_MS) {
        return;
    }
    setTriggerEntry(routeKey, {ref: lastPressedTriggerRef});
}

function restoreTriggerForRoute(routeKey: string): RefObject<View | null> | null {
    const entry = triggerMap.get(routeKey);
    if (!entry) {
        return null;
    }
    const view = entry.ref.current;
    // `mergeRefs` nulls `.current` on Pressable unmount, so non-null here means still in React's tree.
    if (!view) {
        return null;
    }
    fireFocusEvent(view);
    return entry.ref;
}

function cancelPendingRestore(): void {
    pendingRestore?.cancel();
    pendingRestore = null;
}

function scheduleRestore(routeKey: string): void {
    cancelPendingRestore();
    let cancelled = false;
    let refocusHandle: {cancel: () => void} | null = null;
    const handle = TransitionTracker.runAfterTransitions({
        callback: () => {
            if (cancelled) {
                return;
            }
            const ref = restoreTriggerForRoute(routeKey);
            triggerMap.delete(routeKey);
            if (!ref) {
                pendingRestore = null;
                return;
            }
            refocusHandle = scheduleRefocus(ref);
        },
    });

    pendingRestore = {
        cancel: () => {
            cancelled = true;
            handle.cancel();
            refocusHandle?.cancel();
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
        lastPressedTriggerRef = null;
    } else if (action.type === 'backward') {
        if (skipNextRestore) {
            skipNextRestore = false;
            cancelPendingRestore();
            triggerMap.delete(action.restoreKey);
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
    lastPressedTriggerRef = null;
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

/** Web-only invariant; native returns false. */
function isFocusRestoreInProgress(): boolean {
    return false;
}

/** Web-only invariant; native returns false. */
function shouldSkipAutoFocusDueToExistingFocus(): boolean {
    return false;
}

function resetForTests(): void {
    teardownNavigationFocusReturn();
}

function setLastPressedTriggerRefForTests(ref: RefObject<View | null> | null): void {
    lastPressedTriggerRef = ref;
    lastPressedTriggerAt = ref ? Date.now() : 0;
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
    setLastPressedTriggerRefForTests,
    getTriggerMapSizeForTests,
};
