const PROGRAMMATIC_FOCUS_DATA_ATTRIBUTE = 'data-programmatic-focus';

/**
 * Marks `el` as receiving programmatic (a11y-restore) focus so role-based consumers (`Button` enter-shortcut suppression) skip it on a later keypress.
 * Auto-clears on blur; the returned function clears synchronously if the focus call never landed.
 */
function markProgrammaticFocus(el: HTMLElement): () => void {
    el.setAttribute(PROGRAMMATIC_FOCUS_DATA_ATTRIBUTE, 'true');
    const clear = () => el.removeAttribute(PROGRAMMATIC_FOCUS_DATA_ATTRIBUTE);
    el.addEventListener('blur', clear, {once: true});
    return () => {
        el.removeEventListener('blur', clear);
        clear();
    };
}

export {PROGRAMMATIC_FOCUS_DATA_ATTRIBUTE, markProgrammaticFocus};
