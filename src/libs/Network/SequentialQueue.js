import _ from 'underscore';
import Onyx from 'react-native-onyx';
import * as PersistedRequests from '../actions/PersistedRequests';
import * as NetworkStore from './NetworkStore';
import ONYXKEYS from '../../ONYXKEYS';
import * as ActiveClientManager from '../ActiveClientManager';
import * as Request from '../Request';
import * as RequestThrottle from '../RequestThrottle';
import CONST from '../../CONST';
import * as QueuedOnyxUpdates from '../actions/QueuedOnyxUpdates';

let resolveIsReadyPromise;
let isReadyPromise = new Promise((resolve) => {
    resolveIsReadyPromise = resolve;
});

// Resolve the isReadyPromise immediately so that the queue starts working as soon as the page loads
resolveIsReadyPromise();

let isSequentialQueueRunning = false;
let currentRequest = null;
let isQueuePaused = false;

/**
 * Process any persisted requests, when online, one at a time until the queue is empty.
 *
 * If a request fails due to some kind of network error, such as a request being throttled or when our backend is down, then we retry it with an exponential back off process until a response
 * is successfully returned. The first time a request fails we set a random, small, initial wait time. After waiting, we retry the request. If there are subsequent failures the request wait
 * time is doubled creating an exponential back off in the frequency of requests hitting the server. Since the initial wait time is random and it increases exponentially, the load of
 * requests to our backend is evenly distributed and it gradually decreases with time, which helps the servers catch up.
 * @returns {Promise}
 */
function process() {
    // When the queue is paused, return early. This prevents any new requests from happening. The queue will be flushed again when the queue is unpaused.
    if (isQueuePaused) {
        return Promise.resolve();
    }

    const persistedRequests = PersistedRequests.getAll();
    if (_.isEmpty(persistedRequests) || NetworkStore.isOffline()) {
        return Promise.resolve();
    }
    const requestToProcess = persistedRequests[0];

    // Set the current request to a promise awaiting its processing so that getCurrentRequest can be used to take some action after the current request has processed.
    currentRequest = Request.processWithMiddleware(requestToProcess, true)
        .then(() => {
            PersistedRequests.remove(requestToProcess);
            RequestThrottle.clear();
            return process();
        })
        .catch((error) => {
            // On sign out we cancel any in flight requests from the user. Since that user is no longer signed in their requests should not be retried.
            // Duplicate records don't need to be retried as they just mean the record already exists on the server
            if (error.name === CONST.ERROR.REQUEST_CANCELLED || error.message === CONST.ERROR.DUPLICATE_RECORD) {
                PersistedRequests.remove(requestToProcess);
                RequestThrottle.clear();
                return process();
            }
            return RequestThrottle.sleep().then(process);
        });
    return currentRequest;
}

function flush() {
    // When the queue is paused, return early. This will keep an requests in the queue and they will get flushed again when the queue is unpaused
    if (isQueuePaused) {
        return;
    }

    if (isSequentialQueueRunning || _.isEmpty(PersistedRequests.getAll())) {
        return;
    }

    // ONYXKEYS.PERSISTED_REQUESTS is shared across clients, thus every client/tab will have a copy
    // It is very important to only process the queue from leader client otherwise requests will be duplicated.
    if (!ActiveClientManager.isClientTheLeader()) {
        return;
    }

    isSequentialQueueRunning = true;

    // Reset the isReadyPromise so that the queue will be flushed as soon as the request is finished
    isReadyPromise = new Promise((resolve) => {
        resolveIsReadyPromise = resolve;
    });

    // Ensure persistedRequests are read from storage before proceeding with the queue
    const connectionID = Onyx.connect({
        key: ONYXKEYS.PERSISTED_REQUESTS,
        callback: () => {
            Onyx.disconnect(connectionID);
            process().finally(() => {
                isSequentialQueueRunning = false;
                resolveIsReadyPromise();
                currentRequest = null;
                Onyx.update(QueuedOnyxUpdates.getQueuedUpdates()).then(QueuedOnyxUpdates.clear);
            });
        },
    });
}

/**
 * @returns {Boolean}
 */
function isRunning() {
    return isSequentialQueueRunning;
}

// Flush the queue when the connection resumes
NetworkStore.onReconnection(flush);

/**
 * @param {Object} request
 */
function push(request) {
    // Add request to Persisted Requests so that it can be retried if it fails
    PersistedRequests.save([request]);

    // If we are offline we don't need to trigger the queue to empty as it will happen when we come back online
    if (NetworkStore.isOffline()) {
        return;
    }

    // If the queue is running this request will run once it has finished processing the current batch
    if (isSequentialQueueRunning) {
        isReadyPromise.then(flush);
        return;
    }

    flush();
}

/**
 * @returns {Promise}
 */
function getCurrentRequest() {
    if (currentRequest === null) {
        return Promise.resolve();
    }
    return currentRequest;
}

/**
 * Returns a promise that resolves when the sequential queue is done processing all persisted write requests.
 * @returns {Promise}
 */
function waitForIdle() {
    return isReadyPromise;
}

/**
 * Puts the queue into a paused state so that no requests will be processed
 */
function pause() {
    if (isQueuePaused) {
        return;
    }

    console.debug('[SequentialQueue] Pausing the queue');
    isQueuePaused = true;
}

/**
 * Unpauses the queue and flushes all the requests that were in it or were added to it while paused
 */
function unpause() {
    if (!isQueuePaused) {
        return;
    }

    const numberOfPersistedRequests = PersistedRequests.getAll().length || 0;
    console.debug(`[SequentialQueue] Unpausing the queue and flushing ${numberOfPersistedRequests} requests`);
    isQueuePaused = false;
    flush();
}

export {flush, getCurrentRequest, isRunning, push, waitForIdle, pause, unpause};
