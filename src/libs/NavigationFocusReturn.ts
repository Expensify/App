import {findFocusedRoute} from '@react-navigation/core';
import type {NavigationState, PartialState} from '@react-navigation/native';
import {InteractionManager} from 'react-native';
import getHadTabNavigation from './hadTabNavigation';
import navigationRef from './Navigation/navigationRef';
import {Priorities, resetCycle, tryClaim} from './ScreenFocusArbiter';

/**
 * A document focusin listener tracks the last keyboard-focused element; a
 * navigation state listener captures it against the outgoing route on forward
 * nav and restores it on backward nav.
 */

type AnyState = NavigationState | PartialState<NavigationState> | undefined;

type DiffAction = {type: 'forward'; captureKey: string} | {type: 'backward'; restoreKey: string} | {type: 'lateral'} | {type: 'noop'};

// Fallback (if set) is the surrounding trap's launcher, used only when primary is gone from the DOM at restore time.
type TriggerEntry = {primary: HTMLElement; fallback?: HTMLElement};

const COMPOUND_KEY_DELIMITER = '::';
const LAUNCHER_CLEAR_DELAY_MS = 1000;

let lastInteractiveElement: HTMLElement | null = null;
let activePopoverLauncher: HTMLElement | null = null;
// `clearLauncherTimerId === undefined` with a non-null launcher ≡ popover active; with a timer set ≡ deactivated but held for deferred-nav consumption.
let clearLauncherTimerId: ReturnType<typeof setTimeout> | undefined;
const triggerMap = new Map<string, TriggerEntry>();
let prevState: NavigationState | undefined;
let pendingRestore: {cancel: () => void} | null = null;
let focusinHandler: ((e: FocusEvent) => void) | null = null;
let stateUnsubscribe: (() => void) | null = null;

function collectRouteKeys(state: AnyState, out = new Set<string>()): Set<string> {
    if (!state?.routes) {
        return out;
    }
    for (const route of state.routes) {
        if (route.key) {
            out.add(route.key);
        }
        if (route.state) {
            collectRouteKeys(route.state as PartialState<NavigationState>, out);
        }
    }
    return out;
}

function diffNavigationState(prev: AnyState, next: NavigationState): {action: DiffAction; removedKeys: string[]} {
    const newFocusedKey = findFocusedRoute(next)?.key;
    const prevFocusedKey = prev ? findFocusedRoute(prev as NavigationState)?.key : undefined;

    const prevKeys = collectRouteKeys(prev);
    const newKeys = collectRouteKeys(next);
    const removedKeys: string[] = [];
    for (const key of prevKeys) {
        if (!newKeys.has(key)) {
            removedKeys.push(key);
        }
    }

    let action: DiffAction;
    if (!prevFocusedKey || !newFocusedKey || prevFocusedKey === newFocusedKey) {
        action = {type: 'noop'};
    } else if (prevKeys.has(newFocusedKey) && removedKeys.length > 0) {
        action = {type: 'backward', restoreKey: newFocusedKey};
    } else if (!prevKeys.has(newFocusedKey)) {
        action = {type: 'forward', captureKey: prevFocusedKey};
    } else {
        // Key existed, nothing dropped — e.g. top-tab switch with all tabs mounted.
        action = {type: 'lateral'};
    }

    return {action, removedKeys};
}

function captureTriggerForRoute(routeKey: string): void {
    if (typeof document === 'undefined') {
        return;
    }
    // Skip mouse-driven nav: lastInteractiveElement would be a stale keyboard target.
    if (!getHadTabNavigation()) {
        return;
    }

    const launcher = activePopoverLauncher && document.contains(activePopoverLauncher) ? activePopoverLauncher : null;

    // Reject lastInteractiveElement if focus has since drifted to another non-body element.
    const active = document.activeElement;
    const innerIsStale = lastInteractiveElement && active && active !== document.body && active !== lastInteractiveElement;
    const inner = lastInteractiveElement && document.contains(lastInteractiveElement) && !innerIsStale ? lastInteractiveElement : null;

    if (launcher) {
        // Dual-capture in trapped UI: prefer the in-trap element on restore; fall back to the launcher only when the primary is removed on trap close.
        if (inner && inner !== launcher) {
            triggerMap.set(routeKey, {primary: inner, fallback: launcher});
        } else {
            triggerMap.set(routeKey, {primary: launcher});
        }
        setActivePopoverLauncher(null);
        return;
    }

    if (!inner) {
        return;
    }
    triggerMap.set(routeKey, {primary: inner});
}

