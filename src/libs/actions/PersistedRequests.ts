import isEqual from 'lodash/isEqual';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Request} from '@src/types/onyx';

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
    const requests = [...persistedRequests, requestToPersist];

    // identify and handle any existing requests that conflict with the new one
    const {getConflictingRequests, handleConflictingRequest, shouldIncludeCurrentRequest} = requestToPersist;
    if (getConflictingRequests) {
        // Get all the requests, potentially including the one we're adding, which will always be at the end of the array
        const potentiallyConflictingRequests = shouldIncludeCurrentRequest ? requests : requests.slice(0, requests.length - 1);

        // Identify conflicting requests according to logic bound to the new request
        const conflictingRequests = getConflictingRequests(potentiallyConflictingRequests);

        conflictingRequests.forEach((conflictingRequest) => {
            // delete the conflicting request
            const index = requests.findIndex((req) => req === conflictingRequest);
            if (index !== -1) {
                requests.splice(index, 1);
            }

            // Allow the new request to perform any additional cleanup for a cancelled request
            handleConflictingRequest?.(conflictingRequest);
        });
    }

    // Don't try to serialize conflict resolution functions
    persistedRequests = requests.map((request) => {
        delete request.getConflictingRequests;
        delete request.handleConflictingRequest;
        delete request.shouldIncludeCurrentRequest;
        return request;
    });

    // Save the updated set of requests
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
