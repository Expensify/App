import _ from 'underscore';
import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import HttpUtils from '../HttpUtils';
import ONYXKEYS from '../../ONYXKEYS';
import * as ActiveClientManager from '../ActiveClientManager';
import CONST from '../../CONST';
import createCallback from '../createCallback';
import * as NetworkRequestQueue from '../actions/NetworkRequestQueue';
import * as NetworkStore from './NetworkStore';
import enhanceParameters from './enhanceParameters';

let isOffline = false;
let persistedRequestsQueueRunning = false;

// Queue for network requests so we don't lose actions done by the user while offline
let networkRequestQueue = [];

// These handlers must be registered so we can process the request, response, and errors returned from the queue.
// The first argument passed will be the queuedRequest object and the second will be either the parameters, response, or error.
const [onRequest, registerRequestHandler] = createCallback();
const [onResponse, registerResponseHandler] = createCallback();
const [onError, registerErrorHandler] = createCallback();
const [onRequestSkipped, registerRequestSkippedHandler] = createCallback();
const [getLogger, registerLogHandler] = createCallback();
const [recheckConnectivity, registerConnectionCheckCallback] = createCallback();

/**
 * @param {Object} request
 * @param {String} request.command
 * @param {Object} request.data
 * @param {String} request.type
 * @param {Boolean} request.shouldUseSecure
 * @returns {Promise}
 */
function processRequest(request) {
    const finalParameters = enhanceParameters(request.command, request.data);

    // If request is still in processing after this time, we might be offline
    const timerId = setTimeout(recheckConnectivity, CONST.NETWORK.MAX_PENDING_TIME_MS);

    onRequest(request, finalParameters);
    return HttpUtils.xhr(request.command, finalParameters, request.type, request.shouldUseSecure)
        .finally(() => clearTimeout(timerId));
}

/**
 * This method will get any persisted requests and fire them off in parallel to retry them.
 * If we get any jsonCode besides 407 the request is a success. It doesn't make sense to
 * continually retry things that have returned a response. However, we can retry any requests
 * with known networking errors like "Failed to fetch".
 *
 * @returns {Promise}
 */
function processPersistedRequestsQueue() {
    const persistedRequests = NetworkRequestQueue.getPersistedRequests();

    // This sanity check is also a recursion exit point
    if (isOffline || _.isEmpty(persistedRequests)) {
        return Promise.resolve();
    }

    const tasks = _.map(persistedRequests, request => processRequest(request)
        .then((response) => {
            if (response.jsonCode === CONST.JSON_CODE.NOT_AUTHENTICATED) {
                getLogger().info('Persisted optimistic request needs authentication');
            } else {
                getLogger().info('Persisted optimistic request returned a valid jsonCode. Not retrying.');
            }
            onResponse(request, response);
            NetworkRequestQueue.removeRetryableRequest(request);
        })
        .catch((error) => {
            // If we are catching a known network error like "Failed to fetch" allow this request to be retried if we have retries left
            if (error.message === CONST.ERROR.FAILED_TO_FETCH) {
                const retryCount = NetworkRequestQueue.incrementRetries(request);
                getLogger().info('Persisted request failed', false, {retryCount, command: request.command, error: error.message});
                if (retryCount >= CONST.NETWORK.MAX_REQUEST_RETRIES) {
                    getLogger().info('Request failed too many times removing from storage', false, {retryCount, command: request.command, error: error.message});
                    NetworkRequestQueue.removeRetryableRequest(request);
                }
            } else if (error.name === CONST.ERROR.REQUEST_CANCELLED) {
                getLogger().info('Persisted request was cancelled. Not retrying.');
                onError(request);
                NetworkRequestQueue.removeRetryableRequest(request);
            } else {
                getLogger().alert(`${CONST.ERROR.ENSURE_BUGBOT} unknown error while retrying persisted request. Not retrying.`, {
                    command: request.command,
                    error: error.message,
                });
                NetworkRequestQueue.removeRetryableRequest(request);
            }
        }));

    // Do a recursive call in case the queue is not empty after processing the current batch
    return Promise.all(tasks)
        .then(processPersistedRequestsQueue);
}

