/**
 * Stack of popover/modal launcher elements — the element that opened a focus trap. Top is the most recent.
 * pickLauncher prefers the topmost active entry, else the most recent deactivated-within-LAUNCHER_CLEAR_DELAY_MS.
 */
import {LAUNCHER_CLEAR_DELAY_MS, LAUNCHER_STACK_MAX} from './focusReturnTimings';

// deactivatedAt is set once every trap holding the launcher has closed; the entry then lives LAUNCHER_CLEAR_DELAY_MS so
// deferred-nav popovers can still consume it. holders counts those traps: nested traps and a modal opened from a popover
// all adopt the same element, and the entry must stay active until the last of them lets go.
type LauncherEntry = {element: HTMLElement; deactivatedAt?: number; holders: number};

// Stack (not slot) so nested + sequential traps retain correct launcher context.
const launcherStack: LauncherEntry[] = [];
let hasWarnedAboutOverflow = false;

// Two passes so nested traps resolve to the outer (active) launcher, not the just-closed inner.
function pickLauncher(): HTMLElement | null {
    if (typeof document === 'undefined') {
        return null;
    }
    // Monotonic — Date.now() would misbehave on clock jumps.
    const now = performance.now();
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

/**
 * Whether `element` is still tracked. A forward navigation consumes its launcher (see captureTriggerForRoute), so a
 * missing entry means navigation already claimed this launcher and owns the focus restore from here on.
 */
function hasLauncher(element: HTMLElement): boolean {
    return launcherStack.some((entry) => entry.element === element);
}

function consumeLauncher(element: HTMLElement): void {
    const idx = launcherStack.findIndex((e) => e.element === element);
    if (idx >= 0) {
        launcherStack.splice(idx, 1);
    }
}

function setActivePopoverLauncher(element: HTMLElement): void {
    if (typeof document === 'undefined') {
        return;
    }
    // Reactivation must move the entry to the tail — pickLauncher scans end-first, so leaving a reactivated entry mid-stack lets newer (still-active) entries shadow it.
    const existingIdx = launcherStack.findIndex((e) => e.element === element);
    const [existing] = existingIdx >= 0 ? launcherStack.splice(existingIdx, 1) : [];
    launcherStack.push({element, holders: (existing?.holders ?? 0) + 1, deactivatedAt: undefined});
    if (launcherStack.length > LAUNCHER_STACK_MAX) {
        if (!hasWarnedAboutOverflow) {
            hasWarnedAboutOverflow = true;
            // Once-per-session so a pathological trap loop doesn't spam dev logs.
            // eslint-disable-next-line no-console
            console.warn('[NavigationFocusReturn] launcherStack overflow — dropping oldest entry');
        }
        launcherStack.shift();
    }
}

/**
 * Release one trap's hold on a launcher (or on the top-of-stack entry). The entry is only marked deactivated once the
 * last holder releases it, so a popover closing underneath a modal it opened cannot age out the launcher that modal
 * still needs. pickLauncher lazy-prunes deactivated entries on LAUNCHER_CLEAR_DELAY_MS.
 */
function markActivePopoverLauncherDeactivated(element?: HTMLElement): void {
    if (typeof document === 'undefined') {
        return;
    }
    const index = element ? launcherStack.findIndex((e) => e.element === element) : launcherStack.length - 1;
    if (index < 0) {
        return;
    }
    const entry = launcherStack.at(index);
    if (!entry) {
        return;
    }
    entry.holders = Math.max(0, entry.holders - 1);
    if (entry.holders > 0) {
        return;
    }
    // Splice-then-push so end-first scan returns the most-recently-deactivated (correct for nested-trap close: outer closes after inner).
    launcherStack.splice(index, 1);
    entry.deactivatedAt = performance.now();
    launcherStack.push(entry);
}

function resetLauncherStackForTests(): void {
    launcherStack.length = 0;
    hasWarnedAboutOverflow = false;
}

export {pickLauncher, consumeLauncher, hasLauncher, setActivePopoverLauncher, markActivePopoverLauncherDeactivated, resetLauncherStackForTests};
