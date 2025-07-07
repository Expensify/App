"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var Environment = require("@libs/Environment/Environment");
var Firebase_1 = require("@libs/Firebase");
var getPlatform_1 = require("@libs/getPlatform");
var Log_1 = require("@libs/Log");
var package_json_1 = require("../../../package.json");
var timestampData = {};
/**
 * Start a performance timing measurement
 *
 * @param eventName
 * @param shouldUseFirebase - adds an additional trace in Firebase
 */
function start(eventName, shouldUseFirebase) {
    if (shouldUseFirebase === void 0) { shouldUseFirebase = true; }
    if (shouldUseFirebase) {
        Firebase_1.default.startTrace(eventName);
    }
    timestampData[eventName] = { startTime: performance.now(), shouldUseFirebase: shouldUseFirebase };
}
/**
 * End performance timing. Measure the time between event start/end in milliseconds, and push to Grafana
 *
 * @param eventName - event name used as timestamp key
 * @param [secondaryName] - optional secondary event name, passed to grafana
 * @param [maxExecutionTime] - optional amount of time (ms) to wait before logging a warn
 */
function end(eventName, secondaryName, maxExecutionTime) {
    if (secondaryName === void 0) { secondaryName = ''; }
    if (maxExecutionTime === void 0) { maxExecutionTime = 0; }
    if (!timestampData[eventName]) {
        return;
    }
    var _a = timestampData[eventName], startTime = _a.startTime, shouldUseFirebase = _a.shouldUseFirebase;
    var eventTime = performance.now() - startTime;
    if (shouldUseFirebase) {
        Firebase_1.default.stopTrace(eventName);
    }
    Environment.getEnvironment().then(function (envName) {
        var baseEventName = "".concat(envName, ".new.expensify.").concat(eventName);
        var grafanaEventName = secondaryName ? "".concat(baseEventName, ".").concat(secondaryName) : baseEventName;
        console.debug("Timing:".concat(grafanaEventName), eventTime);
        delete timestampData[eventName];
        if (Environment.isDevelopment()) {
            // Don't create traces on dev as this will mess up the accuracy of data in release builds of the app
            return;
        }
        if (maxExecutionTime && eventTime > maxExecutionTime) {
            Log_1.default.warn("".concat(eventName, " exceeded max execution time of ").concat(maxExecutionTime, "."), { eventTime: eventTime, eventName: eventName });
        }
        var parameters = {
            name: grafanaEventName,
            value: eventTime,
            platform: "".concat((0, getPlatform_1.default)()),
            version: "".concat(package_json_1.default.version),
        };
        API.read(types_1.READ_COMMANDS.SEND_PERFORMANCE_TIMING, parameters, {});
    });
}
/**
 * Clears all timing data
 */
function clearData() {
    timestampData = {};
}
exports.default = {
    start: start,
    end: end,
    clearData: clearData,
};
