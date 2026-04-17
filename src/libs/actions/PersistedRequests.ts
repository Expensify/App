import {deepEqual} from 'fast-equals';
import type {OnyxKey} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Request} from '@src/types/onyx';
import type {AnyRequest} from '@src/types/onyx/Request';

let persistedRequests: AnyRequest[] = [];
let ongoingRequest: AnyRequest | null = null;
let pendingSaveOperations: AnyRequest[] = [];
let isInitialized = false;
// Tracks all requestIDs this tab has ever seen (from disk init, save(), or other tabs).
// Used to distinguish stale own-write callbacks (ignore) from new requests enqueued
// by other browser tabs (merge into memory).
const knownRequestIDs = new Set<number>();
let crossTabRequestsCallback: (() => void) | undefined;
// Tracks the number of unresolved Onyx.set()/Onyx.multiSet() promises initiated
// by this tab. While any own writes are pending, the Onyx callback must NOT
// reconcile deletions, because the callback may have been triggered synchronously
// by broadcastUpdate during our own Onyx.set() call — and that value may become
// stale if a later Onyx.set() has already been called (Issue 4 protection).
// When the counter is 0, any callback must be from a cross-tab storage event,
// so it is safe to reconcile deletions from the leader tab.
let pendingOnyxWrites = 0;

function trackOnyxWrite<T>(promise: Promise<T>): Promise<T> {
    pendingOnyxWrites++;
    return promise.finally(() => {
        pendingOnyxWrites--;
    });
}

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

function onCrossTabRequestsMerged(callbackFunction: () => void) {
    crossTabRequestsCallback = callbackFunction;
}

// We have opted for connectWithoutView here as this module is strictly non-UI
Onyx.connectWithoutView({
    key: ONYXKEYS.PERSISTED_REQUESTS,
    callback: (val) => {
        Log.info('[PersistedRequests] hit Onyx connect callback', false, {isValNullish: val == null, isInitialized});

        // After initialization, in-memory is authoritative — ignore stale disk
        // callbacks to prevent out-of-order Onyx.set() from overwriting the
        // correct in-memory state (Bug #80759 Issue 4).
        // Exception 1: Onyx.clear() fires callback with null — allow through.
        // Exception 2: Other browser tabs can enqueue requests. We detect these
        // by checking for requestIDs not in knownRequestIDs, and merge them in.
        if (isInitialized && val != null) {
            const newFromOtherTabs = val.filter((r) => r.requestID != null && !knownRequestIDs.has(r.requestID));
            if (newFromOtherTabs.length > 0) {
                Log.info('[PersistedRequests] Merging requests from other tabs', false, {
                    newCount: newFromOtherTabs.length,
                    newCommands: getCommands(newFromOtherTabs),
                });
                for (const r of newFromOtherTabs) {
                    if (r.requestID != null) {
                        knownRequestIDs.add(r.requestID);
                    }
                }
                persistedRequests = [...persistedRequests, ...newFromOtherTabs];
                trackOnyxWrite(Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, persistedRequests));
                crossTabRequestsCallback?.();
                return;
            }

            // Reconcile deletions from the leader tab. When pendingOnyxWrites > 0,
            // the callback may be a stale own-write (broadcastUpdate fires synchronously
            // inside Onyx.set) — skip to preserve Issue 4 protection. When counter is 0,
            // the callback is from a cross-tab storage event, safe to remove from memory
            // any requests the leader already processed.
            if (pendingOnyxWrites === 0) {
                const diskIDs = new Set<number>();
                for (const r of val) {
                    if (r.requestID != null) {
                        diskIDs.add(r.requestID);
                    }
                }
                const previousLength = persistedRequests.length;
                persistedRequests = persistedRequests.filter((r) => r.requestID == null || diskIDs.has(r.requestID));
                if (persistedRequests.length !== previousLength) {
                    Log.info('[PersistedRequests] Reconciled deletions from leader tab', false, {
                        removedCount: previousLength - persistedRequests.length,
                        remainingCount: persistedRequests.length,
                    });
                }
            }
            return;
        }

        const previousInMemoryRequests = [...persistedRequests];
        const diskRequests = val ?? [];
        persistedRequests = diskRequests;
        for (const r of diskRequests) {
            if (r.requestID == null) {
                continue;
            }
            knownRequestIDs.add(r.requestID);
        }

        Log.info('[PersistedRequests] DISK vs MEMORY comparison', false, {
            diskRequestsLength: diskRequests.length,
            previousMemoryRequestsLength: previousInMemoryRequests.length,
            diskCommands: getCommands(diskRequests),
            previousMemoryCommands: getCommands(previousInMemoryRequests),
            mismatch: diskRequests.length !== previousInMemoryRequests.length,
        });

        // Process any pending save operations that were queued before initialization
        if (pendingSaveOperations.length > 0) {
            Log.info(`[PersistedRequests] Processing pending save operations, size: ${pendingSaveOperations.length}`, false, {
                pendingCommands: getCommands(pendingSaveOperations),
            });
            for (const r of pendingSaveOperations) {
                if (r.requestID != null) {
                    knownRequestIDs.add(r.requestID);
                }
            }
            const requests = [...persistedRequests, ...pendingSaveOperations];
            persistedRequests = requests;
            trackOnyxWrite(Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests));
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
    persistedRequests = [];
    pendingSaveOperations = [];
    knownRequestIDs.clear();
    Onyx.set(ONYXKEYS.PERSISTED_ONGOING_REQUESTS, null);
    return trackOnyxWrite(Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, []));
}

