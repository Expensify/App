import type {NavigationState} from '@react-navigation/native';
import type {RefObject} from 'react';
import type {View} from 'react-native';
import compoundParamsKey, {COMPOUND_KEY_DELIMITER} from '@libs/compoundParamsKey';
import FOCUSABLE_SELECTOR from '@libs/focusableSelector';
import hasFocusableAttributes from '@libs/focusGuards';
import getHadTabNavigation from '@libs/hadTabNavigation';
import {consumeLauncher, pickLauncher, resetLauncherStackForTests} from '@libs/LauncherStack';
import navigationRef from '@libs/Navigation/navigationRef';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {collectRouteKeys, diffNavigationState} from '@libs/navigationStateDiff';
import restoreFocusWithModality from '@libs/restoreFocusWithModality';
import {isCycleIdle, Priorities, resetCycle, tryClaim} from '@libs/ScreenFocusArbiter';

/** focusin tracks the last keyboard-focused element; a nav state listener captures it against the outgoing route and restores it on backward nav. */

// Fallback is the surrounding trap's launcher, used when primary can't accept focus at restore.
type TriggerEntry = {primary: HTMLElement; fallback?: HTMLElement};

// Bound triggerMap so forward-only PUSH_PARAMS sessions can't pin detached DOM nodes indefinitely.
const TRIGGER_MAP_MAX = 64;
// A click long before a timer-triggered nav shouldn't get captured as that nav's trigger.
const MOUSE_TRIGGER_TTL_MS = 3_000;
const triggerMap = new Map<string, TriggerEntry>();
const MOUSE_ACTIVATION_EVENTS = ['pointerdown', 'mousedown', 'click'] as const;

// Cross-modality: mouse-click-forward → keyboard-back still needs focus returned (WCAG 2.4.3).
let lastMouseTrigger: HTMLElement | null = null;
let lastInteractiveElement: HTMLElement | null = null;
let lastMouseTriggerAt = 0;

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
let isRestoringFocus = false;
let skipNextRestore = false;
let focusinHandler: ((e: FocusEvent) => void) | null = null;
let mouseActivationHandler: ((e: MouseEvent) => void) | null = null;
let stateUnsubscribe: (() => void) | null = null;

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
    skipNextRestore = false;
    cancelPendingFocusRestore();
    captureTriggerForRoute(compoundParamsKey(routeKey, prevParams));
    lastInteractiveElement = null;
    lastMouseTrigger = null;
    lastMouseTriggerAt = 0;
}

function notifyPushParamsBackward(routeKey: string, targetParams: unknown): void {
    // Honor a one-shot skip on this param-revert too (form-submit goBack can land as PUSH_PARAMS, not a stack pop).
    const compoundKey = compoundParamsKey(routeKey, targetParams);
    if (skipNextRestore) {
        applySkippedRestore(compoundKey);
        return;
    }
    scheduleRestore(compoundKey, {waitForUpcomingTransition: false});
}

/*
 * Skips the focus restore for the next back navigation. Call it before a form-submit goBack so the re-focused row
 * doesn't eat the next Enter (which should hit the page's submit). Back and Esc don't call it, so they still restore focus.
 */
function skipNextFocusRestore(): void {
    skipNextRestore = true;
}

/** Native-only. Web captures via `focusin`; no-op here so the import resolves cross-platform. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function notifyPressedTrigger(_ref: RefObject<View | null> | null, _identifier?: string): void {}

/** Native-only registry no-op; cross-platform stub. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function registerPressable(_routeKey: string, _identifier: string, _ref: RefObject<View | null>): () => void {
    return () => {};
}

/** True only while restoreTriggerForRoute is in its .focus() call. Lists use it to tell the restore apart from a real keyboard Tab, which also has no sourceCapabilities. */
function isFocusRestoreInProgress(): boolean {
    return isRestoringFocus;
}

type RestorePick = {target: HTMLElement; source: 'primary' | 'fallback'};

/*
 * null = nothing focusable yet (mounted but not focusable, or detached mid-remount). Detached is NOT "gone": the caller keeps
 * the entry so scheduleRestore's budget can recover a remount — only that budget deletes (on success/exhaustion).
 */
