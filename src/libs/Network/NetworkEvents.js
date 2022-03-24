import createCallback from '../createCallback';

const [getLogger, registerLogHandler] = createCallback();
const [triggerConnectivityResumed, onConnectivityResumed] = createCallback();
const [onRequest, registerRequestHandler] = createCallback();
const [onResponse, registerResponseHandler] = createCallback();
const [onError, registerErrorHandler] = createCallback();
const [triggerRecheckNeeded, registerConnectionCheckCallback] = createCallback();
const [onRequestSkipped, registerRequestSkippedHandler] = createCallback();

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
    registerRequestSkippedHandler,
    onRequestSkipped,
};
