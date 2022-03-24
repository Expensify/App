import CONST from '../../CONST';
import createCallback from '../createCallback';

const [getLogger, registerLogHandler] = createCallback();
const [triggerConnectivityResumed, onConnectivityResumed] = createCallback();
const [onRequest, registerRequestHandler] = createCallback();
const [onResponse, registerResponseHandler] = createCallback();
const [onError, registerErrorHandler] = createCallback();
const [triggerRecheckNeeded, registerConnectionCheckCallback] = createCallback();

/**
 * @returns {Function} cancel timer
 */
function startRequestTimeoutTimer() {
    // If request is still in processing after this time, we might be offline
    const timerId = setTimeout(() => triggerRecheckNeeded(), CONST.NETWORK.MAX_PENDING_TIME_MS);
    return () => clearTimeout(timerId);
}

export {
    registerLogHandler,
    getLogger,
    triggerConnectivityResumed,
    onConnectivityResumed,
    onRequest,
    registerRequestHandler,
    onResponse,
    registerResponseHandler,
    onError,
    registerErrorHandler,
    triggerRecheckNeeded,
    registerConnectionCheckCallback,
    startRequestTimeoutTimer,
};