function flushPersistedRequestsQueue() {
    if (persistedRequestsQueueRunning) {
        return;
    }

    // NETWORK_REQUEST_QUEUE is shared across clients, thus every client/tab will have a copy
    // It is very important to only process the queue from leader client otherwise requests will be duplicated.
    if (!ActiveClientManager.isClientTheLeader()) {
        return;
    }

    persistedRequestsQueueRunning = true;

    // Ensure persistedRequests are read from storage before proceeding with the queue
    const connectionId = Onyx.connect({
        key: ONYXKEYS.NETWORK_REQUEST_QUEUE,
        callback: () => {
            Onyx.disconnect(connectionId);
            processPersistedRequestsQueue()
                .finally(() => persistedRequestsQueueRunning = false);
        },
    });
}

// We subscribe to the online/offline status of the network to determine when we should fire off API calls
// vs queueing them for later.
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: (network) => {
        if (!network) {
            return;
        }

        // Client becomes online, process the queue.
        if (isOffline && !network.isOffline) {
            flushPersistedRequestsQueue();
        }

        isOffline = network.isOffline;
    },
});

/**
 * Checks to see if a request can be made.
 *
 * @param {Object} request
 * @param {String} request.type
 * @param {String} request.command
 * @param {Object} [request.data]
 * @param {Boolean} request.data.forceNetworkRequest
 * @return {Boolean}
 */
function canMakeRequest(request) {
    if (!NetworkStore.isReady()) {
        onRequestSkipped({command: request.command, type: request.type});
        return false;
    }

    // These requests are always made even when the queue is paused
    if (request.data.forceNetworkRequest === true) {
        return true;
    }

    // If we are authenticating we will not make the request right now
    return !NetworkStore.isAuthenticating();
}

/**
 * Checks to see if a request should be retried when the queue is "paused" and logs the command name + returnValueList
 * to give us some limited debugging info. We don't want to log the entire request since this could lead to
 * unintentional sharing of sensitive information.
 *
 * @param {Object} request
 * @param {String} request.command
 * @param {Object} request.data
 * @param {Boolean} request.data.shouldRetry
 * @param {String} [request.data.returnValueList]
 * @return {Boolean}
 */
function canRetryRequest(request) {
    const shouldRetry = lodashGet(request, 'data.shouldRetry');
    const logParams = {command: request.command, shouldRetry, isAuthenticating: NetworkStore.isAuthenticating()};
    const returnValueList = lodashGet(request, 'data.returnValueList');
    if (returnValueList) {
        logParams.returnValueList = returnValueList;
    }

    if (!shouldRetry) {
        console.debug('Skipping request that should not be re-tried: ', logParams);
    } else {
        console.debug('Skipping request and re-queueing: ', logParams);
    }

    return shouldRetry;
}

/**
 * Process the networkRequestQueue by looping through the queue and attempting to make the requests
 */
