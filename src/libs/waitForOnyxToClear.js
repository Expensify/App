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

function setIsOnyxClearing() {
    onyxClearPromise = new Promise((resolve) => {
        resolveOnyxClearPromise = resolve;
    });
}

function setOnyxIsDoneClearing() {
    resolveOnyxClearPromise();
}

export default waitForOnyxToClear;

export {
    setIsOnyxClearing,
    setOnyxIsDoneClearing,
};
