/**
 * Chooses which element FocusTrapForModal should register as the launcher on activate.
 * Pure so nested-trap vs new-modal cases can be unit-tested without the focus-trap harness.
 */
function resolveFocusTrapLauncher(fromActive: HTMLElement | null, activeStacked: HTMLElement | null, container: HTMLElement | null, fallback: HTMLElement | null): HTMLElement | null {
    // Parent trap already moved focus into this container (PopoverMenu Modal → content).
    // Keep the registered outside opener — do not capture the ephemeral in-menu node.
    // A newly opened nested modal still uses fromActive when the opener is outside this container.
    const focusAlreadyInsideTrap = !!fromActive && !!container?.contains(fromActive);
    if (focusAlreadyInsideTrap && activeStacked && fromActive !== activeStacked) {
        return activeStacked;
    }
    return fromActive ?? fallback;
}

export default resolveFocusTrapLauncher;
