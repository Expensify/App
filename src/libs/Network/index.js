"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.post = post;
exports.clearProcessQueueInterval = clearProcessQueueInterval;
var ActiveClientManager = require("@libs/ActiveClientManager");
var CONST_1 = require("@src/CONST");
var package_json_1 = require("../../../package.json");
var MainQueue_1 = require("./MainQueue");
var SequentialQueue_1 = require("./SequentialQueue");
// React Native uses a number for the timer id, but Web/NodeJS uses a Timeout object
var processQueueInterval;
// We must wait until the ActiveClientManager is ready so that we ensure only the "leader" tab processes any persisted requests
ActiveClientManager.isReady().then(function () {
    (0, SequentialQueue_1.flush)();
    // Start main queue and process once every n ms delay
    processQueueInterval = setInterval(MainQueue_1.process, CONST_1.default.NETWORK.PROCESS_REQUEST_DELAY_MS);
});
/**
 * Clear any existing intervals during test runs
 * This is to prevent previous intervals interfering with other tests
 */
function clearProcessQueueInterval() {
    if (!processQueueInterval) {
        return;
    }
    clearInterval(processQueueInterval);
}
/**
 * Perform a queued post request
 */
function post(command, data, type, shouldUseSecure) {
    if (data === void 0) { data = {}; }
    if (type === void 0) { type = CONST_1.default.NETWORK.METHOD.POST; }
    if (shouldUseSecure === void 0) { shouldUseSecure = false; }
    return new Promise(function (resolve, reject) {
        var _a, _b, _c, _d;
        var request = {
            command: command,
            data: data,
            type: type,
            shouldUseSecure: shouldUseSecure,
        };
        // By default, request are retry-able and cancellable
        // (e.g. any requests currently happening when the user logs out are cancelled)
        request.data = __assign(__assign({}, data), { shouldRetry: (_a = data === null || data === void 0 ? void 0 : data.shouldRetry) !== null && _a !== void 0 ? _a : true, canCancel: (_b = data === null || data === void 0 ? void 0 : data.canCancel) !== null && _b !== void 0 ? _b : true, appversion: package_json_1.default.version });
        // Add promise handlers to any request that we are not persisting
        request.resolve = resolve;
        request.reject = reject;
        // Add the request to a queue of actions to perform
        (0, MainQueue_1.push)(request);
        // This check is mainly used to prevent API commands from triggering calls to MainQueue.process() from inside the context of a previous
        // call to MainQueue.process() e.g. calling a Log command without this would cause the requests in mainQueue to double process
        // since we call Log inside MainQueue.process().
        var shouldProcessImmediately = (_d = (_c = request === null || request === void 0 ? void 0 : request.data) === null || _c === void 0 ? void 0 : _c.shouldProcessImmediately) !== null && _d !== void 0 ? _d : true;
        if (!shouldProcessImmediately) {
            return;
        }
        // Try to fire off the request as soon as it's queued so we don't add a delay to every queued command
        (0, MainQueue_1.process)();
    });
}
