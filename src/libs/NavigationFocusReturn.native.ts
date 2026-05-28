import type {NavigationState} from '@react-navigation/native';
import type {RefObject} from 'react';
import type {View} from 'react-native';
import Accessibility from './Accessibility';
import fireFocusEvent from './Accessibility/fireFocusEvent';
import scheduleRefocus from './Accessibility/scheduleRefocus';
import compoundParamsKey, {COMPOUND_KEY_DELIMITER} from './compoundParamsKey';
import navigationRef from './Navigation/navigationRef';
// eslint-disable-next-line no-restricted-imports -- sibling primitive to TransitionTracker; needs the exact transitionEnd signal to avoid OS focus-restore races.
import TransitionTracker from './Navigation/TransitionTracker';
import {diffNavigationState} from './navigationStateDiff';

type TriggerEntry = {ref: RefObject<View | null>; identifier?: string};

const TRIGGER_MAP_MAX = 64;
const PRESS_TRIGGER_TTL_MS = 3_000;

let lastPressedTriggerRef: RefObject<View | null> | null = null;
let lastPressedTriggerIdentifier: string | null = null;
let lastPressedTriggerAt = 0;
const triggerMap = new Map<string, TriggerEntry>();
const pressableRegistry = new Map<string, Map<string, RefObject<View | null>>>();
let prevState: NavigationState | undefined;
let pendingRestore: {cancel: () => void} | null = null;
let skipNextRestore = false;
let stateUnsubscribe: (() => void) | null = null;

/*
 * Delete-then-set so a re-set moves the key to the tail and FIFO eviction drops the truly oldest.
 */
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

function notifyPressedTrigger(ref: RefObject<View | null> | null, identifier?: string): void {
    if (!Accessibility.isScreenReaderEnabledSync()) {
        return;
    }
    lastPressedTriggerRef = ref;
    lastPressedTriggerIdentifier = identifier ?? null;
    lastPressedTriggerAt = ref ? Date.now() : 0;
}

/** Skip the next backward restore; call before a form-submit goBack. */
function skipNextFocusRestore(): void {
    skipNextRestore = true;
}

function registerPressable(routeKey: string, identifier: string, ref: RefObject<View | null>): () => void {
    let routeMap = pressableRegistry.get(routeKey);
    if (!routeMap) {
        routeMap = new Map();
        pressableRegistry.set(routeKey, routeMap);
    }
    routeMap.set(identifier, ref);
    return () => {
        const map = pressableRegistry.get(routeKey);
        if (!map) {
            return;
        }
        // Guard against deregister-after-replace: a newer Pressable may have overwritten this identifier.
        if (map.get(identifier) === ref) {
            map.delete(identifier);
        }
        if (map.size === 0) {
            pressableRegistry.delete(routeKey);
        }
    };
}

function captureTriggerForRoute(routeKey: string): void {
    if (!Accessibility.isScreenReaderEnabledSync()) {
        return;
    }
    if (!lastPressedTriggerRef || Date.now() - lastPressedTriggerAt > PRESS_TRIGGER_TTL_MS) {
        return;
    }
    setTriggerEntry(routeKey, {ref: lastPressedTriggerRef, identifier: lastPressedTriggerIdentifier ?? undefined});
}

/*
 * Fast path = captured ref still alive. Fallback = ref nulled by `react-native-screens` detach; resolve via the registry's live re-registration.
 */
function restoreTriggerForRoute(routeKey: string): RefObject<View | null> | null {
    const entry = triggerMap.get(routeKey);
    if (!entry) {
        return null;
    }
    let ref: RefObject<View | null> = entry.ref;
    let view = ref.current;
    if (!view && entry.identifier) {
        const liveRef = pressableRegistry.get(routeKey)?.get(entry.identifier);
        if (liveRef?.current) {
            ref = liveRef;
            view = liveRef.current;
        }
    }
    if (!view) {
        return null;
    }
    fireFocusEvent(view);
    return ref;
}

function cancelPendingRestore(): void {
    pendingRestore?.cancel();
    pendingRestore = null;
}

function scheduleRestore(routeKey: string, {waitForUpcomingTransition = true}: {waitForUpcomingTransition?: boolean} = {}): void {
    cancelPendingRestore();
    let cancelled = false;
    let refocusHandle: {cancel: () => void} | null = null;
    let rafHandle: number | null = null;
    const handle = TransitionTracker.runAfterTransitions({
        // Stack pops fire before their transition registers, so wait for it; PUSH_PARAMS emits none, so the caller opts out to avoid stalling on the 1s timeout.
        waitForUpcomingTransition,
        callback: () => {
            if (cancelled) {
                return;
            }
            const ref = restoreTriggerForRoute(routeKey);
            if (ref) {
                triggerMap.delete(routeKey);
                refocusHandle = scheduleRefocus(ref);
                return;
            }
            // Re-attach can lag transitionEnd by a frame; the new Pressable's mount effect will have populated the registry by next rAF.
            rafHandle = requestAnimationFrame(() => {
                if (cancelled) {
                    return;
                }
                const retryRef = restoreTriggerForRoute(routeKey);
                triggerMap.delete(routeKey);
                if (!retryRef) {
                    pendingRestore = null;
                    return;
                }
                refocusHandle = scheduleRefocus(retryRef);
            });
        },
    });

    pendingRestore = {
        cancel: () => {
            cancelled = true;
            handle.cancel();
            refocusHandle?.cancel();
            if (rafHandle !== null) {
                cancelAnimationFrame(rafHandle);
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
        lastPressedTriggerRef = null;
        lastPressedTriggerIdentifier = null;
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
        pressableRegistry.delete(key);
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
    pressableRegistry.clear();
    lastPressedTriggerRef = null;
    lastPressedTriggerIdentifier = null;
    lastPressedTriggerAt = 0;
    skipNextRestore = false;
    stateUnsubscribe?.();
    stateUnsubscribe = null;
}

/** PUSH_PARAMS reuses the focused key, so `diffNavigationState` reports `noop`; key against `routeKey + params`. */
function notifyPushParamsForward(routeKey: string, prevParams: unknown): void {
    cancelPendingRestore();
    captureTriggerForRoute(compoundParamsKey(routeKey, prevParams));
}

function notifyPushParamsBackward(routeKey: string, targetParams: unknown): void {
    scheduleRestore(compoundParamsKey(routeKey, targetParams), {waitForUpcomingTransition: false});
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

function setLastPressedTriggerRefForTests(ref: RefObject<View | null> | null, identifier?: string): void {
    lastPressedTriggerRef = ref;
    lastPressedTriggerIdentifier = identifier ?? null;
    lastPressedTriggerAt = ref ? Date.now() : 0;
}

function getTriggerMapSizeForTests(): number {
    return triggerMap.size;
}

function getRegistrySizeForTests(): number {
    let total = 0;
    for (const m of pressableRegistry.values()) {
        total += m.size;
    }
    return total;
}

export {
    setupNavigationFocusReturn,
    teardownNavigationFocusReturn,
    handleStateChange,
    notifyPressedTrigger,
    registerPressable,
    notifyPushParamsForward,
    notifyPushParamsBackward,
    cancelPendingFocusRestore,
    skipNextFocusRestore,
    isFocusRestoreInProgress,
    shouldSkipAutoFocusDueToExistingFocus,
    resetForTests,
    setLastPressedTriggerRefForTests,
    getTriggerMapSizeForTests,
    getRegistrySizeForTests,
};
