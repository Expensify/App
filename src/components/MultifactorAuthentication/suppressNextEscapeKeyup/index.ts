// Also runs on blur: a keyup lost while the window was unfocused must not swallow a later, unrelated Escape.
function disarm() {
    document.removeEventListener('keyup', suppressEscapeKeyup, true);
    window.removeEventListener('blur', disarm);
}

function suppressEscapeKeyup(event: KeyboardEvent) {
    disarm();
    if (event.key === 'Escape') {
        event.stopImmediatePropagation();
    }
}

/** Swallows the Escape `keyup` of the press that opened the cancel modal, so that press doesn't also close it. */
function suppressNextEscapeKeyup() {
    // Capture on `document` runs before the modal's own `keyup` listener on `document.body`.
    // Re-adding the same listener is a no-op, so a held Escape arms it only once.
    document.addEventListener('keyup', suppressEscapeKeyup, true);
    window.addEventListener('blur', disarm);
}

export default suppressNextEscapeKeyup;
