import _ from 'underscore';
import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import HttpUtils from './HttpUtils';
import ONYXKEYS from '../ONYXKEYS';
import * as ActiveClientManager from './ActiveClientManager';
import CONST from '../CONST';
import createCallback from './createCallback';
import * as NetworkRequestQueue from './actions/NetworkRequestQueue';

let isReady = false;
let isQueuePaused = false;

// Queue for network requests so we don't lose actions done by the user while offline
let networkRequestQueue = [];

// This is an optional function that this lib can be configured with (via registerParameterEnhancer())
// that accepts all request parameters and returns a new copy of them. This allows other code to inject
// parameters such as authTokens or CSRF tokens, etc.
let enhanceParameters;

// These handlers must be registered so we can process the request, response, and errors returned from the queue.
// The first argument passed will be the queuedRequest object and the second will be either the parameters, response, or error.
const [onRequest, registerRequestHandler] = createCallback();
const [onResponse, registerResponseHandler] = createCallback();
const [onError, registerErrorHandler] = createCallback();
const [onRequestSkipped, registerRequestSkippedHandler] = createCallback();

let didLoadPersistedRequests;
let isOffline;

const PROCESS_REQUEST_DELAY_MS = 1000;

/**
 * Process the offline NETWORK_REQUEST_QUEUE
 * @param {Array<Object> | null} persistedRequests - Requests
 */
function processOfflineQueue(persistedRequests) {
    // NETWORK_REQUEST_QUEUE is shared across clients, thus every client will have similiar copy of
    // NETWORK_REQUEST_QUEUE. It is very important to only process the queue from leader client
    // otherwise requests will be duplicated.
    // We only process the persisted requests when
    // a) Client is leader.
    // b) User is online.
    // c) requests are not already loaded,
    // d) When there is at least one request
    if (!ActiveClientManager.isClientTheLeader()
        || isOffline
        || didLoadPersistedRequests
        || !persistedRequests
        || !persistedRequests.length) {
        return;
    }

    // Queue processing expects handlers but due to we are loading the requests from Storage
    // we just noop them to ignore the errors.
    _.each(persistedRequests, (request) => {
        request.resolve = () => {};
        request.reject = () => {};
    });

    // Merge the persisted requests with the requests in memory then clear out the queue as we only need to load
    // this once when the app initializes
    networkRequestQueue = [...networkRequestQueue, ...persistedRequests];
    NetworkRequestQueue.clearPersistedRequests();
    didLoadPersistedRequests = true;
}

// We subscribe to changes to the online/offline status of the network to determine when we should fire off API calls
// vs queueing them for later.
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: (val) => {
        if (!val) {
            return;
        }

        // Client becomes online, process the queue.
        if (isOffline && !val.isOffline) {
            const connection = Onyx.connect({
                key: ONYXKEYS.NETWORK_REQUEST_QUEUE,
                callback: processOfflineQueue,
            });
            Onyx.disconnect(connection);
        }
        isOffline = val.isOffline;
    },
});

// Subscribe to NETWORK_REQUEST_QUEUE queue as soon as Client is ready
ActiveClientManager.isReady().then(() => {
    Onyx.connect({
        key: ONYXKEYS.NETWORK_REQUEST_QUEUE,
        callback: processOfflineQueue,
    });
});

// Subscribe to the user's session so we can include their email in every request and include it in the server logs
let email;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: val => email = val ? val.email : null,
});

/**
 * @param {Boolean} val
 */
function setIsReady(val) {
    isReady = val;
}

/**
 * Checks to see if a request can be made.
 *
 * @param {Object} request
 * @param {String} request.type
 * @param {String} request.command
 * @param {Object} request.data
 * @param {Boolean} request.data.forceNetworkRequest
 * @return {Boolean}
 */
function canMakeRequest(request) {
    if (!isReady) {
        onRequestSkipped({command: request.command, type: request.type});
        return false;
    }

    // These requests are always made even when the queue is paused
    if (request.data.forceNetworkRequest === true) {
        return true;
    }

    // If the queue is paused we will not make the request right now
    return !isQueuePaused;
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
    const logParams = {command: request.command, shouldRetry, isQueuePaused};
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

        const requestData = queuedRequest.data;
        const requestEmail = lodashGet(requestData, 'email', '');

        // If we haven't passed an email in the request data, set it to the current user's email
        if (email && _.isEmpty(requestEmail)) {
            requestData.email = email;
        }

        const finalParameters = _.isFunction(enhanceParameters)
            ? enhanceParameters(queuedRequest.command, requestData)
            : requestData;

        onRequest(queuedRequest, finalParameters);
        HttpUtils.xhr(queuedRequest.command, finalParameters, queuedRequest.type, queuedRequest.shouldUseSecure)
            .then(response => onResponse(queuedRequest, response))
            .catch((error) => {
                // When the request did not reach its destination add it back the queue to be retried
                const shouldRetry = lodashGet(queuedRequest, 'data.shouldRetry');
                if (shouldRetry) {
                    networkRequestQueue.push(queuedRequest);
                    return;
                }

                onError(queuedRequest, error);
            });
    });

    // We should clear the NETWORK_REQUEST_QUEUE when we have loaded the persisted requests & they are processed.
    // As multiple client will be sharing the same Queue and NETWORK_REQUEST_QUEUE is synchronized among clients,
    // we only ask Leader client to clear the queue
    if (ActiveClientManager.isClientTheLeader() && didLoadPersistedRequests) {
        NetworkRequestQueue.clearPersistedRequests();
    }

    // User could have bad connectivity and he can go offline multiple times
    // thus we allow NETWORK_REQUEST_QUEUE to be processed multiple times but only after we have processed
    // old requests in the NETWORK_REQUEST_QUEUE
    didLoadPersistedRequests = false;

    // We clear the request queue at the end by setting the queue to retryableRequests which will either have some
    // requests we want to retry or an empty array
    networkRequestQueue = requestsToProcessOnNextRun;
}

// Process our write queue very often
setInterval(processNetworkRequestQueue, PROCESS_REQUEST_DELAY_MS);

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

        // All requests should be retried by default
        if (_.isUndefined(request.data.shouldRetry)) {
            request.data.shouldRetry = true;
        }

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
 * Prevent the network queue from being processed
 */
function pauseRequestQueue() {
    isQueuePaused = true;
}

/**
 * Allow the network queue to continue to be processed
 */
function unpauseRequestQueue() {
    isQueuePaused = false;
}

/**
 * Register a function that will accept all the parameters being sent in a request
 * and will return a new set of parameters to send instead. Useful for adding data to every request
 * like auth or CRSF tokens.
 *
 * @param {Function} callback
 */
function registerParameterEnhancer(callback) {
    enhanceParameters = callback;
}

/**
 * Clear the queue so all pending requests will be cancelled
 */
function clearRequestQueue() {
    networkRequestQueue = [];
}

export {
    post,
    pauseRequestQueue,
    PROCESS_REQUEST_DELAY_MS,
    unpauseRequestQueue,
    registerParameterEnhancer,
    clearRequestQueue,
    registerResponseHandler,
    registerErrorHandler,
    registerRequestHandler,
    setIsReady,
    registerRequestSkippedHandler,
};
