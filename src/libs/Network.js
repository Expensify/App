import _ from 'underscore';
import lodashGet from 'lodash.get';
import Onyx from 'react-native-onyx';
import HttpUtils from './HttpUtils';
import ONYXKEYS from '../ONYXKEYS';

let isQueuePaused = false;

// Queue for network requests so we don't lose actions done by the user while offline
let networkRequestQueue = [];

// This is an optional function that this lib can be configured with (via registerParameterEnhancer())
// that accepts all request parameters and returns a new copy of them. This allows other code to inject
// parameters such as authTokens or CSRF tokens, etc.
let enhanceParameters;

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
        Onyx.set(ONYXKEYS.NETWORK_REQUEST_QUEUE, []);
        didLoadPersistedRequests = true;
    },
});

// Subscribe to the user's session so we can include their email in every request and include it in the server logs
let email;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: val => email = val ? val.email : null,
});

/**
 * Checks to see if a request should be made.
 *
 * @param {Object} request
 * @param {Object} request.data
 * @param {Boolean} request.data.forceNetworkRequest
 * @return {Boolean}
 */
function shouldMakeRequest(request) {
    // These requests are always made even when the queue is paused
    if (request.data.forceNetworkRequest === true) {
        return true;
    }

    if (isQueuePaused) {
        return false;
    }

    return true;
}

/**
 * Checks to see if a request should be retried when the queue is "paused".
 *
 * @param {Object} request
 * @param {String} request.command
 * @param {Object} request.data
 * @param {Boolean} request.data.doNotRetry
 * @param {String} [request.data.returnValueList]
 * @return {Boolean}
 */
function shouldRetryRequest(request) {
    const doNotRetry = lodashGet(request, 'data.doNotRetry', false);
    const logParams = {command: request.command, doNotRetry, isQueuePaused};
    const returnValueList = lodashGet(request, 'data.returnValueList');
    if (returnValueList) {
        logParams.returnValueList = returnValueList;
    }

    if (doNotRetry) {
        console.debug('Skipping request that should not be re-tried: ', logParams);
        return false;
    }

    console.debug('Skipping request and re-queueing: ', logParams);
    return true;
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

    // If a request can't run because the queue is paused then it should end up here so it can be retried.
    const retryableRequests = [];

    _.each(networkRequestQueue, (queuedRequest) => {
        // Some requests must be allowed to run even when the queue is paused e.g. an authentication request
        // that pauses the network queue while authentication happens, then unpauses it when it's done.
        if (!shouldMakeRequest(queuedRequest)) {
            if (shouldRetryRequest(queuedRequest)) {
                retryableRequests.push(queuedRequest);
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
        if (!shouldMakeRequest(queuedRequest)) {
            return;
        }

        HttpUtils.xhr(queuedRequest.command, finalParameters, queuedRequest.type)
            .then(queuedRequest.resolve)
            .catch(queuedRequest.reject);
    });

    // We clear the request queue at the end by setting the queue to retryableRequests which will either have some
    // requests we want to retry or an empty array
    networkRequestQueue = retryableRequests;
}

// Process our write queue very often
setInterval(processNetworkRequestQueue, 1000);

/**
 * Perform a queued post request
 *
 * @param {String} command
 * @param {*} data
 * @param {String} type
 * @returns {Promise}
 */
function post(command, data, type) {
    return new Promise((resolve, reject) => {
        // Add the write request to a queue of actions to perform
        networkRequestQueue.push({
            command,
            data,
            type,
            resolve,
            reject,
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

export {
    post,
    pauseRequestQueue,
    unpauseRequestQueue,
    registerParameterEnhancer,
    clearRequestQueue,
};
