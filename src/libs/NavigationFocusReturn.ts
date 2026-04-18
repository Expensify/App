import {findFocusedRoute} from '@react-navigation/core';
import type {NavigationState, PartialState} from '@react-navigation/native';
import {InteractionManager} from 'react-native';
import FOCUSABLE_SELECTOR from './focusableSelector';
import {hasFocusableAttributes} from './focusGuards';
import getHadTabNavigation from './hadTabNavigation';
import {consumeLauncher, pickLauncher, resetLauncherStackForTests} from './LauncherStack';
import navigationRef from './Navigation/navigationRef';
import {Priorities, resetCycle, tryClaim} from './ScreenFocusArbiter';

/** focusin tracks the last keyboard-focused element; a nav state listener captures it against the outgoing route and restores it on backward nav. */

type AnyState = NavigationState | PartialState<NavigationState> | undefined;

type DiffAction = {type: 'forward'; captureKey: string} | {type: 'backward'; restoreKey: string} | {type: 'lateral'} | {type: 'noop'};

// Fallback is the surrounding trap's launcher, used when primary can't accept focus at restore.
type TriggerEntry = {primary: HTMLElement; fallback?: HTMLElement};

const COMPOUND_KEY_DELIMITER = '::';

let lastInteractiveElement: HTMLElement | null = null;
// Cross-modality: mouse-click-forward → keyboard-back still needs focus returned (WCAG 2.4.3).
let lastMouseTrigger: HTMLElement | null = null;
const triggerMap = new Map<string, TriggerEntry>();
let prevState: NavigationState | undefined;
let pendingRestore: {cancel: () => void} | null = null;
let focusinHandler: ((e: FocusEvent) => void) | null = null;
let mouseActivationHandler: ((e: MouseEvent) => void) | null = null;
let stateUnsubscribe: (() => void) | null = null;

// pointerdown covers touch/pen and PointerEvent-shim mice that bypass mousedown; mousedown is the legacy fallback; click covers drag-to-release. All three update the same handler idempotently.
const MOUSE_ACTIVATION_EVENTS = ['pointerdown', 'mousedown', 'click'] as const;

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

    const launcher = pickLauncher();
    let inner: HTMLElement | null;
    if (getHadTabNavigation()) {
        const active = document.activeElement;
        const innerIsStale = lastInteractiveElement && active && active !== document.body && active !== lastInteractiveElement;
        inner = lastInteractiveElement && document.contains(lastInteractiveElement) && !innerIsStale ? lastInteractiveElement : null;
    } else {
        inner = lastMouseTrigger && document.contains(lastMouseTrigger) ? lastMouseTrigger : null;
    }

    if (launcher) {
        // Prefer the in-trap element; fall back to the launcher when primary is removed on trap close.
        if (inner && inner !== launcher) {
            triggerMap.set(routeKey, {primary: inner, fallback: launcher});
        } else {
            triggerMap.set(routeKey, {primary: launcher});
        }
        consumeLauncher(launcher);
        return;
    }

    if (!inner) {
        return;
    }
    triggerMap.set(routeKey, {primary: inner});
}

// Sentinel so JSON.stringify can't collapse [undefined] → [null].
const UNDEFINED_SENTINEL = '\u0000undefined';

