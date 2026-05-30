let isInternal = false;

/** Returns true when the next `popstate` was triggered by our own `history.back()`, not a real user back navigation. */
function isInternalPopstateInProgress(): boolean {
    return isInternal;
}

/** Runs `action` (e.g. `history.back()`) while flagging the resulting `popstate` as internal, so listeners can ignore it. */
function withInternalPopstate(action: () => void) {
    isInternal = true;
    const clear = () => {
        isInternal = false;
        window.removeEventListener('popstate', clear);
    };
    window.addEventListener('popstate', clear);
    action();
}

export {isInternalPopstateInProgress, withInternalPopstate};
