// Suppresses the `:focus-visible` ring (see web/index.html) on programmatically-focused elements so mouse users don't see a ring (WCAG 2.4.7).
const PROGRAMMATIC_FOCUS_DATA_ATTRIBUTE = 'data-programmatic-focus';

/** Marks `el` as receiving programmatic (a11y autofocus) focus so the `:focus-visible` ring is suppressed. Auto-clears on blur; the returned function clears synchronously if the focus call never landed. */
function markProgrammaticFocus(el: HTMLElement): () => void {
    el.setAttribute(PROGRAMMATIC_FOCUS_DATA_ATTRIBUTE, 'true');
    const clear = () => el.removeAttribute(PROGRAMMATIC_FOCUS_DATA_ATTRIBUTE);
    el.addEventListener('blur', clear, {once: true});
    return () => {
        el.removeEventListener('blur', clear);
        clear();
    };
}

/** Lets consumers distinguish app-driven autofocus from real user focus movement when the arbiter cycle is idle. */
function isProgrammaticFocus(element: Element | null): boolean {
    return element instanceof Element && element.getAttribute(PROGRAMMATIC_FOCUS_DATA_ATTRIBUTE) === 'true';
}

export default markProgrammaticFocus;
export {isProgrammaticFocus};
