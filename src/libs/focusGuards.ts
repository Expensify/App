/** Pre-focus guards used by focus-moving systems (auto-focus, initial dialog focus, RETURN restore) to avoid overriding legitimate user focus and to skip elements that can't accept focus. */

/** AUTO's async chain can outlive RETURN_HOLD_MS; skip when another element (e.g. a restored RETURN target) already holds focus. */
function shouldSkipAutoFocusDueToExistingFocus(): boolean {
    return typeof document !== 'undefined' && !!document.activeElement && document.activeElement !== document.body;
}

/** Attribute-level focusability only. Geometry (display:none, visibility:hidden, zero-size) is caught post-focus via document.activeElement verification. */
function hasFocusableAttributes(el: Element): boolean {
    return !el.matches(':disabled') && el.getAttribute('aria-disabled') !== 'true' && !el.closest('[aria-hidden="true"]') && !el.closest('[inert]');
}

export {shouldSkipAutoFocusDueToExistingFocus, hasFocusableAttributes};