function setActivePopoverLauncher(element: HTMLElement | null): void {
    if (clearLauncherTimerId !== undefined) {
        clearTimeout(clearLauncherTimerId);
        clearLauncherTimerId = undefined;
    }
    activePopoverLauncher = element;
}

/** Defer the launcher clear so deferred-navigation popovers can still consume it. A new setActivePopoverLauncher cancels the pending clear. */
function scheduleClearActivePopoverLauncher(): void {
    if (clearLauncherTimerId !== undefined) {
        clearTimeout(clearLauncherTimerId);
    }
    clearLauncherTimerId = setTimeout(() => {
        activePopoverLauncher = null;
        clearLauncherTimerId = undefined;
    }, LAUNCHER_CLEAR_DELAY_MS);
}

/** Compound key for PUSH_PARAMS history (same route.key across params snapshots). Sorts top-level keys for insertion-order stability. */
function compoundParamsKey(routeKey: string, params: unknown): string {
    if (params == null) {
        return `${routeKey}${COMPOUND_KEY_DELIMITER}`;
    }
    if (typeof params !== 'object') {
        return `${routeKey}${COMPOUND_KEY_DELIMITER}${JSON.stringify(params)}`;
    }
    // Drop undefined so explicit-undefined fields match path-rehydrated (omitted) params.
    const entries = Object.entries(params as Record<string, unknown>)
        .filter(([, value]) => value !== undefined)
        .sort(([a], [b]) => {
            if (a < b) {
                return -1;
            }
            if (a > b) {
                return 1;
            }
            return 0;
        });
    return `${routeKey}${COMPOUND_KEY_DELIMITER}${JSON.stringify(entries)}`;
}

function notifyPushParamsForward(routeKey: string, prevParams: unknown): void {
    // Same-key transitions are classified as noop by handleStateChange, which doesn't cancel — do it here.
    cancelPendingRestore();
    captureTriggerForRoute(compoundParamsKey(routeKey, prevParams));
}

function notifyPushParamsBackward(routeKey: string, targetParams: unknown): void {
    scheduleRestore(compoundParamsKey(routeKey, targetParams));
}

/** Cancel a queued restore without capturing anything — e.g. PUSH_PARAMS browser-forward RESET. */
function cancelPendingFocusRestore(): void {
    cancelPendingRestore();
}

function canAcceptFocus(el: HTMLElement): boolean {
    return !el.matches(':disabled') && el.getAttribute('aria-disabled') !== 'true' && !el.closest('[aria-hidden="true"]');
}

function restoreTriggerForRoute(routeKey: string): boolean {
    if (typeof document === 'undefined') {
        return false;
    }
    const entry = triggerMap.get(routeKey);
    if (!entry) {
        return false;
    }
    const {primary, fallback} = entry;
    const primaryInDom = document.contains(primary);

    // Primary in DOM but transiently cannot accept focus: keep entry so scheduleRestore can retry.
    if (primaryInDom && !canAcceptFocus(primary)) {
        return false;
    }

    let target: HTMLElement | null = null;
    if (primaryInDom) {
        target = primary;
    } else if (fallback && document.contains(fallback)) {
        if (!canAcceptFocus(fallback)) {
            return false;
        }
        target = fallback;
    }

    if (!target) {
        triggerMap.delete(routeKey);
        return false;
    }

    triggerMap.delete(routeKey);
    if (!tryClaim(Priorities.RETURN)) {
        return false;
    }
    // focusVisible reflects current modality so a user who switched to mouse doesn't get a ring.
    target.focus({preventScroll: true, focusVisible: getHadTabNavigation()} as FocusOptions);
    return true;
}

function cancelPendingRestore(): void {
    pendingRestore?.cancel();
    pendingRestore = null;
}

const MAX_RESTORE_ATTEMPTS = 2;
const RESTORE_RETRY_MS = 50;

