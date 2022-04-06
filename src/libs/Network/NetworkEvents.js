import CONST from '../../CONST';
import createCallback from '../createCallback';

/**
 * This file helps bridge the Network layer with other parts of the app like API, NetworkConnection, PersistedRequestsQueue etc.
 * It helps avoid circular dependencies and by setting up event triggers and subscribers.
 */

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
