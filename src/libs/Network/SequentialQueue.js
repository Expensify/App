"use strict";
exports.__esModule = true;
exports.sequentialQueueRequestThrottle = exports.resetQueue = exports.process = exports.unpause = exports.pause = exports.waitForIdle = exports.push = exports.isPaused = exports.isRunning = exports.getCurrentRequest = exports.flush = void 0;
var react_native_onyx_1 = require("react-native-onyx");
var PersistedRequests_1 = require("@libs/actions/PersistedRequests");
var QueuedOnyxUpdates_1 = require("@libs/actions/QueuedOnyxUpdates");
var ActiveClientManager_1 = require("@libs/ActiveClientManager");
var Log_1 = require("@libs/Log");
var Request_1 = require("@libs/Request");
var RequestThrottle_1 = require("@libs/RequestThrottle");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var NetworkStore_1 = require("./NetworkStore");
var shouldFailAllRequests;
react_native_onyx_1["default"].connect({
    key: ONYXKEYS_1["default"].NETWORK,
    callback: function (network) {
        if (!network) {
            return;
        }
        shouldFailAllRequests = !!network.shouldFailAllRequests;
    }
});
var resolveIsReadyPromise;
var isReadyPromise = new Promise(function (resolve) {
    resolveIsReadyPromise = resolve;
});
// Resolve the isReadyPromise immediately so that the queue starts working as soon as the page loads
resolveIsReadyPromise === null || resolveIsReadyPromise === void 0 ? void 0 : resolveIsReadyPromise();
var isSequentialQueueRunning = false;
var currentRequestPromise = null;
var isQueuePaused = false;
var sequentialQueueRequestThrottle = new RequestThrottle_1["default"]('SequentialQueue');
exports.sequentialQueueRequestThrottle = sequentialQueueRequestThrottle;
/**
 * Puts the queue into a paused state so that no requests will be processed
 */
function pause() {
    if (isQueuePaused) {
        Log_1["default"].info('[SequentialQueue] Queue already paused');
        return;
    }
    Log_1["default"].info('[SequentialQueue] Pausing the queue');
    isQueuePaused = true;
}
exports.pause = pause;
/**
 * Gets the current Onyx queued updates, apply them and clear the queue if the queue is not paused.
 */
function flushOnyxUpdatesQueue() {
    // The only situation where the queue is paused is if we found a gap between the app current data state and our server's. If that happens,
    // we'll trigger async calls to make the client updated again. While we do that, we don't want to insert anything in Onyx.
    if (isQueuePaused) {
        Log_1["default"].info('[SequentialQueue] Queue already paused');
        return;
    }
    QueuedOnyxUpdates_1.flushQueue();
}
/**
 * Process any persisted requests, when online, one at a time until the queue is empty.
 *
 * If a request fails due to some kind of network error, such as a request being throttled or when our backend is down, then we retry it with an exponential back off process until a response
 * is successfully returned. The first time a request fails we set a random, small, initial wait time. After waiting, we retry the request. If there are subsequent failures the request wait
 * time is doubled creating an exponential back off in the frequency of requests hitting the server. Since the initial wait time is random and it increases exponentially, the load of
 * requests to our backend is evenly distributed and it gradually decreases with time, which helps the servers catch up.
 */
