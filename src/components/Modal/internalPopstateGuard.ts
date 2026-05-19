let isInternal = false;

function isInternalPopstateInProgress(): boolean {
    return isInternal;
}

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
