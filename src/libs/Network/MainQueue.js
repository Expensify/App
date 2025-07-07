"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clear = clear;
exports.replay = replay;
exports.push = push;
exports.process = process;
exports.getAll = getAll;
var Request_1 = require("@libs/Request");
var NetworkStore_1 = require("./NetworkStore");
var SequentialQueue_1 = require("./SequentialQueue");
// Queue for network requests so we don't lose actions done by the user while offline
var networkRequestQueue = [];
/**
 * Checks to see if a request can be made.
 */
function canMakeRequest(request) {
    var _a;
    // Some requests are always made even when we are in the process of authenticating (typically because they require no authToken e.g. Log, BeginSignIn)
    // However, if we are in the process of authenticating we always want to queue requests until we are no longer authenticating.
    return ((_a = request.data) === null || _a === void 0 ? void 0 : _a.forceNetworkRequest) === true || (!(0, NetworkStore_1.isAuthenticating)() && !(0, SequentialQueue_1.isRunning)());
}
function push(request) {
    networkRequestQueue.push(request);
}
function replay(request) {
    push(request);
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    process();
}
/**
 * Process the networkRequestQueue by looping through the queue and attempting to make the requests
 */
function process() {
    if ((0, NetworkStore_1.isOffline)()) {
        return;
    }
    // When the queue length is empty an early return is performed since nothing needs to be processed
    if (networkRequestQueue.length === 0) {
        return;
    }
    // Some requests should be retried and will end up here if the following conditions are met:
    // - we are in the process of authenticating and the request is retryable (most are)
    // - the request does not have forceNetworkRequest === true (this will trigger it to process immediately)
    // - the request does not have shouldRetry === false (specified when we do not want to retry, defaults to true)
    var requestsToProcessOnNextRun = [];
    networkRequestQueue.forEach(function (queuedRequest) {
        var _a;
        // Check if we can make this request at all and if we can't see if we should save it for the next run or chuck it into the ether
        if (!canMakeRequest(queuedRequest)) {
            var shouldRetry = (_a = queuedRequest === null || queuedRequest === void 0 ? void 0 : queuedRequest.data) === null || _a === void 0 ? void 0 : _a.shouldRetry;
            if (shouldRetry) {
                requestsToProcessOnNextRun.push(queuedRequest);
            }
            else {
                console.debug('Skipping request that should not be re-tried: ', { command: queuedRequest.command });
            }
            return;
        }
        (0, Request_1.processWithMiddleware)(queuedRequest);
    });
    // We clear the request queue at the end by setting the queue to requestsToProcessOnNextRun which will either have some
    // requests we want to retry or an empty array
    networkRequestQueue = requestsToProcessOnNextRun;
}
/**
 * Clear the queue and cancels all pending requests
 * Non-cancellable requests like Log would not be cleared
 */
function clear() {
    networkRequestQueue = networkRequestQueue.filter(function (request) { var _a; return !((_a = request.data) === null || _a === void 0 ? void 0 : _a.canCancel); });
}
function getAll() {
    return networkRequestQueue;
}
