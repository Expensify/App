import _ from 'underscore';
import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import * as PersistedRequests from '../actions/PersistedRequests';
import ONYXKEYS from '../../ONYXKEYS';
import * as ActiveClientManager from '../ActiveClientManager';
import * as Request from '../Request';

let resolveIsReadyPromise;
let isReadyPromise = new Promise((resolve) => {
    resolveIsReadyPromise = resolve;
});

// Resolve the isReadyPromise immediately so that the queue starts working as soon as the page loads
resolveIsReadyPromise();

let isSequentialQueueRunning = false;
let isOffline = true;

/**
 * This method will get any persisted requests and fire them off in sequence to retry them.
 *
 * @returns {Promise}
 */
function process() {
    const persistedRequests = PersistedRequests.getAll();

    // This sanity check is also a recursion exit point
    if (isOffline || _.isEmpty(persistedRequests)) {
        return Promise.resolve();
    }

    const task = _.reduce(persistedRequests, (previousRequest, request) => previousRequest.then(() => Request.processWithMiddleware(request, true)), Promise.resolve());

    // Do a recursive call in case the queue is not empty after processing the current batch
    return task.then(process);
}

function flush() {
    if (isSequentialQueueRunning) {
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
            process()
                .finally(() => {
                    isSequentialQueueRunning = false;
                    resolveIsReadyPromise();
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

/**
 * @param {Object} request
 */
function push(request) {
    // Add request to Persisted Requests so that it can be retried if it fails
    PersistedRequests.save([request]);

    // If we are offline we don't need to trigger the queue to empty as it will happen when we come back online
    if (isOffline) {
        return;
    }

    // If the queue is running this request will run once it has finished processing the current batch
    if (isSequentialQueueRunning) {
        isReadyPromise.then(flush);
        return;
    }

    flush();
}

Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: (val) => {
        const wasOffline = isOffline;
        isOffline = lodashGet(val, 'isOffline', true);

        // Flush the queue when the connection resumes
        if (wasOffline && !isOffline) {
            flush();
        }
    },
    initWithStoredValues: false,
});

export {
    flush,
    isRunning,
    push,
};
