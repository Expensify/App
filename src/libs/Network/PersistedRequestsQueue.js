import _ from 'underscore';
import Onyx from 'react-native-onyx';
import * as PersistedRequests from '../actions/PersistedRequests';
import * as NetworkStore from './NetworkStore';
import * as NetworkEvents from './NetworkEvents';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import * as ActiveClientManager from '../ActiveClientManager';
import processRequest from './processRequest';

let persistedRequestsQueueRunning = false;

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

    const tasks = _.map(persistedRequests, request => processRequest(request)
        .catch((error) => {
            const retryCount = PersistedRequests.incrementRetries(request);
            NetworkEvents.getLogger().info('Persisted request failed', false, {retryCount, command: request.command, error: error.message});
            if (retryCount >= CONST.NETWORK.MAX_REQUEST_RETRIES) {
                NetworkEvents.getLogger().info('Request failed too many times removing from storage', false, {retryCount, command: request.command, error: error.message});
                PersistedRequests.remove(request);
            }
        }));

    // Do a recursive call in case the queue is not empty after processing the current batch
    return Promise.all(tasks)
        .then(process);
}

function flush() {
    if (persistedRequestsQueueRunning) {
        return;
    }

    // ONYXKEYS.PERSISTED_REQUESTS is shared across clients, thus every client/tab will have a copy
    // It is very important to only process the queue from leader client otherwise requests will be duplicated.
    if (!ActiveClientManager.isClientTheLeader()) {
        return;
    }

    persistedRequestsQueueRunning = true;

    // Ensure persistedRequests are read from storage before proceeding with the queue
    const connectionId = Onyx.connect({
        key: ONYXKEYS.PERSISTED_REQUESTS,
        callback: () => {
            Onyx.disconnect(connectionId);
            process()
                .finally(() => persistedRequestsQueueRunning = false);
        },
    });
}

// Flush the queue when the connection resumes
NetworkEvents.onConnectivityResumed(flush);

export {
    // eslint-disable-next-line import/prefer-default-export
    flush,
};
