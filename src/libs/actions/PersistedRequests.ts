import {deepEqual} from 'fast-equals';
import type {OnyxKey} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Request} from '@src/types/onyx';
import type {GenericRequest} from '@src/types/onyx/Request';

let persistedRequests: GenericRequest[] = [];
let ongoingRequest: GenericRequest | null = null;
let pendingSaveOperations: GenericRequest[] = [];
let isInitialized = false;
let initializationCallback: () => void;
function triggerInitializationCallback() {
    if (typeof initializationCallback !== 'function') {
        return;
    }
    return initializationCallback();
}

function onInitialization(callbackFunction: () => void) {
    initializationCallback = callbackFunction;
}

// We have opted for connectWithoutView here as this module is strictly non-UI
Onyx.connectWithoutView({
    key: ONYXKEYS.PERSISTED_REQUESTS,
    callback: (val) => {
        Log.info('[PersistedRequests] hit Onyx connect callback', false, {isValNullish: val == null});
        persistedRequests = val ?? [];

        // Process any pending save operations that were queued before initialization
        if (pendingSaveOperations.length > 0) {
            Log.info(`[PersistedRequests] Processing pending save operations, size: ${pendingSaveOperations.length}`, false);
            const requests = [...persistedRequests, ...pendingSaveOperations];
            persistedRequests = requests;
            Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests);
            pendingSaveOperations = [];
        }

        if (ongoingRequest && persistedRequests.length > 0) {
            const nextRequestToProcess = persistedRequests.at(0);

            // We try to remove the next request from the persistedRequests if it is the same as ongoingRequest
            // so we don't process it twice.
            if (deepEqual(nextRequestToProcess, ongoingRequest)) {
                persistedRequests = persistedRequests.slice(1);
            }
        }

        if (!isInitialized && persistedRequests.length > 0) {
            Log.info('[PersistedRequests] Triggering initialization callback', false);
            triggerInitializationCallback();
        }
        isInitialized = true;
    },
});
// We have opted for connectWithoutView here as this module is strictly non-UI
Onyx.connectWithoutView({
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

function save<TKey extends OnyxKey>(requestToPersist: Request<TKey>) {
    Log.info('[PersistedRequests] Saving request to queue started', false, {command: requestToPersist.command});
    // If not initialized yet, queue the request for later processing
    if (!isInitialized) {
        Log.info('[PersistedRequests] Queueing request until initialization completes', false);
        pendingSaveOperations.push(requestToPersist as GenericRequest);
        return;
    }

    // If the command is not in the keepLastInstance array, add the new request as usual
    const requests = [...persistedRequests, requestToPersist];
    persistedRequests = requests;
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests)
        .then(() => {
            Log.info(`[SequentialQueue] '${requestToPersist.command}' command queued. Queue length is ${getLength()}`);
        })
        .catch(() => {
            Log.info('[SequentialQueue] Error saving request to queue', false, {command: requestToPersist.command});
        });
}

function endRequestAndRemoveFromQueue<TKey extends OnyxKey>(requestToRemove: Request<TKey>) {
    ongoingRequest = null;
    /**
     * We only remove the first matching request because the order of requests matters.
     * If we were to remove all matching requests, we can end up with a final state that is different than what the user intended.
     */
    const requests = [...persistedRequests];
    const index = requests.findIndex((persistedRequest) => deepEqual(persistedRequest, requestToRemove));

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

function deleteRequestsByIndices(indices: number[]) {
    // Create a Set from the indices array for efficient lookup
    const indicesSet = new Set(indices);

    // Create a new array excluding elements at the specified indices
    persistedRequests = persistedRequests.filter((_, index) => !indicesSet.has(index));

    // Update the persisted requests in storage or state as necessary
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, persistedRequests).then(() => {
        Log.info(`Multiple (${indices.length}) requests removed from the queue. Queue length is ${persistedRequests.length}`);
    });
}

function update<TKey extends OnyxKey>(oldRequestIndex: number, newRequest: Request<TKey>) {
    const requests = [...persistedRequests];
    const oldRequest = requests.at(oldRequestIndex);
    Log.info('[PersistedRequests] Updating a request', false, {oldRequest, newRequest, oldRequestIndex});
    requests.splice(oldRequestIndex, 1, newRequest);
    persistedRequests = requests;
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests);
}

function updateOngoingRequest<TKey extends OnyxKey>(newRequest: Request<TKey>) {
    Log.info('[PersistedRequests] Updating the ongoing request', false, {ongoingRequest, newRequest});
    ongoingRequest = newRequest;

    if (newRequest.persistWhenOngoing) {
        Onyx.set(ONYXKEYS.PERSISTED_ONGOING_REQUESTS, newRequest);
    }
}

function processNextRequest(): GenericRequest | null {
    if (ongoingRequest) {
        Log.info(`Ongoing Request already set returning same one ${ongoingRequest.commandName}`);
        return ongoingRequest;
    }

    // You must handle the case where there are no requests to process
    if (persistedRequests.length === 0) {
        throw new Error('No requests to process');
    }

    ongoingRequest = persistedRequests?.at(0) ?? null;

    // Create a new array without the first element
    const newPersistedRequests = persistedRequests.slice(1);
    persistedRequests = newPersistedRequests;

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
    persistedRequests.unshift({...ongoingRequest, isRollback: true});

    // Clear the ongoingRequest
    ongoingRequest = null;
}

function getAll(): GenericRequest[] {
    return persistedRequests;
}

function getOngoingRequest(): GenericRequest | null {
    return ongoingRequest;
}

export {
    clear,
    save,
    getAll,
    endRequestAndRemoveFromQueue,
    update,
    getLength,
    getOngoingRequest,
    processNextRequest,
    updateOngoingRequest,
    rollbackOngoingRequest,
    deleteRequestsByIndices,
    onInitialization,
};
