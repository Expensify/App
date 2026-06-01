/**
 * Swallows the next Escape `keyup`.
 * - `window` (not `document`) capture: runs before `PopoverProvider`'s keyup which would otherwise preempt and leak us.
 * - Singleton: each install evicts any pending listener.
 */
let pending: ((event: KeyboardEvent) => void) | null = null;

function suppressNextEscapeKeyUp(): () => void {
    if (pending) {
        window.removeEventListener('keyup', pending, true);
        pending = null;
    }

    const onKeyUp = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') {
            return;
        }
        event.stopImmediatePropagation();
        window.removeEventListener('keyup', onKeyUp, true);
        if (pending === onKeyUp) {
            pending = null;
        }
    };

    pending = onKeyUp;
    window.addEventListener('keyup', onKeyUp, true);

    return () => {
        window.removeEventListener('keyup', onKeyUp, true);
        if (pending === onKeyUp) {
            pending = null;
        }
    };
}

export default suppressNextEscapeKeyUp;