function process() {
    // When the queue is paused, return early. This prevents any new requests from happening. The queue will be flushed again when the queue is unpaused.
    if (isQueuePaused) {
        Log_1["default"].info('[SequentialQueue] Unable to process. Queue is paused.');
        return Promise.resolve();
    }
    if (NetworkStore_1.isOffline()) {
        Log_1["default"].info('[SequentialQueue] Unable to process. We are offline.');
        return Promise.resolve();
    }
    var persistedRequests = PersistedRequests_1.getAll();
    if (persistedRequests.length === 0) {
        Log_1["default"].info('[SequentialQueue] Unable to process. No requests to process.');
        return Promise.resolve();
    }
    var requestToProcess = PersistedRequests_1.processNextRequest();
    if (!requestToProcess) {
        Log_1["default"].info('[SequentialQueue] Unable to process. No next request to handle.');
        return Promise.resolve();
    }
    // Set the current request to a promise awaiting its processing so that getCurrentRequest can be used to take some action after the current request has processed.
    currentRequestPromise = Request_1.processWithMiddleware(requestToProcess, true)
        .then(function (response) {
        // A response might indicate that the queue should be paused. This happens when a gap in onyx updates is detected between the client and the server and
        // that gap needs resolved before the queue can continue.
        if (response === null || response === void 0 ? void 0 : response.shouldPauseQueue) {
            Log_1["default"].info("[SequentialQueue] Handled 'shouldPauseQueue' in response. Pausing the queue.");
            pause();
        }
        Log_1["default"].info('[SequentialQueue] Removing persisted request because it was processed successfully.', false, { request: requestToProcess });
        PersistedRequests_1.endRequestAndRemoveFromQueue(requestToProcess);
        sequentialQueueRequestThrottle.clear();
        return process();
    })["catch"](function (error) {
        var _a;
        // On sign out we cancel any in flight requests from the user. Since that user is no longer signed in their requests should not be retried.
        // Duplicate records don't need to be retried as they just mean the record already exists on the server
        if (error.name === CONST_1["default"].ERROR.REQUEST_CANCELLED || error.message === CONST_1["default"].ERROR.DUPLICATE_RECORD || shouldFailAllRequests) {
            if (shouldFailAllRequests) {
                react_native_onyx_1["default"].update((_a = requestToProcess.failureData) !== null && _a !== void 0 ? _a : []);
            }
            Log_1["default"].info("[SequentialQueue] Removing persisted request because it failed and doesn't need to be retried.", false, { error: error, request: requestToProcess });
            PersistedRequests_1.endRequestAndRemoveFromQueue(requestToProcess);
            sequentialQueueRequestThrottle.clear();
            return process();
        }
        PersistedRequests_1.rollbackOngoingRequest();
        return sequentialQueueRequestThrottle
            .sleep(error, requestToProcess.command)
            .then(process)["catch"](function () {
            var _a;
            react_native_onyx_1["default"].update((_a = requestToProcess.failureData) !== null && _a !== void 0 ? _a : []);
            Log_1["default"].info('[SequentialQueue] Removing persisted request because it failed too many times.', false, { error: error, request: requestToProcess });
            PersistedRequests_1.endRequestAndRemoveFromQueue(requestToProcess);
            sequentialQueueRequestThrottle.clear();
            return process();
        });
    });
    return currentRequestPromise;
}
exports.process = process;
/**
 * @param shouldResetPromise Determines whether the isReadyPromise should be reset.
 * A READ request will wait until all the WRITE requests are done, using the isReadyPromise promise.
 * Resetting can cause unresolved READ requests to hang if tied to the old promise,
 * so some cases (e.g., unpausing) require skipping the reset to maintain proper behavior.
 */
function flush(shouldResetPromise) {
    if (shouldResetPromise === void 0) { shouldResetPromise = true; }
    // When the queue is paused, return early. This will keep an requests in the queue and they will get flushed again when the queue is unpaused
    if (isQueuePaused) {
        Log_1["default"].info('[SequentialQueue] Unable to flush. Queue is paused.');
        return;
    }
    if (isSequentialQueueRunning) {
        Log_1["default"].info('[SequentialQueue] Unable to flush. Queue is already running.');
        return;
    }
    if (PersistedRequests_1.getAll().length === 0 && QueuedOnyxUpdates_1.isEmpty()) {
        Log_1["default"].info('[SequentialQueue] Unable to flush. No requests or queued Onyx updates to process.');
        return;
    }
    // ONYXKEYS.PERSISTED_REQUESTS is shared across clients, thus every client/tab will have a copy
    // It is very important to only process the queue from leader client otherwise requests will be duplicated.
    if (!ActiveClientManager_1.isClientTheLeader()) {
        Log_1["default"].info('[SequentialQueue] Unable to flush. Client is not the leader.');
        return;
    }
    isSequentialQueueRunning = true;
    if (shouldResetPromise) {
        // Reset the isReadyPromise so that the queue will be flushed as soon as the request is finished
        isReadyPromise = new Promise(function (resolve) {
            resolveIsReadyPromise = resolve;
        });
    }
    // Ensure persistedRequests are read from storage before proceeding with the queue
    var connection = react_native_onyx_1["default"].connect({
        key: ONYXKEYS_1["default"].PERSISTED_REQUESTS,
        // We exceptionally opt out of reusing the connection here to avoid extra callback calls due to
        // an existing connection already made in PersistedRequests.ts.
        reuseConnection: false,
        callback: function () {
            react_native_onyx_1["default"].disconnect(connection);
            process()["finally"](function () {
                Log_1["default"].info('[SequentialQueue] Finished processing queue.');
                isSequentialQueueRunning = false;
                if (NetworkStore_1.isOffline() || PersistedRequests_1.getAll().length === 0) {
                    resolveIsReadyPromise === null || resolveIsReadyPromise === void 0 ? void 0 : resolveIsReadyPromise();
                }
                currentRequestPromise = null;
                // The queue can be paused when we sync the data with backend so we should only update the Onyx data when the queue is empty
                if (PersistedRequests_1.getAll().length === 0) {
                    flushOnyxUpdatesQueue();
                }
            });
        }
    });
}
exports.flush = flush;
/**
 * Unpauses the queue and flushes all the requests that were in it or were added to it while paused
 */
