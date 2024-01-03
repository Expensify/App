import isEqual from 'lodash/isEqual';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {Request} from '@src/types/onyx';

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

function save(requestToPersist: Request) {
    const requests = [...persistedRequests];
    const existingRequestIndex = requests.findIndex((request) => request.data?.idempotencyKey && request.data?.idempotencyKey === requestToPersist.data?.idempotencyKey);
    if (existingRequestIndex > -1) {
        // Merge the new request into the existing one, keeping its place in the queue
        requests.splice(existingRequestIndex, 1, requestToPersist);
    } else {
        // If not, push the new request to the end of the queue
        requests.push(requestToPersist);
    }
    persistedRequests = requests;

    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests);
}

function remove(requestToRemove: Request) {
    /**
     * We only remove the first matching request because the order of requests matters.
     * If we were to remove all matching requests, we can end up with a final state that is different than what the user intended.
     */
    const requests = [...persistedRequests];
    const index = requests.findIndex((persistedRequest) => isEqual(persistedRequest, requestToRemove));
    if (index === -1) {
        return;
    }
    requests.splice(index, 1);
    persistedRequests = requests;
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests);
}

function update(oldRequestIndex: number, newRequest: Request) {
    const requests = [...persistedRequests];
    requests.splice(oldRequestIndex, 1, newRequest);
    persistedRequests = requests;
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests);
}

function getAll(): Request[] {
    return persistedRequests;
}

export {clear, save, getAll, remove, update};
