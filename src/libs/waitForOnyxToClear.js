// By default Onyx is done clearing
let onyxClearPromise = Promise.resolve();

/**
 * @returns {Promise}
 */
function waitForOnyxToClear() {
    return onyxClearPromise;
}

function setOnyxClearing() {
    onyxClearPromise = new Promise();
}

function setOnyxDoneClearing() {
    onyxClearPromise.resolve();
}

export default waitForOnyxToClear;

export {
    setOnyxClearing,
    setOnyxDoneClearing,
};
