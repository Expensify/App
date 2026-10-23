let shouldSuppressEscapeRelease = false;

if (typeof window !== 'undefined') {
    // Reset before app handlers run, even if the previous press lost its keyup when the window blurred.
    window.addEventListener(
        'keydown',
        (event: KeyboardEvent) => {
            if (event.key !== 'Escape' || event.repeat) {
                return;
            }
            shouldSuppressEscapeRelease = false;
        },
        true,
    );
}

function markModalShown(): void {
    shouldSuppressEscapeRelease = true;
}

/** Only for Escape release handlers: suppress releases until the next non-repeating Escape keydown. */
function shouldIgnoreEscapeRelease(): boolean {
    return shouldSuppressEscapeRelease;
}

export {markModalShown, shouldIgnoreEscapeRelease};