function getLength(): number {
    // Making it backwards compatible with the old implementation
    return persistedRequests.length + (ongoingRequest ? 1 : 0);
}

function save<TKey extends OnyxKey>(requestToPersist: Request<TKey>): Promise<void> {
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
        pendingSaveOperations.push(requestToPersist as AnyRequest);
        return Promise.resolve();
    }

    // If the command is not in the keepLastInstance array, add the new request as usual
    const requests = [...persistedRequests, requestToPersist];
    const previousLength = persistedRequests.length;
    persistedRequests = requests as AnyRequest[];
    if (requestToPersist.requestID != null) {
        knownRequestIDs.add(requestToPersist.requestID);
    }

    Log.info('[PersistedRequests] Request added to memory, persisting to disk', false, {
        command: requestToPersist.command,
        previousQueueLength: previousLength,
        newQueueLength: requests.length,
    });

    return trackOnyxWrite(Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests as AnyRequest[]))
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

function endRequestAndRemoveFromQueue<TKey extends OnyxKey>(requestToRemove: Request<TKey>) {
    Log.info('[PersistedRequests] endRequestAndRemoveFromQueue called', false, {
        commandToRemove: requestToRemove.command,
        currentOngoingCommand: ongoingRequest?.command ?? 'null',
        currentQueueLength: persistedRequests.length,
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
    });

    trackOnyxWrite(
        Onyx.multiSet({
            [ONYXKEYS.PERSISTED_REQUESTS]: persistedRequests,
            [ONYXKEYS.PERSISTED_ONGOING_REQUESTS]: null,
        }),
    ).then(() => {
        Log.info('[PersistedRequests] Successfully persisted request removal to disk', false, {
            command: requestToRemove.command,
            newQueueLength: getLength(),
        });
    });
}

function deleteRequestsByIndices(indices: number[]): Promise<void> {
    // Create a Set from the indices array for efficient lookup
    const indicesSet = new Set(indices);

    // Create a new array excluding elements at the specified indices
    persistedRequests = persistedRequests.filter((_, index) => !indicesSet.has(index));

    // Update the persisted requests in storage or state as necessary
    return trackOnyxWrite(Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, persistedRequests)).then(() => {
        Log.info(`Multiple (${indices.length}) requests removed from the queue. Queue length is ${persistedRequests.length}`);
    });
}

