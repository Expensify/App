import CONST from '../../CONST';
import createCallback from '../createCallback';

const [getLogger, registerLogHandler] = createCallback();
const [triggerConnectivityResumed, onConnectivityResumed] = createCallback();
const [triggerResponse, onResponse] = createCallback();
const [triggerRecheckNeeded, onRecheckNeeded] = createCallback();

/**
 * @returns {Function} cancel timer
 */
function startRecheckTimeoutTimer() {
    // If request is still in processing after this time, we might be offline
    const timerID = setTimeout(triggerRecheckNeeded, CONST.NETWORK.MAX_PENDING_TIME_MS);
    return () => clearTimeout(timerID);
}

export {
    registerLogHandler,
    getLogger,
    triggerConnectivityResumed,
    onConnectivityResumed,
    onResponse,
    triggerResponse,
    triggerRecheckNeeded,
    onRecheckNeeded,
    startRecheckTimeoutTimer,
};
