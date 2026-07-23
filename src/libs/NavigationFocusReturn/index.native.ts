import Accessibility from '@libs/Accessibility';
import fireFocusEvent from '@libs/Accessibility/fireFocusEvent';
import scheduleRefocus from '@libs/Accessibility/scheduleRefocus';
import compoundParamsKey, {COMPOUND_KEY_DELIMITER} from '@libs/compoundParamsKey';
import {MAX_RESTORE_FRAMES, PRESS_TRIGGER_TTL_MS, TRIGGER_MAP_MAX} from '@libs/focusReturnTimings';
import Log from '@libs/Log';
import navigationRef from '@libs/Navigation/navigationRef';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {diffNavigationState} from '@libs/navigationStateDiff';

import CONST from '@src/CONST';

import type {NavigationState} from '@react-navigation/native';
import type {RefObject} from 'react';
import type {View} from 'react-native';

import setFifoEntry from './fifoMap';

type TriggerEntry = {ref: RefObject<View | null>; identifier?: string};

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

// Recorded unconditionally so cold-start presses survive the warm-up window. performance.now is monotonic — Date.now would corrupt the TTL on clock jumps.
function notifyPressedTrigger(ref: RefObject<View | null> | null, identifier?: string): void {
    lastPressedTriggerRef = ref;
    lastPressedTriggerIdentifier = identifier ?? null;
    lastPressedTriggerAt = ref ? performance.now() : 0;
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

// Gate on `'disabled'` so the warm-up window (cold start, AppState resume) — which returns `'unknown'` — still captures defensively.
function captureTriggerForRoute(routeKey: string): void {
    if (Accessibility.getScreenReaderState() === 'disabled') {
        return;
    }
    if (!lastPressedTriggerRef || performance.now() - lastPressedTriggerAt > PRESS_TRIGGER_TTL_MS) {
        return;
    }
    setFifoEntry(triggerMap, routeKey, {ref: lastPressedTriggerRef, identifier: lastPressedTriggerIdentifier ?? undefined}, TRIGGER_MAP_MAX);
}

// Caller passes the raw (compound-suffix-stripped) route key — pressables register under raw, but PUSH_PARAMS restores arrive under the compound key.
function resolveLiveRefFromRegistry(rawRouteKey: string, identifier: string): RefObject<View | null> | null {
    const refs = pressableRegistry.get(rawRouteKey)?.get(identifier);
    if (!refs || refs.size === 0) {
        return null;
    }
    // Fast path: single registration. Skip the Array.from + filter allocation in the common case.
    if (refs.size === 1) {
        const sole = refs.values().next().value;
        return sole?.current ? sole : null;
    }
    // Multi-registration: a single live ref always wins; multi-live only resolves when on the collision-tolerant allowlist.
    let firstLive: RefObject<View | null> | null = null;
    let liveCount = 0;
    for (const ref of refs) {
        if (!ref.current) {
            continue;
        }
        liveCount += 1;
        if (!firstLive) {
            firstLive = ref;
        }
    }
    if (liveCount === 1) {
        return firstLive;
    }
    if (liveCount > 1 && COLLISION_TOLERANT_IDENTIFIERS.has(identifier)) {
        return firstLive;
    }
    return null;
}

/*
 * Registry-first: a fresh re-registration wins over the captured ref because the captured native handle
 * can stale-out across detach without nulling the JS ref. Falls back to the captured ref when the registry misses.
 */
function restoreTriggerForRoute(routeKey: string, rawRouteKey: string): RefObject<View | null> | null {
    const entry = triggerMap.get(routeKey);
    if (!entry) {
        return null;
    }
    const liveRef = entry.identifier ? resolveLiveRefFromRegistry(rawRouteKey, entry.identifier) : null;
    const ref = liveRef ?? entry.ref;
    const view = ref.current;
    if (!view) {
        return null;
    }
    if (!fireFocusEvent(view)) {
        return null;
    }
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

function scheduleRestore(routeKey: string, {waitForUpcomingTransition}: {waitForUpcomingTransition: false | 'navigation'}): void {
    // Cancel first so a stale prior restore can't fire on the prior route after the user moved on (rapid double-back).
    cancelPendingRestore();
    // Consume the entry so a later SR re-enable + press-less nav can't replay this stale capture.
    if (Accessibility.getScreenReaderState() === 'disabled') {
        triggerMap.delete(routeKey);
        return;
    }
    if (!triggerMap.has(routeKey)) {
        return;
    }
    let cancelled = false;
    let refocusHandle: {cancel: () => void} | null = null;
    let rafHandle: number | null = null;
    let handle: {cancel: () => void} | null = null;

    // Assign pendingRestore before runAfterTransitions: the callback can fire synchronously, so a re-entrant cancel must see this handle to abort the rAF retry.
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

    // Hoist out of the retry loop — routeKey is invariant across rAF retries.
    const rawRouteKey = routeKey.split(COMPOUND_KEY_DELIMITER).at(0) ?? routeKey;

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
                const ref = restoreTriggerForRoute(routeKey, rawRouteKey);
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
            // PUSH_PARAMS dispatches pre-commit (from getStateForAction) — defer a frame so the new params render before we focus.
            if (waitForUpcomingTransition === false) {
                rafHandle = requestAnimationFrame(attempt);
            } else {
                attempt();
            }
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
            scheduleRestore(action.restoreKey, {waitForUpcomingTransition: 'navigation'});
        }
    } else if (action.type === 'lateral') {
        skipNextRestore = false;
        cancelPendingRestore();
    } else if (action.type === 'noop') {
        skipNextRestore = false;
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
