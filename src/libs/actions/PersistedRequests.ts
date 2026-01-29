import {deepEqual} from 'fast-equals';
import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Request} from '@src/types/onyx';

let persistedRequests: Request[] = [];
let ongoingRequest: Request | null = null;
let pendingSaveOperations: Request[] = [];
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
        const previousInMemoryRequests = [...persistedRequests];
        const diskRequests = val ?? [];
        persistedRequests = diskRequests;

        Log.info('[PersistedRequests] DISK vs MEMORY comparison', false, {
            diskRequestsLength: diskRequests.length,
            previousMemoryRequestsLength: previousInMemoryRequests.length,
            diskCommands: diskRequests.map((r) => r.command),
            previousMemoryCommands: previousInMemoryRequests.map((r) => r.command),
            mismatch: diskRequests.length !== previousInMemoryRequests.length,
        });

        // Process any pending save operations that were queued before initialization
        if (pendingSaveOperations.length > 0) {
            Log.info(`[PersistedRequests] Processing pending save operations, size: ${pendingSaveOperations.length}`, false, {
                pendingCommands: pendingSaveOperations.map((r) => r.command),
            });
            const requests = [...persistedRequests, ...pendingSaveOperations];
            persistedRequests = requests;
            Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests);
            pendingSaveOperations = [];
        }

        if (ongoingRequest && persistedRequests.length > 0) {
            const nextRequestToProcess = persistedRequests.at(0);

            Log.info('[PersistedRequests] Checking for duplicate ongoingRequest', false, {
                ongoingRequestCommand: ongoingRequest.command,
                nextRequestCommand: nextRequestToProcess?.command,
                areEqual: deepEqual(nextRequestToProcess, ongoingRequest),
            });

            // We try to remove the next request from the persistedRequests if it is the same as ongoingRequest
            // so we don't process it twice.
            if (deepEqual(nextRequestToProcess, ongoingRequest)) {
                persistedRequests = persistedRequests.slice(1);
                Log.info('[PersistedRequests] Removed duplicate ongoingRequest from queue', false);
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
        const previousOngoingRequest = ongoingRequest;
        ongoingRequest = val ?? null;

        Log.info('[PersistedRequests] ONGOING_REQUEST changed', false, {
            previousOngoingCommand: previousOngoingRequest?.command ?? 'null',
            newOngoingCommand: ongoingRequest?.command ?? 'null',
            diskValue: val?.command ?? 'null',
            changed: previousOngoingRequest !== ongoingRequest,
        });
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
    Log.info('[PersistedRequests] Saving request to queue started', false, {
        command: requestToPersist.command,
        currentQueueLength: persistedRequests.length,
        ongoingRequest: ongoingRequest?.command ?? 'null',
        isInitialized,
    });
    // If not initialized yet, queue the request for later processing
    if (!isInitialized) {
        Log.info('[PersistedRequests] Queueing request until initialization completes', false, {
            pendingSaveOperationsLength: pendingSaveOperations.length,
        });
        pendingSaveOperations.push(requestToPersist);
        return;
    }

    // If the command is not in the keepLastInstance array, add the new request as usual
    const requests = [...persistedRequests, requestToPersist];
    const previousLength = persistedRequests.length;
    persistedRequests = requests;

    Log.info('[PersistedRequests] Request added to memory, persisting to disk', false, {
        command: requestToPersist.command,
        previousQueueLength: previousLength,
        newQueueLength: requests.length,
        allCommands: requests.map((r) => r.command),
    });

    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests)
        .then(() => {
            Log.info('[PersistedRequests] Request successfully persisted to disk', false, {
                command: requestToPersist.command,
                queueLength: getLength(),
            });
        })
        .catch(() => {
            Log.info('[PersistedRequests] ERROR: Failed to persist request to disk', false, {
                command: requestToPersist.command,
                queueLength: getLength(),
            });
        });
}

