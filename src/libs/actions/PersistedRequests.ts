import {deepEqual} from 'fast-equals';
import Onyx from 'react-native-onyx';
import {AppState} from 'react-native';
import {WRITE_COMMANDS} from '@libs/API/types';
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
    // Log TRACK_EXPENSE if it's being cleared
    const trackExpenseInQueue = persistedRequests.find((req) => req.command === WRITE_COMMANDS.TRACK_EXPENSE);
    const isTrackExpenseOngoing = ongoingRequest?.command === WRITE_COMMANDS.TRACK_EXPENSE;
    
    if (trackExpenseInQueue || isTrackExpenseOngoing) {
        const stackTrace = new Error().stack;
        Log.warn('[API_DEBUG] PersistedRequests.clear - TRACK_EXPENSE being cleared from queue!', {
            transactionID: trackExpenseInQueue?.data?.transactionID ?? ongoingRequest?.data?.transactionID,
            isInQueue: !!trackExpenseInQueue,
            isOngoing: isTrackExpenseOngoing,
            queueLength: persistedRequests.length,
            stackTrace: stackTrace?.split('\n').slice(0, 15).join('\n'), // First 15 lines of stack
        });
    }
    
    ongoingRequest = null;
    Onyx.set(ONYXKEYS.PERSISTED_ONGOING_REQUESTS, null);
    return Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, []);
}

function getLength(): number {
    // Making it backwards compatible with the old implementation
    return persistedRequests.length + (ongoingRequest ? 1 : 0);
}

function save(requestToPersist: Request) {
    // Log TRACK_EXPENSE when saving
    if (requestToPersist.command === WRITE_COMMANDS.TRACK_EXPENSE) {
        Log.info('[API_DEBUG] PersistedRequests.save - Saving TRACK_EXPENSE', false, {
            command: requestToPersist.command,
            transactionID: requestToPersist?.data?.transactionID,
            isInitialized,
            currentQueueLength: persistedRequests.length,
        });
    }
    
    // If not initialized yet, queue the request for later processing
    if (!isInitialized) {
        Log.info('[PersistedRequests] Queueing request until initialization completes', false);
        if (requestToPersist.command === WRITE_COMMANDS.TRACK_EXPENSE) {
            Log.info('[API_DEBUG] PersistedRequests.save - TRACK_EXPENSE queued for later (not initialized)', false, {
                transactionID: requestToPersist?.data?.transactionID,
            });
        }
        pendingSaveOperations.push(requestToPersist);
        return;
    }

    // If the command is not in the keepLastInstance array, add the new request as usual
    const requests = [...persistedRequests, requestToPersist];
    persistedRequests = requests;
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests).then(() => {
        Log.info(`[SequentialQueue] '${requestToPersist.command}' command queued. Queue length is ${getLength()}`);
        if (requestToPersist.command === WRITE_COMMANDS.TRACK_EXPENSE) {
            Log.info('[API_DEBUG] PersistedRequests.save - TRACK_EXPENSE saved to Onyx', false, {
                transactionID: requestToPersist?.data?.transactionID,
                queueLength: getLength(),
            });
        }
    });
}

function endRequestAndRemoveFromQueue(requestToRemove: Request) {
    // Log TRACK_EXPENSE when it's removed from queue with stack trace
    if (requestToRemove.command === WRITE_COMMANDS.TRACK_EXPENSE) {
        const stackTrace = new Error().stack;
        Log.warn('[API_DEBUG] PersistedRequests.endRequestAndRemoveFromQueue - TRACK_EXPENSE removed from queue', {
            command: requestToRemove.command,
            transactionID: requestToRemove?.data?.transactionID,
            requestID: requestToRemove?.requestID,
            queueLengthBefore: getLength(),
            ongoingRequestCommand: ongoingRequest?.command,
            isOngoingRequest: ongoingRequest?.command === WRITE_COMMANDS.TRACK_EXPENSE,
            stackTrace: stackTrace?.split('\n').slice(0, 15).join('\n'), // First 15 lines of stack
        });
    }

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

    Log.info('[API_DEBUG] Starting persistence', false, {
        operation: 'removal',
        appState: AppState.currentState, // 'active', 'background', 'inactive'
    });

    Onyx.multiSet({
        [ONYXKEYS.PERSISTED_REQUESTS]: persistedRequests,
        [ONYXKEYS.PERSISTED_ONGOING_REQUESTS]: null,
    }).then(() => {
        Log.info(`[SequentialQueue] '${requestToRemove.command}' removed from the queue. Queue length is ${getLength()}`);

        Log.info('[API_DEBUG] PersistedRequests.endRequestAndRemoveFromQueue - TRACK_EXPENSE removal PERSISTED', false, {
            command: requestToRemove.command,
            transactionID: requestToRemove?.data?.transactionID,
            timestamp: Date.now(),
        });

        Log.info('[API_DEBUG] Persistence completed', false, {
            operation: 'removal',
            appState: AppState.currentState,
        });
    });
}

