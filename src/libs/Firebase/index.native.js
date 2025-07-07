"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-unused-vars */
var crashlytics_1 = require("@react-native-firebase/crashlytics");
var perf_1 = require("@react-native-firebase/perf");
var Environment = require("@libs/Environment/Environment");
var utils_1 = require("./utils");
var traceMap = {};
var startTrace = function (customEventName) {
    var start = global.performance.now();
    if (Environment.isDevelopment()) {
        return;
    }
    if (traceMap[customEventName]) {
        return;
    }
    var attributes = utils_1.default.getAttributes(['accountId', 'personalDetailsLength', 'reportActionsLength', 'reportsLength', 'policiesLength']);
    (0, perf_1.default)()
        .startTrace(customEventName)
        .then(function (trace) {
        Object.entries(attributes).forEach(function (_a) {
            var name = _a[0], value = _a[1];
            trace.putAttribute(name, value);
        });
        traceMap[customEventName] = {
            trace: trace,
            start: start,
        };
    });
};
var stopTrace = function (customEventName) {
    var _a;
    // Uncomment to inspect logs on release builds
    // const stop = global.performance.now();
    if (Environment.isDevelopment()) {
        return;
    }
    var trace = (_a = traceMap[customEventName]) === null || _a === void 0 ? void 0 : _a.trace;
    if (!trace) {
        return;
    }
    trace.stop();
    // Uncomment to inspect logs on release builds
    // const start = lodashGet(traceMap, [customEventName, 'start']);
    // Log.info(`sidebar_loaded: ${stop - start} ms`, true);
    delete traceMap[customEventName];
};
var log = function (action) {
    (0, crashlytics_1.default)().log(action);
};
exports.default = {
    startTrace: startTrace,
    stopTrace: stopTrace,
    log: log,
};