function endRequestAndRemoveFromQueue(requestToRemove: Request) {
    Log.info('[PersistedRequests] endRequestAndRemoveFromQueue called', false, {
        commandToRemove: requestToRemove.command,
        currentOngoingCommand: ongoingRequest?.command ?? 'null',
        currentQueueLength: persistedRequests.length,
        currentQueueCommands: persistedRequests.map((r) => r.command),
    });

    const previousOngoingRequest = ongoingRequest;
    ongoingRequest = null;

    Log.info('[PersistedRequests] Cleared ongoingRequest', false, {
        previousOngoingCommand: previousOngoingRequest?.command ?? 'null',
    });

    /**
     * We only remove the first matching request because the order of requests matters.
     * If we were to remove all matching requests, we can end up with a final state that is different than what the user intended.
     */
    const requests = [...persistedRequests];
    const index = requests.findIndex((persistedRequest) => deepEqual(persistedRequest, requestToRemove));

    Log.info('[PersistedRequests] Searching for request in queue', false, {
        commandToRemove: requestToRemove.command,
        foundIndex: index,
        wasInQueue: index !== -1,
    });

    if (index !== -1) {
        requests.splice(index, 1);
        Log.info('[PersistedRequests] Removed request from queue', false, {
            command: requestToRemove.command,
            removedAtIndex: index,
        });
    } else {
        Log.info('[PersistedRequests] Request NOT found in queue (expected if it was ongoingRequest)', false, {
            command: requestToRemove.command,
        });
    }

    persistedRequests = requests;

    Log.info('[PersistedRequests] Persisting updated queue and clearing ongoingRequest to disk', false, {
        newQueueLength: persistedRequests.length,
        newQueueCommands: persistedRequests.map((r) => r.command),
    });

    Onyx.multiSet({
        [ONYXKEYS.PERSISTED_REQUESTS]: persistedRequests,
        [ONYXKEYS.PERSISTED_ONGOING_REQUESTS]: null,
    }).then(() => {
        Log.info('[PersistedRequests] Successfully persisted request removal to disk', false, {
            command: requestToRemove.command,
            newQueueLength: getLength(),
        });
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

function update(oldRequestIndex: number, newRequest: Request) {
    const requests = [...persistedRequests];
    const oldRequest = requests.at(oldRequestIndex);
    Log.info('[PersistedRequests] Updating a request', false, {oldRequest, newRequest, oldRequestIndex});
    requests.splice(oldRequestIndex, 1, newRequest);
    persistedRequests = requests;
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests);
}

function updateOngoingRequest(newRequest: Request) {
    Log.info('[PersistedRequests] Updating the ongoing request', false, {ongoingRequest, newRequest});
    ongoingRequest = newRequest;

    if (newRequest.persistWhenOngoing) {
        Onyx.set(ONYXKEYS.PERSISTED_ONGOING_REQUESTS, newRequest);
    }
}

function processNextRequest(): Request | null {
    Log.info('[PersistedRequests] processNextRequest called', false, {
        hasOngoingRequest: !!ongoingRequest,
        ongoingCommand: ongoingRequest?.command ?? 'null',
        queueLength: persistedRequests.length,
        queueCommands: persistedRequests.map((r) => r.command),
    });

    if (ongoingRequest) {
        Log.info('[PersistedRequests] Ongoing Request already set, returning same one', false, {
            command: ongoingRequest.command,
            commandName: ongoingRequest.commandName,
        });
        return ongoingRequest;
    }

    // You must handle the case where there are no requests to process
    if (persistedRequests.length === 0) {
        Log.info('[PersistedRequests] ERROR: No requests to process but processNextRequest was called');
        throw new Error('No requests to process');
    }

    const nextRequest = persistedRequests.at(0) ?? null;
    ongoingRequest = nextRequest;

    Log.info('[PersistedRequests] Setting new ongoingRequest', false, {
        command: ongoingRequest?.command ?? 'null',
        persistWhenOngoing: ongoingRequest?.persistWhenOngoing ?? false,
        remainingQueueLength: persistedRequests.length - 1,
    });

    // Create a new array without the first element
    const newPersistedRequests = persistedRequests.slice(1);
    persistedRequests = newPersistedRequests;

    Log.info('[PersistedRequests] Queue updated after moving request to ongoing', false, {
        ongoingCommand: ongoingRequest?.command ?? 'null',
        newQueueLength: persistedRequests.length,
        newQueueCommands: persistedRequests.map((r) => r.command),
    });

    if (ongoingRequest && ongoingRequest.persistWhenOngoing) {
        Log.info('[PersistedRequests] Persisting ongoingRequest to disk', false, {
            command: ongoingRequest.command,
        });
        Onyx.set(ONYXKEYS.PERSISTED_ONGOING_REQUESTS, ongoingRequest);
    } else {
        Log.info('[PersistedRequests] NOT persisting ongoingRequest to disk (persistWhenOngoing=false)', false, {
            command: ongoingRequest?.command ?? 'null',
        });
    }

    return ongoingRequest;
}

function rollbackOngoingRequest() {
    Log.info('[PersistedRequests] rollbackOngoingRequest called', false, {
        hasOngoingRequest: !!ongoingRequest,
        ongoingCommand: ongoingRequest?.command ?? 'null',
        currentQueueLength: persistedRequests.length,
    });

    if (!ongoingRequest) {
        Log.info('[PersistedRequests] No ongoingRequest to rollback');
        return;
    }

    const requestToRollback = {...ongoingRequest, isRollback: true};

    Log.info('[PersistedRequests] Rolling back request to front of queue', false, {
        command: ongoingRequest.command,
        wasMarkedAsRollback: true,
    });

    // Prepend ongoingRequest to persistedRequests
    persistedRequests.unshift(requestToRollback);

    // Clear the ongoingRequest
    ongoingRequest = null;

    Log.info('[PersistedRequests] Rollback complete', false, {
        rolledBackCommand: requestToRollback.command,
        newQueueLength: persistedRequests.length,
        newQueueCommands: persistedRequests.map((r) => r.command),
        ongoingRequestCleared: true,
    });
}

function getAll(): Request[] {
    return persistedRequests;
}

function getOngoingRequest(): Request | null {
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
