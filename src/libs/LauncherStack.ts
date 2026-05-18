/**
 * Stack of popover/modal launcher elements — the element that opened a focus trap. Top is the most recent.
 * pickLauncher prefers the topmost active entry, else the most recent deactivated-within-LAUNCHER_CLEAR_DELAY_MS.
 */

// deactivatedAt is set on trap close; entry lives LAUNCHER_CLEAR_DELAY_MS so deferred-nav popovers can still consume it.
type LauncherEntry = {element: HTMLElement; deactivatedAt?: number};

// Covers click → state-listener → captureTriggerForRoute on slow devices.
const LAUNCHER_CLEAR_DELAY_MS = 1000;
const LAUNCHER_STACK_MAX = 8;

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
    if (existingIdx >= 0) {
        launcherStack.splice(existingIdx, 1);
    }
    launcherStack.push({element});
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

/** Mark a launcher (or top-of-stack) as deactivated. pickLauncher lazy-prunes on LAUNCHER_CLEAR_DELAY_MS. */
function scheduleClearActivePopoverLauncher(element?: HTMLElement): void {
    if (typeof document === 'undefined') {
        return;
    }
    const index = element ? launcherStack.findIndex((e) => e.element === element) : launcherStack.length - 1;
    if (index < 0) {
        return;
    }
    // Splice-then-push so end-first scan returns the most-recently-deactivated (correct for nested-trap close: outer closes after inner).
    const [entry] = launcherStack.splice(index, 1);
    entry.deactivatedAt = performance.now();
    launcherStack.push(entry);
}

function resetLauncherStackForTests(): void {
    launcherStack.length = 0;
    hasWarnedAboutOverflow = false;
}

export {pickLauncher, consumeLauncher, setActivePopoverLauncher, scheduleClearActivePopoverLauncher, resetLauncherStackForTests, LAUNCHER_CLEAR_DELAY_MS, LAUNCHER_STACK_MAX};
