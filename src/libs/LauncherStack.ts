/**
 * Stack of popover/modal "launcher" elements — the element that opened a focus trap. The top of the stack is the most recently opened trap.
 * `pickLauncher` prefers the topmost still-active entry; if none is active, falls back to the most recent deactivated entry still within LAUNCHER_CLEAR_DELAY_MS.
 * Split out from NavigationFocusReturn so the data structure and its lifecycle rules are independent from the trigger-map / state-listener subsystems.
 */

// `deactivatedAt` set when the trap closes; entry lives for LAUNCHER_CLEAR_DELAY_MS so a deferred-nav popover can still consume it.
type LauncherEntry = {element: HTMLElement; deactivatedAt?: number};

// Covers the click → state-listener → captureTriggerForRoute chain for deferred-nav popovers; conservative for slower devices.
const LAUNCHER_CLEAR_DELAY_MS = 1000;
// Guard against pathological trap storms. Typical stack depth is 1–2.
const LAUNCHER_STACK_MAX = 8;

// Stack (not slot) so nested + sequential traps retain correct launcher context.
const launcherStack: LauncherEntry[] = [];

// Prefer topmost active, then most recent deactivated-within-window. Two passes so nested traps resolve to the outer (active) launcher, not the just-closed inner.
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
        // Overflow drops the oldest (outermost) launcher — typically the most important to restore to. Should never happen in normal use.
        // eslint-disable-next-line no-console
        console.warn('[NavigationFocusReturn] launcherStack overflow — dropping oldest entry');
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

function resetLauncherStackForTests(): void {
    launcherStack.length = 0;
}

export {pickLauncher, consumeLauncher, setActivePopoverLauncher, scheduleClearActivePopoverLauncher, resetLauncherStackForTests, LAUNCHER_CLEAR_DELAY_MS, LAUNCHER_STACK_MAX};
