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

type DiffAction = {type: 'forward'; captureKey: string} | {type: 'backward'; restoreKey: string} | {type: 'noop'};

let lastInteractiveElement: HTMLElement | null = null;
const triggerMap = new Map<string, HTMLElement>();
let prevState: NavigationState | undefined;
let pendingRestore: {cancel: () => void} | null = null;
let teardown: (() => void) | null = null;

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
    } else if (prevKeys.has(newFocusedKey)) {
        action = {type: 'backward', restoreKey: newFocusedKey};
    } else {
        action = {type: 'forward', captureKey: prevFocusedKey};
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

function restoreTriggerForRoute(routeKey: string): boolean {
    if (typeof document === 'undefined') {
        return false;
    }
    const element = triggerMap.get(routeKey);
    if (!element) {
        return false;
    }
    triggerMap.delete(routeKey);
    if (!document.contains(element)) {
        return false;
    }
    // Unfocusable trigger: skip both the claim and the focus so fallbacks can run.
    if (element.matches(':disabled') || element.getAttribute('aria-disabled') === 'true' || element.closest('[aria-hidden="true"]')) {
        return false;
    }
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

function scheduleRestore(routeKey: string): void {
    cancelPendingRestore();
    let cancelled = false;
    let frameId: number | undefined;
    // Defer past the transition so useAutoFocusInput and React Navigation's own focus work settle first.
    // InteractionManager is marked deprecated in type defs but remains the idiomatic defer primitive across this codebase.
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const handle = InteractionManager.runAfterInteractions(() => {
        if (cancelled) {
            return;
        }
        frameId = requestAnimationFrame(() => {
            if (cancelled) {
                return;
            }
            restoreTriggerForRoute(routeKey);
            pendingRestore = null;
        });
    });
    pendingRestore = {
        cancel: () => {
            cancelled = true;
            handle.cancel();
            if (frameId !== undefined) {
                cancelAnimationFrame(frameId);
            }
        },
    };
}

function handleStateChange(newState: NavigationState | undefined): void {
    if (!newState) {
        return;
    }
    resetCycle();
    const {action, removedKeys} = diffNavigationState(prevState, newState);

    if (action.type === 'forward') {
        captureTriggerForRoute(action.captureKey);
    } else if (action.type === 'backward') {
        scheduleRestore(action.restoreKey);
    }

    for (const key of removedKeys) {
        triggerMap.delete(key);
    }

    prevState = newState;
}

function setupNavigationFocusReturn(): void {
    if (teardown || typeof document === 'undefined') {
        return;
    }

    const focusinHandler = (e: FocusEvent) => {
        if (!(e.target instanceof HTMLElement) || e.target === document.body) {
            return;
        }
        if (!getHadTabNavigation()) {
            return;
        }
        lastInteractiveElement = e.target;
    };
    const stateHandler = () => {
        handleStateChange(navigationRef.getRootState());
    };

    document.addEventListener('focusin', focusinHandler, true);
    const unsubscribeState = navigationRef.addListener('state', stateHandler);

    teardown = () => {
        document.removeEventListener('focusin', focusinHandler, true);
        unsubscribeState();
        teardown = null;
    };
}

function teardownNavigationFocusReturn(): void {
    cancelPendingRestore();
    teardown?.();
}

function resetForTests(): void {
    cancelPendingRestore();
    triggerMap.clear();
    prevState = undefined;
    lastInteractiveElement = null;
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
    resetForTests,
    setLastInteractiveElementForTests,
};
