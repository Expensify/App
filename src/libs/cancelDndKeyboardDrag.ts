import CONST from '@src/CONST';

/**
 * Whether a dnd-kit keyboard drag cancel is currently in progress.
 * The flag is synchronously true only while `document.dispatchEvent` executes
 * the synthetic Escape event, so callers on the same call-stack (e.g.
 * `EscapeHandler`) can check it to avoid side-effects like closing modals.
 */
let isCancelling = false;

function isCancellingDndKeyboardDrag(): boolean {
    return isCancelling;
}

/**
 * Cancel an active dnd-kit keyboard drag by dispatching a synthetic Escape
 * keydown on `document` (where the KeyboardSensor listens).
 *
 * A module-level flag is set for the duration of the synchronous dispatch so
 * that the app's global keyboard shortcut system can distinguish this synthetic
 * event from a real user Escape press and skip navigation side-effects.
 */
function cancelDndKeyboardDrag(): void {
    if (typeof document === 'undefined') {
        return;
    }
    isCancelling = true;
    document.dispatchEvent(
        new KeyboardEvent('keydown', {
            key: CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey,
            code: CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey,
            bubbles: true,
            cancelable: true,
        }),
    );
    isCancelling = false;
}

export {cancelDndKeyboardDrag, isCancellingDndKeyboardDrag};
