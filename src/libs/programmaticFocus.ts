// Suppresses the `:focus-visible` ring (see web/index.html) on programmatically-focused elements — used for a11y autofocus and focus restore so mouse users don't see a ring (WCAG 2.4.7).
const PROGRAMMATIC_FOCUS_DATA_ATTRIBUTE = 'data-programmatic-focus';
// Read by ActiveElementRoleProvider to report no active role — keeps page-level Enter shortcuts active after a form-submit restore. Distinct from the ring marker so generic autofocus doesn't suppress role.
const SUPPRESS_ACTIVE_ROLE_DATA_ATTRIBUTE = 'data-suppress-active-role';

// Sets `attribute` on `el`, auto-clearing on blur. Returns a function that clears synchronously (used when the focus call never landed).
function markWithAttribute(el: HTMLElement, attribute: string): () => void {
    el.setAttribute(attribute, 'true');
    const clear = () => el.removeAttribute(attribute);
    el.addEventListener('blur', clear, {once: true});
    return () => {
        el.removeEventListener('blur', clear);
        clear();
    };
}

/** Suppresses the focus-visible ring on a programmatically-focused element (a11y autofocus / restore). */
function markProgrammaticFocus(el: HTMLElement): () => void {
    return markWithAttribute(el, PROGRAMMATIC_FOCUS_DATA_ATTRIBUTE);
}

/** Marks a restored element so `ActiveElementRoleProvider` reports no active role — only the form-submit restore path opts in. */
function suppressActiveRole(el: HTMLElement): () => void {
    return markWithAttribute(el, SUPPRESS_ACTIVE_ROLE_DATA_ATTRIBUTE);
}

export {PROGRAMMATIC_FOCUS_DATA_ATTRIBUTE, SUPPRESS_ACTIVE_ROLE_DATA_ATTRIBUTE, markProgrammaticFocus, suppressActiveRole};