function scheduleRestore(routeKey: string): void {
    cancelPendingRestore();
    let cancelled = false;
    let attempts = 0;
    let frameId: number | undefined;
    let retryTimerId: ReturnType<typeof setTimeout> | undefined;
    let imHandle: {cancel: () => void} | undefined;

    const attempt = () => {
        // Defer past the transition so useAutoFocusInput and React Navigation's own focus work settle first.
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- idiomatic defer primitive despite type-def deprecation.
        imHandle = InteractionManager.runAfterInteractions(() => {
            if (cancelled) {
                return;
            }
            frameId = requestAnimationFrame(() => {
                if (cancelled) {
                    return;
                }
                attempts += 1;
                const restored = restoreTriggerForRoute(routeKey);
                if (restored || !triggerMap.has(routeKey)) {
                    pendingRestore = null;
                    return;
                }
                if (attempts >= MAX_RESTORE_ATTEMPTS) {
                    triggerMap.delete(routeKey);
                    pendingRestore = null;
                    return;
                }
                retryTimerId = setTimeout(attempt, RESTORE_RETRY_MS);
            });
        });
    };

    pendingRestore = {
        cancel: () => {
            cancelled = true;
            imHandle?.cancel();
            if (frameId !== undefined) {
                cancelAnimationFrame(frameId);
            }
            if (retryTimerId !== undefined) {
                clearTimeout(retryTimerId);
            }
        },
    };

    attempt();
}

function handleStateChange(newState: NavigationState | undefined): void {
    if (!newState) {
        return;
    }
    resetCycle();
    const {action, removedKeys} = diffNavigationState(prevState, newState);

    if (action.type === 'forward') {
        cancelPendingRestore();
        captureTriggerForRoute(action.captureKey);
    } else if (action.type === 'backward') {
        // scheduleRestore cancels any prior pending internally.
        scheduleRestore(action.restoreKey);
    } else if (action.type === 'lateral') {
        // Sibling route — stale restore would steal focus back.
        cancelPendingRestore();
    }
    // noop (same focused route, e.g. setParams): leave any pending restore intact.

    for (const key of removedKeys) {
        triggerMap.delete(key);
        // Drop compound PUSH_PARAMS entries (`${key}::...`) for the removed route.
        const compoundPrefix = `${key}${COMPOUND_KEY_DELIMITER}`;
        for (const mapKey of triggerMap.keys()) {
            if (mapKey.startsWith(compoundPrefix)) {
                triggerMap.delete(mapKey);
            }
        }
    }

    prevState = newState;
}

function setupNavigationFocusReturn(): void {
    if (typeof document === 'undefined') {
        return;
    }
    if (!focusinHandler) {
        focusinHandler = (e: FocusEvent) => {
            if (!(e.target instanceof HTMLElement) || e.target === document.body) {
                return;
            }
            if (!getHadTabNavigation()) {
                return;
            }
            lastInteractiveElement = e.target;
        };
        document.addEventListener('focusin', focusinHandler, true);
    }
    // addListener is absent pre-mount and in test mocks; NavigationRoot.onReady re-invokes once the container is live.
    if (!stateUnsubscribe && typeof navigationRef?.addListener === 'function') {
        // Seed so the first transition diffs against a live state, not undefined (which classifies as noop and skips capture).
        if (typeof navigationRef.getRootState === 'function') {
            prevState = navigationRef.getRootState() ?? prevState;
        }
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
    if (focusinHandler && typeof document !== 'undefined') {
        document.removeEventListener('focusin', focusinHandler, true);
    }
    focusinHandler = null;
    stateUnsubscribe?.();
    stateUnsubscribe = null;
}

function resetForTests(): void {
    cancelPendingRestore();
    if (clearLauncherTimerId !== undefined) {
        clearTimeout(clearLauncherTimerId);
        clearLauncherTimerId = undefined;
    }
    triggerMap.clear();
    prevState = undefined;
    lastInteractiveElement = null;
    activePopoverLauncher = null;
}

function setLastInteractiveElementForTests(element: HTMLElement | null): void {
    lastInteractiveElement = element;
}

setupNavigationFocusReturn();

export {
    setupNavigationFocusReturn,
    teardownNavigationFocusReturn,
    handleStateChange,
    diffNavigationState,
    collectRouteKeys,
    captureTriggerForRoute,
    restoreTriggerForRoute,
    setActivePopoverLauncher,
    scheduleClearActivePopoverLauncher,
    notifyPushParamsForward,
    notifyPushParamsBackward,
    cancelPendingFocusRestore,
    compoundParamsKey,
    resetForTests,
    setLastInteractiveElementForTests,
};
