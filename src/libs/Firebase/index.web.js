"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var performance_1 = require("@firebase/performance");
var Environment = require("@libs/Environment/Environment");
var firebaseWebConfig_1 = require("./firebaseWebConfig");
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
    var perfTrace = (0, performance_1.trace)(firebaseWebConfig_1.firebasePerfWeb, customEventName);
    var attributes = utils_1.default.getAttributes(['accountId', 'personalDetailsLength', 'reportActionsLength', 'reportsLength', 'policiesLength']);
    Object.entries(attributes).forEach(function (_a) {
        var name = _a[0], value = _a[1];
        perfTrace.putAttribute(name, value);
    });
    traceMap[customEventName] = {
        trace: perfTrace,
        start: start,
    };
    perfTrace.start();
};
var stopTrace = function (customEventName) {
    var _a;
    if (Environment.isDevelopment()) {
        return;
    }
    var perfTrace = (_a = traceMap[customEventName]) === null || _a === void 0 ? void 0 : _a.trace;
    if (!perfTrace) {
        return;
    }
    perfTrace.stop();
    delete traceMap[customEventName];
};
var log = function () {
    // crashlytics is not supported on WEB
};
exports.default = {
    startTrace: startTrace,
    stopTrace: stopTrace,
    log: log,
};
