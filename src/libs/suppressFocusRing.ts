// Hides both the app's `:focus-visible` ring and the browser's own outline (see web/index.html). `data-programmatic-focus`
// cannot do this, because dropping out of the app's rule hands the element back to the browser's default outline.
const SUPPRESSED_FOCUS_RING_DATA_ATTRIBUTE = 'data-suppressed-focus-ring';

/** Hides the focus ring on `el` until it loses focus. The returned function clears the mark early. */
function suppressFocusRing(el: HTMLElement): () => void {
    el.setAttribute(SUPPRESSED_FOCUS_RING_DATA_ATTRIBUTE, 'true');
    const clear = () => el.removeAttribute(SUPPRESSED_FOCUS_RING_DATA_ATTRIBUTE);
    el.addEventListener('blur', clear, {once: true});
    return () => {
        el.removeEventListener('blur', clear);
        clear();
    };
}

/** Lets tests and callers ask whether an element is currently hiding its focus ring. */
function isFocusRingSuppressed(element: Element | null): boolean {
    return element instanceof Element && element.getAttribute(SUPPRESSED_FOCUS_RING_DATA_ATTRIBUTE) === 'true';
}

export default suppressFocusRing;
export {isFocusRingSuppressed};
