import createOnReadyTask from './createOnReadyTask';

const onyxClearReadyTask = createOnReadyTask();
onyxClearReadyTask.setIsReady();

/**
 * @returns {Promise}
 */
function waitForOnyxToClear() {
    return onyxClearReadyTask.isReady();
}

function reset() {
    onyxClearReadyTask.reset();
}

function setIsReady() {
    onyxClearReadyTask.setIsReady();
}

export default waitForOnyxToClear;

export {
    reset,
    setIsReady,
};
