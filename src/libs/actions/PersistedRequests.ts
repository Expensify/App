import isEqual from 'lodash/isEqual';
import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Request} from '@src/types/onyx';

let persistedRequests: Request[] = [];
let ongoingRequest: Request | null = null;

Onyx.connect({
    key: ONYXKEYS.PERSISTED_REQUESTS,
    callback: (val) => {
        persistedRequests = val ?? [];

        if (ongoingRequest && persistedRequests.length > 0) {
            const nextRequestToProcess = persistedRequests.at(0);

            // We try to remove the next request from the persistedRequests if it is the same as ongoingRequest
            // so we don't process it twice.
            if (isEqual(nextRequestToProcess, ongoingRequest)) {
                persistedRequests = persistedRequests.slice(1);
            }
        }
    },
});
Onyx.connect({
    key: ONYXKEYS.PERSISTED_ONGOING_REQUESTS,
    callback: (val) => {
        ongoingRequest = val ?? null;
    },
});

/**
 * This promise is only used by tests. DO NOT USE THIS PROMISE IN THE APPLICATION CODE
 */
function clear() {
    ongoingRequest = null;
    Onyx.set(ONYXKEYS.PERSISTED_ONGOING_REQUESTS, null);
    return Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, []);
}

function getLength(): number {
    // Making it backwards compatible with the old implementation
    return persistedRequests.length + (ongoingRequest ? 1 : 0);
}

function save(requestToPersist: Request) {
    // If the command is not in the keepLastInstance array, add the new request as usual
    const requests = [...persistedRequests, requestToPersist];
    persistedRequests = requests;
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests).then(() => {
        Log.info(`[SequentialQueue] '${requestToPersist.command}' command queued. Queue length is ${getLength()}`);
    });
}

function remove(requestToRemove: Request) {
    ongoingRequest = null;
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

    Onyx.multiSet({
        [ONYXKEYS.PERSISTED_REQUESTS]: persistedRequests,
        [ONYXKEYS.PERSISTED_ONGOING_REQUESTS]: null,
    }).then(() => {
        Log.info(`[SequentialQueue] '${requestToRemove.command}' removed from the queue. Queue length is ${getLength()}`);
    });
}

function update(oldRequestIndex: number, newRequest: Request) {
    const requests = [...persistedRequests];
    requests.splice(oldRequestIndex, 1, newRequest);
    persistedRequests = requests;
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests);
}

function updateOngoingRequest(newRequest: Request) {
    ongoingRequest = newRequest;

    if (newRequest.persistWhenOngoing) {
        Onyx.set(ONYXKEYS.PERSISTED_ONGOING_REQUESTS, newRequest);
    }
}

function processNextRequest(): Request | null {
    if (ongoingRequest) {
        Log.info(`Ongoing Request already set returning same one ${ongoingRequest.commandName}`);
        return ongoingRequest;
    }

    // You must handle the case where there are no requests to process
    if (persistedRequests.length === 0) {
        throw new Error('No requests to process');
    }

    ongoingRequest = persistedRequests.shift() ?? null;

    if (ongoingRequest && ongoingRequest.persistWhenOngoing) {
        Onyx.set(ONYXKEYS.PERSISTED_ONGOING_REQUESTS, ongoingRequest);
    }

    return ongoingRequest;
}

function rollbackOngoingRequest() {
    if (!ongoingRequest) {
        return;
    }

    // Prepend ongoingRequest to persistedRequests
    persistedRequests.unshift(ongoingRequest);

    // Clear the ongoingRequest
    ongoingRequest = null;
}

function getAll(): Request[] {
    return persistedRequests;
}

function getOngoingRequest(): Request | null {
    return ongoingRequest;
}

export {clear, save, getAll, remove, update, getLength, getOngoingRequest, processNextRequest, updateOngoingRequest, rollbackOngoingRequest};
