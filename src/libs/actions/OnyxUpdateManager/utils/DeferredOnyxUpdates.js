"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMissingOnyxUpdatesQueryPromise = getMissingOnyxUpdatesQueryPromise;
exports.setMissingOnyxUpdatesQueryPromise = setMissingOnyxUpdatesQueryPromise;
exports.getUpdates = getUpdates;
exports.isEmpty = isEmpty;
exports.process = process;
exports.enqueue = enqueue;
exports.clear = clear;
var react_native_onyx_1 = require("react-native-onyx");
var Log_1 = require("@libs/Log");
var SequentialQueue = require("@libs/Network/SequentialQueue");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var OnyxUpdatesFromServer_1 = require("@src/types/onyx/OnyxUpdatesFromServer");
// eslint-disable-next-line import/no-cycle
var _1 = require(".");
var missingOnyxUpdatesQueryPromise;
var deferredUpdates = {};
/**
 * Returns the promise that fetches the missing onyx updates
 * @returns the promise
 */
function getMissingOnyxUpdatesQueryPromise() {
    return missingOnyxUpdatesQueryPromise;
}
/**
 * Sets the promise that fetches the missing onyx updates
 */
function setMissingOnyxUpdatesQueryPromise(promise) {
    missingOnyxUpdatesQueryPromise = promise;
}
/**
 * Returns the deferred updates that are currently in the queue
 * @param minUpdateID An optional minimum update ID to filter the deferred updates by
 * @returns
 */
function getUpdates(options) {
    if ((options === null || options === void 0 ? void 0 : options.minUpdateID) == null) {
        return deferredUpdates;
    }
    return Object.entries(deferredUpdates).reduce(function (acc, _a) {
        var _b;
        var lastUpdateID = _a[0], update = _a[1];
        if (Number(lastUpdateID) > ((_b = options.minUpdateID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID)) {
            acc[Number(lastUpdateID)] = update;
        }
        return acc;
    }, {});
}
/**
 * Returns a boolean indicating whether the deferred updates queue is empty
 * @returns a boolean indicating whether the deferred updates queue is empty
 */
function isEmpty() {
    return Object.keys(deferredUpdates).length === 0;
}
/**
 * Manually processes and applies the updates from the deferred updates queue. (used e.g. for push notifications)
 */
function process() {
    if (missingOnyxUpdatesQueryPromise) {
        missingOnyxUpdatesQueryPromise.finally(function () { return _1.validateAndApplyDeferredUpdates; });
    }
    missingOnyxUpdatesQueryPromise = (0, _1.validateAndApplyDeferredUpdates)();
}
/**
 * Allows adding onyx updates to the deferred updates queue manually.
 * @param updates The updates that should be applied (e.g. updates from push notifications)
 * @param options additional flags to change the behaviour of this function
 */
function enqueue(updates, options) {
    var _a;
    if ((_a = options === null || options === void 0 ? void 0 : options.shouldPauseSequentialQueue) !== null && _a !== void 0 ? _a : true) {
        Log_1.default.info('[DeferredOnyxUpdates] Pausing SequentialQueue');
        SequentialQueue.pause();
    }
    // We check here if the "updates" param is a single update.
    // If so, we only need to insert one update into the deferred updates queue.
    if ((0, OnyxUpdatesFromServer_1.isValidOnyxUpdateFromServer)(updates)) {
        var lastUpdateID = Number(updates.lastUpdateID);
        // Prioritize HTTPS since it provides complete request information for updating in the correct logical order
        if (deferredUpdates[lastUpdateID] && updates.type !== CONST_1.default.ONYX_UPDATE_TYPES.HTTPS) {
            return;
        }
        deferredUpdates[lastUpdateID] = updates;
    }
    else {
        // If the "updates" param is an object, we need to insert multiple updates into the deferred updates queue.
        Object.entries(updates).forEach(function (_a) {
            var lastUpdateIDString = _a[0], update = _a[1];
            var lastUpdateID = Number(lastUpdateIDString);
            if (deferredUpdates[lastUpdateID]) {
                return;
            }
            deferredUpdates[lastUpdateID] = update;
        });
    }
}
/**
 * Clears the deferred updates queue and unpauses the SequentialQueue
 * @param options additional flags to change the behaviour of this function
 */
function clear(options) {
    var _a, _b;
    deferredUpdates = {};
    if ((_a = options === null || options === void 0 ? void 0 : options.shouldResetGetMissingOnyxUpdatesPromise) !== null && _a !== void 0 ? _a : true) {
        missingOnyxUpdatesQueryPromise = undefined;
    }
    if ((_b = options === null || options === void 0 ? void 0 : options.shouldUnpauseSequentialQueue) !== null && _b !== void 0 ? _b : true) {
        react_native_onyx_1.default.set(ONYXKEYS_1.default.ONYX_UPDATES_FROM_SERVER, null);
        SequentialQueue.unpause();
    }
}
