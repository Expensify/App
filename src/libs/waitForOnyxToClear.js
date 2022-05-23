let resolveOnyxClearPromise;
let onyxClearPromise = new Promise((resolve) => {
    resolveOnyxClearPromise = resolve;
});

// By default Onyx is done clearing
resolveOnyxClearPromise();

/**
 * @returns {Promise}
 */
function waitForOnyxToClear() {
    return onyxClearPromise;
}

function setOnyxClearing() {
    onyxClearPromise = new Promise((resolve) => {
        resolveOnyxClearPromise = resolve;
    });
}

function setOnyxDoneClearing() {
    resolveOnyxClearPromise();
}

export default waitForOnyxToClear;

export {
    setOnyxClearing,
    setOnyxDoneClearing,
};
