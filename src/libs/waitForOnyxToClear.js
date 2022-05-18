import createOnReadyTask from './createOnReadyTask';

const onyxClearReadyTask = createOnReadyTask();
onyxClearReadyTask.setIsReady();

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
