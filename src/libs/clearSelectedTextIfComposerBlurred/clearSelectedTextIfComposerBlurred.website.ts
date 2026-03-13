/**
 * This function checks if the currently focused element is the composer element
 * (with id 'composer'). If the composer is focused, the function returns early
 * without clearing the selection to preserve any selection within the composer.
 * Otherwise, it removes all selection ranges, effectively deselecting any
 * selected text in the document.
 */
function clearSelectedTextIfComposerBlurred() {
    const activeElement = document.activeElement as HTMLElement | null;
    const isComposerFocused = activeElement?.id === 'composer';

    if (isComposerFocused) {
        return;
    }

    window.getSelection()?.removeAllRanges();
}

export default clearSelectedTextIfComposerBlurred;
