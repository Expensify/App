let isEscapeHeld = false;
let wasModalShownWhileEscapeHeld = false;
let isDispatchingKeyupOfPressThatShowedModal = false;
let teardown: (() => void) | null = null;

function resetPress() {
    isEscapeHeld = false;
    wasModalShownWhileEscapeHeld = false;
}

/**
 * Tracks the Escape press in progress on web, so a modal shown by an Escape `keydown` is not closed by the `keyup`
 * of the same press. The listeners sit on `window` in the capture phase, so they run before any other key handler.
 */
function setup(): void {
    if (teardown || typeof window === 'undefined' || typeof document === 'undefined') {
        return;
    }

    const keydownHandler = (event: KeyboardEvent) => {
        if (event.key !== 'Escape' || event.repeat) {
            return;
        }
        isEscapeHeld = true;
        wasModalShownWhileEscapeHeld = false;
    };
    const keyupHandler = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') {
            return;
        }
        if (wasModalShownWhileEscapeHeld) {
            isDispatchingKeyupOfPressThatShowedModal = true;
            // A macrotask runs only after every listener of this keyup, while microtasks run between listeners.
            setTimeout(() => {
                isDispatchingKeyupOfPressThatShowedModal = false;
            }, 0);
        }
        resetPress();
    };

    window.addEventListener('keydown', keydownHandler, true);
    window.addEventListener('keyup', keyupHandler, true);
    // A key released outside the window never sends its keyup.
    window.addEventListener('blur', resetPress);

    teardown = () => {
        window.removeEventListener('keydown', keydownHandler, true);
        window.removeEventListener('keyup', keyupHandler, true);
        window.removeEventListener('blur', resetPress);
        resetPress();
        isDispatchingKeyupOfPressThatShowedModal = false;
        teardown = null;
    };
}

function markModalShown(): void {
    if (!isEscapeHeld) {
        return;
    }
    wasModalShownWhileEscapeHeld = true;
}

/** Whether the Escape `keyup` being dispatched ends a press during which a modal was shown, so it must not close that modal. */
function isKeyupOfPressThatShowedModal(): boolean {
    return isDispatchingKeyupOfPressThatShowedModal;
}

function teardownEscapeKeyPress(): void {
    teardown?.();
}

export {setup as setupEscapeKeyPress, markModalShown, isKeyupOfPressThatShowedModal, teardownEscapeKeyPress};
