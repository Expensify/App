import _ from 'underscore';
import * as NetworkStore from './NetworkStore';
import * as SequentialQueue from './SequentialQueue';
import HttpUtils from '../HttpUtils';
import * as Request from '../Request';

// Queue for network requests so we don't lose actions done by the user while offline
let networkRequestQueue = [];

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
    // Some requests are always made even when we are in the process of authenticating (typically because they require no authToken e.g. Log, GetAccountStatus)
    // However, if we are in the process of authenticating we always want to queue requests until we are no longer authenticating.
    return request.data.forceNetworkRequest === true || (!NetworkStore.isAuthenticating() && !SequentialQueue.isRunning());
}

/**
 * @param {Object} request
 */
function push(request) {
    networkRequestQueue.push(request);
}

/**
 * @param {Object} request
 */
function replay(request) {
    push(request);

    // eslint-disable-next-line no-use-before-define
    process();
}

/**
 * Process the networkRequestQueue by looping through the queue and attempting to make the requests
 */
function process() {
    if (NetworkStore.isOffline()) {
        return;
    }

    // When the queue length is empty an early return is performed since nothing needs to be processed
    if (networkRequestQueue.length === 0) {
        return;
    }

    // Some requests should be retried and will end up here if the following conditions are met:
    // - we are in the process of authenticating and must wait until we are no longer authenticating
    // - the request does not have forceNetworkRequest === true (this will trigger it to process immediately)
    const requestsToProcessOnNextRun = [];

    _.each(networkRequestQueue, (queuedRequest) => {
        // Save request for the next run if we can't make it yet
        if (!canMakeRequest(queuedRequest)) {
            requestsToProcessOnNextRun.push(queuedRequest);
            return;
        }

        Request.processWithMiddleware(queuedRequest);
    });

    // We clear the request queue at the end by setting the queue to requestsToProcessOnNextRun which will either have some
    // requests we want to retry or an empty array
    networkRequestQueue = requestsToProcessOnNextRun;
}

/**
 * Clear the queue and cancels all pending requests
 * Non-cancellable requests like Log would not be cleared
 */
function clear() {
    networkRequestQueue = _.filter(networkRequestQueue, request => !request.data.canCancel);
    HttpUtils.cancelPendingRequests();
}

export {
    clear,
    replay,
    push,
    process,
};
