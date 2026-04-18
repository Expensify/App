/** Shared focus-related constants and guards used by the focus-return + initial-focus subsystems. */

/** Keyboard-focusable HTML elements: interactive tags + ARIA role widgets + explicit tabindex. `a[href]` is intentionally tighter than bare `[href]` (non-anchor hrefs aren't focusable). */
const FOCUSABLE_SELECTOR = 'button, a[href], input, textarea, select, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])';

/** AUTO's async chain can outlive RETURN_HOLD_MS; skip when another element (e.g. a restored RETURN target) already holds focus. */
function shouldSkipAutoFocusDueToExistingFocus(): boolean {
    return typeof document !== 'undefined' && !!document.activeElement && document.activeElement !== document.body;
}

export {FOCUSABLE_SELECTOR, shouldSkipAutoFocusDueToExistingFocus};
