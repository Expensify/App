import _ from 'underscore';
import Onyx from 'react-native-onyx';
import * as PersistedRequests from '../actions/PersistedRequests';
import * as NetworkStore from './NetworkStore';
import * as NetworkEvents from './NetworkEvents';
import ONYXKEYS from '../../ONYXKEYS';
import * as ActiveClientManager from '../ActiveClientManager';
import processRequest from './processRequest';

let isPersistedRequestsQueueRunning = false;

/**
 * @param {Array} requests
 * @returns {Promise}
 */
function runRequestsSync(requests) {
    return _.reduce(requests, (previousRequest, request) => {
        previousRequest.then(() => processRequest(request));
    }, Promise.resolve());
}

/**
 * This method will get any persisted requests and fire them off in parallel to retry them.
 * If we get any jsonCode besides 407 the request is a success. It doesn't make sense to
 * continually retry things that have returned a response. However, we can retry any requests
 * with known networking errors like "Failed to fetch".
 *
 * @returns {Promise}
 */
function process() {
    const persistedRequests = PersistedRequests.getAll();

    // This sanity check is also a recursion exit point
    if (NetworkStore.getIsOffline() || _.isEmpty(persistedRequests)) {
        return Promise.resolve();
    }

    // All persisted requests require Pusher so if we don't have an active connection then don't persist
    if (!NetworkStore.isPusherSubscribed()) {
        // TODO: If we do this we also need to trigger event to empty the queue again when we do subscribe
        return Promise.resolve();
    }

    // Do a recursive call in case the queue is not empty after processing the current batch
    return Promise.all(runRequestsSync(persistedRequests))
        .then(process);
}

function flush() {
    if (isPersistedRequestsQueueRunning) {
        return;
    }

    // ONYXKEYS.PERSISTED_REQUESTS is shared across clients, thus every client/tab will have a copy
    // It is very important to only process the queue from leader client otherwise requests will be duplicated.
    if (!ActiveClientManager.isClientTheLeader()) {
        return;
    }

    isPersistedRequestsQueueRunning = true;

    // Ensure persistedRequests are read from storage before proceeding with the queue
    const connectionID = Onyx.connect({
        key: ONYXKEYS.PERSISTED_REQUESTS,
        callback: () => {
            Onyx.disconnect(connectionID);
            process()
                .finally(() => isPersistedRequestsQueueRunning = false);
        },
    });
}

// Flush the queue when the connection resumes
NetworkEvents.onConnectivityResumed(flush);

/**
 * @returns {Boolean}
 */
function isRunning() {
    return isPersistedRequestsQueueRunning;
}

export {
    flush,
    isRunning,
};
