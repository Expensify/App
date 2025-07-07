"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stop = exports.start = void 0;
var profiler_1 = require("@perf-profiler/profiler");
var reporter_1 = require("@perf-profiler/reporter");
var types_1 = require("@perf-profiler/types");
var Logger = require("./logger");
var measures = [];
var POLLING_STOPPED = {
    stop: function () {
        throw new Error('Cannot stop polling on a stopped profiler');
    },
};
var polling = POLLING_STOPPED;
var start = function (bundleId, _a) {
    var onAttachFailed = _a.onAttachFailed;
    // clear our measurements results
    measures = [];
    polling = profiler_1.profiler.pollPerformanceMeasures(bundleId, {
        onMeasure: function (measure) {
            measures.push(measure);
        },
        onPidChanged: function () {
            onAttachFailed();
        },
    });
    Logger.info("Starting performance measurements for ".concat(bundleId));
};
exports.start = start;
var stop = function (whoTriggered) {
    var _a, _b;
    Logger.info("Stop performance measurements... Was triggered by ".concat(whoTriggered));
    polling.stop();
    polling = POLLING_STOPPED;
    var average = (0, reporter_1.getAverageCpuUsagePerProcess)(measures);
    var uiThread = (_a = average.find(function (_a) {
        var processName = _a.processName;
        return processName === types_1.ThreadNames.ANDROID.UI;
    })) === null || _a === void 0 ? void 0 : _a.cpuUsage;
    // most likely this line needs to be updated when we migrate to RN 0.74 with bridgeless mode
    var jsThread = (_b = average.find(function (_a) {
        var processName = _a.processName;
        return processName === types_1.ThreadNames.RN.JS_ANDROID;
    })) === null || _b === void 0 ? void 0 : _b.cpuUsage;
    var cpu = (0, reporter_1.getAverageCpuUsage)(measures);
    var fps = (0, reporter_1.getAverageFPSUsage)(measures);
    var ram = (0, reporter_1.getAverageRAMUsage)(measures);
    return {
        uiThread: uiThread,
        jsThread: jsThread,
        cpu: cpu,
        fps: fps,
        ram: ram,
    };
};
exports.stop = stop;
