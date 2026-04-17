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

// Fallback (if set) is the surrounding trap's launcher, used only when primary cannot accept focus at restore time.
// triggerMap holds at most one entry per currently-mounted route key (Map.set overwrites); `removedKeys` in handleStateChange purges entries as routes leave the tree, bounding memory by the nav tree size.
type TriggerEntry = {primary: HTMLElement; fallback?: HTMLElement};

// `deactivatedAt` set when the trap closes; entry lives for LAUNCHER_CLEAR_DELAY_MS so a deferred-nav popover can still consume it.
type LauncherEntry = {element: HTMLElement; deactivatedAt?: number};

const COMPOUND_KEY_DELIMITER = '::';
// Covers the click → state-listener dispatch → focusin → captureTriggerForRoute chain for deferred-navigation popovers. 1s is conservative for slower devices.
const LAUNCHER_CLEAR_DELAY_MS = 1000;
// Guard against pathological trap storms. Typical stack depth is 1–2.
const LAUNCHER_STACK_MAX = 8;

let lastInteractiveElement: HTMLElement | null = null;
// Stack (not slot) so nested + sequential traps retain correct launcher context.
const launcherStack: LauncherEntry[] = [];
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

// Prefer topmost active, then most recent deactivated-within-window. Two passes so nested traps resolve to the outer (active) launcher, not the just-closed inner.
function pickLauncher(): HTMLElement | null {
    if (typeof document === 'undefined') {
        return null;
    }
    const now = Date.now();
    // Pass 1: topmost active, pruning detached as we go.
    for (let i = launcherStack.length - 1; i >= 0; i -= 1) {
        const entry = launcherStack.at(i);
        if (!entry) {
            continue;
        }
        if (!document.contains(entry.element)) {
            launcherStack.splice(i, 1);
            continue;
        }
        if (entry.deactivatedAt === undefined) {
            return entry.element;
        }
    }
    // Pass 2: most recent deactivated within the clear window, pruning stale as we go.
    for (let i = launcherStack.length - 1; i >= 0; i -= 1) {
        const entry = launcherStack.at(i);
        if (entry?.deactivatedAt === undefined) {
            continue;
        }
        if (!document.contains(entry.element)) {
            launcherStack.splice(i, 1);
            continue;
        }
        if (now - entry.deactivatedAt > LAUNCHER_CLEAR_DELAY_MS) {
            launcherStack.splice(i, 1);
            continue;
        }
        return entry.element;
    }
    return null;
}

function consumeLauncher(element: HTMLElement): void {
    const idx = launcherStack.findIndex((e) => e.element === element);
    if (idx >= 0) {
        launcherStack.splice(idx, 1);
    }
}

function captureTriggerForRoute(routeKey: string): void {
    if (typeof document === 'undefined') {
        return;
    }
    // Skip mouse-driven nav: lastInteractiveElement would be a stale keyboard target.
    if (!getHadTabNavigation()) {
        return;
    }

    const launcher = pickLauncher();

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
        consumeLauncher(launcher);
        return;
    }

    if (!inner) {
        return;
    }
    triggerMap.set(routeKey, {primary: inner});
}

// Push a launcher onto the stack. Passing null pops the most recent entry (backward-compatible "clear immediately" call).
function setActivePopoverLauncher(element: HTMLElement | null): void {
    if (element === null) {
        launcherStack.pop();
        return;
    }
    // Re-activating an element already on the stack just clears its deactivated state.
    const existing = launcherStack.find((e) => e.element === element);
    if (existing) {
        existing.deactivatedAt = undefined;
        return;
    }
    launcherStack.push({element});
    while (launcherStack.length > LAUNCHER_STACK_MAX) {
        launcherStack.shift();
    }
}

/** Mark the given launcher (or the top of the stack if omitted) as deactivated. Lazy pruning in pickLauncher enforces LAUNCHER_CLEAR_DELAY_MS. */
function scheduleClearActivePopoverLauncher(element?: HTMLElement): void {
    const entry = element ? launcherStack.find((e) => e.element === element) : launcherStack.at(-1);
    if (entry) {
        entry.deactivatedAt = Date.now();
    }
}

