'use strict';
var __assign =
    (this && this.__assign) ||
    function () {
        __assign =
            Object.assign ||
            function (t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i];
                    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
                }
                return t;
            };
        return __assign.apply(this, arguments);
    };
var __spreadArrays =
    (this && this.__spreadArrays) ||
    function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];
        return r;
    };
exports.__esModule = true;
exports.deleteRequestsByIndices =
    exports.rollbackOngoingRequest =
    exports.updateOngoingRequest =
    exports.processNextRequest =
    exports.getOngoingRequest =
    exports.getLength =
    exports.update =
    exports.endRequestAndRemoveFromQueue =
    exports.getAll =
    exports.save =
    exports.clear =
        void 0;
var isEqual_1 = require('lodash/isEqual');
var react_native_onyx_1 = require('react-native-onyx');
var Log_1 = require('@libs/Log');
var ONYXKEYS_1 = require('@src/ONYXKEYS');
var persistedRequests = [];
var ongoingRequest = null;
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].PERSISTED_REQUESTS,
    callback: function (val) {
        Log_1['default'].info('[PersistedRequests] hit Onyx connect callback', false, {isValNullish: val == null});
        persistedRequests = val !== null && val !== void 0 ? val : [];
        if (ongoingRequest && persistedRequests.length > 0) {
            var nextRequestToProcess = persistedRequests.at(0);
            // We try to remove the next request from the persistedRequests if it is the same as ongoingRequest
            // so we don't process it twice.
            if (isEqual_1['default'](nextRequestToProcess, ongoingRequest)) {
                persistedRequests = persistedRequests.slice(1);
            }
        }
    },
});
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].PERSISTED_ONGOING_REQUESTS,
    callback: function (val) {
        ongoingRequest = val !== null && val !== void 0 ? val : null;
    },
});
/**
 * This promise is only used by tests. DO NOT USE THIS PROMISE IN THE APPLICATION CODE
 */
function clear() {
    ongoingRequest = null;
    react_native_onyx_1['default'].set(ONYXKEYS_1['default'].PERSISTED_ONGOING_REQUESTS, null);
    return react_native_onyx_1['default'].set(ONYXKEYS_1['default'].PERSISTED_REQUESTS, []);
}
exports.clear = clear;
function getLength() {
    // Making it backwards compatible with the old implementation
    return persistedRequests.length + (ongoingRequest ? 1 : 0);
}
exports.getLength = getLength;
function save(requestToPersist) {
    // If the command is not in the keepLastInstance array, add the new request as usual
    var requests = __spreadArrays(persistedRequests, [requestToPersist]);
    persistedRequests = requests;
    react_native_onyx_1['default'].set(ONYXKEYS_1['default'].PERSISTED_REQUESTS, requests).then(function () {
        Log_1['default'].info("[SequentialQueue] '" + requestToPersist.command + "' command queued. Queue length is " + getLength());
    });
}
exports.save = save;
function endRequestAndRemoveFromQueue(requestToRemove) {
    var _a;
    ongoingRequest = null;
    /**
     * We only remove the first matching request because the order of requests matters.
     * If we were to remove all matching requests, we can end up with a final state that is different than what the user intended.
     */
    var requests = __spreadArrays(persistedRequests);
    var index = requests.findIndex(function (persistedRequest) {
        return isEqual_1['default'](persistedRequest, requestToRemove);
    });
    if (index !== -1) {
        requests.splice(index, 1);
    }
    persistedRequests = requests;
    react_native_onyx_1['default']
        .multiSet(((_a = {}), (_a[ONYXKEYS_1['default'].PERSISTED_REQUESTS] = persistedRequests), (_a[ONYXKEYS_1['default'].PERSISTED_ONGOING_REQUESTS] = null), _a))
        .then(function () {
            Log_1['default'].info("[SequentialQueue] '" + requestToRemove.command + "' removed from the queue. Queue length is " + getLength());
        });
}
exports.endRequestAndRemoveFromQueue = endRequestAndRemoveFromQueue;
function deleteRequestsByIndices(indices) {
    // Create a Set from the indices array for efficient lookup
    var indicesSet = new Set(indices);
    // Create a new array excluding elements at the specified indices
    persistedRequests = persistedRequests.filter(function (_, index) {
        return !indicesSet.has(index);
    });
    // Update the persisted requests in storage or state as necessary
    react_native_onyx_1['default'].set(ONYXKEYS_1['default'].PERSISTED_REQUESTS, persistedRequests).then(function () {
        Log_1['default'].info('Multiple (' + indices.length + ') requests removed from the queue. Queue length is ' + persistedRequests.length);
    });
}
exports.deleteRequestsByIndices = deleteRequestsByIndices;
function update(oldRequestIndex, newRequest) {
    var requests = __spreadArrays(persistedRequests);
    var oldRequest = requests.at(oldRequestIndex);
    Log_1['default'].info('[PersistedRequests] Updating a request', false, {oldRequest: oldRequest, newRequest: newRequest, oldRequestIndex: oldRequestIndex});
    requests.splice(oldRequestIndex, 1, newRequest);
    persistedRequests = requests;
    react_native_onyx_1['default'].set(ONYXKEYS_1['default'].PERSISTED_REQUESTS, requests);
}
exports.update = update;
function updateOngoingRequest(newRequest) {
    Log_1['default'].info('[PersistedRequests] Updating the ongoing request', false, {ongoingRequest: ongoingRequest, newRequest: newRequest});
    ongoingRequest = newRequest;
    if (newRequest.persistWhenOngoing) {
        react_native_onyx_1['default'].set(ONYXKEYS_1['default'].PERSISTED_ONGOING_REQUESTS, newRequest);
    }
}
exports.updateOngoingRequest = updateOngoingRequest;
function processNextRequest() {
    var _a;
    if (ongoingRequest) {
        Log_1['default'].info('Ongoing Request already set returning same one ' + ongoingRequest.commandName);
        return ongoingRequest;
    }
    // You must handle the case where there are no requests to process
    if (persistedRequests.length === 0) {
        throw new Error('No requests to process');
    }
    ongoingRequest = (_a = persistedRequests.shift()) !== null && _a !== void 0 ? _a : null;
    if (ongoingRequest && ongoingRequest.persistWhenOngoing) {
        react_native_onyx_1['default'].set(ONYXKEYS_1['default'].PERSISTED_ONGOING_REQUESTS, ongoingRequest);
    }
    return ongoingRequest;
}
exports.processNextRequest = processNextRequest;
function rollbackOngoingRequest() {
    if (!ongoingRequest) {
        return;
    }
    // Prepend ongoingRequest to persistedRequests
    persistedRequests.unshift(__assign(__assign({}, ongoingRequest), {isRollbacked: true}));
    // Clear the ongoingRequest
    ongoingRequest = null;
}
exports.rollbackOngoingRequest = rollbackOngoingRequest;
function getAll() {
    return persistedRequests;
}
exports.getAll = getAll;
function getOngoingRequest() {
    return ongoingRequest;
}
exports.getOngoingRequest = getOngoingRequest;
