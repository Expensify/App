import _ from 'underscore';
import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import HttpUtils from './HttpUtils';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';

let isQueuePaused = false;

// Queue for network requests so we don't lose actions done by the user while offline
let networkRequestQueue = [];

// This is an optional function that this lib can be configured with (via registerParameterEnhancer())
// that accepts all request parameters and returns a new copy of them. This allows other code to inject
// parameters such as authTokens or CSRF tokens, etc.
let enhanceParameters;

// These handlers must be registered in order to process the response or network errors returned from the queue.
// The first argument passed will be the queuedRequest object and the second will be either the response or error.
let onResponse = () => {};
let onError = () => {};

// We subscribe to changes to the online/offline status of the network to determine when we should fire off API calls
// vs queueing them for later.
let isOffline;
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: val => isOffline = val && val.isOffline,
});

let didLoadPersistedRequests;
Onyx.connect({
    key: ONYXKEYS.NETWORK_REQUEST_QUEUE,
    callback: (persistedRequests) => {
        if (didLoadPersistedRequests || !persistedRequests) {
            return;
        }

        // Merge the persisted requests with the requests in memory then clear out the queue as we only need to load
        // this once when the app initializes
        networkRequestQueue = [...networkRequestQueue, ...persistedRequests];
        didLoadPersistedRequests = true;
        Onyx.set(ONYXKEYS.NETWORK_REQUEST_QUEUE, []);
    },
});

// Subscribe to the user's session so we can include their email in every request and include it in the server logs
let email;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: val => email = val ? val.email : null,
});

/**
 * Checks to see if a request can be made.
 *
 * @param {Object} request
 * @param {Object} request.data
 * @param {Boolean} request.data.forceNetworkRequest
 * @return {Boolean}
 */
function canMakeRequest(request) {
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
 * @param {Boolean} request.data.doNotRetry
 * @param {String} [request.data.returnValueList]
 * @return {Boolean}
 */
function canRetryRequest(request) {
    const doNotRetry = lodashGet(request, 'data.doNotRetry', false);
    const logParams = {command: request.command, doNotRetry, isQueuePaused};
    const returnValueList = lodashGet(request, 'data.returnValueList');
    if (returnValueList) {
        logParams.returnValueList = returnValueList;
    }

    if (doNotRetry) {
        console.debug('Skipping request that should not be re-tried: ', logParams);
    } else {
        console.debug('Skipping request and re-queueing: ', logParams);
    }

    return !doNotRetry;
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

        // If we have a request then we need to check if it can be persisted in case we close the tab while offline
        const retryableRequests = _.filter(networkRequestQueue, request => (
            !request.data.doNotRetry && request.data.persist
        ));
        Onyx.set(ONYXKEYS.NETWORK_REQUEST_QUEUE, retryableRequests);
        return;
    }

    // When the queue length is empty an early return is performed since nothing needs to be processed
    if (networkRequestQueue.length === 0) {
        return;
    }

    // Some requests should be retried and will end up here if the following conditions are met:
    // - the queue is paused
    // - the request does not have forceNetworkRequest === true
    // - the request does not have doNotRetry === true
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
        const requestEmail = requestData.email ?? '';

        // If we haven't passed an email in the request data, set it to the current user's email
        if (email && _.isEmpty(requestEmail)) {
            requestData.email = email;
        }

        const finalParameters = _.isFunction(enhanceParameters)
            ? enhanceParameters(queuedRequest.command, requestData)
            : requestData;

        // Check to see if the queue has paused again. It's possible that a call to enhanceParameters()
        // has paused the queue and if this is the case we must return. We don't retry these requests
        // since if a request is made without an authToken we sign out the user.
        if (!canMakeRequest(queuedRequest)) {
            return;
        }

        HttpUtils.xhr(queuedRequest.command, finalParameters, queuedRequest.type, queuedRequest.shouldUseSecure)
            .then(response => onResponse(queuedRequest, response))
            .catch(error => onError(queuedRequest, error));
    });

    // We clear the request queue at the end by setting the queue to retryableRequests which will either have some
    // requests we want to retry or an empty array
    networkRequestQueue = requestsToProcessOnNextRun;
}

// Process our write queue very often
setInterval(processNetworkRequestQueue, 1000);

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
        // Add the write request to a queue of actions to perform
        networkRequestQueue.push({
            command,
            data,
            type,
            resolve,
            reject,
            shouldUseSecure,
        });

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

/**
 * Register a method to call when the authToken expires
 * @param {Function} callback
 */
function registerResponseHandler(callback) {
    onResponse = callback;
}

/**
 * The error handler will handle fetch() errors. Not used for successful responses that might send expected error codes
 * e.g. jsonCode: 407.
 * @param {Function} callback
 */
function registerErrorHandler(callback) {
    onError = callback;
}

export {
    post,
    pauseRequestQueue,
    unpauseRequestQueue,
    registerParameterEnhancer,
    clearRequestQueue,
    registerResponseHandler,
    registerErrorHandler,
};
