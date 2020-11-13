import _ from 'underscore';
import Onyx from 'react-native-onyx';
import HttpUtils from './HttpUtils';
import NetworkConnection from './NetworkConnection';
import ONYXKEYS from '../ONYXKEYS';

let isQueuePaused = false;

// Queue for network requests so we don't lose actions done by the user while offline
let networkRequestQueue = [];

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
        // Two things will bring the app online again...
        // 1. Pusher reconnecting (see registerSocketEventCallback in this file)
        // 2. Getting a 200 response back from the API (happens right below)

        // Make a simple request every second to see if the API is online again
        HttpUtils.xhr('Get', {doNotRetry: true})
            .then(() => NetworkConnection.setOfflineStatus(false));
        return;
    }

    // Don't make any requests when the queue is paused
    if (isQueuePaused || networkRequestQueue.length === 0) {
        return;
    }

    _.each(networkRequestQueue, (queuedRequest) => {
        HttpUtils.xhr(queuedRequest.command, queuedRequest.data, queuedRequest.type)
            .then(queuedRequest.resolve)
            .catch(queuedRequest.reject);
    });

    networkRequestQueue = [];
}

// Process our write queue very often
setInterval(processNetworkRequestQueue, 1000);

/**
 * Adds a request to networkRequestQueue
 *
 * @param {string} command
 * @param {mixed} data
 * @param {string} type
 * @returns {Promise}
 */
function queueRequest(command, data, type) {
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
 * Perform a queued post request
 *
 * @param {string} command
 * @param {mixed} data
 * @param {string} type
 * @returns {Promise}
 */
function post(command, data, type) {
    return queueRequest(command, data, type);
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

export {
    post,
    pauseRequestQueue,
    unpauseRequestQueue,
    queueRequest,
};
