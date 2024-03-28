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
    for (let i = requests.length - 1; i > 0; i--) {
        // since we're deleting elements from the array, it may be reindexed.
        // In this case, we need to make sure our index is still in bounds
        if (i >= requests.length) {
            i--;
            // eslint-disable-next-line no-continue
            continue;
        }

        const request = requests[i];

        // identify and handle any existing requests that conflict with the new one
        const {getConflictingRequests, handleConflictingRequest, shouldIncludeCurrentRequest} = request;
        if (!getConflictingRequests) {
            // eslint-disable-next-line no-continue
            continue;
        }

        // Get all the remaining requests, potentially excluding the one we're adding, which will always be at the end of the array
        const remainingRequests = shouldIncludeCurrentRequest ? requests : requests.slice(0, requests.length - 1);

        // Identify conflicting requests according to logic bound to the request
        const conflictingRequests = getConflictingRequests(remainingRequests);
        conflictingRequests.forEach((conflictingRequest) => {
            // delete the conflicting request
            const index = requests.findIndex((req) => req === conflictingRequest);
            if (index !== -1) {
                requests.splice(index, 1);
            }

            // Allow the request to perform any additional cleanup for a cancelled request
            handleConflictingRequest?.(conflictingRequest);
        });
    }

    // Save the updated set of requests
    persistedRequests = requests.map((request) => {
        // Don't try to serialize conflict resolution functions
        delete request.getConflictingRequests;
        delete request.handleConflictingRequest;
        delete request.shouldIncludeCurrentRequest;
        return request;
    });
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
