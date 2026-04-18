/** Keyboard-focusable HTML elements: interactive tags + ARIA role widgets + explicit tabindex. `a[href]` is intentionally tighter than bare `[href]` (non-anchor hrefs aren't focusable). */
const FOCUSABLE_SELECTOR = 'button, a[href], input, textarea, select, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])';

export default FOCUSABLE_SELECTOR;
