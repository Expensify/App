let isReadyToFocusPromise = Promise.resolve();
let resolveIsReadyToFocus: (value: void | PromiseLike<void>) => void;

function resetReadyToFocus() {
    isReadyToFocusPromise = new Promise((resolve) => {
        resolveIsReadyToFocus = resolve;
    });
}

function setReadyToFocus() {
    if (!resolveIsReadyToFocus) {
        return;
    }
    resolveIsReadyToFocus();
}

function isReadyToFocus(): Promise<void> {
    return isReadyToFocusPromise;
}

export default {
    resetReadyToFocus,
    setReadyToFocus,
    isReadyToFocus,
};
