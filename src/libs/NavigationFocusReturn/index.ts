import compoundParamsKey, {COMPOUND_KEY_DELIMITER} from '@libs/compoundParamsKey';
import FOCUSABLE_SELECTOR from '@libs/focusableSelector';
import hasFocusableAttributes from '@libs/focusGuards';
import {KEYBOARD_TRIGGER_TTL_MS, MAX_RESTORE_FRAMES, MOUSE_TRIGGER_TTL_MS, RETURN_HOLD_MS, TRIGGER_MAP_MAX} from '@libs/focusReturnTimings';
import getHadTabNavigation from '@libs/hadTabNavigation';
import isActivatableTarget from '@libs/isActivatableTarget';
import isActivationKeydown from '@libs/isActivationKeydown';
import isEffectivelyVisible from '@libs/isEffectivelyVisible';
import isFocusMovingKeydown from '@libs/isFocusMovingKeydown';
import {consumeLauncher, pickLauncher, resetLauncherStackForTests} from '@libs/LauncherStack';
import Log from '@libs/Log';
import navigationRef from '@libs/Navigation/navigationRef';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {diffNavigationState} from '@libs/navigationStateDiff';
import {isProgrammaticFocus} from '@libs/programmaticFocus';
import restoreFocusWithModality from '@libs/restoreFocusWithModality';
import {isCycleIdle, Priorities, resetCycle, tryClaim} from '@libs/ScreenFocusArbiter';

import CONST from '@src/CONST';

import type {NavigationState} from '@react-navigation/native';
import type {RefObject} from 'react';
import type {View} from 'react-native';

import setFifoEntry from './fifoMap';

/** focusin tracks the last keyboard-focused element; a nav state listener captures it against the outgoing route and restores it on backward nav. */

// Fallback is the surrounding trap's launcher, used when primary can't accept focus at restore.
type TriggerEntry = {primary: HTMLElement; fallback?: HTMLElement};

const triggerMap = new Map<string, TriggerEntry>();
const MOUSE_ACTIVATION_EVENTS = ['pointerdown', 'mousedown', 'click'] as const;

// Cross-modality: mouse-click-forward → keyboard-back still needs focus returned (WCAG 2.4.3).
let lastMouseTrigger: HTMLElement | null = null;
let lastInteractiveElement: HTMLElement | null = null;
let lastMouseTriggerAt = 0;
let lastKeyboardTrigger: HTMLElement | null = null;
let lastKeyboardTriggerAt = 0;
let pendingActivationKey: 'Enter' | 'Space' | null = null;

function setTriggerEntry(routeKey: string, entry: TriggerEntry): void {
    setFifoEntry(triggerMap, routeKey, entry, TRIGGER_MAP_MAX);
}

let prevState: NavigationState | undefined;
let pendingRestore: {cancel: () => void} | null = null;
let isRestoringFocus = false;
let skipNextRestore = false;
let focusinHandler: ((e: FocusEvent) => void) | null = null;
let mouseActivationHandler: ((e: MouseEvent) => void) | null = null;
let keyActivationHandler: ((e: KeyboardEvent) => void) | null = null;
let keyReleaseHandler: ((e: KeyboardEvent) => void) | null = null;
let stateUnsubscribe: (() => void) | null = null;

