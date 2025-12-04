import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {AppState} from 'react-native';
import {setIsOpenAppFailureModalOpen} from '@libs/actions/isOpenAppFailureModalOpen';
import {
    deleteRequestsByIndices as deletePersistedRequestsByIndices,
    endRequestAndRemoveFromQueue as endPersistedRequestAndRemoveFromQueue,
    getAll as getAllPersistedRequests,
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
import type {ConflictData} from '@src/types/onyx/Request';
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

let queueFlushedDataToStore: OnyxUpdate[] = [];

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

function saveQueueFlushedData(...onyxUpdates: OnyxUpdate[]) {
    // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
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
    
    // Log TRACK_EXPENSE and REQUEST_MONEY in queue
    const trackExpenseInQueue = persistedRequests.find((req) => req.command === WRITE_COMMANDS.TRACK_EXPENSE);
    const requestMoneyInQueue = persistedRequests.find((req) => req.command === WRITE_COMMANDS.REQUEST_MONEY);
    if (trackExpenseInQueue) {
        Log.info('[API_DEBUG] SequentialQueue.process - TRACK_EXPENSE found in queue', false, {
            queueLength: persistedRequests.length,
            trackExpenseIndex: persistedRequests.findIndex((req) => req.command === WRITE_COMMANDS.TRACK_EXPENSE),
            transactionID: trackExpenseInQueue?.data?.transactionID,
        });
    }
    if (requestMoneyInQueue) {
        Log.info('[API_DEBUG] SequentialQueue.process - RequestMoney found in queue', false, {
            queueLength: persistedRequests.length,
            requestMoneyIndex: persistedRequests.findIndex((req) => req.command === WRITE_COMMANDS.REQUEST_MONEY),
            transactionID: requestMoneyInQueue?.data?.transactionID,
            receiptState: requestMoneyInQueue?.data?.receiptState,
        });
    }
    
    if (persistedRequests.length === 0) {
        Log.info('[SequentialQueue] Unable to process. No requests to process.');
        return Promise.resolve();
    }

    const requestToProcess = processNextPersistedRequest();
    if (!requestToProcess) {
        Log.info('[SequentialQueue] Unable to process. No next request to handle.');
        // Check if TRACK_EXPENSE is still in queue but wasn't selected
        if (trackExpenseInQueue) {
            Log.warn('[API_DEBUG] SequentialQueue.process - TRACK_EXPENSE in queue but processNextPersistedRequest returned null!', {
                transactionID: trackExpenseInQueue?.data?.transactionID,
                queueLength: persistedRequests.length,
            });
        }
        return Promise.resolve();
    }

    // Log what request is being processed
    Log.info('[API_DEBUG] SequentialQueue.process - Request selected for processing', false, {
        command: requestToProcess.command,
        transactionID: requestToProcess?.data?.transactionID,
        requestID: requestToProcess?.requestID,
        isTrackExpense: requestToProcess.command === WRITE_COMMANDS.TRACK_EXPENSE,
        isRequestMoney: requestToProcess.command === WRITE_COMMANDS.REQUEST_MONEY,
        receiptState: requestToProcess?.data?.receiptState,
    });

    // Log if TRACK_EXPENSE is still in queue but not being processed
    if (trackExpenseInQueue && requestToProcess.command !== WRITE_COMMANDS.TRACK_EXPENSE) {
        Log.warn('[API_DEBUG] SequentialQueue.process - TRACK_EXPENSE in queue but different request being processed', {
            trackExpenseTransactionID: trackExpenseInQueue?.data?.transactionID,
            processingCommand: requestToProcess.command,
            processingTransactionID: requestToProcess?.data?.transactionID,
            queueLength: persistedRequests.length,
        });
    }

    // Log if TRACK_EXPENSE or REQUEST_MONEY is being processed
    if (requestToProcess.command === WRITE_COMMANDS.TRACK_EXPENSE || requestToProcess.command === WRITE_COMMANDS.REQUEST_MONEY) {
        Log.info(`[API_DEBUG] SequentialQueue.process - About to process ${requestToProcess.command}`, false, {
            transactionID: requestToProcess?.data?.transactionID,
            receiptState: requestToProcess?.data?.receiptState,
            requestID: requestToProcess?.requestID,
        });
    }

    // Log when request is about to be processed
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    Log.info('[API_DEBUG] SequentialQueue - Processing request', false, {
        command: requestToProcess.command,
        transactionID: requestToProcess?.data?.transactionID,
        requestID: requestToProcess?.requestID,
    });

    // Log specifically for TRACK_EXPENSE and REQUEST_MONEY
    if (requestToProcess.command === WRITE_COMMANDS.TRACK_EXPENSE || requestToProcess.command === WRITE_COMMANDS.REQUEST_MONEY) {
        Log.info(`[API_DEBUG] SequentialQueue - Processing ${requestToProcess.command}`, false, {
            command: requestToProcess.command,
            transactionID: requestToProcess?.data?.transactionID,
            receiptState: requestToProcess?.data?.receiptState,
            requestID: requestToProcess?.requestID,
            apiRequestType: requestToProcess?.data?.apiRequestType,
        });
    }

    // Set the current request to a promise awaiting its processing so that getCurrentRequest can be used to take some action after the current request has processed.
    currentRequestPromise = processWithMiddleware(requestToProcess, true)
        .then((response) => {
            // Log all API responses, especially for update commands
            const isUpdateCommand = requestToProcess.command?.includes('UPDATE') || requestToProcess.command?.includes('CREATE') || requestToProcess.command?.includes('DELETE');
            const isError = response?.jsonCode !== 200;

            if (isUpdateCommand || requestToProcess.command === WRITE_COMMANDS.UPDATE_MONEY_REQUEST_AMOUNT_AND_CURRENCY) {
                if (isError) {
                    Log.warn('[API_DEBUG] SequentialQueue - API response error', {
                        command: requestToProcess.command,
                        jsonCode: response?.jsonCode,
                        requestID: response?.requestID,
                        transactionID: requestToProcess?.data?.transactionID,
                        errorMessage: response?.message,
                        errorTitle: response?.title,
                        errorType: response?.type,
                        hasOnyxData: !!response?.onyxData,
                        onyxDataCount: response?.onyxData?.length ?? 0,
                    });
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    Log.info('[API_DEBUG] SequentialQueue - API response success', false, {
                        command: requestToProcess.command,
                        jsonCode: response?.jsonCode,
                        requestID: response?.requestID,
                        transactionID: requestToProcess?.data?.transactionID,
                        hasOnyxData: !!response?.onyxData,
                        onyxDataCount: response?.onyxData?.length ?? 0,
                    });
                }
            }

            // A response might indicate that the queue should be paused. This happens when a gap in onyx updates is detected between the client and the server and
            // that gap needs resolved before the queue can continue.
            if (response?.shouldPauseQueue) {
                Log.info("[SequentialQueue] Handled 'shouldPauseQueue' in response. Pausing the queue.");
                pause();
            }

            // For WRITE requests, ensure queued Onyx updates are flushed before removing the request
            // This is critical because WRITE requests queue their updates and they're only flushed when the queue finishes.
            // If the app backgrounds before the queue finishes, updates would be lost.
            const apiRequestType = requestToProcess?.data?.apiRequestType;
            const isWriteRequest = apiRequestType === CONST.API_REQUEST_TYPE.WRITE;
            const isTrackExpense = requestToProcess.command === WRITE_COMMANDS.TRACK_EXPENSE;
            const isRequestMoney = requestToProcess.command === WRITE_COMMANDS.REQUEST_MONEY;

            // Log for debugging
            if (isTrackExpense || isRequestMoney) {
                Log.info(`[API_DEBUG] SequentialQueue - ${requestToProcess.command} response received`, false, {
                    command: requestToProcess.command,
                    apiRequestType,
                    isWriteRequest,
                    transactionID: requestToProcess?.data?.transactionID,
                    receiptState: requestToProcess?.data?.receiptState,
                    jsonCode: response?.jsonCode,
                });
            }

            if (isWriteRequest || isTrackExpense) {
                Log.info('[API_DEBUG] SequentialQueue - Flushing queued Onyx updates for WRITE request before removing from queue', false, {
                    command: requestToProcess.command,
                    transactionID: requestToProcess?.data?.transactionID,
                });
                // Flush queued updates synchronously before removing the request
                const flushPromise = flushOnyxUpdatesQueue();
                if (!flushPromise) {
                    // If flush returns undefined (queue paused), still proceed with removing request
                    Log.info('[API_DEBUG] SequentialQueue - Queue paused, proceeding to remove request', false, {
                        command: requestToProcess.command,
                        transactionID: requestToProcess?.data?.transactionID,
                    });
                    Log.info('[SequentialQueue] Removing persisted request because it was processed successfully.', false, {request: requestToProcess});
                    Log.info('[API_DEBUG] Starting persistence', false, {
                        operation: 'removal',
                        appState: AppState.currentState, // 'active', 'background', 'inactive'
                    });
                    const removalStartTime = Date.now();
                    endPersistedRequestAndRemoveFromQueue(requestToProcess);
                    // After persistence completes (in endRequestAndRemoveFromQueue):
                    Log.info('[API_DEBUG] SequentialQueue - Removal persistence duration', false, {
                        durationMs: Date.now() - removalStartTime,
                    });

                    if (requestToProcess.queueFlushedData) {
                        Log.info('[SequentialQueue] Will store queueFlushedData.', false, {queueFlushedData: requestToProcess.queueFlushedData});
                        saveQueueFlushedData(...requestToProcess.queueFlushedData);
                    }

                    sequentialQueueRequestThrottle.clear();
                    return process();
                }

                return flushPromise
                    .then(() => {
                        Log.info('[API_DEBUG] SequentialQueue - Queued Onyx updates flushed, removing request', false, {
                            command: requestToProcess.command,
                            transactionID: requestToProcess?.data?.transactionID,
                        });
                        Log.info('[SequentialQueue] Removing persisted request because it was processed successfully.', false, {request: requestToProcess});
                        Log.info('[API_DEBUG] Starting persistence', false, {
                            operation: 'removal',
                            appState: AppState.currentState, // 'active', 'background', 'inactive'
                        });
                        endPersistedRequestAndRemoveFromQueue(requestToProcess);

                        if (requestToProcess.queueFlushedData) {
                            Log.info('[SequentialQueue] Will store queueFlushedData.', false, {queueFlushedData: requestToProcess.queueFlushedData});
                            saveQueueFlushedData(...requestToProcess.queueFlushedData);
                        }

                        sequentialQueueRequestThrottle.clear();
                        return process();
                    })
                    .catch((error) => {
                        Log.warn(`[API_DEBUG] SequentialQueue - Error flushing queued Onyx updates: ${String(error)}`, {
                            command: requestToProcess.command,
                            transactionID: requestToProcess?.data?.transactionID,
                        });
                        // Still remove the request even if flush fails
                        Log.info('[SequentialQueue] Removing persisted request because it was processed successfully.', false, {request: requestToProcess});
                        Log.info('[API_DEBUG] Starting persistence', false, {
                            operation: 'removal',
                            appState: AppState.currentState, // 'active', 'background', 'inactive'
                        });
                        endPersistedRequestAndRemoveFromQueue(requestToProcess);

                        if (requestToProcess.queueFlushedData) {
                            Log.info('[SequentialQueue] Will store queueFlushedData.', false, {queueFlushedData: requestToProcess.queueFlushedData});
                            saveQueueFlushedData(...requestToProcess.queueFlushedData);
                        }

                        sequentialQueueRequestThrottle.clear();
                        return process();
                    });
            }

            Log.info('[SequentialQueue] Removing persisted request because it was processed successfully.', false, {request: requestToProcess});
            Log.info('[API_DEBUG] Starting persistence', false, {
                operation: 'removal',
                appState: AppState.currentState, // 'active', 'background', 'inactive'
            });
            endPersistedRequestAndRemoveFromQueue(requestToProcess);

            if (requestToProcess.queueFlushedData) {
                Log.info('[SequentialQueue] Will store queueFlushedData.', false, {queueFlushedData: requestToProcess.queueFlushedData});
                saveQueueFlushedData(...requestToProcess.queueFlushedData);
            }

            sequentialQueueRequestThrottle.clear();
            return process();
        })
        .catch((error: RequestError) => {
            // Log TRACK_EXPENSE errors/cancellations
            if (requestToProcess.command === WRITE_COMMANDS.TRACK_EXPENSE) {
                Log.info('[API_DEBUG] SequentialQueue - TRACK_EXPENSE error/cancellation', false, {
                    command: requestToProcess.command,
                    transactionID: requestToProcess?.data?.transactionID,
                    errorName: error.name,
                    errorMessage: error.message,
                    isRequestCancelled: error.name === CONST.ERROR.REQUEST_CANCELLED,
                    isDuplicateRecord: error.message === CONST.ERROR.DUPLICATE_RECORD,
                    shouldFailAllRequests,
                });
            }

            // On sign out we cancel any in flight requests from the user. Since that user is no longer signed in their requests should not be retried.
            // Duplicate records don't need to be retried as they just mean the record already exists on the server
            if (error.name === CONST.ERROR.REQUEST_CANCELLED || error.message === CONST.ERROR.DUPLICATE_RECORD || shouldFailAllRequests) {
                // Special handling for TRACK_EXPENSE: if cancelled, roll back to queue instead of removing
                if (requestToProcess.command === WRITE_COMMANDS.TRACK_EXPENSE && error.name === CONST.ERROR.REQUEST_CANCELLED) {
                    Log.info('[API_DEBUG] SequentialQueue - TRACK_EXPENSE cancelled, rolling back instead of removing to allow retry', false, {
                        error: String(error),
                        errorName: error.name,
                        transactionID: requestToProcess?.data?.transactionID,
                    });
                    rollbackOngoingPersistedRequest();
                    sequentialQueueRequestThrottle.clear();
                    return process();
                }

                if (shouldFailAllRequests) {
                    Onyx.update(requestToProcess.failureData ?? []);
                }
                Log.info("[SequentialQueue] Removing persisted request because it failed and doesn't need to be retried.", false, {error, request: requestToProcess});
                endPersistedRequestAndRemoveFromQueue(requestToProcess);
                sequentialQueueRequestThrottle.clear();
                return process();
            }
            // For rate limiting errors (429) on ResendValidateCode, don't retry to prevent spam
            if (error.message === CONST.ERROR.THROTTLED && requestToProcess.command === WRITE_COMMANDS.RESEND_VALIDATE_CODE) {
                Onyx.update(requestToProcess.failureData ?? []);
                endPersistedRequestAndRemoveFromQueue(requestToProcess);
                sequentialQueueRequestThrottle.clear();
                return process();
            }
            rollbackOngoingPersistedRequest();
            return sequentialQueueRequestThrottle
                .sleep(error, requestToProcess.command)
                .then(process)
                .catch(() => {
                    Onyx.update(requestToProcess.failureData ?? []);
                    Log.info('[SequentialQueue] Removing persisted request because it failed too many times.', false, {error, request: requestToProcess});
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
    // Log TRACK_EXPENSE and REQUEST_MONEY in queue when flush is called
    const persistedRequests = getAllPersistedRequests();
    const trackExpenseInQueue = persistedRequests.find((req) => req.command === WRITE_COMMANDS.TRACK_EXPENSE);
    const requestMoneyInQueue = persistedRequests.find((req) => req.command === WRITE_COMMANDS.REQUEST_MONEY);
    if (trackExpenseInQueue) {
        Log.info('[API_DEBUG] SequentialQueue.flush - TRACK_EXPENSE in queue when flush called', false, {
            queueLength: persistedRequests.length,
            transactionID: trackExpenseInQueue?.data?.transactionID,
            isQueuePaused,
            isSequentialQueueRunning,
        });
    }
    if (requestMoneyInQueue) {
        Log.info('[API_DEBUG] SequentialQueue.flush - RequestMoney in queue when flush called', false, {
            queueLength: persistedRequests.length,
            transactionID: requestMoneyInQueue?.data?.transactionID,
            receiptState: requestMoneyInQueue?.data?.receiptState,
            isQueuePaused,
            isSequentialQueueRunning,
        });
    }

    // When the queue is paused, return early. This will keep an requests in the queue and they will get flushed again when the queue is unpaused
    if (isQueuePaused) {
        Log.info('[SequentialQueue] Unable to flush. Queue is paused.');
        return;
    }

    if (isSequentialQueueRunning) {
        Log.info('[SequentialQueue] Unable to flush. Queue is already running.');
        return;
    }

    const allRequests = getAllPersistedRequests();
    if (allRequests.length === 0 && isEmpty()) {
        Log.info('[SequentialQueue] Unable to flush. No requests or queued Onyx updates to process.');
        return;
    }

    // ONYXKEYS.PERSISTED_REQUESTS is shared across clients, thus every client/tab will have a copy
    // It is very important to only process the queue from leader client otherwise requests will be duplicated.
    const isLeader = isClientTheLeader();
    if (!isLeader) {
        Log.info('[SequentialQueue] Unable to flush. Client is not the leader.');
        // Log TRACK_EXPENSE and REQUEST_MONEY if not leader
        if (trackExpenseInQueue) {
            Log.info('[API_DEBUG] SequentialQueue.flush - TRACK_EXPENSE in queue but client not leader', false, {
                transactionID: trackExpenseInQueue?.data?.transactionID,
                queueLength: allRequests.length,
            });
        }
        if (requestMoneyInQueue) {
            Log.info('[API_DEBUG] SequentialQueue.flush - RequestMoney in queue but client not leader', false, {
                transactionID: requestMoneyInQueue?.data?.transactionID,
                receiptState: requestMoneyInQueue?.data?.receiptState,
                queueLength: allRequests.length,
            });
        }
        return;
    }

    // Log TRACK_EXPENSE and REQUEST_MONEY before setting isSequentialQueueRunning
    if (trackExpenseInQueue) {
        Log.info('[API_DEBUG] SequentialQueue.flush - About to call process() for TRACK_EXPENSE', false, {
            transactionID: trackExpenseInQueue?.data?.transactionID,
            queueLength: allRequests.length,
            shouldResetPromise,
        });
    }
    if (requestMoneyInQueue) {
        Log.info('[API_DEBUG] SequentialQueue.flush - About to call process() for RequestMoney', false, {
            transactionID: requestMoneyInQueue?.data?.transactionID,
            receiptState: requestMoneyInQueue?.data?.receiptState,
            queueLength: allRequests.length,
            shouldResetPromise,
        });
    }

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
            // Log TRACK_EXPENSE when Onyx callback fires
            const requestsInCallback = getAllPersistedRequests();
            const trackExpenseInCallback = requestsInCallback.find((req) => req.command === WRITE_COMMANDS.TRACK_EXPENSE);
            if (trackExpenseInCallback) {
                Log.info('[API_DEBUG] SequentialQueue.flush - Onyx callback fired, TRACK_EXPENSE still in queue, calling process()', false, {
                    transactionID: trackExpenseInCallback?.data?.transactionID,
                    queueLength: requestsInCallback.length,
                });
            } else if (trackExpenseInQueue) {
                Log.warn('[API_DEBUG] SequentialQueue.flush - Onyx callback fired but TRACK_EXPENSE NOT in queue anymore!', {
                    transactionID: trackExpenseInQueue?.data?.transactionID,
                    queueLength: requestsInCallback.length,
                });
            }

            Onyx.disconnect(connection);
            process().finally(() => {
                Log.info('[SequentialQueue] Finished processing queue.');
                isSequentialQueueRunning = false;
                if (isOffline() || getAllPersistedRequests().length === 0) {
                    resolveIsReadyPromise?.();
                }
                currentRequestPromise = null;

                // The queue can be paused when we sync the data with backend so we should only update the Onyx data when the queue is empty
                if (getAllPersistedRequests().length === 0) {
                    flushOnyxUpdatesQueue()?.then(() => {
                        const queueFlushedData = getQueueFlushedData();
                        if (queueFlushedData.length === 0) {
                            return;
                        }
                        Log.info('[SequentialQueue] Will store queueFlushedData.', false, {queueFlushedData});
                        Onyx.update(queueFlushedData).then(() => {
                            Log.info('[SequentialQueue] QueueFlushedData has been stored.', false, {queueFlushedData});
                            clearQueueFlushedData();
                        });
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

    const numberOfPersistedRequests = getAllPersistedRequests().length || 0;
    Log.info(`[SequentialQueue] Unpausing the queue and flushing ${numberOfPersistedRequests} requests`);
    isQueuePaused = false;

    // If there are no persisted requests, we need to flush the Onyx updates queue
    if (numberOfPersistedRequests === 0) {
        flushOnyxUpdatesQueue();
    }

    // When the queue is paused and then unpaused, we call flush which by defaults recreates the isReadyPromise.
    // After all the WRITE requests are done, the isReadyPromise is resolved, but since it's a new instance of promise,
    // the pending READ request never received the resolved callback. That's why we don't want to recreate
    // the promise when unpausing the queue.
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

function handleConflictActions(conflictAction: ConflictData, newRequest: OnyxRequest) {
    if (conflictAction.type === 'push') {
        savePersistedRequest(newRequest);
    } else if (conflictAction.type === 'replace') {
        updatePersistedRequest(conflictAction.index, conflictAction.request ?? newRequest);
    } else if (conflictAction.type === 'delete') {
        deletePersistedRequestsByIndices(conflictAction.indices);
        if (conflictAction.pushNewRequest) {
            savePersistedRequest(newRequest);
        }
        if (conflictAction.nextAction) {
            handleConflictActions(conflictAction.nextAction, newRequest);
        }
    } else {
        Log.info(`[SequentialQueue] No action performed to command ${newRequest.command} and it will be ignored.`);
    }
}

function push(newRequest: OnyxRequest) {
    const {checkAndFixConflictingRequest} = newRequest;

    // Log TRACK_EXPENSE and REQUEST_MONEY when added to the queue
    if (newRequest.command === WRITE_COMMANDS.TRACK_EXPENSE || newRequest.command === WRITE_COMMANDS.REQUEST_MONEY) {
        Log.info(`[API_DEBUG] SequentialQueue.push - ${newRequest.command} added to queue`, false, {
            command: newRequest.command,
            transactionID: newRequest?.data?.transactionID,
            receiptState: newRequest?.data?.receiptState,
            apiRequestType: newRequest?.data?.apiRequestType,
            hasConflictResolver: !!checkAndFixConflictingRequest,
        });
    }

    if (checkAndFixConflictingRequest) {
        const requests = getAllPersistedRequests();
        const {conflictAction} = checkAndFixConflictingRequest(requests);
        Log.info(`[SequentialQueue] Conflict action for command ${newRequest.command} - ${conflictAction.type}:`);

        // Log TRACK_EXPENSE and REQUEST_MONEY conflict action
        if (newRequest.command === WRITE_COMMANDS.TRACK_EXPENSE || newRequest.command === WRITE_COMMANDS.REQUEST_MONEY) {
            Log.info(`[API_DEBUG] SequentialQueue.push - ${newRequest.command} conflict action`, false, {
                conflictActionType: conflictAction.type,
                transactionID: newRequest?.data?.transactionID,
                receiptState: newRequest?.data?.receiptState,
            });
        }

        // don't try to serialize a function.
        // eslint-disable-next-line no-param-reassign
        delete newRequest.checkAndFixConflictingRequest;
        handleConflictActions(conflictAction, newRequest);
    } else {
        // Add request to Persisted Requests so that it can be retried if it fails
        savePersistedRequest(newRequest);
    }

    // Log TRACK_EXPENSE and REQUEST_MONEY after save
    if (newRequest.command === WRITE_COMMANDS.TRACK_EXPENSE || newRequest.command === WRITE_COMMANDS.REQUEST_MONEY) {
        const allRequests = getAllPersistedRequests();
        const trackExpenseInQueue = allRequests.find((req) => req.command === WRITE_COMMANDS.TRACK_EXPENSE);
        const requestMoneyInQueue = allRequests.find((req) => req.command === WRITE_COMMANDS.REQUEST_MONEY);
        Log.info(`[API_DEBUG] SequentialQueue.push - After savePersistedRequest, checking queue state`, false, {
            command: newRequest.command,
            transactionID: newRequest?.data?.transactionID,
            receiptState: newRequest?.data?.receiptState,
            isOffline: isOffline(),
            isSequentialQueueRunning,
            isQueuePaused,
            queueLength: allRequests.length,
            trackExpenseInQueue: !!trackExpenseInQueue,
            requestMoneyInQueue: !!requestMoneyInQueue,
            willCallFlush: !isOffline() && (!isSequentialQueueRunning || true), // Always log
        });
    }

    // If we are offline we don't need to trigger the queue to empty as it will happen when we come back online
    if (isOffline()) {
        if (newRequest.command === WRITE_COMMANDS.TRACK_EXPENSE || newRequest.command === WRITE_COMMANDS.REQUEST_MONEY) {
            Log.info(`[API_DEBUG] SequentialQueue.push - ${newRequest.command} added but offline, will process when online`, false, {
                transactionID: newRequest?.data?.transactionID,
                receiptState: newRequest?.data?.receiptState,
            });
        }
        return;
    }

    // If the queue is running this request will run once it has finished processing the current batch
    if (isSequentialQueueRunning) {
        if (newRequest.command === WRITE_COMMANDS.TRACK_EXPENSE || newRequest.command === WRITE_COMMANDS.REQUEST_MONEY) {
            Log.info(`[API_DEBUG] SequentialQueue.push - ${newRequest.command} added but queue running, will flush when ready`, false, {
                transactionID: newRequest?.data?.transactionID,
                receiptState: newRequest?.data?.receiptState,
            });
        }
        isReadyPromise.then(() => {
            if (newRequest.command === WRITE_COMMANDS.TRACK_EXPENSE || newRequest.command === WRITE_COMMANDS.REQUEST_MONEY) {
                Log.info(`[API_DEBUG] SequentialQueue.push - Queue ready, calling flush for ${newRequest.command}`, false, {
                    transactionID: newRequest?.data?.transactionID,
                    receiptState: newRequest?.data?.receiptState,
                });
            }
            flush(true);
        });
        return;
    }

    if (newRequest.command === WRITE_COMMANDS.TRACK_EXPENSE || newRequest.command === WRITE_COMMANDS.REQUEST_MONEY) {
        Log.info(`[API_DEBUG] SequentialQueue.push - Calling flush immediately for ${newRequest.command}`, false, {
            transactionID: newRequest?.data?.transactionID,
            receiptState: newRequest?.data?.receiptState,
        });
    }
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

export {
    flush,
    getCurrentRequest,
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
