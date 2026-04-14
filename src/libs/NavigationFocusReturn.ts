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

let lastInteractiveElement: HTMLElement | null = null;
let activePopoverLauncher: HTMLElement | null = null;
const triggerMap = new Map<string, HTMLElement>();
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
    // Items inside an active FocusTrapForModal get removed on close; prefer the launcher.
    if (activePopoverLauncher && document.contains(activePopoverLauncher)) {
        triggerMap.set(routeKey, activePopoverLauncher);
        return;
    }
    if (!lastInteractiveElement || !document.contains(lastInteractiveElement)) {
        return;
    }
    // Stale: focus drifted to another non-body element since the last focusin.
    const active = document.activeElement;
    if (active && active !== document.body && active !== lastInteractiveElement) {
        return;
    }
    triggerMap.set(routeKey, lastInteractiveElement);
}

function setActivePopoverLauncher(element: HTMLElement | null): void {
    activePopoverLauncher = element;
}

/** Compound key for PUSH_PARAMS history (same route.key across params snapshots). Sorts top-level keys for insertion-order stability. */
function compoundParamsKey(routeKey: string, params: unknown): string {
    if (params == null) {
        return `${routeKey}::`;
    }
    if (typeof params !== 'object') {
        return `${routeKey}::${JSON.stringify(params)}`;
    }
    const entries = Object.entries(params as Record<string, unknown>).sort(([a], [b]) => {
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1;
        }
        return 0;
    });
    return `${routeKey}::${JSON.stringify(entries)}`;
}

function notifyPushParamsForward(routeKey: string, prevParams: unknown): void {
    captureTriggerForRoute(compoundParamsKey(routeKey, prevParams));
}

function notifyPushParamsBackward(routeKey: string, targetParams: unknown): void {
    scheduleRestore(compoundParamsKey(routeKey, targetParams));
}

function restoreTriggerForRoute(routeKey: string): boolean {
    if (typeof document === 'undefined') {
        return false;
    }
    const element = triggerMap.get(routeKey);
    if (!element) {
        return false;
    }
    if (!document.contains(element)) {
        triggerMap.delete(routeKey);
        return false;
    }
    // Keep the entry when the trigger cannot currently accept focus so scheduleRestore can retry.
    if (element.matches(':disabled') || element.getAttribute('aria-disabled') === 'true' || element.closest('[aria-hidden="true"]')) {
        return false;
    }
    triggerMap.delete(routeKey);
    if (!tryClaim(Priorities.RETURN)) {
        return false;
    }
    // focusVisible reflects current modality so a user who switched to mouse doesn't get a ring.
    element.focus({preventScroll: true, focusVisible: getHadTabNavigation()} as FocusOptions);
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
        // InteractionManager is the idiomatic defer primitive here despite the type-def deprecation.
        // eslint-disable-next-line @typescript-eslint/no-deprecated
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
                    // Give up — drop the stale entry.
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
    // Absent before NavigationContainer mounts and in tests that mock navigationRef; NavigationRoot.onReady re-invokes this to install once the container is live.
    if (!stateUnsubscribe && typeof navigationRef?.addListener === 'function') {
        stateUnsubscribe = navigationRef.addListener('state', () => {
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
    notifyPushParamsForward,
    notifyPushParamsBackward,
    compoundParamsKey,
    resetForTests,
    setLastInteractiveElementForTests,
};
