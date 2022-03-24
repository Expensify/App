import _ from 'underscore';
import lodashGet from 'lodash/get';
import HttpUtils from '../HttpUtils';
import * as ActiveClientManager from '../ActiveClientManager';
import CONST from '../../CONST';
import * as NetworkRequestQueue from '../actions/NetworkRequestQueue';
import * as NetworkStore from './NetworkStore';
import * as NetworkEvents from './NetworkEvents';
import * as PersistedRequestsQueue from './PersistedRequestsQueue';
import processRequest from './processRequest';

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
    if (!NetworkStore.isReady()) {
        NetworkEvents.onRequestSkipped({command: request.command, type: request.type});
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
    if (NetworkStore.getIsOffline()) {
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
            .then(response => NetworkEvents.onResponse(queuedRequest, response))
            .catch((error) => {
                // Cancelled requests should not be retried
                if (error.name === CONST.ERROR.REQUEST_CANCELLED) {
                    NetworkEvents.onError(queuedRequest, error);
                    return;
                }

                NetworkEvents.triggerRecheckNeeded();

                // Retry and request that returns a "Failed to fetch" error. Very common if a user is offline or experiencing an unlikely scenario.
                if (error.message === CONST.ERROR.FAILED_TO_FETCH) {
                    // When the request did not reach its destination add it back the queue to be retried if we can
                    const shouldRetry = lodashGet(queuedRequest, 'data.shouldRetry');
                    if (shouldRetry) {
                        const retryCount = NetworkRequestQueue.incrementRetries(queuedRequest);
                        NetworkEvents.getLogger().info('A retryable request failed', false, {
                            retryCount,
                            command: queuedRequest.command,
                            error: error.message,
                        });

                        if (retryCount < CONST.NETWORK.MAX_REQUEST_RETRIES) {
                            networkRequestQueue.push(queuedRequest);
                            return;
                        }

                        NetworkEvents.getLogger().info('Request was retried too many times with no success. No more retries left');
                    }

                    NetworkEvents.onError(queuedRequest, error);
                } else {
                    NetworkEvents.getLogger().alert(`${CONST.ERROR.ENSURE_BUGBOT} unknown error caught while processing request`, {
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
    PersistedRequestsQueue.flush();
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
};
