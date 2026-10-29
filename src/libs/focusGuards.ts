/** Pre-focus guard for focus-moving systems (auto-focus, initial dialog focus, RETURN restore). Attribute-level focusability only — geometry (display:none, visibility:hidden, zero-size) is caught post-focus via document.activeElement verification. */
function hasFocusableAttributes(el: Element): boolean {
    return !el.matches(':disabled') && el.getAttribute('aria-disabled') !== 'true' && !el.closest('[aria-hidden="true"]') && !el.closest('[inert]');
}

export default hasFocusableAttributes;