function unpause() {
    if (!isQueuePaused) {
        Log_1["default"].info('[SequentialQueue] Unable to unpause queue. We are already processing.');
        return;
    }
    var numberOfPersistedRequests = PersistedRequests_1.getAll().length || 0;
    Log_1["default"].info("[SequentialQueue] Unpausing the queue and flushing " + numberOfPersistedRequests + " requests");
    isQueuePaused = false;
    // When the queue is paused and then unpaused, we call flush which by defaults recreates the isReadyPromise.
    // After all the WRITE requests are done, the isReadyPromise is resolved, but since it's a new instance of promise,
    // the pending READ request never received the resolved callback. That's why we don't want to recreate
    // the promise when unpausing the queue.
    flush(false);
}
exports.unpause = unpause;
function isRunning() {
    return isSequentialQueueRunning;
}
exports.isRunning = isRunning;
function isPaused() {
    return isQueuePaused;
}
exports.isPaused = isPaused;
// Flush the queue when the connection resumes
NetworkStore_1.onReconnection(flush);
function handleConflictActions(conflictAction, newRequest) {
    var _a;
    if (conflictAction.type === 'push') {
        PersistedRequests_1.save(newRequest);
    }
    else if (conflictAction.type === 'replace') {
        PersistedRequests_1.update(conflictAction.index, (_a = conflictAction.request) !== null && _a !== void 0 ? _a : newRequest);
    }
    else if (conflictAction.type === 'delete') {
        PersistedRequests_1.deleteRequestsByIndices(conflictAction.indices);
        if (conflictAction.pushNewRequest) {
            PersistedRequests_1.save(newRequest);
        }
        if (conflictAction.nextAction) {
            handleConflictActions(conflictAction.nextAction, newRequest);
        }
    }
    else {
        Log_1["default"].info("[SequentialQueue] No action performed to command " + newRequest.command + " and it will be ignored.");
    }
}
function push(newRequest) {
    var checkAndFixConflictingRequest = newRequest.checkAndFixConflictingRequest;
    if (checkAndFixConflictingRequest) {
        var requests = PersistedRequests_1.getAll();
        var conflictAction = checkAndFixConflictingRequest(requests).conflictAction;
        Log_1["default"].info("[SequentialQueue] Conflict action for command " + newRequest.command + " - " + conflictAction.type + ":");
        // don't try to serialize a function.
        // eslint-disable-next-line no-param-reassign
        delete newRequest.checkAndFixConflictingRequest;
        handleConflictActions(conflictAction, newRequest);
    }
    else {
        // Add request to Persisted Requests so that it can be retried if it fails
        PersistedRequests_1.save(newRequest);
    }
    // If we are offline we don't need to trigger the queue to empty as it will happen when we come back online
    if (NetworkStore_1.isOffline()) {
        return;
    }
    // If the queue is running this request will run once it has finished processing the current batch
    if (isSequentialQueueRunning) {
        isReadyPromise.then(function () { return flush(); });
        return;
    }
    flush();
}
exports.push = push;
function getCurrentRequest() {
    if (currentRequestPromise === null) {
        return Promise.resolve();
    }
    return currentRequestPromise;
}
exports.getCurrentRequest = getCurrentRequest;
/**
 * Returns a promise that resolves when the sequential queue is done processing all persisted write requests.
 */
function waitForIdle() {
    return isReadyPromise;
}
exports.waitForIdle = waitForIdle;
/**
 * Clear any pending requests during test runs
 * This is to prevent previous requests interfering with other tests
 */
function resetQueue() {
    isSequentialQueueRunning = false;
    currentRequestPromise = null;
    isQueuePaused = false;
    isReadyPromise = new Promise(function (resolve) {
        resolveIsReadyPromise = resolve;
    });
    resolveIsReadyPromise === null || resolveIsReadyPromise === void 0 ? void 0 : resolveIsReadyPromise();
}
exports.resetQueue = resetQueue;