function processNetworkRequestQueue() {
    // NetInfo tells us whether the app is offline
    if (isOffline) {
        if (!networkRequestQueue.length) {
            return;
        }
        const retryableRequests = [];

        // If we have a request then we need to check if it can be persisted in case we close the tab while offline.
        // We filter persisted requests from the normal Queue to remove duplicates
        networkRequestQueue = _.reject(networkRequestQueue, (request) => {
            const shouldRetry = lodashGet(request, 'data.shouldRetry');
            if (shouldRetry && request.data.persist) {
                // exclude functions as they cannot be persisted
                const requestToPersist = _.omit(request, val => _.isFunction(val));
                retryableRequests.push(requestToPersist);
                return true;
            }
        });
        if (retryableRequests.length) {
            NetworkRequestQueue.saveRetryableRequests(retryableRequests);
        }
        return;
    }

    // When the queue length is empty an early return is performed since nothing needs to be processed
    if (networkRequestQueue.length === 0) {
        return;
    }

    // Some requests should be retried and will end up here if the following conditions are met:
    // - the queue is paused
    // - the request does not have forceNetworkRequest === true
    // - the request does not have shouldRetry === false
    const requestsToProcessOnNextRun = [];

    _.each(networkRequestQueue, (queuedRequest) => {
        // Some requests must be allowed to run even when the queue is paused e.g. an authentication request
        // that pauses the network queue while authentication happens, then unpauses it when it's done.
        if (!canMakeRequest(queuedRequest)) {
            if (canRetryRequest(queuedRequest)) {
                requestsToProcessOnNextRun.push(queuedRequest);
            }
            return;
        }

        processRequest(queuedRequest)
            .then(response => onResponse(queuedRequest, response))
            .catch((error) => {
                // Cancelled requests should not be retried
                if (error.name === CONST.ERROR.REQUEST_CANCELLED) {
                    onError(queuedRequest, error);
                    return;
                }

                recheckConnectivity();

                // Retry and request that returns a "Failed to fetch" error. Very common if a user is offline or experiencing an unlikely scenario.
                if (error.message === CONST.ERROR.FAILED_TO_FETCH) {
                    // When the request did not reach its destination add it back the queue to be retried if we can
                    const shouldRetry = lodashGet(queuedRequest, 'data.shouldRetry');
                    if (shouldRetry) {
                        const retryCount = NetworkRequestQueue.incrementRetries(queuedRequest);
                        getLogger().info('A retryable request failed', false, {
                            retryCount,
                            command: queuedRequest.command,
                            error: error.message,
                        });

                        if (retryCount < CONST.NETWORK.MAX_REQUEST_RETRIES) {
                            networkRequestQueue.push(queuedRequest);
                            return;
                        }

                        getLogger().info('Request was retried too many times with no success. No more retries left');
                    }

                    onError(queuedRequest, error);
                } else {
                    getLogger().alert(`${CONST.ERROR.ENSURE_BUGBOT} unknown error caught while processing request`, {
                        command: queuedRequest.command,
                        error: error.message,
                    });
                }
            });
    });

    // We clear the request queue at the end by setting the queue to retryableRequests which will either have some
    // requests we want to retry or an empty array
    networkRequestQueue = requestsToProcessOnNextRun;
}

function startDefaultQueue() {
    setInterval(processNetworkRequestQueue, CONST.NETWORK.PROCESS_REQUEST_DELAY_MS);
}

// Post any pending request after we launch the app
ActiveClientManager.isReady().then(() => {
    flushPersistedRequestsQueue();
    startDefaultQueue();
});

/**
 * @param {Object} request
 * @returns {Boolean}
 */
function canProcessRequestImmediately(request) {
    return lodashGet(request, 'data.shouldProcessImmediately', true);
}

/**
 * Perform a queued post request
 *
 * @param {String} command
 * @param {*} [data]
 * @param {String} [type]
 * @param {Boolean} shouldUseSecure - Whether we should use the secure API
 * @returns {Promise}
 */
function post(command, data = {}, type = CONST.NETWORK.METHOD.POST, shouldUseSecure = false) {
    return new Promise((resolve, reject) => {
        const request = {
            command,
            data,
            type,
            resolve,
            reject,
            shouldUseSecure,
        };

        // By default, request are retry-able and cancellable
        // (e.g. any requests currently happening when the user logs out are cancelled)
        request.data = {
            ...data,
            shouldRetry: lodashGet(data, 'shouldRetry', true),
            canCancel: lodashGet(data, 'canCancel', true),
        };

        // Add the request to a queue of actions to perform
        networkRequestQueue.push(request);

        if (!canProcessRequestImmediately(request)) {
            return;
        }

        // Try to fire off the request as soon as it's queued so we don't add a delay to every queued command
        processNetworkRequestQueue();
    });
}

/**
 * Clear the queue and cancels all pending requests
 * Non-cancellable requests like Log would not be cleared
 */
function clearRequestQueue() {
    networkRequestQueue = _.filter(networkRequestQueue, request => !request.data.canCancel);
    HttpUtils.cancelPendingRequests();
}

export {
    post,
    clearRequestQueue,
    registerResponseHandler,
    registerErrorHandler,
    registerRequestHandler,
    registerRequestSkippedHandler,
    registerLogHandler,
    registerConnectionCheckCallback,
};
