import _ from 'underscore';
import lodashGet from 'lodash/get';
import HttpUtils from '../HttpUtils';
import * as ActiveClientManager from '../ActiveClientManager';
import CONST from '../../CONST';
import * as PersistedRequests from '../actions/PersistedRequests';
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
    // We must attempt to read authToken and credentials from storage before allowing any requests to happen so that any requests that
    // require authToken or trigger reauthentication will succeed.
    if (!NetworkStore.hasReadRequiredDataFromStorage()) {
        return false;
    }

    // Some requests are always made even when we are in the process of authenticating (typically because they require no authToken e.g. Log, GetAccountStatus)
    // However, if we are in the process of authenticating we always want to queue requests until we are no longer authenticating and will also want to queue
    // any requests while the sync queue is running.
    return request.data.forceNetworkRequest === true || (!NetworkStore.getIsAuthenticating() && !PersistedRequestsQueue.isRunning());
}

/**
 * Process the networkRequestQueue by looping through the queue and attempting to make the requests
 */
function processNetworkRequestQueue() {
    // We're offline nothing to do here until we're back online
    if (NetworkStore.getIsOffline()) {
        return;
    }

    // When the queue length is empty an early return is performed since nothing needs to be processed
    if (networkRequestQueue.length === 0) {
        return;
    }

    // Some requests should be retried and will end up here if the following conditions are met:
    // - we are in the process of authenticating and the request is retryable (most are)
    // - the request does not have forceNetworkRequest === true (this will trigger it to process immediately)
    const requestsToProcessOnNextRun = [];

    _.each(networkRequestQueue, (queuedRequest) => {
        // Check if we can make this request at all and if we can't see if we should save it for the next run or chuck it into the ether
        if (!canMakeRequest(queuedRequest)) {
            requestsToProcessOnNextRun.push(queuedRequest);
            return;
        }

        processRequest(queuedRequest)
            .catch((error) => {
                // Because we ran into an error we assume we might be offline and do a "connection" health test
                NetworkEvents.triggerRecheckNeeded();

                const persist = lodashGet(queuedRequest, 'data.persist');
                if (persist) {
                    // This request should alread be in our sync queue so there's nothing else to do here. We might have gotten here because we
                    // - Made a request while online
                    // - Failed to fetch error occurred because we went offline while the request was in progress
                    // - Failed to fetch error occurred because Expensify service interruption
                    //
                    // We'll retry this request when we are back online, but can also schedule a retry in case there was an Expensify service interruption
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
            shouldUseSecure,
        };

        // By default, request are retry-able and cancellable
        // (e.g. any requests currently happening when the user logs out are cancelled)
        request.data = {
            ...data,
            canCancel: lodashGet(data, 'canCancel', true),
        };

        const persist = lodashGet(data, 'persist', false);

        // All requests that should be persisted must be saved immediately whether they are run now or when we are back from offline.
        // If the user closes their browser or the app crashes before a response is recieved then the request will be saved and retried later.
        if (persist) {
            PersistedRequests.save([request]);
        }

        // We're offline. If this request cannot be persisted then we need to return a response so the front end can handle this situation.
        // In reality, for any blocking pessimistic requests we should not be able to make them at all so we will also log here when it happens
        // as it may indicate an issue with our UX. We also return a specific jsonCode so at a minimum this situation is not handled as a "success"
        if (!persist && NetworkStore.getIsOffline()) {
            return;
        }

        request.resolve = resolve;
        request.reject = reject;

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
