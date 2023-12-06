let isReadyToFocusPromise = Promise.resolve();
let resolveIsReadyToFocus;

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
function isReadyToFocus() {
    return isReadyToFocusPromise;
}

export default {
    resetReadyToFocus,
    setReadyToFocus,
    isReadyToFocus,
};
