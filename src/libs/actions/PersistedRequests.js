import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';

let persistedRequests = [];

Onyx.connect({
    key: ONYXKEYS.PERSISTED_REQUESTS,
    callback: (val) => (persistedRequests = val || []),
});

function clear() {
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, []);
}

/**
 * @param {Array} requestsToPersist
 */
function save(requestsToPersist) {
    persistedRequests = persistedRequests.concat(requestsToPersist);
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, persistedRequests);
}

/**
 * @param {Object} requestToRemove
 */
function remove(requestToRemove) {
    /**
     * We only remove the first matching request because the order of requests matters.
     * If we were to remove all matching requests, we can end up with a final state that is different than what the user intended.
     */
    const requests = [...persistedRequests];
    const index = _.findIndex(requests, (persistedRequest) => _.isEqual(persistedRequest, requestToRemove));
    if (index !== -1) {
        requests.splice(index, 1);
    }

    persistedRequests = requests;
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests);
}

/**
 * @returns {Array}
 */
function getAll() {
    return persistedRequests;
}

export {clear, save, getAll, remove};
