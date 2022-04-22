import _ from 'underscore';
import Onyx from 'react-native-onyx';
import * as PersistedRequests from '../actions/PersistedRequests';
import * as NetworkStore from './NetworkStore';
import * as NetworkEvents from './NetworkEvents';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import * as ActiveClientManager from '../ActiveClientManager';
import processRequest from './processRequest';

let isSequentialQueueRunning = false;

/**
 * @param {Object} request
 * @returns {Promise}
 */
function makeSequentialRequest(request) {
    return processRequest(request)
        .then((response) => {
            // We successfully reauthenticated replay the original request
            if (response.jsonCode === CONST.JSON_CODE.REAUTHENTICATED) {
                return makeSequentialRequest(request);
            }

            PersistedRequests.remove(request);
        })
        .catch((error) => {
            // This should not happen since the sequential queue makes blocking calls to Authenticate
            if (error === CONST.ERROR.ALREADY_AUTHENTICATING) {
                NetworkEvents.getLogger().alert('Failed to process sequential queue request because we are already authenticating');
                return;
            }

            const retryCount = PersistedRequests.incrementRetries(request);
            NetworkEvents.getLogger().info('Persisted request failed', false, {retryCount, command: request.command, error: error.message});
            if (retryCount >= CONST.NETWORK.MAX_REQUEST_RETRIES) {
                NetworkEvents.getLogger().info('Request failed too many times, removing from storage', false, {retryCount, command: request.command, error: error.message});
                PersistedRequests.remove(request);
            }
        });
}

/**
 * This method will get any persisted requests and fire them off in sequence to retry them.
 *
 * @returns {Promise}
 */
function process() {
    const persistedRequests = PersistedRequests.getAll();

    // This sanity check is also a recursion exit point
    if (NetworkStore.getIsOffline() || _.isEmpty(persistedRequests)) {
        return Promise.resolve();
    }

    const task = _.reduce(persistedRequests, (previousRequest, request) => previousRequest.then(() => makeSequentialRequest(request)), Promise.resolve());

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

    // Ensure persistedRequests are read from storage before proceeding with the queue
    const connectionID = Onyx.connect({
        key: ONYXKEYS.PERSISTED_REQUESTS,
        callback: () => {
            Onyx.disconnect(connectionID);
            process()
                .finally(() => isSequentialQueueRunning = false);
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
NetworkEvents.onConnectivityResumed(flush);

export {
    flush,
    isRunning,
};
