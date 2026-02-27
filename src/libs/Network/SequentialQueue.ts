import type {Span} from '@sentry/core';
import * as Sentry from '@sentry/react-native';
import type {OnyxKey, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {setIsOpenAppFailureModalOpen} from '@libs/actions/isOpenAppFailureModalOpen';
import {
    deleteRequestsByIndices as deletePersistedRequestsByIndices,
    endRequestAndRemoveFromQueue as endPersistedRequestAndRemoveFromQueue,
    getAll as getAllPersistedRequests,
    getCommands,
    onInitialization as onPersistedRequestsInitialization,
    processNextRequest as processNextPersistedRequest,
    rollbackOngoingRequest as rollbackOngoingPersistedRequest,
    save as savePersistedRequest,
    update as updatePersistedRequest,
} from '@libs/actions/PersistedRequests';
import {flushQueue, isEmpty} from '@libs/actions/QueuedOnyxUpdates';
import {isClientTheLeader} from '@libs/ActiveClientManager';
import {WRITE_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';
import {processWithMiddleware} from '@libs/Request';
import RequestThrottle from '@libs/RequestThrottle';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type OnyxRequest from '@src/types/onyx/Request';
import type {AnyOnyxUpdate, AnyRequest, ConflictData} from '@src/types/onyx/Request';
import {isOffline, onReconnection} from './NetworkStore';

let shouldFailAllRequests: boolean;
// Use connectWithoutView since this is for network data and don't affect to any UI
Onyx.connectWithoutView({
    key: ONYXKEYS.NETWORK,
    callback: (network) => {
        if (!network) {
            return;
        }
        shouldFailAllRequests = !!network.shouldFailAllRequests;
    },
});

type RequestError = Error & {
    name?: string;
    message?: string;
    status?: string;
};

let resolveIsReadyPromise: ((args?: unknown[]) => void) | undefined;
let isReadyPromise = new Promise((resolve) => {
    resolveIsReadyPromise = resolve;
});

// Resolve the isReadyPromise immediately so that the queue starts working as soon as the page loads
resolveIsReadyPromise?.();

let isSequentialQueueRunning = false;
let currentRequestPromise: Promise<void> | null = null;
let isQueuePaused = false;
const sequentialQueueRequestThrottle = new RequestThrottle('SequentialQueue');

let currentFlushSpan: Span | undefined;
let currentProcessSpan: Span | undefined;

function getFlushSpan(): Span | undefined {
    return currentFlushSpan;
}

/**
 * Puts the queue into a paused state so that no requests will be processed
 */
function pause() {
    if (isQueuePaused) {
        Log.info('[SequentialQueue] Queue already paused');
        return;
    }

    Log.info('[SequentialQueue] Pausing the queue');
    isQueuePaused = true;
}

/**
 * Gets the current Onyx queued updates, apply them and clear the queue if the queue is not paused.
 */
function flushOnyxUpdatesQueue() {
    // The only situation where the queue is paused is if we found a gap between the app current data state and our server's. If that happens,
    // we'll trigger async calls to make the client updated again. While we do that, we don't want to insert anything in Onyx.
    if (isQueuePaused) {
        Log.info('[SequentialQueue] Queue already paused');
        return;
    }
    const span = Sentry.startInactiveSpan({
        name: CONST.TELEMETRY.SPAN_FLUSH_ONYX_UPDATES_QUEUE,
        op: CONST.TELEMETRY.SPAN_FLUSH_ONYX_UPDATES_QUEUE,
        parentSpan: currentFlushSpan,
    });
    return flushQueue()
        ?.then((result) => {
            span.setStatus({code: 1});
            span.end();
            return result;
        })
        .catch((error: unknown) => {
            span.setStatus({code: 2, message: error instanceof Error ? error.message : undefined});
            span.end();
            throw error;
        });
}

let queueFlushedDataToStore: AnyOnyxUpdate[] = [];

// Use connectWithoutView since this is for network queue and don't affect to any UI
Onyx.connectWithoutView({
    key: ONYXKEYS.QUEUE_FLUSHED_DATA,
    callback: (val) => {
        if (!val) {
            return;
        }
        queueFlushedDataToStore = val;
    },
});

function saveQueueFlushedData<TKey extends OnyxKey>(...onyxUpdates: Array<OnyxUpdate<TKey>>) {
    const newValue = [...queueFlushedDataToStore, ...onyxUpdates];
    // eslint-disable-next-line rulesdir/prefer-actions-set-data
    return Onyx.set(ONYXKEYS.QUEUE_FLUSHED_DATA, newValue).then(() => {
        Log.info('[SequentialQueue] QueueFlushedData has been stored.', false, {newValue});
    });
}
function clearQueueFlushedData() {
    // eslint-disable-next-line rulesdir/prefer-actions-set-data
    return Onyx.set(ONYXKEYS.QUEUE_FLUSHED_DATA, null).then(() => {
        queueFlushedDataToStore.length = 0;
        Log.info('[SequentialQueue] QueueFlushedData has been cleared.');
    });
}
function getQueueFlushedData() {
    return queueFlushedDataToStore;
}

/**
 * Process any persisted requests, when online, one at a time until the queue is empty.
 *
 * If a request fails due to some kind of network error, such as a request being throttled or when our backend is down, then we retry it with an exponential back off process until a response
 * is successfully returned. The first time a request fails we set a random, small, initial wait time. After waiting, we retry the request. If there are subsequent failures the request wait
 * time is doubled creating an exponential back off in the frequency of requests hitting the server. Since the initial wait time is random and it increases exponentially, the load of
 * requests to our backend is evenly distributed and it gradually decreases with time, which helps the servers catch up.
 */
function process(): Promise<void> {
    // When the queue is paused, return early. This prevents any new requests from happening. The queue will be flushed again when the queue is unpaused.
    if (isQueuePaused) {
        Log.info('[SequentialQueue] Unable to process. Queue is paused.');
        return Promise.resolve();
    }

    if (isOffline()) {
        Log.info('[SequentialQueue] Unable to process. We are offline.');
        return Promise.resolve();
    }

    const persistedRequests = getAllPersistedRequests();

    Log.info('[SequentialQueue] process() called', false, {
        persistedRequestsLength: persistedRequests.length,
        isSequentialQueueRunning,
    });

    if (persistedRequests.length === 0) {
        Log.info('[SequentialQueue] Unable to process. No requests to process.');
        return Promise.resolve();
    }

    const requestToProcess = processNextPersistedRequest();
    if (!requestToProcess) {
        Log.info('[SequentialQueue] Unable to process. No next request to handle.');
        return Promise.resolve();
    }

    Log.info('[SequentialQueue] Starting to process request', false, {
        command: requestToProcess.command,
        isRollback: requestToProcess.isRollback ?? false,
        persistWhenOngoing: requestToProcess.persistWhenOngoing ?? false,
    });

    currentProcessSpan = Sentry.startInactiveSpan({
        name: CONST.TELEMETRY.SPAN_SEQUENTIAL_QUEUE_PROCESS,
        op: CONST.TELEMETRY.SPAN_SEQUENTIAL_QUEUE_PROCESS,
        parentSpan: currentFlushSpan,
        attributes: {
            [CONST.TELEMETRY.ATTRIBUTE_COMMAND]: requestToProcess.command,
        },
    });

    // Set the current request to a promise awaiting its processing so that getCurrentRequest can be used to take some action after the current request has processed.
    currentRequestPromise = processWithMiddleware(requestToProcess, true)
        .then((response) => {
            Log.info('[SequentialQueue] Request processed successfully', false, {
                command: requestToProcess.command,
                shouldPauseQueue: response?.shouldPauseQueue ?? false,
                hasQueueFlushedData: !!requestToProcess.queueFlushedData,
            });

            // A response might indicate that the queue should be paused. This happens when a gap in onyx updates is detected between the client and the server and
            // that gap needs resolved before the queue can continue.
            if (response?.shouldPauseQueue) {
                Log.info("[SequentialQueue] Handled 'shouldPauseQueue' in response. Pausing the queue.");
                pause();
            }

            Log.info('[SequentialQueue] Removing persisted request because it was processed successfully.', false, {
                command: requestToProcess.command,
                remainingRequests: getAllPersistedRequests().length,
            });
            endPersistedRequestAndRemoveFromQueue(requestToProcess);

            if (requestToProcess.queueFlushedData) {
                Log.info('[SequentialQueue] Will store queueFlushedData.', false, {
                    command: requestToProcess.command,
                    queueFlushedDataLength: requestToProcess.queueFlushedData.length,
                });
                saveQueueFlushedData(...requestToProcess.queueFlushedData);
            }

            sequentialQueueRequestThrottle.clear();
            currentProcessSpan?.setStatus({code: 1});
            currentProcessSpan?.end();
            currentProcessSpan = undefined;
            Log.info('[SequentialQueue] Continuing to process next request');
            return process();
        })
        .catch((error: RequestError) => {
            currentProcessSpan?.setStatus({code: 2, message: error.message});
            currentProcessSpan?.end();
            currentProcessSpan = undefined;

            Log.info('[SequentialQueue] Request failed with error', false, {
                command: requestToProcess.command,
                errorName: error.name ?? 'unknown',
                errorMessage: error.message ?? 'unknown',
                errorStatus: error.status ?? 'unknown',
                shouldFailAllRequests,
            });

            // On sign out we cancel any in flight requests from the user. Since that user is no longer signed in their requests should not be retried.
            // Duplicate records don't need to be retried as they just mean the record already exists on the server
            if (error.name === CONST.ERROR.REQUEST_CANCELLED || error.message === CONST.ERROR.DUPLICATE_RECORD || shouldFailAllRequests) {
                if (shouldFailAllRequests) {
                    const onyxUpdates = [...(requestToProcess.failureData ?? []), ...(requestToProcess.finallyData ?? [])] as AnyOnyxUpdate[];
                    Log.info('[SequentialQueue] Applying failure and finally data because shouldFailAllRequests', false, {
                        command: requestToProcess.command,
                        updatesCount: onyxUpdates.length,
                    });
                    Onyx.update(onyxUpdates);
                }
                Log.info("[SequentialQueue] Removing persisted request because it failed and doesn't need to be retried.", false, {
                    command: requestToProcess.command,
                    errorName: error.name,
                    errorMessage: error.message,
                });
                endPersistedRequestAndRemoveFromQueue(requestToProcess);
                sequentialQueueRequestThrottle.clear();
                return process();
            }
            // For rate limiting errors (429) on ResendValidateCode, don't retry to prevent spam
            if (error.message === CONST.ERROR.THROTTLED && requestToProcess.command === WRITE_COMMANDS.RESEND_VALIDATE_CODE) {
                Log.info('[SequentialQueue] RESEND_VALIDATE_CODE throttled, not retrying', false, {
                    command: requestToProcess.command,
                });
                Onyx.update(requestToProcess.failureData ?? []);
                endPersistedRequestAndRemoveFromQueue(requestToProcess);
                sequentialQueueRequestThrottle.clear();
                return process();
            }

            Log.info('[SequentialQueue] Will retry request after rollback and throttle delay', false, {
                command: requestToProcess.command,
                errorMessage: error.message,
            });

            rollbackOngoingPersistedRequest();
            return sequentialQueueRequestThrottle
                .sleep(error, requestToProcess.command)
                .then(() => {
                    Log.info('[SequentialQueue] Throttle delay completed, retrying request', false, {
                        command: requestToProcess.command,
                    });
                    return process();
                })
                .catch(() => {
                    Log.info('[SequentialQueue] Request failed too many times, giving up', false, {
                        command: requestToProcess.command,
                        errorMessage: error.message,
                    });
                    Onyx.update(requestToProcess.failureData ?? []);
                    endPersistedRequestAndRemoveFromQueue(requestToProcess);
                    sequentialQueueRequestThrottle.clear();
                    if (requestToProcess.command === WRITE_COMMANDS.OPEN_APP) {
                        setIsOpenAppFailureModalOpen(true);
                    }
                    return process();
                });
        });

    return currentRequestPromise;
}

/**
 * @param shouldResetPromise Determines whether the isReadyPromise should be reset.
 * A READ request will wait until all the WRITE requests are done, using the isReadyPromise promise.
 * Resetting can cause unresolved READ requests to hang if tied to the old promise,
 * so some cases (e.g., unpausing) require skipping the reset to maintain proper behavior.
 */
function flush(shouldResetPromise = true) {
    // When the queue is paused, return early. This will keep an requests in the queue and they will get flushed again when the queue is unpaused
    if (isQueuePaused) {
        Log.info('[SequentialQueue] Unable to flush. Queue is paused.');
        return;
    }

    if (isSequentialQueueRunning) {
        Log.info('[SequentialQueue] Unable to flush. Queue is already running.');
        return;
    }

    const currentPersistedRequests = getAllPersistedRequests();
    const persistedRequestsLength = currentPersistedRequests.length;
    const hasOnyxUpdates = !isEmpty();

    Log.info('[SequentialQueue] flush() called', false, {
        shouldResetPromise,
        persistedRequestsLength,
        hasQueuedOnyxUpdates: hasOnyxUpdates,
        isClientTheLeader: isClientTheLeader(),
    });

    if (persistedRequestsLength === 0 && !hasOnyxUpdates) {
        Log.info('[SequentialQueue] Unable to flush. No requests or queued Onyx updates to process.');
        return;
    }

    Log.info('[SequentialQueue] Checking if client is leader', false, {
        persistedRequestsLength,
        hasOnyxUpdates,
    });

    // ONYXKEYS.PERSISTED_REQUESTS is shared across clients, thus every client/tab will have a copy
    // It is very important to only process the queue from leader client otherwise requests will be duplicated.
    if (!isClientTheLeader()) {
        Log.info('[SequentialQueue] Unable to flush. Client is not the leader.', false, {
            persistedRequestsLength,
        });
        return;
    }

    Log.info('[SequentialQueue] Starting queue processing', false, {
        persistedRequestsLength,
        persistedCommands: getCommands(currentPersistedRequests),
    });

    currentFlushSpan = Sentry.startInactiveSpan({
        name: CONST.TELEMETRY.SPAN_SEQUENTIAL_QUEUE_FLUSH,
        op: CONST.TELEMETRY.SPAN_SEQUENTIAL_QUEUE_FLUSH,
        attributes: {
            [CONST.TELEMETRY.ATTRIBUTE_QUEUE_LENGTH]: persistedRequestsLength,
        },
    });

    isSequentialQueueRunning = true;

    if (shouldResetPromise) {
        // Reset the isReadyPromise so that the queue will be flushed as soon as the request is finished
        isReadyPromise = new Promise((resolve) => {
            resolveIsReadyPromise = resolve;
        });
    }

    // Ensure persistedRequests are read from storage before proceeding with the queue
    // Use connectWithoutView since this is for network queue and don't affect to any UI
    const connection = Onyx.connectWithoutView({
        key: ONYXKEYS.PERSISTED_REQUESTS,
        // We exceptionally opt out of reusing the connection here to avoid extra callback calls due to
        // an existing connection already made in PersistedRequests.ts.
        reuseConnection: false,
        callback: () => {
            Log.info('[SequentialQueue] PERSISTED_REQUESTS loaded, starting process()', false, {
                requestsLength: getAllPersistedRequests().length,
            });
            Onyx.disconnect(connection);
            process().finally(() => {
                const remainingRequests = getAllPersistedRequests().length;
                Log.info('[SequentialQueue] Finished processing queue.', false, {
                    remainingRequests,
                    isOffline: isOffline(),
                    willResolvePromise: isOffline() || remainingRequests === 0,
                });

                isSequentialQueueRunning = false;
                if (isOffline() || remainingRequests === 0) {
                    Log.info('[SequentialQueue] Resolving isReadyPromise', false, {
                        reason: isOffline() ? 'offline' : 'queue empty',
                    });
                    resolveIsReadyPromise?.();
                }
                currentRequestPromise = null;

                const endFlushSpanOk = () => {
                    currentFlushSpan?.setStatus({code: 1});
                    currentFlushSpan?.end();
                    currentFlushSpan = undefined;
                };
                const endFlushSpanErr = (error: unknown) => {
                    currentFlushSpan?.setStatus({code: 2, message: error instanceof Error ? error.message : undefined});
                    currentFlushSpan?.end();
                    currentFlushSpan = undefined;
                };

                // The queue can be paused when we sync the data with backend so we should only update the Onyx data when the queue is empty
                if (remainingRequests === 0) {
                    Log.info('[SequentialQueue] Queue is empty, flushing Onyx updates');
                    const flushPromise = flushOnyxUpdatesQueue()?.then(() => {
                        const queueFlushedData = getQueueFlushedData();
                        if (queueFlushedData.length === 0) {
                            Log.info('[SequentialQueue] No queueFlushedData to apply');
                            return;
                        }
                        Log.info('[SequentialQueue] Applying queueFlushedData', false, {
                            queueFlushedDataLength: queueFlushedData.length,
                        });
                        return Onyx.update(queueFlushedData).then(() => {
                            Log.info('[SequentialQueue] QueueFlushedData has been applied and stored', false, {
                                queueFlushedDataLength: queueFlushedData.length,
                            });
                            clearQueueFlushedData();
                        });
                    });
                    if (flushPromise) {
                        flushPromise.then(endFlushSpanOk).catch(endFlushSpanErr);
                    } else {
                        endFlushSpanOk();
                    }
                } else {
                    Log.info('[SequentialQueue] Queue still has requests, NOT flushing Onyx updates', false, {
                        remainingRequests,
                    });
                    endFlushSpanOk();
                }
            });
        },
    });
}

/**
 * Unpauses the queue and flushes all the requests that were in it or were added to it while paused
 */
function unpause() {
    if (!isQueuePaused) {
        Log.info('[SequentialQueue] Unable to unpause queue. We are already processing.');
        return;
    }

    const currentPersistedRequests = getAllPersistedRequests();
    const numberOfPersistedRequests = currentPersistedRequests.length;
    const persistedCommands = getCommands(currentPersistedRequests);

    Log.info('[SequentialQueue] Unpausing the queue', false, {
        numberOfPersistedRequests,
        persistedCommands,
    });

    isQueuePaused = false;

    // If there are no persisted requests, we need to flush the Onyx updates queue
    if (numberOfPersistedRequests === 0) {
        Log.info('[SequentialQueue] No persisted requests, flushing Onyx updates queue');
        flushOnyxUpdatesQueue();
    }

    // When the queue is paused and then unpaused, we call flush which by defaults recreates the isReadyPromise.
    // After all the WRITE requests are done, the isReadyPromise is resolved, but since it's a new instance of promise,
    // the pending READ request never received the resolved callback. That's why we don't want to recreate
    // the promise when unpausing the queue.
    Log.info('[SequentialQueue] Calling flush(false) to start processing', false, {
        numberOfPersistedRequests,
    });
    flush(false);
}

function isRunning(): boolean {
    return isSequentialQueueRunning;
}

function isPaused(): boolean {
    return isQueuePaused;
}

function getShouldFailAllRequests(): boolean {
    return shouldFailAllRequests;
}

// Flush the queue when the connection resumes
onReconnection(flush);

// Flush the queue when the persisted requests are initialized
onPersistedRequestsInitialization(flush);

function handleConflictActions<TKey extends OnyxKey>(conflictAction: ConflictData, newRequest: OnyxRequest<TKey>) {
    Log.info('[SequentialQueue] handleConflictActions', false, {
        conflictType: conflictAction.type,
        newCommand: newRequest.command,
        currentQueueLength: getAllPersistedRequests().length,
    });

    if (conflictAction.type === 'push') {
        Log.info('[SequentialQueue] Conflict resolution: PUSH', false, {
            command: newRequest.command,
        });
        savePersistedRequest(newRequest);
    } else if (conflictAction.type === 'replace') {
        Log.info('[SequentialQueue] Conflict resolution: REPLACE', false, {
            command: newRequest.command,
            replaceIndex: conflictAction.index,
            replacementRequest: conflictAction.request?.command ?? newRequest.command,
        });
        updatePersistedRequest(conflictAction.index, conflictAction.request ?? (newRequest as AnyRequest));
    } else if (conflictAction.type === 'delete') {
        Log.info('[SequentialQueue] Conflict resolution: DELETE', false, {
            command: newRequest.command,
            deleteIndices: conflictAction.indices,
            willPushNewRequest: conflictAction.pushNewRequest ?? false,
            hasNextAction: !!conflictAction.nextAction,
        });
        deletePersistedRequestsByIndices(conflictAction.indices);
        if (conflictAction.pushNewRequest) {
            Log.info('[SequentialQueue] Pushing new request after delete', false, {
                command: newRequest.command,
            });
            savePersistedRequest(newRequest);
        }
        if (conflictAction.nextAction) {
            Log.info('[SequentialQueue] Processing next conflict action', false, {
                command: newRequest.command,
                nextActionType: conflictAction.nextAction.type,
            });
            handleConflictActions(conflictAction.nextAction, newRequest);
        }
    } else {
        Log.info('[SequentialQueue] No action performed, request ignored', false, {
            command: newRequest.command,
            conflictType: conflictAction.type,
        });
    }
}

function push<TKey extends OnyxKey>(newRequest: OnyxRequest<TKey>) {
    const currentRequests = getAllPersistedRequests();
    Log.info('[SequentialQueue] push() called', false, {
        command: newRequest.command,
        hasConflictChecker: !!newRequest.checkAndFixConflictingRequest,
        currentQueueLength: currentRequests.length,
        isOffline: isOffline(),
        isSequentialQueueRunning,
    });

    if (newRequest.checkAndFixConflictingRequest) {
        const requests = currentRequests;
        Log.info('[SequentialQueue] Checking for conflicts', false, {
            command: newRequest.command,
            existingRequestsCount: requests.length,
        });

        const {conflictAction} = newRequest.checkAndFixConflictingRequest(requests as Array<OnyxRequest<TKey>>);
        Log.info('[SequentialQueue] Conflict action determined', false, {
            command: newRequest.command,
            conflictType: conflictAction.type,
        });

        // don't try to serialize a function.
        // eslint-disable-next-line no-param-reassign
        delete newRequest.checkAndFixConflictingRequest;
        handleConflictActions(conflictAction, newRequest);
    } else {
        Log.info('[SequentialQueue] No conflict action. Adding request to Persisted Requests', false, {
            command: newRequest.command,
        });
        // Add request to Persisted Requests so that it can be retried if it fails
        savePersistedRequest(newRequest);
    }

    // If we are offline we don't need to trigger the queue to empty as it will happen when we come back online
    if (isOffline()) {
        Log.info('[SequentialQueue] Unable to push request due to offline status', false, {
            command: newRequest.command,
            queueLength: getAllPersistedRequests().length,
        });
        return;
    }

    // If the queue is running this request will run once it has finished processing the current batch
    if (isSequentialQueueRunning) {
        Log.info('[SequentialQueue] Queue is running. Will flush when the current request is finished.', false, {
            command: newRequest.command,
        });
        isReadyPromise.then(() => {
            Log.info('[SequentialQueue] isReadyPromise resolved, flushing queue', false, {
                command: newRequest.command,
            });
            flush(true);
        });
        return;
    }

    Log.info('[SequentialQueue] Queue is not running. Flushing the queue.', false, {
        command: newRequest.command,
    });
    flush(true);
}

function getCurrentRequest(): Promise<void> {
    if (currentRequestPromise === null) {
        return Promise.resolve();
    }
    return currentRequestPromise;
}

/**
 * Returns a promise that resolves when the sequential queue is done processing all persisted write requests.
 */
function waitForIdle(): Promise<unknown> {
    return isReadyPromise;
}

/**
 * Clear any pending requests during test runs
 * This is to prevent previous requests interfering with other tests
 */
function resetQueue(): void {
    isSequentialQueueRunning = false;
    currentRequestPromise = null;
    isQueuePaused = false;
    isReadyPromise = new Promise((resolve) => {
        resolveIsReadyPromise = resolve;
    });
    resolveIsReadyPromise?.();
}

function getProcessSpan(): Span | undefined {
    return currentProcessSpan;
}

export {
    flush,
    getCurrentRequest,
    getFlushSpan,
    getProcessSpan,
    getShouldFailAllRequests,
    isPaused,
    isRunning,
    pause,
    process,
    push,
    resetQueue,
    sequentialQueueRequestThrottle,
    unpause,
    waitForIdle,
    getQueueFlushedData,
    saveQueueFlushedData,
    clearQueueFlushedData,
};
export type {RequestError};
