import compoundParamsKey, {COMPOUND_KEY_DELIMITER} from '@libs/compoundParamsKey';
import FOCUSABLE_SELECTOR from '@libs/focusableSelector';
import hasFocusableAttributes from '@libs/focusGuards';
import {KEYBOARD_TRIGGER_TTL_MS, MAX_RESTORE_FRAMES, MOUSE_TRIGGER_TTL_MS, RETURN_HOLD_MS, TRIGGER_MAP_MAX} from '@libs/focusReturnTimings';
import getHadTabNavigation from '@libs/hadTabNavigation';
import isEffectivelyVisible from '@libs/isEffectivelyVisible';
import isHTMLElement from '@libs/isHTMLElement';
import isEnterWhileComposition from '@libs/KeyboardShortcut/isEnterWhileComposition';
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

/** focusin tracks the last keyboard-focused element. A nav state listener captures it against the outgoing route and restores it on backward nav. */

// Fallback is the surrounding trap's launcher, used when primary can't accept focus at restore.
type TriggerEntry = {primary: HTMLElement; fallback?: HTMLElement};

const triggerMap = new Map<string, TriggerEntry>();
const MOUSE_ACTIVATION_EVENTS = ['pointerdown', 'mousedown', 'click'] as const;

// Cross-modality: mouse-click forward, then keyboard back, still needs focus returned (WCAG 2.4.3).
let lastMouseTrigger: HTMLElement | null = null;
let lastInteractiveElement: HTMLElement | null = null;
let lastMouseTriggerAt = 0;
let lastKeyboardTriggerElement: HTMLElement | null = null;
let lastKeyboardTriggerTime = 0;
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
    /*
     * When the user presses Enter or Space on a control that navigates (a Settings row, a
     * menu item), the destination screen usually mounts before this function runs. If
     * that screen focuses one of its own controls on mount (BaseTextInput's mount
     * autofocus is the common case), the focus change fires a focusin event that overwrites
     * lastInteractiveElement with the destination's input. Capturing that here would
     * attribute the trigger to the wrong element. By the time back-navigation runs, the
     * destination's input has been unmounted, so focus falls to <body> instead of
     * returning to the row the user activated.
     *
     * To avoid that, keyActivationHandler snapshots the focused element at keydown time
     * (lastKeyboardTriggerElement) before any destination code can run in response to the
     * activation. Below we prefer that snapshot when two things hold:
     *   1. It is still recent (within KEYBOARD_TRIGGER_TTL_MS). We need a window because
     *      activation-to-navigation is generally async (microtasks, promise chains, async
     *      form submits), so keydown and this capture rarely land in the same tick. 500ms
     *      covers realistic activation-to-nav latency and is short enough that a keydown
     *      from long ago cannot pin the trigger for a navigation it didn't cause.
     *   2. The element is still focusable. A form-submit spinner may have added
     *      aria-disabled between keydown and now. We check the element itself but not its
     *      ancestors, because React Navigation marks the outgoing screen aria-hidden as
     *      soon as the destination is focused (via CardA11yWrapper / Screen wrapper).
     *      Walking up would find that and false-reject the still-valid control inside
     *      it. The aria-hidden is cleared when the user navigates back, so restoration
     *      still works.
     * When the snapshot isn't usable, we fall through to lastInteractiveElement (the
     * older focusin-tracked value, for keyboard nav) or lastMouseTrigger (for mouse nav)
     * below.
     */
    const isWithinTTL = performance.now() - lastKeyboardTriggerTime < KEYBOARD_TRIGGER_TTL_MS;
    const isStillFocusable =
        lastKeyboardTriggerElement !== null &&
        document.contains(lastKeyboardTriggerElement) &&
        !lastKeyboardTriggerElement.matches(':disabled') &&
        lastKeyboardTriggerElement.getAttribute('aria-disabled') !== 'true';
    const isKeyboardTriggerFresh = isWithinTTL && isStillFocusable;
    if (isKeyboardTriggerFresh) {
        inner = lastKeyboardTriggerElement;
    } else if (getHadTabNavigation()) {
        const active = document.activeElement;
        const innerIsStale = lastInteractiveElement && active && active !== document.body && active !== lastInteractiveElement;
        inner = lastInteractiveElement && document.contains(lastInteractiveElement) && !innerIsStale ? lastInteractiveElement : null;
    } else {
        const isFresh = lastMouseTrigger !== null && performance.now() - lastMouseTriggerAt < MOUSE_TRIGGER_TTL_MS;
        inner = isFresh && lastMouseTrigger && document.contains(lastMouseTrigger) ? lastMouseTrigger : null;
    }

    if (launcher) {
        // Prefer the in-trap element. Fall back to the launcher when primary is removed on trap close.
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

/** Single-site latch reset so the three fields always clear together and future additions get one call site. */
function clearKeyboardLatch(): void {
    lastKeyboardTriggerElement = null;
    lastKeyboardTriggerTime = 0;
    pendingActivationKey = null;
}

/** Loose refs to the prior screen's focused element would pin detached DOM nodes. The triggerMap already holds the captured copy. */
function clearTransientCaptures(): void {
    lastInteractiveElement = null;
    lastMouseTrigger = null;
    lastMouseTriggerAt = 0;
    clearKeyboardLatch();
}

function notifyPushParamsForward(routeKey: string, prevParams: unknown): void {
    // Same-key transition is noop in handleStateChange, so we clear pending restores and completed-RETURN state here to prevent leaks into the next params screen.
    skipNextRestore = false;
    cancelPendingFocusRestore();
    captureTriggerForRoute(compoundParamsKey(routeKey, prevParams));
    clearTransientCaptures();
}

function notifyPushParamsBackward(routeKey: string, targetParams: unknown): void {
    // Honor a one-shot skip on this param-revert too (form-submit goBack can land as PUSH_PARAMS, not a stack pop).
    const compoundKey = compoundParamsKey(routeKey, targetParams);
    if (skipNextRestore) {
        // Save-driven back may synchronously navigate to a new route, so preserve lastInteractiveElement for the follow-up capture. Clear only the latch.
        applySkippedRestore(compoundKey);
        clearKeyboardLatch();
        return;
    }
    scheduleRestore(compoundKey, {waitForUpcomingTransition: false});
    // Same-key PUSH_PARAMS looks like a noop to handleStateChange, so clear here on the real backward path.
    clearTransientCaptures();
}

/*
 * Skips the focus restore for the next back navigation. Call it before a form-submit goBack so the re-focused row
 * doesn't eat the next Enter (which should hit the page's submit). Back and Esc don't call it, so they still restore focus.
 */
function skipNextFocusRestore(): void {
    skipNextRestore = true;
}

/** Native-only. Web captures via `focusin` so this stub exists only to keep the import cross-platform. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function notifyPressedTrigger(_ref: RefObject<View | null> | null, _identifier?: string): void {}

/** Native-only registry. Cross-platform stub. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function registerPressable(_routeKey: string, _identifier: string, _ref: RefObject<View | null>): () => void {
    return () => {};
}

/** True only while restoreTriggerForRoute is in its .focus() call. Lists use it to tell the restore apart from a real keyboard Tab, which also has no sourceCapabilities. */
function isFocusRestoreInProgress(): boolean {
    return isRestoringFocus;
}

/** Seeds the trigger candidate for focus restoration */
function seedTriggerCandidate(element: HTMLElement): void {
    if (getHadTabNavigation()) {
        return;
    }
    lastMouseTrigger = element;
    lastMouseTriggerAt = performance.now();
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
// Set on successful RETURN. Consulted at hold-release time to decide whether to eagerly reset the cycle or defer.
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
        // Target still focused, so defer to the arbiter's own CYCLE_TIMEOUT_MS. An early reset would let a slow AUTO chain steal after the target briefly drops focusable-attributes.
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

// Same-key forward is noop in handleStateChange. Drop the cycle for both an in-flight restore (AUTO may have grabbed it during the deferred window) and a completed RETURN. Otherwise it blocks the next screen's INITIAL/AUTO.
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
            seedTriggerCandidate(candidate);
            scheduleReturnHoldRelease();
            return true;
        }
        // Only accept as onFocus redirect when focus actually moved. Pre-existing focus with a silent no-op must fall through to the fallback.
        if (after !== before && after && after !== document.body) {
            triggerMap.delete(routeKey);
            lastRestoreTarget = after instanceof HTMLElement ? after : candidate;
            seedTriggerCandidate(lastRestoreTarget);
            scheduleReturnHoldRelease();
            return true;
        }
    }

    // Silent no-op (transient display:none / visibility:hidden ancestor). Leave the entry for scheduleRestore to retry, and release the cycle so AUTO/INITIAL aren't blocked during the window.
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
        // Stack pops dispatch before their transition registers, so they wait for the upcoming one. PUSH_PARAMS emits none, so it opts out to avoid stalling on the timeout.
        waitForUpcomingTransition,
        callback: () => {
            // A miss keeps the entry, so retry. Stop once it's restored or removed elsewhere, and drop it ourselves only on exhaustion.
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
            // PUSH_PARAMS dispatches pre-commit (from getStateForAction), so defer a frame to let the new params render before we focus.
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
    // End the capture window on real user-visible transitions. noop is excluded so background route cleanups don't race with an in-flight activation (keydown-latched, keyup-onPress pending).
    if (action.type === 'forward' || action.type === 'backward' || action.type === 'lateral') {
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

// UI test mocks of navigationRef may omit isReady/getRootState, so defend at call sites.
function navigationRefHasLiveState(): boolean {
    return typeof navigationRef?.isReady === 'function' && navigationRef.isReady() && typeof navigationRef.getRootState === 'function';
}

// MUST stay idempotent. Invoked from Navigation.ts module load, NavigationRoot useEffect, and NavigationRoot.onReady. Each step is guarded against re-add.
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
            // instanceof filters SVG matches to HTMLElement. Setting null clears the cache so a non-focusable activation can't leak a prior click.
            const next = closest instanceof HTMLElement ? closest : null;
            if (next !== lastMouseTrigger) {
                lastMouseTrigger = next;
            }
            lastMouseTriggerAt = performance.now();
            // Preserve synthetic Enter/Space activation click on the latched element. Uses `.contains` (not FOCUSABLE_SELECTOR closest) so roving-tabindex ARIA widgets don't wrongly clear their own latch.
            const didClickOnLatch = e.type === 'click' && lastKeyboardTriggerElement !== null && (e.target === lastKeyboardTriggerElement || lastKeyboardTriggerElement.contains(e.target));
            if (!didClickOnLatch) {
                clearKeyboardLatch();
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
            // Mirror isActivationKeydown. Remapped code='Space' with key='ñ' is typing, not a rejected activation.
            const isSpace = e.code === CONST.KEYBOARD_SHORTCUTS.SPACE.shortcutKey && e.key === CONST.KEYBOARD_SHORTCUTS.SPACE.trigger.DEFAULT.input;
            if (isActivationKeydown(e)) {
                const activeElement = document.activeElement;
                const key = isEnter ? 'Enter' : 'Space';
                if (activeElement && activeElement !== document.body && isActivatableTarget(activeElement, key) && hasFocusableAttributes(activeElement)) {
                    lastKeyboardTriggerElement = activeElement;
                    lastKeyboardTriggerTime = performance.now();
                    pendingActivationKey = key;
                    return;
                }
                // Only supersede when activeElement === body (no target intent). An invalid HTMLElement preserves a prior in-flight latch, since the user may be retrying while the first activation's async is still en route.
                if (activeElement === null || activeElement === document.body) {
                    clearKeyboardLatch();
                }
                return;
            }
            // Rejected Enter/Space. Auto-repeats preserve pending so the held-key keyup can refresh, while IME/composition clears because the user has moved contexts.
            if (isEnter || isSpace) {
                if (!e.repeat) {
                    clearKeyboardLatch();
                }
                return;
            }
            // Only focus-movers supersede. Standalone modifiers and typing must not, or muscle-memory Shift/Cmd after Enter would reintroduce #96970.
            if (isFocusMovingKeydown(e)) {
                clearKeyboardLatch();
            }
        };
        document.addEventListener('keydown', keyActivationHandler, true);
    }
    if (!keyReleaseHandler) {
        // RNW dispatches onPress from keyup, so we refresh here to measure activation-to-capture. Gated on pendingActivationKey to block IME/rejected releases from reviving a stale latch.
        keyReleaseHandler = (e: KeyboardEvent) => {
            if (pendingActivationKey === null) {
                return;
            }
            const isEnter = e.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey;
            const isSpace = e.code === CONST.KEYBOARD_SHORTCUTS.SPACE.shortcutKey && e.key === CONST.KEYBOARD_SHORTCUTS.SPACE.trigger.DEFAULT.input;
            const isMatchingRelease = (pendingActivationKey === 'Enter' && isEnter) || (pendingActivationKey === 'Space' && isSpace);
            // Non-matching release (modifier, or the other activation key) must not burn pending, since the matching release still needs to refresh.
            if (!isMatchingRelease) {
                return;
            }
            pendingActivationKey = null;
            if (lastKeyboardTriggerElement === null) {
                return;
            }
            // Mirror RNW's `isActiveElement`. Mismatched target means onPress is canceled, so clear the latch (not just skip refresh) or an unrelated nav within TTL could pin the canceled control.
            if (e.target !== lastKeyboardTriggerElement) {
                clearKeyboardLatch();
                return;
            }
            lastKeyboardTriggerTime = performance.now();
        };
        document.addEventListener('keyup', keyReleaseHandler, true);
    }
    // getRootState() pre-mount triggers React Navigation's "not initialized" console.error. Retries on each setup call so NavigationRoot.onReady picks up live state.
    if (!prevState && navigationRefHasLiveState()) {
        prevState = navigationRef.getRootState() ?? prevState;
    }
    // Pre-mount addListener returns a queue-only unsubscribe. Once the container forwards the listener it can't be detached. NavigationRoot's onReady/useEffect re-invoke once current is set.
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
    // Reset cached state so a remount (logout/HMR) re-seeds. Setup's `!prevState` gate would otherwise skip the seed and diff against stale routes.
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

type ActivationKey = 'Enter' | 'Space';

/** True when a keydown activates a Pressable (Enter/Space, no repeat, no IME, any modifier). Text-editable targets are filtered downstream by isActivatableTarget. */
function isActivationKeydown(e: KeyboardEvent): boolean {
    const isEnter = e.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey;
    const isSpace = e.code === CONST.KEYBOARD_SHORTCUTS.SPACE.shortcutKey && e.key === CONST.KEYBOARD_SHORTCUTS.SPACE.trigger.DEFAULT.input;
    if (!isEnter && !isSpace) {
        return false;
    }
    if (e.repeat || e.isComposing) {
        return false;
    }
    // Safari's IME-Enter reports isComposing=false, so the helper catches it via keyCode===229.
    return !isEnterWhileComposition(e);
}

/** True when a keydown moves focus context (Tab, arrows, etc.), used to invalidate stale activation latches. Modifiers and typing don't count. */
function isFocusMovingKeydown(e: KeyboardEvent): boolean {
    const focusMovingKeys = new Set(['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown', 'Escape']);
    return focusMovingKeys.has(e.key);
}

/** Native tags or ARIA roles that make an element user-activatable regardless of tab order. */
function isInteractive(el: HTMLElement): boolean {
    const interactiveTags = new Set(['BUTTON', 'SELECT']);
    const interactiveRoles = new Set([
        'button',
        'link',
        'menuitem',
        'menuitemcheckbox',
        'menuitemradio',
        'tab',
        'switch',
        'option',
        'row',
        'gridcell',
        'treeitem',
        'searchbox',
        'combobox',
        'checkbox',
        'radio',
    ]);
    if (interactiveTags.has(el.tagName)) {
        return true;
    }
    if (el.tagName === 'A' && el.hasAttribute('href')) {
        return true;
    }
    const role = el.getAttribute('role');
    return role !== null && interactiveRoles.has(role);
}

/** True when this key would activate a control instead of typing text. Excludes textarea, contenteditable, and non-button-typed inputs. Text inputs still accept Enter (form submit). */
function isActivatableTarget(el: Element, key: ActivationKey): el is HTMLElement {
    const textInputTypes = new Set(['text', 'search', 'email', 'password', 'tel', 'url', 'number', 'date', 'datetime-local', 'month', 'time', 'week']);
    const buttonInputTypes = new Set(['button', 'submit', 'reset', 'image']);
    if (!isHTMLElement(el)) {
        return false;
    }
    if (el instanceof HTMLTextAreaElement) {
        return false;
    }
    if (el instanceof HTMLInputElement) {
        if (textInputTypes.has(el.type)) {
            return key === 'Enter';
        }
        return buttonInputTypes.has(el.type);
    }
    // Attribute fallback for jsdom where isContentEditable isn't implemented.
    if (el.isContentEditable || el.getAttribute('contenteditable') === 'true' || el.getAttribute('contenteditable') === '') {
        return false;
    }
    return isInteractive(el);
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