function deleteRequestsByIndices(indices: number[]) {
    // Create a Set from the indices array for efficient lookup
    const indicesSet = new Set(indices);
    
    // Log TRACK_EXPENSE if it's being deleted
    const trackExpenseIndex = persistedRequests.findIndex((req) => req.command === WRITE_COMMANDS.TRACK_EXPENSE);
    const isTrackExpenseBeingDeleted = trackExpenseIndex !== -1 && indicesSet.has(trackExpenseIndex);
    
    if (isTrackExpenseBeingDeleted) {
        const trackExpenseRequest = persistedRequests.at(trackExpenseIndex);
        const stackTrace = new Error().stack;
        Log.warn('[API_DEBUG] PersistedRequests.deleteRequestsByIndices - TRACK_EXPENSE being deleted from queue!', {
            transactionID: trackExpenseRequest?.data?.transactionID,
            trackExpenseIndex,
            indicesBeingDeleted: Array.from(indices),
            queueLength: persistedRequests.length,
            stackTrace: stackTrace?.split('\n').slice(0, 15).join('\n'), // First 15 lines of stack
        });
    }

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
    // Log TRACK_EXPENSE when checking for next request
    const trackExpenseInQueue = persistedRequests.find((req) => req.command === WRITE_COMMANDS.TRACK_EXPENSE);
    if (trackExpenseInQueue) {
        Log.info('[API_DEBUG] PersistedRequests.processNextRequest - TRACK_EXPENSE in queue', false, {
            transactionID: trackExpenseInQueue?.data?.transactionID,
            hasOngoingRequest: !!ongoingRequest,
            ongoingRequestCommand: ongoingRequest?.command,
            queueLength: persistedRequests.length,
            trackExpenseIndex: persistedRequests.findIndex((req) => req.command === WRITE_COMMANDS.TRACK_EXPENSE),
        });
    }

    if (ongoingRequest) {
        Log.info(`Ongoing Request already set returning same one ${ongoingRequest.commandName}`);
        // Log if ongoing request is blocking TRACK_EXPENSE
        if (trackExpenseInQueue && ongoingRequest.command !== WRITE_COMMANDS.TRACK_EXPENSE) {
            Log.warn('[API_DEBUG] PersistedRequests.processNextRequest - TRACK_EXPENSE blocked by ongoing request', {
                ongoingRequestCommand: ongoingRequest.command,
                trackExpenseTransactionID: trackExpenseInQueue?.data?.transactionID,
            });
        }
        return ongoingRequest;
    }

    // You must handle the case where there are no requests to process
    if (persistedRequests.length === 0) {
        throw new Error('No requests to process');
    }

    ongoingRequest = persistedRequests.length > 0 ? (persistedRequests.at(0) ?? null) : null;

    // Log if TRACK_EXPENSE is being selected
    if (ongoingRequest?.command === WRITE_COMMANDS.TRACK_EXPENSE) {
        Log.info('[API_DEBUG] PersistedRequests.processNextRequest - TRACK_EXPENSE selected for processing', false, {
            transactionID: ongoingRequest?.data?.transactionID,
            requestID: ongoingRequest?.requestID,
        });
    } else if (trackExpenseInQueue) {
        Log.warn('[API_DEBUG] PersistedRequests.processNextRequest - TRACK_EXPENSE in queue but different request selected', {
            selectedCommand: ongoingRequest?.command,
            selectedTransactionID: ongoingRequest?.data?.transactionID,
            trackExpenseTransactionID: trackExpenseInQueue?.data?.transactionID,
            trackExpenseIndex: persistedRequests.findIndex((req) => req.command === WRITE_COMMANDS.TRACK_EXPENSE),
        });
    }

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

    const isTrackExpense = ongoingRequest.command === WRITE_COMMANDS.TRACK_EXPENSE;
    
    Log.info('[API_DEBUG] PersistedRequests.rollbackOngoingRequest - Rolling back ongoing request', false, {
        ongoingRequestCommand: ongoingRequest.command,
        transactionID: ongoingRequest?.data?.transactionID,
        queueLengthBefore: persistedRequests.length,
        isTrackExpense,
    });
    
    if (isTrackExpense) {
        Log.warn('[API_DEBUG] PersistedRequests.rollbackOngoingRequest - TRACK_EXPENSE being rolled back, saving to Onyx to persist across backgrounding', {
            transactionID: ongoingRequest?.data?.transactionID,
            queueLengthBefore: persistedRequests.length,
        });
    }

    Log.info('[API_DEBUG] Starting persistence', false, {
        operation: 'rollback',
        appState: AppState.currentState, // 'active', 'background', 'inactive'
    });


    // Update in-memory state 
    ongoingRequest = null;

    Log.info('[API_DEBUG] PersistedRequests.rollbackOngoingRequest - Ongoing request rolled back and saved to Onyx', false, {
        ongoingRequest,
        queueLength: persistedRequests.length,
        isTrackExpense,
    });
    
    if (isTrackExpense) {
        Log.info('[API_DEBUG] PersistedRequests.rollbackOngoingRequest - TRACK_EXPENSE rolled back and saved to Onyx successfully', false, {
            ongoingRequest,
            queueLength: persistedRequests.length,
        });
    }
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
