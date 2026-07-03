import {setIsOpenAppFailureModalOpen} from '@libs/actions/isOpenAppFailureModalOpen';
import {
    deleteRequestsByIndices as deletePersistedRequestsByIndices,
    endRequestAndRemoveFromQueue as endPersistedRequestAndRemoveFromQueue,
    getAll as getAllPersistedRequests,
    getCommands,
    getOngoingRequest as getPersistedOngoingRequest,
    onCrossTabRequestsMerged as onPersistedRequestsCrossTabMerge,
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
import {getIsOffline as isOfflineNetwork} from '@libs/NetworkState';
import {processWithMiddleware} from '@libs/Request';
import RequestThrottle from '@libs/RequestThrottle';
import {logReceiptEnqueued, RECEIPT_BEARING_COMMANDS} from '@libs/telemetry/ReceiptObservability';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type OnyxRequest from '@src/types/onyx/Request';
import type {AnyOnyxUpdate, AnyRequest, ConflictData} from '@src/types/onyx/Request';

import type {OnyxKey, OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

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

let resolveIsReadyPromise: (() => void) | undefined;
let isReadyPromise: Promise<void> = Promise.resolve();
let isReadyPromisePending = false;

/**
 * Marks isReadyPromise as pending so any READ that consults waitForIdle() parks behind us.
 * Idempotent: if already pending, no-op (avoids orphaning subscribers from prior pushes).
 * Called from push()'s sync prelude before the first await, so READs on the next sync line
 * see the pending promise.
 */
function setIsReadyPromisePending() {
    if (isReadyPromisePending) {
        return;
    }
    isReadyPromise = new Promise<void>((resolve) => {
        resolveIsReadyPromise = () => {
            isReadyPromisePending = false;
            resolve();
        };
    });
    isReadyPromisePending = true;
}

let isSequentialQueueRunning = false;
let currentRequestPromise: Promise<void> | null = null;
let isQueuePaused = false;
const sequentialQueueRequestThrottle = new RequestThrottle('SequentialQueue');

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
    return flushQueue();
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
        Log.info('[SequentialQueue] QueueFlushedData has been stored.', false, {
            newValue,
        });
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
    // When the queue is paused, return early. This prevents any new requests from happening.
    // The queue will be flushed again when the queue is unpaused.
    if (isQueuePaused) {
        Log.info('[SequentialQueue] Unable to process. Queue is paused.');
        return Promise.resolve();
    }

    if (isOfflineNetwork()) {
        Log.info('[SequentialQueue] Unable to process. We are offline.');
        return Promise.resolve();
    }

    const persistedRequests = getAllPersistedRequests();
    const ongoingRequest = getPersistedOngoingRequest();

    Log.info('[SequentialQueue] process() called', false, {
        persistedRequestsLength: persistedRequests.length,
        hasOngoingRequest: !!ongoingRequest,
        isSequentialQueueRunning,
    });

    if (persistedRequests.length === 0 && !ongoingRequest) {
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
            Log.info('[SequentialQueue] Continuing to process next request');
            return process();
        })
        .catch((error: RequestError) => {
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

            if (error.message === CONST.ERROR.ALREADY_CREATED) {
                const onyxUpdates = [...(requestToProcess.successData ?? []), ...(requestToProcess.finallyData ?? [])] as AnyOnyxUpdate[];
                Log.info('[SequentialQueue] Applying success and finally data on ALREADY_CREATED — resource already exists server-side', false, {
                    command: requestToProcess.command,
                    updatesCount: onyxUpdates.length,
                });
                Onyx.update(onyxUpdates);
                Log.info('[SequentialQueue] Removing persisted request because the resource was already created server-side.', false, {
                    command: requestToProcess.command,
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
    // When the queue is paused, return early. This will keep an requests in the queue and they will get flushed again when
    // the queue is unpaused
    if (isQueuePaused) {
        Log.info('[SequentialQueue] Unable to flush. Queue is paused.');
        return;
    }

    if (isOfflineNetwork()) {
        Log.info('[SequentialQueue] Unable to flush. We are offline.');
        return;
    }

    if (isSequentialQueueRunning) {
        Log.info('[SequentialQueue] Unable to flush. Queue is already running.');
        return;
    }

    const currentPersistedRequests = getAllPersistedRequests();
    const currentOngoingRequest = getPersistedOngoingRequest();
    const persistedRequestsLength = currentPersistedRequests.length;
    const hasOnyxUpdates = !isEmpty();

    Log.info('[SequentialQueue] flush() called', false, {
        shouldResetPromise,
        persistedRequestsLength,
        hasOngoingRequest: !!currentOngoingRequest,
        hasQueuedOnyxUpdates: hasOnyxUpdates,
        isClientTheLeader: isClientTheLeader(),
    });

    if (persistedRequestsLength === 0 && !currentOngoingRequest && !hasOnyxUpdates) {
        Log.info('[SequentialQueue] Unable to flush. No requests or queued Onyx updates to process.');
        // push() may have marked isReadyPromise pending in its sync prelude (e.g. a conflict
        // resolver deleted the only request without pushing a replacement). Resolve here so READs
        // parked on waitForIdle() don't hang until unrelated queue activity releases them.
        resolveIsReadyPromise?.();
        return;
    }

    Log.info('[SequentialQueue] Checking if client is leader', false, {
        persistedRequestsLength,
        hasOngoingRequest: !!currentOngoingRequest,
        hasOnyxUpdates,
    });

    // ONYXKEYS.PERSISTED_REQUESTS is shared across clients, thus every client/tab will have a copy
    // It is very important to only process the queue from leader client otherwise requests will be duplicated.
    if (!isClientTheLeader()) {
        Log.info('[SequentialQueue] Unable to flush. Client is not the leader.', false, {
            persistedRequestsLength,
            hasOngoingRequest: !!currentOngoingRequest,
        });
        // push() may have marked isReadyPromise pending in its sync prelude. Followers never
        // process the queue, so resolve here — otherwise READs parked on waitForIdle() would
        // hang forever on this tab after any write.
        resolveIsReadyPromise?.();
        return;
    }

    Log.info('[SequentialQueue] Starting queue processing', false, {
        persistedRequestsLength,
        hasOngoingRequest: !!currentOngoingRequest,
        persistedCommands: getCommands(currentPersistedRequests),
    });

    isSequentialQueueRunning = true;

    if (shouldResetPromise) {
        // Mark isReadyPromise as pending so READs (waitForIdle) park behind us.
        // Idempotent — safe if push() already marked it pending in its sync prelude.
        setIsReadyPromisePending();
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
                ongoingCommand: getPersistedOngoingRequest()?.command ?? 'null',
            });
            Onyx.disconnect(connection);
            process().finally(() => {
                const remainingPersistedRequests = getAllPersistedRequests().length;
                const hasOngoingRequest = !!getPersistedOngoingRequest();
                const hasRemainingRequests = remainingPersistedRequests > 0 || hasOngoingRequest;
                Log.info('[SequentialQueue] Finished processing queue.', false, {
                    remainingRequests: remainingPersistedRequests,
                    isOffline: isOfflineNetwork(),
                    willResolvePromise: isOfflineNetwork() || !hasRemainingRequests,
                });

                isSequentialQueueRunning = false;
                // Use isOfflineNetwork() — not isQueuePaused — to decide whether to resolve isReadyPromise.
                // isQueuePaused is true for both offline pauses AND shouldPauseQueue (data gap sync).
                // For shouldPauseQueue, WRITEs are still pending so READs must wait (don't resolve).
                // For offline, the queue can't process anyway so READs should proceed (resolve).
                if (isOfflineNetwork() || !hasRemainingRequests) {
                    Log.info('[SequentialQueue] Resolving isReadyPromise', false, {
                        reason: isOfflineNetwork() ? 'offline' : 'queue empty',
                    });
                    resolveIsReadyPromise?.();
                }
                currentRequestPromise = null;

                // The queue can be paused when we sync the data with backend so we should only update the Onyx data when the queue is empty
                if (!hasRemainingRequests) {
                    Log.info('[SequentialQueue] Queue is empty, flushing Onyx updates');
                    flushOnyxUpdatesQueue()?.then(() => {
                        const queueFlushedData = getQueueFlushedData();
                        if (queueFlushedData.length === 0) {
                            Log.info('[SequentialQueue] No queueFlushedData to apply');
                            return;
                        }
                        Log.info('[SequentialQueue] Applying queueFlushedData', false, {
                            queueFlushedDataLength: queueFlushedData.length,
                        });
                        Onyx.update(queueFlushedData).then(() => {
                            Log.info('[SequentialQueue] QueueFlushedData has been applied and stored', false, {
                                queueFlushedDataLength: queueFlushedData.length,
                            });
                            clearQueueFlushedData();
                        });
                    });
                } else {
                    Log.info('[SequentialQueue] Queue still has requests, NOT flushing Onyx updates', false, {
                        remainingRequests: remainingPersistedRequests,
                        hasOngoingRequest,
                    });
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
    const currentOngoingRequest = getPersistedOngoingRequest();
    const numberOfPersistedRequests = currentPersistedRequests.length;
    const persistedCommands = getCommands(currentPersistedRequests);

    Log.info('[SequentialQueue] Unpausing the queue', false, {
        numberOfPersistedRequests,
        hasOngoingRequest: !!currentOngoingRequest,
        persistedCommands,
    });

    isQueuePaused = false;

    // If there are no persisted requests, we need to flush the Onyx updates queue
    if (numberOfPersistedRequests === 0 && !currentOngoingRequest) {
        Log.info('[SequentialQueue] No persisted requests, flushing Onyx updates queue');
        flushOnyxUpdatesQueue();
    }

    // We pass shouldResetPromise=false to preserve the existing isReadyPromise so that
    // pending READ requests (waiting via waitForIdle()) resolve correctly after WRITEs complete.
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

// Flush the queue when the persisted requests are initialized
onPersistedRequestsInitialization(flush);

// Flush the queue when another tab enqueues new requests
onPersistedRequestsCrossTabMerge(flush);

async function handleConflictActions<TKey extends OnyxKey>(conflictAction: ConflictData, newRequest: OnyxRequest<TKey>): Promise<void> {
    Log.info('[SequentialQueue] handleConflictActions', false, {
        conflictType: conflictAction.type,
        newCommand: newRequest.command,
        currentQueueLength: getAllPersistedRequests().length,
    });

    if (conflictAction.type === 'push') {
        Log.info('[SequentialQueue] Conflict resolution: PUSH', false, {
            command: newRequest.command,
        });
        await savePersistedRequest(newRequest);
    } else if (conflictAction.type === 'replace') {
        Log.info('[SequentialQueue] Conflict resolution: REPLACE', false, {
            command: newRequest.command,
            replaceIndex: conflictAction.index,
            replacementRequest: conflictAction.request?.command ?? newRequest.command,
        });
        await updatePersistedRequest(conflictAction.index, conflictAction.request ?? (newRequest as AnyRequest));
    } else if (conflictAction.type === 'delete') {
        Log.info('[SequentialQueue] Conflict resolution: DELETE', false, {
            command: newRequest.command,
            deleteIndices: conflictAction.indices,
            willPushNewRequest: conflictAction.pushNewRequest ?? false,
            hasNextAction: !!conflictAction.nextAction,
        });
        await deletePersistedRequestsByIndices(conflictAction.indices);
        if (conflictAction.pushNewRequest) {
            Log.info('[SequentialQueue] Pushing new request after delete', false, {
                command: newRequest.command,
            });
            await savePersistedRequest(newRequest);
        }
        if (conflictAction.nextAction) {
            Log.info('[SequentialQueue] Processing next conflict action', false, {
                command: newRequest.command,
                nextActionType: conflictAction.nextAction.type,
            });
            await handleConflictActions(conflictAction.nextAction, newRequest);
        }
    } else {
        Log.info('[SequentialQueue] No action performed, request ignored', false, {
            command: newRequest.command,
            conflictType: conflictAction.type,
        });
    }
}

async function push<TKey extends OnyxKey>(newRequest: OnyxRequest<TKey>): Promise<void> {
    const currentRequests = getAllPersistedRequests();
    Log.info('[SequentialQueue] push() called', false, {
        command: newRequest.command,
        hasConflictChecker: !!newRequest.checkAndFixConflictingRequest,
        currentQueueLength: currentRequests.length,
        isOffline: isOfflineNetwork(),
        isSequentialQueueRunning,
    });

    if (RECEIPT_BEARING_COMMANDS.has(newRequest.command)) {
        const data = (newRequest.data ?? {}) as {
            transactionID?: string;
            receipt?: {receiptTraceId?: string};
        };
        // Only log when the receipt is reachable at data.receipt — SplitBill nests it in the splits JSON and SendMoney/etc.
        // can run without one. A row without a trace id cannot be joined to the capture log and is just noise.
        if (data.receipt) {
            logReceiptEnqueued({
                receiptTraceId: data.receipt.receiptTraceId,
                transactionID: data.transactionID,
                command: newRequest.command,
                persistedQueueLength: currentRequests.length,
            });
        }
    }

    // Save the request to the persisted queue. The in-memory update inside save()
    // happens synchronously, so flush() below will see the new request immediately.
    // The returned promise resolves when disk persistence completes.
    let persistencePromise: Promise<void>;

    if (newRequest.checkAndFixConflictingRequest) {
        const {conflictAction} = newRequest.checkAndFixConflictingRequest(currentRequests as Array<OnyxRequest<TKey>>);
        Log.info('[SequentialQueue] Conflict action determined', false, {
            command: newRequest.command,
            conflictType: conflictAction.type,
        });

        // don't try to serialize a function.
        // eslint-disable-next-line no-param-reassign
        delete newRequest.checkAndFixConflictingRequest;
        persistencePromise = handleConflictActions(conflictAction, newRequest);
    } else {
        persistencePromise = savePersistedRequest(newRequest);
    }

    if (isOfflineNetwork()) {
        Log.info('[SequentialQueue] Request persisted but not flushing — we are offline', false, {
            command: newRequest.command,
            queueLength: getAllPersistedRequests().length,
        });
        await persistencePromise;
        return;
    }

    // Mark the ready-promise pending sync (before the first await) so any READ that fires on
    // the next synchronous line via waitForIdle() correctly parks behind this write.
    setIsReadyPromisePending();

    // Block until the Onyx disk commit lands so flush() → XHR cannot race the disk write —
    // a process kill in that window would lose the request on next launch.
    try {
        await persistencePromise;
    } catch {
        // Backstop: persistence alerts+swallows on failure, so this shouldn't reject. If it ever does,
        // flush anyway (the request is already in the in-memory queue) rather than stranding isReadyPromise.
        Log.info('[SequentialQueue] Persist rejected — flushing anyway', false, {
            command: newRequest.command,
        });
    }

    // The network may have flipped offline while we awaited the disk write. flush() would
    // early-return on its offline check without resolving isReadyPromise, leaving READs parked
    // on waitForIdle() until an unrelated reconnect drains the queue. Resolve here so READs
    // proceed — consistent with flush() resolving isReadyPromise when offline.
    if (isOfflineNetwork()) {
        Log.info('[SequentialQueue] Went offline during persist — resolving isReadyPromise without flushing', false, {
            command: newRequest.command,
        });
        resolveIsReadyPromise?.();
        return;
    }

    if (isSequentialQueueRunning) {
        Log.info('[SequentialQueue] Queue is running. Will flush when the current request is finished.', false, {
            command: newRequest.command,
        });
        isReadyPromise.then(() => flush(false));
        return;
    }

    Log.info('[SequentialQueue] Queue is not running. Flushing the queue.', false, {
        command: newRequest.command,
    });
    flush(false);
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
    isReadyPromise = Promise.resolve();
    isReadyPromisePending = false;
    resolveIsReadyPromise = undefined;
}

export {
    flush,
    getCurrentRequest,
    isPaused,
    isRunning,
    pause,
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
