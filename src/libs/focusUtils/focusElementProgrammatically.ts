const PROGRAMMATIC_FOCUS_DATA_ATTRIBUTE = 'data-programmatic-focus';

function isHTMLElement(value: unknown): value is HTMLElement {
    return typeof HTMLElement !== 'undefined' && value instanceof HTMLElement;
}

function isElementFocusRestorable(element: Element | null): element is HTMLElement {
    if (typeof document === 'undefined' || typeof window === 'undefined' || !isHTMLElement(element) || element === document.body || element === document.documentElement) {
        return false;
    }

    if (!document.body.contains(element)) {
        return false;
    }

    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') {
        return false;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
        return false;
    }

    return !element.hasAttribute('disabled') && !element.hasAttribute('inert') && !element.closest('[inert]');
}

function markElementForProgrammaticFocus(element: HTMLElement): () => void {
    const removeProgrammaticFocusAttr = () => {
        element.removeAttribute(PROGRAMMATIC_FOCUS_DATA_ATTRIBUTE);
    };

    element.setAttribute(PROGRAMMATIC_FOCUS_DATA_ATTRIBUTE, 'true');
    element.addEventListener('blur', removeProgrammaticFocusAttr, {once: true});

    return () => {
        element.removeEventListener('blur', removeProgrammaticFocusAttr);
        removeProgrammaticFocusAttr();
    };
}

function focusElementProgrammatically(element: HTMLElement | null | undefined, focusOptions?: FocusOptions): boolean {
    if (typeof document === 'undefined' || !isHTMLElement(element)) {
        return false;
    }

    const cleanupProgrammaticFocus = markElementForProgrammaticFocus(element);
    element.focus(focusOptions);

    const focusedElement = document.activeElement;
    if (focusedElement === element || (focusedElement && element.contains(focusedElement))) {
        return true;
    }

    cleanupProgrammaticFocus();
    return false;
}

export default focusElementProgrammatically;
export {PROGRAMMATIC_FOCUS_DATA_ATTRIBUTE, isElementFocusRestorable, isHTMLElement, markElementForProgrammaticFocus};
