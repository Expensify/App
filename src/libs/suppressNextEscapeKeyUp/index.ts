/**
 * Swallows the next Escape `keyup` before any other handler sees it.
 * - Listens on `document` (not `document.body`) so it precedes `ReanimatedModal`'s body keyup that would dismiss the parent modal.
 * - Singleton: `PopoverProvider`'s earlier document-capture keyup can `stopImmediatePropagation` before ours runs, so each install evicts any pending listener.
 */
let pending: ((event: KeyboardEvent) => void) | null = null;

function suppressNextEscapeKeyUp(): () => void {
    if (pending) {
        document.removeEventListener('keyup', pending, true);
        pending = null;
    }

    const onKeyUp = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') {
            return;
        }
        event.stopImmediatePropagation();
        document.removeEventListener('keyup', onKeyUp, true);
        if (pending === onKeyUp) {
            pending = null;
        }
    };

    pending = onKeyUp;
    document.addEventListener('keyup', onKeyUp, true);

    return () => {
        document.removeEventListener('keyup', onKeyUp, true);
        if (pending === onKeyUp) {
            pending = null;
        }
    };
}

export default suppressNextEscapeKeyUp;
