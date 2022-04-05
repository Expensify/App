import _ from 'underscore';
import lodashGet from 'lodash/get';
import HttpUtils from '../HttpUtils';
import * as ActiveClientManager from '../ActiveClientManager';
import CONST from '../../CONST';
import * as PersistedRequests from '../actions/PersistedRequests';
import RetryCounter from '../RetryCounter';
import * as NetworkStore from './NetworkStore';
import * as NetworkEvents from './NetworkEvents';
import * as PersistedRequestsQueue from './PersistedRequestsQueue';
import processRequest from './processRequest';

// Queue for network requests so we don't lose actions done by the user while offline
let networkRequestQueue = [];

// Keep track of retries for any non-persisted requests
const mainQueueRetryCounter = new RetryCounter();

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
    // We must attempt to read authToken and credentials from storage before allowing any requests to happen so that any requests that
    // require authToken or trigger reauthentication will succeed.
    if (!NetworkStore.hasReadRequiredDataFromStorage()) {
        return false;
    }

    // Some requests are always made even when we are in the process of authenticating (typically because they require no authToken e.g. Log, GetAccountStatus)
    // However, if we are in the process of authenticating we always want to queue requests until we are no longer authenticating.
    return request.data.forceNetworkRequest === true || !NetworkStore.getIsAuthenticating();
}

/**
 * @param {Object} queuedRequest
 * @param {*} error
 * @returns {Boolean} true if we were able to retry
 */
function retryFailedRequest(queuedRequest, error) {
    // When the request did not reach its destination add it back the queue to be retried if we can
    const shouldRetry = lodashGet(queuedRequest, 'data.shouldRetry');
    if (!shouldRetry) {
        return false;
    }

    const retryCount = mainQueueRetryCounter.incrementRetries(queuedRequest);
    NetworkEvents.getLogger().info('[Network] A retryable request failed', false, {
        retryCount,
        command: queuedRequest.command,
        error: error.message,
    });

    if (retryCount < CONST.NETWORK.MAX_REQUEST_RETRIES) {
        networkRequestQueue.push(queuedRequest);
        return true;
    }

    NetworkEvents.getLogger().info('[Network] Request was retried too many times with no success. No more retries left');
    return false;
}

/**
 * While we are offline any requests that can be persisted are removed from the main network request queue and moved to a separate map + saved to storage.
 */
function removeAllPersistableRequestsFromMainQueue() {
    // We filter persisted requests from the normal queue so they can be processed separately
    const [networkRequestQueueWithoutPersistedRequests, requestsToPersist] = _.partition(networkRequestQueue, (request) => {
        const shouldRetry = lodashGet(request, 'data.shouldRetry');
        const shouldPersist = lodashGet(request, 'data.persist');
        return !shouldRetry || !shouldPersist;
    });

    networkRequestQueue = networkRequestQueueWithoutPersistedRequests;

    if (!requestsToPersist.length) {
        return;
    }

    // Remove any functions as they are not serializable and cannot be stored to disk
    const requestsToPersistWithoutFunctions = _.map(requestsToPersist, request => _.omit(request, val => _.isFunction(val)));
    PersistedRequests.save(requestsToPersistWithoutFunctions);
}

/**
 * Process the networkRequestQueue by looping through the queue and attempting to make the requests
 */
function processNetworkRequestQueue() {
    if (NetworkStore.getIsOffline()) {
        if (!networkRequestQueue.length) {
            return;
        }

        removeAllPersistableRequestsFromMainQueue();
        return;
    }

    // When the queue length is empty an early return is performed since nothing needs to be processed
    if (networkRequestQueue.length === 0) {
        return;
    }

    // Some requests should be retried and will end up here if the following conditions are met:
    // - we are in the process of authenticating and the request is retryable (most are)
    // - the request does not have forceNetworkRequest === true (this will trigger it to process immediately)
    // - the request does not have shouldRetry === false (specified when we do not want to retry, defaults to true)
    const requestsToProcessOnNextRun = [];

    _.each(networkRequestQueue, (queuedRequest) => {
        // Check if we can make this request at all and if we can't see if we should save it for the next run or chuck it into the ether
        if (!canMakeRequest(queuedRequest)) {
            const shouldRetry = lodashGet(queuedRequest, 'data.shouldRetry');
            if (shouldRetry) {
                requestsToProcessOnNextRun.push(queuedRequest);
            } else {
                console.debug('Skipping request that should not be re-tried: ', {command: queuedRequest.command});
            }
            return;
        }

        processRequest(queuedRequest)
            .catch((error) => {
                // Because we ran into an error we assume we might be offline and do a "connection" health test
                NetworkEvents.triggerRecheckNeeded();
                if (retryFailedRequest(queuedRequest, error)) {
                    return;
                }

                if (queuedRequest.command !== 'Log') {
                    NetworkEvents.getLogger().hmmm('[Network] Handled error when making request', error);
                } else {
                    console.debug('[Network] There was an error in the Log API command, unable to log to server!', error);
                }

                queuedRequest.reject(new Error(CONST.ERROR.API_OFFLINE));
            });
    });

    // We clear the request queue at the end by setting the queue to requestsToProcessOnNextRun which will either have some
    // requests we want to retry or an empty array
    networkRequestQueue = requestsToProcessOnNextRun;
}

// We must wait until the ActiveClientManager is ready so that we ensure only the "leader" tab processes any persisted requests
ActiveClientManager.isReady().then(() => {
    PersistedRequestsQueue.flush();

    // Start main queue and process once every n ms delay
    setInterval(processNetworkRequestQueue, CONST.NETWORK.PROCESS_REQUEST_DELAY_MS);
});

/**
 * Perform a queued post request
 *
 * @param {String} command
 * @param {*} [data]
 * @param {String} [type]
 * @param {Boolean} [shouldUseSecure] - Whether we should use the secure API
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

        // This check is mainly used to prevent API commands from triggering calls to processNetworkRequestQueue from inside the context of a previous
        // call to processNetworkRequestQueue() e.g. calling a Log command without this would cause the requests in networkRequestQueue to double process
        // since we call Log inside processNetworkRequestQueue().
        const shouldProcessImmediately = lodashGet(request, 'data.shouldProcessImmediately', true);
        if (!shouldProcessImmediately) {
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
