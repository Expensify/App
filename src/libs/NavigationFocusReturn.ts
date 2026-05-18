import {findFocusedRoute} from '@react-navigation/core';
import type {NavigationState, PartialState} from '@react-navigation/native';
// eslint-disable-next-line no-restricted-imports -- idiomatic defer primitive past navigation transitions.
import {InteractionManager} from 'react-native';
import compoundParamsKey, {COMPOUND_KEY_DELIMITER} from './compoundParamsKey';
import FOCUSABLE_SELECTOR from './focusableSelector';
import hasFocusableAttributes from './focusGuards';
import getHadTabNavigation from './hadTabNavigation';
import {consumeLauncher, pickLauncher, resetLauncherStackForTests} from './LauncherStack';
import navigationRef from './Navigation/navigationRef';
import {isCycleIdle, Priorities, resetCycle, tryClaim} from './ScreenFocusArbiter';

/** focusin tracks the last keyboard-focused element; a nav state listener captures it against the outgoing route and restores it on backward nav. */

type AnyState = NavigationState | PartialState<NavigationState> | undefined;

type DiffAction = {type: 'forward'; captureKey: string} | {type: 'backward'; restoreKey: string} | {type: 'lateral'} | {type: 'noop'};

// Fallback is the surrounding trap's launcher, used when primary can't accept focus at restore.
type TriggerEntry = {primary: HTMLElement; fallback?: HTMLElement};

// Bound triggerMap so forward-only PUSH_PARAMS sessions can't pin detached DOM nodes indefinitely.
const TRIGGER_MAP_MAX = 64;

let lastInteractiveElement: HTMLElement | null = null;
// Cross-modality: mouse-click-forward → keyboard-back still needs focus returned (WCAG 2.4.3).
let lastMouseTrigger: HTMLElement | null = null;
let lastMouseTriggerAt = 0;
// A click long before a timer-triggered nav shouldn't get captured as that nav's trigger.
const MOUSE_TRIGGER_TTL_MS = 3_000;
const triggerMap = new Map<string, TriggerEntry>();

// Refresh insertion order on re-set so FIFO eviction doesn't drop a recently-active key.
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

let prevState: NavigationState | undefined;
let pendingRestore: {cancel: () => void} | null = null;
let focusinHandler: ((e: FocusEvent) => void) | null = null;
let mouseActivationHandler: ((e: MouseEvent) => void) | null = null;
let stateUnsubscribe: (() => void) | null = null;

// Three events for touch/pen/legacy/drag-to-release coverage; handler is idempotent.
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
        const isFresh = lastMouseTrigger !== null && performance.now() - lastMouseTriggerAt < MOUSE_TRIGGER_TTL_MS;
        inner = isFresh && lastMouseTrigger && document.contains(lastMouseTrigger) ? lastMouseTrigger : null;
    }

    if (launcher) {
        // Prefer the in-trap element; fall back to the launcher when primary is removed on trap close.
        if (inner && inner !== launcher) {
            setTriggerEntry(routeKey, {primary: inner, fallback: launcher});
        } else {
            setTriggerEntry(routeKey, {primary: launcher});
        }
        consumeLauncher(launcher);
        return;
    }

    if (!inner) {
        return;
    }
    setTriggerEntry(routeKey, {primary: inner});
}

function notifyPushParamsForward(routeKey: string, prevParams: unknown): void {
    // Same-key transition is noop in handleStateChange — clear pending restores AND completed-RETURN state here so neither leaks into the next params screen.
    cancelPendingFocusRestore();
    captureTriggerForRoute(compoundParamsKey(routeKey, prevParams));
}