function pickRestoreTarget(entry: TriggerEntry): RestorePick | null {
    const {primary, fallback} = entry;

    if (document.contains(primary) && hasFocusableAttributes(primary)) {
        return {target: primary, source: 'primary'};
    }
    if (fallback && document.contains(fallback) && hasFocusableAttributes(fallback)) {
        return {target: fallback, source: 'fallback'};
    }
    return null;
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

function restoreTriggerForRoute(routeKey: string, restoreBaseline: Element | null = null): boolean {
    if (typeof document === 'undefined') {
        return false;
    }
    const entry = triggerMap.get(routeKey);
    if (!entry) {
        return false;
    }

    const pick = pickRestoreTarget(entry);
    if (!pick) {
        return false;
    }

    // Yield to existing focus only if it moved after the baseline (a user action mid-defer); pre-existing focus is a system-restored opener that RETURN overrides. A held cycle (AUTO mid-defer) is preempted by priority below.
    const activeNow = document.activeElement;
    const focusMovedDuringDefer = activeNow !== restoreBaseline;
    if (isCycleIdle() && activeNow && activeNow !== document.body && hasFocusableAttributes(activeNow) && focusMovedDuringDefer) {
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

    for (const candidate of candidates) {
        const before = document.activeElement;
        isRestoringFocus = true;
        try {
            restoreFocusWithModality(candidate);
        } finally {
            isRestoringFocus = false;
        }
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

/** Skip cleanup: cancel in-flight defer + drop the entry so a stale trigger can't be replayed by a later same-key backward. */
function applySkippedRestore(restoreKey: string): void {
    skipNextRestore = false;
    cancelPendingRestore();
    triggerMap.delete(restoreKey);
}

const MAX_RESTORE_FRAMES = 5;

function scheduleRestore(routeKey: string, {waitForUpcomingTransition}: {waitForUpcomingTransition: boolean}): void {
    // Baseline: focus present synchronously at back-nav time is pre-existing, not a user action during the defer.
    const restoreBaseline = typeof document !== 'undefined' ? document.activeElement : null;
    cancelPendingRestore();
    let cancelled = false;
    let rafId: number | undefined;
    let handle: {cancel: () => void} | undefined;

    pendingRestore = {
        cancel: () => {
            cancelled = true;
            handle?.cancel();
            if (rafId !== undefined) {
                cancelAnimationFrame(rafId);
            }
        },
    };

    handle = TransitionTracker.runAfterTransitions({
        // Stack pops dispatch before their transition registers, so they wait for the upcoming one; PUSH_PARAMS emits none, so it opts out to avoid stalling on the timeout.
        waitForUpcomingTransition,
        callback: () => {
            // A miss keeps the entry, so retry; stop once it's restored or removed elsewhere, and drop it ourselves only on exhaustion.
            let framesLeft = MAX_RESTORE_FRAMES;
            const attempt = () => {
                if (cancelled) {
                    return;
                }
                const restored = restoreTriggerForRoute(routeKey, restoreBaseline);
                if (restored || !triggerMap.has(routeKey)) {
                    pendingRestore = null;
                    return;
                }
                framesLeft -= 1;
                if (framesLeft <= 0) {
                    triggerMap.delete(routeKey);
                    pendingRestore = null;
                    return;
                }
                rafId = requestAnimationFrame(attempt);
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

    // noop (e.g. setParams on focused route): preserve in-flight RETURN hold + AUTO claim so a deferred restore can still complete.
    if (action.type !== 'noop') {
        cancelReturnHoldRelease();
        lastRestoreTarget = null;
        resetCycle();
    }

    if (action.type === 'forward') {
        skipNextRestore = false;
        cancelPendingRestore();
        captureTriggerForRoute(action.captureKey);
        // Loose refs would pin detached unmounted nodes; triggerMap holds the captured copy.
        lastInteractiveElement = null;
        lastMouseTrigger = null;
        lastMouseTriggerAt = 0;
    } else if (action.type === 'backward') {
        if (skipNextRestore) {
            applySkippedRestore(action.restoreKey);
        } else {
            scheduleRestore(action.restoreKey, {waitForUpcomingTransition: true});
        }
    } else if (action.type === 'lateral') {
        skipNextRestore = false;
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
    skipNextRestore = false;
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
    skipNextRestore = false;
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
    skipNextFocusRestore,
    notifyPressedTrigger,
    registerPressable,
    isFocusRestoreInProgress,
    compoundParamsKey,
    shouldSkipAutoFocusDueToExistingFocus,
    resetForTests,
    setLastInteractiveElementForTests,
    setLastMouseTriggerForTests,
};