// Normalize primitive values to strings so URL-rehydrated params (always strings) match PUSH_PARAMS dispatches that may use numbers/booleans.
function normalizeForKey(value: unknown): unknown {
    if (value == null) {
        return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    if (Array.isArray(value)) {
        // Preserve array shape; explicit `undefined` elements coalesce to `null` via JSON spec (URL-rehydrated arrays never contain undefined, so safe).
        return value.map(normalizeForKey);
    }
    if (typeof value === 'object') {
        const entries = Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, normalizeForKey(v)]);
        return Object.fromEntries(entries);
    }
    return value;
}

/** Compound key for PUSH_PARAMS history (same route.key across params snapshots). Sorts top-level keys for insertion-order stability. */
function compoundParamsKey(routeKey: string, params: unknown): string {
    if (params == null) {
        return `${routeKey}${COMPOUND_KEY_DELIMITER}`;
    }
    if (typeof params !== 'object') {
        return `${routeKey}${COMPOUND_KEY_DELIMITER}${JSON.stringify(normalizeForKey(params))}`;
    }
    // Drop undefined so explicit-undefined fields match path-rehydrated (omitted) params.
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

// Resolve the best restore candidate for a TriggerEntry.
// 'retry' = something is in the DOM but cannot currently accept focus (scheduler will retry).
// 'gone' = nothing is in the DOM anymore (permanent failure, drop the entry).
type RestorePick = {target: HTMLElement; source: 'primary' | 'fallback'} | 'retry' | 'gone';

function pickRestoreTarget(entry: TriggerEntry): RestorePick {
    const {primary, fallback} = entry;
    const primaryInDom = document.contains(primary);
    const fallbackInDom = !!fallback && document.contains(fallback);

    if (primaryInDom && canAcceptFocus(primary)) {
        return {target: primary, source: 'primary'};
    }
    if (fallbackInDom && fallback && canAcceptFocus(fallback)) {
        return {target: fallback, source: 'fallback'};
    }
    if (primaryInDom || fallbackInDom) {
        return 'retry';
    }
    return 'gone';
}

// Grace window after a successful restore: RETURN keeps in-flight AUTO/INITIAL from the destination screen losing, then releases so unrelated later claimers (side-panels, etc.) aren't blocked for CYCLE_TIMEOUT_MS.
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

    // Preferred pick first, then fallback. Each attempt is verified via document.activeElement so silent-focus failures (display:none / visibility:hidden ancestors) fall through.
    const candidates: HTMLElement[] = [pick.target];
    if (pick.source === 'primary' && entry.fallback && document.contains(entry.fallback) && canAcceptFocus(entry.fallback)) {
        candidates.push(entry.fallback);
    }

    const focusOptions = {preventScroll: true, focusVisible: getHadTabNavigation()} as FocusOptions;
    for (const candidate of candidates) {
        // Cast: focusVisible is a spec'd FocusOptions field (Chromium/Firefox) but lib.dom.d.ts hasn't adopted it yet.
        candidate.focus(focusOptions);
        const active = document.activeElement;
        if (active === candidate) {
            scheduleReturnHoldRelease();
            return true;
        }
        if (active && active !== document.body) {
            // onFocus handler redirected (composite-widget pattern) — respect it, don't override with the fallback.
            scheduleReturnHoldRelease();
            return true;
        }
        // active is body → silent no-op; try next candidate.
    }

    // All candidates silently no-op'd. Release the claim immediately so AUTO/INITIAL can still try.
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
    // Module-load call runs pre-mount (getRootState undefined); the seed must retry on NavigationRoot.onReady re-invocation, independently of stateUnsubscribe.
    if (!prevState && typeof navigationRef?.getRootState === 'function') {
        prevState = navigationRef.getRootState() ?? prevState;
    }
    // addListener is absent pre-mount and in test mocks; NavigationRoot.onReady re-invokes once the container is live.
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
    if (focusinHandler && typeof document !== 'undefined') {
        document.removeEventListener('focusin', focusinHandler, true);
    }
    focusinHandler = null;
    stateUnsubscribe?.();
    stateUnsubscribe = null;
}

function resetForTests(): void {
    cancelPendingRestore();
    cancelReturnHoldRelease();
    triggerMap.clear();
    launcherStack.length = 0;
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
    setActivePopoverLauncher,
    scheduleClearActivePopoverLauncher,
    notifyPushParamsForward,
    notifyPushParamsBackward,
    cancelPendingFocusRestore,
    compoundParamsKey,
    resetForTests,
    setLastInteractiveElementForTests,
};