function notifyPushParamsBackward(routeKey: string, targetParams: unknown): void {
    scheduleRestore(compoundParamsKey(routeKey, targetParams));
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
// Set on successful RETURN; consulted at hold-release time to decide whether to eagerly reset the cycle or defer.
let lastRestoreTarget: HTMLElement | null = null;

/** Skip AUTO only when activeElement IS (or descends from) the most recent RETURN-restored target. Broader "any focused element" checks would also skip benign forward navigations (e.g. LHN item still focused). */
function shouldSkipAutoFocusDueToExistingFocus(): boolean {
    if (typeof document === 'undefined' || !lastRestoreTarget || !document.activeElement || document.activeElement === document.body) {
        return false;
    }
    if (document.activeElement !== lastRestoreTarget && !lastRestoreTarget.contains(document.activeElement)) {
        return false;
    }
    if (!hasFocusableAttributes(document.activeElement)) {
        return false;
    }
    if (typeof window !== 'undefined' && document.activeElement instanceof HTMLElement) {
        // `display` is element-self only — walk ancestors. `visibility` is inherited — self-check suffices.
        for (let node: HTMLElement | null = document.activeElement; node && node !== document.body; node = node.parentElement) {
            if (window.getComputedStyle(node).display === 'none') {
                return false;
            }
        }
        if (window.getComputedStyle(document.activeElement).visibility === 'hidden') {
            return false;
        }
    }
    return true;
}

function scheduleReturnHoldRelease(): void {
    if (returnHoldTimerId !== undefined) {
        clearTimeout(returnHoldTimerId);
    }
    returnHoldTimerId = setTimeout(() => {
        returnHoldTimerId = undefined;
        // Target still focused → defer to the arbiter's own CYCLE_TIMEOUT_MS; an early reset would let a slow AUTO chain steal after the target briefly drops focusable-attributes.
        if (typeof document !== 'undefined' && lastRestoreTarget && (document.activeElement === lastRestoreTarget || lastRestoreTarget.contains(document.activeElement))) {
            return;
        }
        lastRestoreTarget = null;
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

// Same-key forward is noop in handleStateChange — drop the cycle for both an in-flight restore (AUTO may have grabbed it during the deferred window) and a completed RETURN, otherwise it blocks the next screen's INITIAL/AUTO.
function cancelPendingFocusRestore(): void {
    const hadPendingRestore = pendingRestore !== null;
    cancelPendingRestore();
    if (hadPendingRestore || lastRestoreTarget) {
        cancelReturnHoldRelease();
        lastRestoreTarget = null;
        resetCycle();
    }
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

    // Idle cycle + non-body focus = user manually focused during the defer; respect it. Held cycle (AUTO mid-defer) = system-driven; preempt per priority (Status → Clear after race).
    if (isCycleIdle() && document.activeElement && document.activeElement !== document.body && hasFocusableAttributes(document.activeElement)) {
        triggerMap.delete(routeKey);
        return false;
    }

    if (!tryClaim(Priorities.RETURN)) {
        return false;
    }

    // activeElement verification catches silent-focus failures (display:none / visibility:hidden ancestors).
    const candidates: HTMLElement[] = [pick.target];
    if (pick.source === 'primary' && entry.fallback && document.contains(entry.fallback) && hasFocusableAttributes(entry.fallback)) {
        candidates.push(entry.fallback);
    }

    const focusOptions: FocusOptions = {preventScroll: true, focusVisible: getHadTabNavigation()};
    for (const candidate of candidates) {
        const before = document.activeElement;
        candidate.focus(focusOptions);
        const after = document.activeElement;
        if (after === candidate) {
            triggerMap.delete(routeKey);
            lastRestoreTarget = candidate;
            scheduleReturnHoldRelease();
            return true;
        }
        // Only accept as onFocus redirect when focus actually moved — pre-existing focus with a silent no-op must fall through to the fallback.
        if (after !== before && after && after !== document.body) {
            triggerMap.delete(routeKey);
            lastRestoreTarget = after instanceof HTMLElement ? after : candidate;
            scheduleReturnHoldRelease();
            return true;
        }
    }

    // Silent no-op (transient display:none / visibility:hidden ancestor) — leave the entry for scheduleRestore to retry; release the cycle so AUTO/INITIAL aren't blocked during the window.
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
    // `cancelled` flag in case a primitive's cancel races a queued callback.
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
    const {action, removedKeys} = diffNavigationState(prevState, newState);

    // noop (e.g. setParams on focused route): preserve in-flight RETURN hold + AUTO claim so a deferred restore can still complete.
    if (action.type !== 'noop') {
        cancelReturnHoldRelease();
        lastRestoreTarget = null;
        resetCycle();
    }

    if (action.type === 'forward') {
        cancelPendingRestore();
        captureTriggerForRoute(action.captureKey);
        // Loose refs would pin detached unmounted nodes; triggerMap holds the captured copy.
        lastInteractiveElement = null;
        lastMouseTrigger = null;
        lastMouseTriggerAt = 0;
    } else if (action.type === 'backward') {
        scheduleRestore(action.restoreKey);
    } else if (action.type === 'lateral') {
        // Stale restore would steal focus back on sibling nav.
        cancelPendingRestore();
    }

    for (const key of removedKeys) {
        triggerMap.delete(key);
        // Also drop compound PUSH_PARAMS entries for this route (Map iteration is safe under in-loop delete).
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

// MUST stay idempotent — invoked from Navigation.ts module load, NavigationRoot useEffect, and NavigationRoot.onReady; each step is guarded against re-add.
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
            const closest = e.target.closest(FOCUSABLE_SELECTOR);
            // instanceof filters SVG matches to HTMLElement; null clears the cache so a non-focusable activation can't leak a prior click.
            const next = closest instanceof HTMLElement ? closest : null;
            if (next !== lastMouseTrigger) {
                lastMouseTrigger = next;
            }
            lastMouseTriggerAt = performance.now();
        };
        for (const event of MOUSE_ACTIVATION_EVENTS) {
            document.addEventListener(event, mouseActivationHandler, true);
        }
    }
    // getRootState() pre-mount triggers React Navigation's "not initialized" console.error. Retries on each setup call so NavigationRoot.onReady picks up live state.
    if (!prevState && navigationRefHasLiveState()) {
        prevState = navigationRef.getRootState() ?? prevState;
    }
    // Pre-mount addListener returns a queue-only unsubscribe; once the container forwards the listener it can't be detached. NavigationRoot's onReady/useEffect re-invoke once current is set.
    if (!stateUnsubscribe && navigationRef?.current != null && typeof navigationRef?.addListener === 'function') {
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
    lastRestoreTarget = null;
    // Reset cached state so a remount (logout/HMR) re-seeds — setup's `!prevState` gate would otherwise skip the seed and diff against stale routes.
    prevState = undefined;
    triggerMap.clear();
    lastInteractiveElement = null;
    lastMouseTrigger = null;
    lastMouseTriggerAt = 0;
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
    resetCycle();
    prevState = undefined;
    lastInteractiveElement = null;
    lastMouseTrigger = null;
    lastMouseTriggerAt = 0;
    lastRestoreTarget = null;
}

function setLastInteractiveElementForTests(element: HTMLElement | null): void {
    lastInteractiveElement = element;
}

function setLastMouseTriggerForTests(element: HTMLElement | null): void {
    lastMouseTrigger = element;
    lastMouseTriggerAt = element ? performance.now() : 0;
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
    shouldSkipAutoFocusDueToExistingFocus,
    resetForTests,
    setLastInteractiveElementForTests,
    setLastMouseTriggerForTests,
};
