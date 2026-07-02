/**
 * `window` capture keydown for Escape — runs before `react-native-key-command`'s document-capture
 * listener, so the shortcut stack never walks. Sidesteps the "parent re-subscribes and jumps ahead"
 * race that the stack can't defend against.
 */
function claimEscapeKeyDown(handler: () => void): () => void {
    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') {
            return;
        }
        event.stopImmediatePropagation();
        handler();
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
}

export default claimEscapeKeyDown;
