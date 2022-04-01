import _ from 'underscore';
import CONST from '../../CONST';
import * as NetworkEvents from './NetworkEvents';
import * as NetworkStore from './NetworkStore';
import processRequest from './processRequest';
import * as SyncQueue from './SyncQueue';

let mainQueue = [];

/**
 * @param {Object} request
 */
function push(request) {
    mainQueue.push(request);
}

function clear() {
    mainQueue = _.filter(mainQueue, request => !request.data.canCancel);
}

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
    if (request.data.forceNetworkRequest === true) {
        return true;
    }

    // Requests require a Pusher subscription should be queued until we have one
    if (!NetworkStore.isPusherSubscribed()) {
        return false;
    }

    // However, if we are in the process of authenticating we always want to queue requests until we are no longer authenticating and will also want to queue
    // any requests while the sync queue is running.
    return !NetworkStore.getIsAuthenticating() && !SyncQueue.isRunning();
}

/**
 * Process the mainQueue by looping through the queue and attempting to make the requests
 */
function process() {
    // We're offline. Nothing to do here until we're back online
    if (NetworkStore.getIsOffline()) {
        return;
    }

    // When the queue length is empty an early return is performed since nothing needs to be processed
    if (mainQueue.length === 0) {
        return;
    }

    // Some requests should be retried and will end up here if the following conditions are met:
    // - we are in the process of authenticating
    // - the sync queue is running and we must wait for it to finish
    // - the request does not have forceNetworkRequest === true (as this will trigger it to process immediately)
    const requestsToProcessOnNextRun = [];

    _.each(mainQueue, (queuedRequest) => {
        if (!canMakeRequest(queuedRequest)) {
            requestsToProcessOnNextRun.push(queuedRequest);
            return;
        }

        processRequest(queuedRequest)
            .catch((error) => {
                // Because we ran into an error we assume we might be offline and do a "connection" health test
                NetworkEvents.triggerRecheckNeeded();

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
    mainQueue = requestsToProcessOnNextRun;
}

export {
    push,
    clear,
    process,
};
