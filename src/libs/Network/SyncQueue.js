/* eslint-disable no-use-before-define */
import _ from 'underscore';
import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import * as PersistedRequests from '../actions/PersistedRequests';
import * as NetworkStore from './NetworkStore';
import * as NetworkEvents from './NetworkEvents';
import ONYXKEYS from '../../ONYXKEYS';
import * as ActiveClientManager from '../ActiveClientManager';
import processRequest from './processRequest';
import CONST from '../../CONST';

let isQueueRunning = false;
let scheduledSyncQueueTimerID;
let additionalRequests = [];

/**
 * Schedule a new process and cancel the previous pending scheduled process. This enables us to retry emptying the sync queue again at some point in the future.
 */
function scheduleSyncQueueProcess() {
    clearTimeout(scheduledSyncQueueTimerID);
    scheduledSyncQueueTimerID = setTimeout(() => flush, CONST.NETWORK.SYNC_QUEUE_TIMEOUT_MS);
}

/**
 * @param {Array} requests
 * @returns {Promise}
 */
function runRequestsSync(requests) {
    return _.reduce(requests, (previousRequest, request) => previousRequest.then(() => new Promise((resolve) => {
        const requestWithHandlers = {
            ...request,
            resolve,
        };
        processRequest(requestWithHandlers)
            .catch(() => {
                // The way we handle "Failed to fetch" errors in the Sync Queue is to just retry them at some point in the future.
                // The situation we're experiencing is probably temporary, but we resolve here so the rest of the queue can continue to process.
                resolve();
                scheduleSyncQueueProcess();
            });
    })), Promise.resolve())
        .then(() => {
            if (_.isEmpty(additionalRequests)) {
                return Promise.resolve();
            }

            // If any additional requests were queued by this tab while we are online and the queue is running we will also run them now
            const additionalRequestsToRun = _.clone(additionalRequests);
            additionalRequests = [];
            return runRequestsSync(additionalRequestsToRun);
        });
}

/**
 * Add a new request to the queue and try to run
 *
 * @param {Object} request
 */
function push(request) {
    const requestToPersist = _.clone(request);
    requestToPersist.id = Str.guid();
    PersistedRequests.save(requestToPersist);
    if (isQueueRunning) {
        additionalRequests.push(request);
    } else {
        flush();
    }
}

/**
 * This method will get any persisted requests and fire them off in sequence to retry them.
 * - If we get any jsonCode besides 407 the request is considered a success.
 * - We can handle reauthentication and it will happen synchronously
 * - Any requests that fail for other reasons e.g. "Failed to fetch" are assumed to be retryable and will not be dequeued. It could be that a user lost connectivity
 *   while processing the sync requests or Expensify is experiencing a disruption in service that will be back to normal soon. If this happens we will try to empty the queue again
 *   after some amount of time.
 *
 * @returns {Promise}
 */
function process() {
    const persistedRequests = PersistedRequests.getAll();

    // If we are offline we'll run the queue when we're back. If we have no requests we don't need to do anything for this run.
    if (NetworkStore.getIsOffline() || _.isEmpty(persistedRequests)) {
        return Promise.resolve();
    }

    // All persisted requests require Pusher so if we don't have an active connection then don't persist
    if (!NetworkStore.isPusherSubscribed()) {
        // TODO: If we do this we also need to trigger event to empty the queue again when we do subscribe again
        return Promise.resolve();
    }

    return runRequestsSync(persistedRequests);
}

function flush() {
    // ONYXKEYS.PERSISTED_REQUESTS is shared across clients, thus every client/tab will have a copy
    // It is very important to only process the queue from leader client otherwise requests will be duplicated.
    if (!ActiveClientManager.isClientTheLeader()) {
        return;
    }

    if (isQueueRunning) {
        return;
    }

    isQueueRunning = true;

    // Ensure persistedRequests are read from storage before proceeding with the queue
    const connectionID = Onyx.connect({
        key: ONYXKEYS.PERSISTED_REQUESTS,
        callback: () => {
            Onyx.disconnect(connectionID);
            process()
                .finally(() => {
                    isQueueRunning = false;
                    additionalRequests = [];
                });
        },
    });
}

// Flush the queue when the connection resumes
NetworkEvents.onConnectivityResumed(flush);

/**
 * @returns {Boolean}
 */
function isRunning() {
    return isQueueRunning;
}

export {
    flush,
    push,
    isRunning,
};