function update<TKey extends OnyxKey>(oldRequestIndex: number, newRequest: Request<TKey>): Promise<void> {
    const requests = [...persistedRequests];
    const oldRequest = requests.at(oldRequestIndex);
    Log.info('[PersistedRequests] Updating a request', false, {oldRequest, newRequest, oldRequestIndex});
    requests.splice(oldRequestIndex, 1, newRequest as AnyRequest);
    persistedRequests = requests;
    if (newRequest.requestID != null) {
        knownRequestIDs.add(newRequest.requestID);
    }
    return trackOnyxWrite(Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests));
}

function updateOngoingRequest<TKey extends OnyxKey>(newRequest: Request<TKey>) {
    Log.info('[PersistedRequests] Updating the ongoing request', false, {ongoingRequest, newRequest});
    ongoingRequest = newRequest as AnyRequest;

    if (newRequest.persistWhenOngoing) {
        Onyx.set(ONYXKEYS.PERSISTED_ONGOING_REQUESTS, newRequest as AnyRequest);
    }
}

function processNextRequest(): AnyRequest | null {
    if (ongoingRequest) {
        Log.info('[PersistedRequests] Ongoing Request already set, returning same one', false, {
            command: ongoingRequest.command,
            commandName: ongoingRequest.commandName,
        });
        return ongoingRequest;
    }

    Log.info('[PersistedRequests] processNextRequest called', false, {
        queueLength: persistedRequests.length,
    });

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
    });

    // Persist both the updated queue and the ongoing request to disk atomically.
    // This ensures that if the app crashes mid-flight, the ongoing request is not
    // lost (Bug #80759 Issue 3a) and the queue on disk matches memory (Issue 3c).
    // Skip persisting ongoingRequest when it contains non-serializable values
    // (e.g. File objects in data.file or data.receipt). IndexedDB cannot clone
    // native File objects (DataCloneError). These requests cannot survive a crash
    // anyway since File references are lost on restart.
    const hasNonSerializableData = ongoingRequest?.data && Object.values(ongoingRequest.data).some((v) => v instanceof File || v instanceof Blob);
    trackOnyxWrite(
        Onyx.multiSet({
            [ONYXKEYS.PERSISTED_REQUESTS]: persistedRequests,
            ...(ongoingRequest && !hasNonSerializableData ? {[ONYXKEYS.PERSISTED_ONGOING_REQUESTS]: ongoingRequest} : {}),
        }),
    );

    // Return the local reference, not `ongoingRequest`. The Onyx.multiSet above
    // triggers a synchronous callback (Onyx 3.0.46+) that overwrites `ongoingRequest`
    // with a JSON-serialized copy — which destroys non-serializable values like File
    // objects. The local `nextRequest` still holds the original object.
    return nextRequest;
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
        ongoingRequestCleared: true,
    });

    // Persist both changes to disk so a crash after rollback doesn't lose
    // the rolled-back request or leave a stale ongoingRequest on disk.
    trackOnyxWrite(
        Onyx.multiSet({
            [ONYXKEYS.PERSISTED_REQUESTS]: persistedRequests,
            [ONYXKEYS.PERSISTED_ONGOING_REQUESTS]: null,
        }),
    );
}

function getAll(): AnyRequest[] {
    return persistedRequests;
}

function getCommands(requests: AnyRequest[]): string[] {
    return requests.map((r) => r.command);
}

function getOngoingRequest(): AnyRequest | null {
    return ongoingRequest;
}

/**
 * Reset the pending Onyx write counter. Used ONLY in tests to simulate
 * a clean state before cross-tab event simulations. In production,
 * cross-tab updates arrive via storage events which are independent of
 * the Onyx.set promise lifecycle, so the counter is always 0 at that point.
 */
function resetPendingWritesForTest() {
    pendingOnyxWrites = 0;
}

export {
    clear,
    save,
    getAll,
    getCommands,
    endRequestAndRemoveFromQueue,
    update,
    getLength,
    getOngoingRequest,
    processNextRequest,
    updateOngoingRequest,
    rollbackOngoingRequest,
    deleteRequestsByIndices,
    onInitialization,
    onCrossTabRequestsMerged,
    resetPendingWritesForTest,
};
