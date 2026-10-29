/** Keyboard-focusable HTML elements: interactive tags + ARIA role widgets + contenteditable (except explicit "false") + explicit tabindex. `a[href]` is intentionally tighter than bare `[href]` (non-anchor hrefs aren't focusable). */
const FOCUSABLE_SELECTOR =
    'button, a[href], input, textarea, select, [role="button"], [role="link"], [role="textbox"], [contenteditable]:not([contenteditable="false"]), [tabindex]:not([tabindex="-1"])';

export default FOCUSABLE_SELECTOR;
