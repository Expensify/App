import _ from 'underscore';
import Onyx from 'react-native-onyx';
import HttpUtils from './HttpUtils';
import NetworkConnection from './NetworkConnection';
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

/**
 * Process the networkRequestQueue by looping through the queue and attempting to make the requests
 */
function processNetworkRequestQueue() {
    if (isOffline) {
        // Several things will bring the app online again...
        // 1. Pusher reconnecting (see registerSocketEventCallback in this file)
        // 2. Getting a 200 response back from the API (happens right below)
        // 3. NetInfo triggering an event that the network is back online

        // Make a simple request every second to see if the API is online again
        HttpUtils.xhr('Get', {doNotRetry: true})
            .then(() => NetworkConnection.setOfflineStatus(false));
        return;
    }

    // When the queue length is empty an early return is performed since nothing needs to be processed
    if (networkRequestQueue.length === 0) {
        return;
    }

    _.each(networkRequestQueue, (queuedRequest) => {
        // Some requests must be allowed to run even when the queue is paused e.g. an authentication request
        // that pauses the network queue while authentication happens, then unpauses it when it's done.
        if (isQueuePaused && queuedRequest.data.forceNetworkRequest !== true) {
            return;
        }

        const finalParameters = _.isFunction(enhanceParameters)
            ? enhanceParameters(queuedRequest.command, queuedRequest.data)
            : queuedRequest.data;

        // Check to see if the queue has paused again. It's possible that a call to enhanceParameters()
        // has paused the queue and if this is the case we must return.
        if (isQueuePaused && queuedRequest.data.forceNetworkRequest !== true) {
            return;
        }

        HttpUtils.xhr(queuedRequest.command, finalParameters, queuedRequest.type)
            .then(queuedRequest.resolve)
            .catch(queuedRequest.reject);
    });

    networkRequestQueue = [];
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
