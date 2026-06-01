/**
 * Installed on `document` (not `document.body`) so it fires before any capture listener on body —
 * specifically `ReanimatedModal`'s Escape keyup handler, which would otherwise dismiss the parent
 * modal on the same keystroke.
 */
function suppressNextEscapeKeyUp(): () => void {
    const onKeyUp = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') {
            return;
        }
        event.stopImmediatePropagation();
        document.removeEventListener('keyup', onKeyUp, true);
    };
    document.addEventListener('keyup', onKeyUp, true);
    return () => document.removeEventListener('keyup', onKeyUp, true);
}

export default suppressNextEscapeKeyUp;
