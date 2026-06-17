import type {NavigationState} from '@react-navigation/native';
import type {RefObject} from 'react';
import type {View} from 'react-native';
import Accessibility from '@libs/Accessibility';
import fireFocusEvent from '@libs/Accessibility/fireFocusEvent';
import scheduleRefocus from '@libs/Accessibility/scheduleRefocus';
import compoundParamsKey, {COMPOUND_KEY_DELIMITER} from '@libs/compoundParamsKey';
import Log from '@libs/Log';
import navigationRef from '@libs/Navigation/navigationRef';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {diffNavigationState} from '@libs/navigationStateDiff';
import CONST from '@src/CONST';

type TriggerEntry = {ref: RefObject<View | null>; identifier?: string};

const TRIGGER_MAP_MAX = 64;
const PRESS_TRIGGER_TTL_MS = 3_000;
const MAX_RESTORE_FRAMES = 5;

const COLLISION_TOLERANT_IDENTIFIERS = new Set<string>([CONST.BACK_BUTTON_NATIVE_ID]);

let lastPressedTriggerRef: RefObject<View | null> | null = null;
let lastPressedTriggerIdentifier: string | null = null;
let lastPressedTriggerAt = 0;
const triggerMap = new Map<string, TriggerEntry>();
const pressableRegistry = new Map<string, Map<string, Set<RefObject<View | null>>>>();
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

/* Single-use: consumed by the next navigation so a later press-less forward can't reuse a stale ref within the TTL. */
function clearStagedPress(): void {
    lastPressedTriggerRef = null;
    lastPressedTriggerIdentifier = null;
    lastPressedTriggerAt = 0;
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
    // Set per identifier (not last-write-wins) so a colliding identifier stays detectable — see restoreTriggerForRoute.
    let refs = routeMap.get(identifier);
    if (!refs) {
        refs = new Set();
        routeMap.set(identifier, refs);
    }
    refs.add(ref);
    return () => {
        const map = pressableRegistry.get(routeKey);
        const set = map?.get(identifier);
        if (!map || !set) {
            return;
        }
        set.delete(ref);
        if (set.size === 0) {
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
        // Pressables register under the raw route key; PUSH_PARAMS restores arrive under the compound key, so strip the suffix to match.
        const rawRouteKey = routeKey.split(COMPOUND_KEY_DELIMITER).at(0) ?? routeKey;
        const liveRefs = Array.from(pressableRegistry.get(rawRouteKey)?.get(entry.identifier) ?? []).filter((candidate) => candidate.current);
        const acceptCollision = COLLISION_TOLERANT_IDENTIFIERS.has(entry.identifier);
        const liveRef = liveRefs.length === 1 || (acceptCollision && liveRefs.length > 1) ? liveRefs.at(0) : undefined;
        if (liveRef) {
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

/** Skip cleanup: cancel in-flight defer + drop the entry so a stale trigger can't be replayed by a later same-key backward. */
function applySkippedRestore(restoreKey: string): void {
    skipNextRestore = false;
    cancelPendingRestore();
    triggerMap.delete(restoreKey);
}

function scheduleRestore(routeKey: string, {waitForUpcomingTransition}: {waitForUpcomingTransition: boolean}): void {
    cancelPendingRestore();
    let cancelled = false;
    let refocusHandle: {cancel: () => void} | null = null;
    let rafHandle: number | null = null;
    let handle: {cancel: () => void} | null = null;

    // Assign pendingRestore before runAfterTransitions: with waitForUpcomingTransition false the callback can fire synchronously, so a re-entrant cancel must already see this handle to abort the just-scheduled rAF retry.
    pendingRestore = {
        cancel: () => {
            cancelled = true;
            handle?.cancel();
            refocusHandle?.cancel();
            if (rafHandle !== null) {
                cancelAnimationFrame(rafHandle);
            }
        },
    };

    handle = TransitionTracker.runAfterTransitions({
        // Stack pops fire before their transition registers, so wait for it; PUSH_PARAMS emits none, so the caller opts out to avoid stalling on the 1s timeout.
        waitForUpcomingTransition,
        callback: () => {
            // Keep the entry until success or budget exhaustion, so a transient re-attach miss doesn't drop it.
            let framesLeft = MAX_RESTORE_FRAMES;
            const attempt = () => {
                if (cancelled) {
                    return;
                }
                const ref = restoreTriggerForRoute(routeKey);
                if (ref) {
                    triggerMap.delete(routeKey);
                    refocusHandle = scheduleRefocus(ref);
                    return;
                }
                framesLeft -= 1;
                if (framesLeft <= 0) {
                    // Surface exhaustion — silent failure would erode WCAG 2.4.3 without trace.
                    Log.warn('[NavigationFocusReturn] restore budget exhausted', {routeKey, frames: MAX_RESTORE_FRAMES});
                    triggerMap.delete(routeKey);
                    return;
                }
                rafHandle = requestAnimationFrame(attempt);
            };
            attempt();
        },
    });
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
    } else if (action.type === 'backward') {
        if (skipNextRestore) {
            applySkippedRestore(action.restoreKey);
        } else {
            scheduleRestore(action.restoreKey, {waitForUpcomingTransition: true});
        }
    } else if (action.type === 'lateral') {
        skipNextRestore = false;
        cancelPendingRestore();
    }

    const isRealNavigation = action.type !== 'noop';
    if (isRealNavigation) {
        clearStagedPress();
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
    clearStagedPress();
    skipNextRestore = false;
    stateUnsubscribe?.();
    stateUnsubscribe = null;
}

/** PUSH_PARAMS reuses the focused key, so `diffNavigationState` reports `noop`; key against `routeKey + params`. */
function notifyPushParamsForward(routeKey: string, prevParams: unknown): void {
    skipNextRestore = false;
    cancelPendingRestore();
    captureTriggerForRoute(compoundParamsKey(routeKey, prevParams));
    clearStagedPress();
}

function notifyPushParamsBackward(routeKey: string, targetParams: unknown): void {
    // Honor a one-shot skip on this param-revert too (form-submit goBack can land as PUSH_PARAMS, not a stack pop).
    const compoundKey = compoundParamsKey(routeKey, targetParams);
    if (skipNextRestore) {
        applySkippedRestore(compoundKey);
    } else {
        scheduleRestore(compoundKey, {waitForUpcomingTransition: false});
    }
    clearStagedPress();
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

function getTriggerMapSizeForTests(): number {
    return triggerMap.size;
}

function getRegistrySizeForTests(): number {
    let total = 0;
    for (const routeMap of pressableRegistry.values()) {
        for (const refs of routeMap.values()) {
            total += refs.size;
        }
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
    getTriggerMapSizeForTests,
    getRegistrySizeForTests,
};