function captureTriggerForRoute(routeKey: string): void {
    if (typeof document === 'undefined') {
        return;
    }

    const launcher = pickLauncher();
    let inner: HTMLElement | null;
    const keyboardTriggerFresh = lastKeyboardTrigger !== null && performance.now() - lastKeyboardTriggerAt < KEYBOARD_TRIGGER_TTL_MS && document.contains(lastKeyboardTrigger);
    if (keyboardTriggerFresh) {
        inner = lastKeyboardTrigger;
    } else if (getHadTabNavigation()) {
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

/** Loose refs to the prior screen's focused element would pin detached DOM nodes; triggerMap already holds the captured copy. */
function clearTransientCaptures(): void {
    lastInteractiveElement = null;
    lastMouseTrigger = null;
    lastMouseTriggerAt = 0;
    lastKeyboardTrigger = null;
    lastKeyboardTriggerAt = 0;
    pendingActivationKey = null;
}

function notifyPushParamsForward(routeKey: string, prevParams: unknown): void {
    // Same-key transition is noop in handleStateChange — clear pending restores AND completed-RETURN state here so neither leaks into the next params screen.
    skipNextRestore = false;
    cancelPendingFocusRestore();
    captureTriggerForRoute(compoundParamsKey(routeKey, prevParams));
    clearTransientCaptures();
}

function notifyPushParamsBackward(routeKey: string, targetParams: unknown): void {
    // Honor a one-shot skip on this param-revert too (form-submit goBack can land as PUSH_PARAMS, not a stack pop).
    const compoundKey = compoundParamsKey(routeKey, targetParams);
    if (skipNextRestore) {
        applySkippedRestore(compoundKey);
    } else {
        scheduleRestore(compoundKey, {waitForUpcomingTransition: false});
    }
    // Same-key PUSH_PARAMS looks like a noop to handleStateChange — clear the outgoing capture window here so an Enter-driven Back can't leak its latch into an unrelated forward within the TTL.
    clearTransientCaptures();
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

/* Empty = nothing focusable yet (detached mid-remount, missing attributes); caller's retry budget owns cleanup, not this function. */
function pickRestoreCandidates(entry: TriggerEntry): HTMLElement[] {
    const candidates: HTMLElement[] = [];
    if (document.contains(entry.primary) && hasFocusableAttributes(entry.primary)) {
        candidates.push(entry.primary);
    }
    if (entry.fallback && document.contains(entry.fallback) && hasFocusableAttributes(entry.fallback)) {
        candidates.push(entry.fallback);
    }
    return candidates;
}

// Distinct from the arbiter's cycle timeout: this hold is target-conditional (suppress AUTO only while the restored target stays focused).
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
    if (document.activeElement instanceof HTMLElement && !isEffectivelyVisible(document.activeElement)) {
        return false;
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

    const candidates = pickRestoreCandidates(entry);
    if (candidates.length === 0) {
        return false;
    }

    const activeNow = document.activeElement;
    const focusMovedDuringDefer = activeNow !== restoreBaseline;
    if (isCycleIdle() && activeNow && activeNow !== document.body && hasFocusableAttributes(activeNow) && focusMovedDuringDefer && !isProgrammaticFocus(activeNow)) {
        triggerMap.delete(routeKey);
        return false;
    }

    if (!tryClaim(Priorities.RETURN)) {
        return false;
    }

    // activeElement verification catches silent-focus failures (display:none / visibility:hidden ancestors).
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

function scheduleRestore(routeKey: string, {waitForUpcomingTransition}: {waitForUpcomingTransition: false | 'navigation'}): void {
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
                    Log.warn('[NavigationFocusReturn] restore budget exhausted', {routeKey, frames: MAX_RESTORE_FRAMES});
                    triggerMap.delete(routeKey);
                    pendingRestore = null;
                    return;
                }
                rafId = requestAnimationFrame(attempt);
            };
            // PUSH_PARAMS dispatches pre-commit (from getStateForAction) — defer a frame so the new params render before we focus.
            if (waitForUpcomingTransition === false) {
                rafId = requestAnimationFrame(attempt);
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
    } else if (action.type === 'backward') {
        if (skipNextRestore) {
            applySkippedRestore(action.restoreKey);
        } else {
            scheduleRestore(action.restoreKey, {waitForUpcomingTransition: 'navigation'});
        }
    } else if (action.type === 'lateral') {
        skipNextRestore = false;
        // Stale restore would steal focus back on sibling nav.
        cancelPendingRestore();
    } else if (action.type === 'noop') {
        skipNextRestore = false;
    }
    // Latch/lastInteractiveElement are per-forward-nav; any real state change ends the capture window.
    if (action.type !== 'noop' || removedKeys.length > 0) {
        clearTransientCaptures();
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
            // Physical pointer supersedes the keyboard latch. Same-target `click` is preserved (synthetic Enter/Space activation click on the latched element itself); any other click clears.
            if (e.type !== 'click' || next !== lastKeyboardTrigger) {
                lastKeyboardTrigger = null;
                lastKeyboardTriggerAt = 0;
                pendingActivationKey = null;
            }
        };
        for (const event of MOUSE_ACTIVATION_EVENTS) {
            document.addEventListener(event, mouseActivationHandler, true);
        }
    }
    if (!keyActivationHandler) {
        // Capture-phase keydown latches the pre-activation target before any destination's synchronous autofocus can overwrite lastInteractiveElement.
        keyActivationHandler = (e: KeyboardEvent) => {
            const isEnter = e.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey;
            const isSpace = e.code === CONST.KEYBOARD_SHORTCUTS.SPACE.shortcutKey;
            if (isActivationKeydown(e)) {
                const active = document.activeElement;
                const key = isEnter ? 'Enter' : 'Space';
                if (active && active !== document.body && isActivatableTarget(active, key) && hasFocusableAttributes(active)) {
                    lastKeyboardTrigger = active;
                    lastKeyboardTriggerAt = performance.now();
                    pendingActivationKey = key;
                    return;
                }
                // Failed re-activation cannot re-affirm a stale latch.
                lastKeyboardTrigger = null;
                lastKeyboardTriggerAt = 0;
                pendingActivationKey = null;
                return;
            }
            // Rejected Enter/Space: auto-repeats preserve pending (held-key keyup refresh); IME/composition clears it (its keyup mustn't masquerade as our release).
            if (isEnter || isSpace) {
                if (!e.repeat) {
                    pendingActivationKey = null;
                }
                return;
            }
            // Only focus-movers supersede; standalone modifiers / typing must not (reintroduces #96970 for muscle-memory Shift/Cmd after Enter).
            if (isFocusMovingKeydown(e)) {
                lastKeyboardTrigger = null;
                lastKeyboardTriggerAt = 0;
                pendingActivationKey = null;
            }
        };
        document.addEventListener('keydown', keyActivationHandler, true);
    }
    if (!keyReleaseHandler) {
        // RNW dispatches onPress from keyup — refresh so TTL measures activation-to-capture. Gated on pendingActivationKey to block IME/rejected keyups from reviving a stale latch.
        keyReleaseHandler = (e: KeyboardEvent) => {
            if (pendingActivationKey === null) {
                return;
            }
            const isEnter = e.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey;
            const isSpace = e.code === CONST.KEYBOARD_SHORTCUTS.SPACE.shortcutKey;
            // Modifier releases (Shift/Cmd) must not clear pending — Shift+Enter → release-Shift-first still needs the eventual Enter keyup to refresh.
            if (!isEnter && !isSpace) {
                return;
            }
            const isMatchingRelease = (pendingActivationKey === 'Enter' && isEnter) || (pendingActivationKey === 'Space' && isSpace);
            pendingActivationKey = null;
            if (!isMatchingRelease || lastKeyboardTrigger === null) {
                return;
            }
            // Mirror RNW's `isActiveElement` check: if focus moved during hold, keyup targets a different element and onPress is canceled — the latch must not be refreshed.
            if (e.target !== lastKeyboardTrigger) {
                return;
            }
            lastKeyboardTriggerAt = performance.now();
        };
        document.addEventListener('keyup', keyReleaseHandler, true);
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
    clearTransientCaptures();
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
        if (keyActivationHandler) {
            document.removeEventListener('keydown', keyActivationHandler, true);
        }
        if (keyReleaseHandler) {
            document.removeEventListener('keyup', keyReleaseHandler, true);
        }
    }
    focusinHandler = null;
    mouseActivationHandler = null;
    keyActivationHandler = null;
    keyReleaseHandler = null;
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
    clearTransientCaptures();
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
    captureTriggerForRoute,
    restoreTriggerForRoute,
    notifyPushParamsForward,
    notifyPushParamsBackward,
    cancelPendingFocusRestore,
    skipNextFocusRestore,
    notifyPressedTrigger,
    registerPressable,
    isFocusRestoreInProgress,
    shouldSkipAutoFocusDueToExistingFocus,
    resetForTests,
    setLastInteractiveElementForTests,
    setLastMouseTriggerForTests,
};
