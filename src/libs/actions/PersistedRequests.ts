import Onyx from 'react-native-onyx';
import isEqual from 'lodash/isEqual';
import ONYXKEYS from '../../ONYXKEYS';
import {Request} from '../../types/onyx';

let persistedRequests: Request[] = [];

Onyx.connect({
    key: ONYXKEYS.PERSISTED_REQUESTS,
    callback: (val) => (persistedRequests = val ?? []),
});

/**
 * This promise is only used by tests. DO NOT USE THIS PROMISE IN THE APPLICATION CODE
 */
function clear() {
    return Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, []);
}

function save(requestsToPersist: Request[]) {
    if (persistedRequests.length) {
        persistedRequests = persistedRequests.concat(requestsToPersist);
    } else {
        persistedRequests = requestsToPersist;
    }
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, persistedRequests);
}

function remove(requestToRemove: Request) {
    /**
     * We only remove the first matching request because the order of requests matters.
     * If we were to remove all matching requests, we can end up with a final state that is different than what the user intended.
     */
    const requests = [...persistedRequests];
    const index = requests.findIndex((persistedRequest) => isEqual(persistedRequest, requestToRemove));
    if (index !== -1) {
        requests.splice(index, 1);
    }

    persistedRequests = requests;
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests);
}

function getAll(): Request[] {
    return persistedRequests;
}

export {clear, save, getAll, remove};
