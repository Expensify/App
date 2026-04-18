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

// Two passes so nested traps resolve to the outer (active) launcher, not the just-closed inner.
function pickLauncher(): HTMLElement | null {
    if (typeof document === 'undefined') {
        return null;
    }
    const now = Date.now();
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
    const existing = launcherStack.find((e) => e.element === element);
    if (existing) {
        existing.deactivatedAt = undefined;
        return;
    }
    launcherStack.push({element});
    while (launcherStack.length > LAUNCHER_STACK_MAX) {
        // Overflow drops the oldest (outermost) launcher. Should never happen in normal use.
        // eslint-disable-next-line no-console
        console.warn('[NavigationFocusReturn] launcherStack overflow — dropping oldest entry');
        launcherStack.shift();
    }
}

/** Mark a launcher (or top-of-stack) as deactivated. pickLauncher lazy-prunes on LAUNCHER_CLEAR_DELAY_MS. */
function scheduleClearActivePopoverLauncher(element?: HTMLElement): void {
    if (typeof document === 'undefined') {
        return;
    }
    const entry = element ? launcherStack.find((e) => e.element === element) : launcherStack.at(-1);
    if (entry) {
        entry.deactivatedAt = Date.now();
    }
}

function resetLauncherStackForTests(): void {
    launcherStack.length = 0;
}

export {pickLauncher, consumeLauncher, setActivePopoverLauncher, scheduleClearActivePopoverLauncher, resetLauncherStackForTests, LAUNCHER_CLEAR_DELAY_MS, LAUNCHER_STACK_MAX};