// URL-rehydrated params are always strings; PUSH_PARAMS dispatches may use numbers/booleans.
// Top-level undefined is dropped by the caller's filter; nested undefined is preserved via UNDEFINED_SENTINEL — asymmetric but inert (URL params are flat).
function normalizeForKey(value: unknown): unknown {
    if (value === null) {
        return null;
    }
    if (value === undefined) {
        return UNDEFINED_SENTINEL;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    if (Array.isArray(value)) {
        return value.map(normalizeForKey);
    }
    if (typeof value === 'object') {
        // Recursively sort so differently-ordered nested keys produce the same compound.
        const entries = Object.entries(value as Record<string, unknown>)
            .sort(([a], [b]) => {
                if (a < b) {
                    return -1;
                }
                if (a > b) {
                    return 1;
                }
                return 0;
            })
            .map(([k, v]) => [k, normalizeForKey(v)]);
        return Object.fromEntries(entries);
    }
    return value;
}

/** Compound key for PUSH_PARAMS history (same route.key across params snapshots). */
function compoundParamsKey(routeKey: string, params: unknown): string {
    if (params == null) {
        return `${routeKey}${COMPOUND_KEY_DELIMITER}`;
    }
    if (typeof params !== 'object') {
        return `${routeKey}${COMPOUND_KEY_DELIMITER}${JSON.stringify(normalizeForKey(params))}`;
    }
    // Explicit-undefined fields must match path-rehydrated (omitted) params.
    const entries = Object.entries(params as Record<string, unknown>)
        .filter(([, value]) => value !== undefined)
        .map(([k, v]) => [k, normalizeForKey(v)] as const)
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
    // Same-key transitions are noop in handleStateChange, which doesn't cancel — do it here.
    cancelPendingRestore();
    captureTriggerForRoute(compoundParamsKey(routeKey, prevParams));
}

function notifyPushParamsBackward(routeKey: string, targetParams: unknown): void {
    scheduleRestore(compoundParamsKey(routeKey, targetParams));
}

/** For PUSH_PARAMS browser-forward RESET: cancel a queued restore without capturing. */
function cancelPendingFocusRestore(): void {
    cancelPendingRestore();
}

// 'retry' = in DOM but cannot accept focus now; 'gone' = detached, drop the entry.
type RestorePick = {target: HTMLElement; source: 'primary' | 'fallback'} | 'retry' | 'gone';

function pickRestoreTarget(entry: TriggerEntry): RestorePick {
    const {primary, fallback} = entry;
    const primaryInDom = document.contains(primary);
    const fallbackInDom = !!fallback && document.contains(fallback);

    if (primaryInDom && hasFocusableAttributes(primary)) {
        return {target: primary, source: 'primary'};
    }
    if (fallbackInDom && fallback && hasFocusableAttributes(fallback)) {
        return {target: fallback, source: 'fallback'};
    }
    if (primaryInDom || fallbackInDom) {
        return 'retry';
    }
    return 'gone';
}

// Grace window after a successful restore: vetoes in-flight AUTO/INITIAL, then releases so unrelated later claimers aren't blocked for CYCLE_TIMEOUT_MS.
const RETURN_HOLD_MS = 500;
let returnHoldTimerId: ReturnType<typeof setTimeout> | undefined;

function scheduleReturnHoldRelease(): void {
    if (returnHoldTimerId !== undefined) {
        clearTimeout(returnHoldTimerId);
    }
    returnHoldTimerId = setTimeout(() => {
        returnHoldTimerId = undefined;
        resetCycle();
    }, RETURN_HOLD_MS);
}

function cancelReturnHoldRelease(): void {
    if (returnHoldTimerId === undefined) {
        return;
    }
    clearTimeout(returnHoldTimerId);
    returnHoldTimerId = undefined;
}

function restoreTriggerForRoute(routeKey: string): boolean {
    if (typeof document === 'undefined') {
        return false;
    }
    const entry = triggerMap.get(routeKey);
    if (!entry) {
        return false;
    }

    const pick = pickRestoreTarget(entry);
    if (pick === 'retry') {
        return false;
    }
    if (pick === 'gone') {
        triggerMap.delete(routeKey);
        return false;
    }

    triggerMap.delete(routeKey);
    if (!tryClaim(Priorities.RETURN)) {
        return false;
    }

    // activeElement verification catches silent-focus failures (display:none / visibility:hidden ancestors).
    const candidates: HTMLElement[] = [pick.target];
    if (pick.source === 'primary' && entry.fallback && document.contains(entry.fallback) && hasFocusableAttributes(entry.fallback)) {
        candidates.push(entry.fallback);
    }

    // focusVisible: Chromium/Firefox only (lib.dom.d.ts too); Safari's :focus-visible heuristic aligns.
    const focusOptions = {preventScroll: true, focusVisible: getHadTabNavigation()} as FocusOptions;
    for (const candidate of candidates) {
        const before = document.activeElement;
        candidate.focus(focusOptions);
        const after = document.activeElement;
        if (after === candidate) {
            scheduleReturnHoldRelease();
            return true;
        }
        // Only accept as onFocus redirect when focus actually moved — pre-existing focus with a silent no-op must fall through to the fallback.
        if (after !== before && after && after !== document.body) {
            scheduleReturnHoldRelease();
            return true;
        }
    }

    // All silent no-ops — release so AUTO/INITIAL can try.
    resetCycle();
    return false;
}

function cancelPendingRestore(): void {
    pendingRestore?.cancel();
    pendingRestore = null;
}

const MAX_RESTORE_ATTEMPTS = 2;
const RESTORE_RETRY_MS = 50;

function scheduleRestore(routeKey: string): void {
    cancelPendingRestore();
    // Belt-and-suspenders: cancel primitives + cancelled flag, in case a cancel doesn't prevent the already-queued callback.
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
    // A stale return-hold timer would reset the new cycle's priority.
    cancelReturnHoldRelease();
    resetCycle();
    const {action, removedKeys} = diffNavigationState(prevState, newState);

    if (action.type === 'forward') {
        cancelPendingRestore();
        captureTriggerForRoute(action.captureKey);
    } else if (action.type === 'backward') {
        scheduleRestore(action.restoreKey);
    } else if (action.type === 'lateral') {
        // Stale restore would steal focus back on sibling nav.
        cancelPendingRestore();
    }
    // noop (e.g. setParams on same route): leave pending restore intact.

    for (const key of removedKeys) {
        triggerMap.delete(key);
        // Also drop compound PUSH_PARAMS entries for this route.
        const compoundPrefix = `${key}${COMPOUND_KEY_DELIMITER}`;
        for (const mapKey of triggerMap.keys()) {
            if (mapKey.startsWith(compoundPrefix)) {
                triggerMap.delete(mapKey);
            }
        }
    }

    prevState = newState;
}

// UI test mocks of navigationRef may omit isReady/getRootState; defend at call sites.
function navigationRefHasLiveState(): boolean {
    return typeof navigationRef?.isReady === 'function' && navigationRef.isReady() && typeof navigationRef.getRootState === 'function';
}

// Called twice: module load (pre-mount, seed skipped) and NavigationRoot.onReady (container live). Idempotent across both.
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
    if (!mouseActivationHandler) {
        mouseActivationHandler = (e: MouseEvent) => {
            if (!(e.target instanceof Element)) {
                return;
            }
            const target = e.target.closest(FOCUSABLE_SELECTOR);
            // SVG role="button" matches would return SVGElement; instanceof filters to HTMLElement to match the rest of the module's typing.
            if (target instanceof HTMLElement && target !== lastMouseTrigger) {
                lastMouseTrigger = target;
            }
        };
        for (const event of MOUSE_ACTIVATION_EVENTS) {
            document.addEventListener(event, mouseActivationHandler, true);
        }
    }
    // getRootState() pre-mount triggers React Navigation's "not initialized" console.error. Retries on each setup call so NavigationRoot.onReady picks up live state.
    if (!prevState && navigationRefHasLiveState()) {
        prevState = navigationRef.getRootState() ?? prevState;
    }
    // addListener is absent pre-mount and in test mocks; NavigationRoot.onReady re-invokes once live.
    if (!stateUnsubscribe && typeof navigationRef?.addListener === 'function') {
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
    cancelReturnHoldRelease();
    if (typeof document !== 'undefined') {
        if (focusinHandler) {
            document.removeEventListener('focusin', focusinHandler, true);
        }
        if (mouseActivationHandler) {
            for (const event of MOUSE_ACTIVATION_EVENTS) {
                document.removeEventListener(event, mouseActivationHandler, true);
            }
        }
    }
    focusinHandler = null;
    mouseActivationHandler = null;
    stateUnsubscribe?.();
    stateUnsubscribe = null;
}

function resetForTests(): void {
    cancelPendingRestore();
    cancelReturnHoldRelease();
    triggerMap.clear();
    resetLauncherStackForTests();
    prevState = undefined;
    lastInteractiveElement = null;
    lastMouseTrigger = null;
}

function setLastInteractiveElementForTests(element: HTMLElement | null): void {
    lastInteractiveElement = element;
}

function setLastMouseTriggerForTests(element: HTMLElement | null): void {
    lastMouseTrigger = element;
}

export {
    setupNavigationFocusReturn,
    teardownNavigationFocusReturn,
    handleStateChange,
    diffNavigationState,
    collectRouteKeys,
    captureTriggerForRoute,
    restoreTriggerForRoute,
    notifyPushParamsForward,
    notifyPushParamsBackward,
    cancelPendingFocusRestore,
    compoundParamsKey,
    resetForTests,
    setLastInteractiveElementForTests,
    setLastMouseTriggerForTests,
};
