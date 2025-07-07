"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var fast_equals_1 = require("fast-equals");
var isObject_1 = require("lodash/isObject");
var transform_1 = require("lodash/transform");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_performance_1 = require("react-native-performance");
var CONST_1 = require("@src/CONST");
var isE2ETestSession_1 = require("./E2E/isE2ETestSession");
var getComponentDisplayName_1 = require("./getComponentDisplayName");
var Metrics_1 = require("./Metrics");
/**
 * Deep diff between two objects. Useful for figuring out what changed about an object from one render to the next so
 * that state and props updates can be optimized.
 */
function diffObject(object, base) {
    function changes(obj, comparisonObject) {
        return (0, transform_1.default)(obj, function (result, value, key) {
            if ((0, fast_equals_1.deepEqual)(value, comparisonObject[key])) {
                return;
            }
            // eslint-disable-next-line no-param-reassign
            result[key] = (0, isObject_1.default)(value) && (0, isObject_1.default)(comparisonObject[key]) ? changes(value, comparisonObject[key]) : value;
        });
    }
    return changes(object, base);
}
function measureFailSafe(measureName, startOrMeasureOptions, endMark) {
    try {
        react_native_performance_1.default.measure(measureName, startOrMeasureOptions, endMark);
    }
    catch (error) {
        // Sometimes there might be no start mark recorded and the measure will fail with an error
        if (error instanceof Error) {
            console.debug(error.message);
        }
    }
}
/**
 * Measures the TTI (time to interactive) time starting from the `nativeLaunchStart` event.
 * To be called when the app is considered to be interactive.
 */
function measureTTI(endMark) {
    // Make sure TTI is captured when the app is really usable
    react_native_1.InteractionManager.runAfterInteractions(function () {
        requestAnimationFrame(function () {
            measureFailSafe('TTI', 'nativeLaunchStart', endMark);
            // We don't want an alert to show:
            // - on builds with performance metrics collection disabled by a feature flag
            // - e2e test sessions
            if (!(0, Metrics_1.default)() || (0, isE2ETestSession_1.default)()) {
                return;
            }
            printPerformanceMetrics();
        });
    });
}
/*
 * Monitor native marks that we want to put on the timeline
 */
var nativeMarksObserver = new react_native_performance_1.PerformanceObserver(function (list, _observer) {
    list.getEntries().forEach(function (entry) {
        if (entry.name === 'nativeLaunchEnd') {
            measureFailSafe('nativeLaunch', 'nativeLaunchStart', 'nativeLaunchEnd');
        }
        if (entry.name === 'downloadEnd') {
            measureFailSafe('jsBundleDownload', 'downloadStart', 'downloadEnd');
        }
        if (entry.name === 'runJsBundleEnd') {
            measureFailSafe('runJsBundle', 'runJsBundleStart', 'runJsBundleEnd');
        }
        if (entry.name === 'appCreationEnd') {
            measureFailSafe('appCreation', 'appCreationStart', 'appCreationEnd');
            measureFailSafe('nativeLaunchEnd_To_appCreationStart', 'nativeLaunchEnd', 'appCreationStart');
        }
        if (entry.name === 'contentAppeared') {
            measureFailSafe('appCreationEnd_To_contentAppeared', 'appCreationEnd', 'contentAppeared');
        }
        // At this point we've captured and processed all the native marks we're interested in
        // and are not expecting to have more thus we can safely disconnect the observer
        if (entry.name === 'runJsBundleEnd' || entry.name === 'downloadEnd') {
            _observer.disconnect();
        }
    });
});
function setNativeMarksObserverEnabled(enabled) {
    if (enabled === void 0) { enabled = false; }
    if (!enabled) {
        nativeMarksObserver.disconnect();
        return;
    }
    nativeMarksObserver.disconnect();
    nativeMarksObserver.observe({ type: 'react-native-mark', buffered: true });
}
/**
 * Monitor for "_end" marks and capture "_start" to "_end" measures, including events recorded in the native layer before the app fully initializes.
 */
var customMarksObserver = new react_native_performance_1.PerformanceObserver(function (list) {
    list.getEntriesByType('mark').forEach(function (mark) {
        if (mark.name.endsWith('_end')) {
            var end = mark.name;
            var name_1 = end.replace(/_end$/, '');
            var start = "".concat(name_1, "_start");
            measureFailSafe(name_1, start, end);
        }
        // Capture any custom measures or metrics below
        if (mark.name === "".concat(CONST_1.default.TIMING.SIDEBAR_LOADED, "_end")) {
            measureFailSafe('contentAppeared_To_screenTTI', 'contentAppeared', mark.name);
            measureTTI(mark.name);
        }
    });
});
function setCustomMarksObserverEnabled(enabled) {
    if (enabled === void 0) { enabled = false; }
    if (!enabled) {
        customMarksObserver.disconnect();
        return;
    }
    customMarksObserver.disconnect();
    customMarksObserver.observe({ type: 'mark', buffered: true });
}
function getPerformanceMetrics() {
    return __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], react_native_performance_1.default.getEntriesByName('nativeLaunch'), true), react_native_performance_1.default.getEntriesByName('nativeLaunchEnd_To_appCreationStart'), true), react_native_performance_1.default.getEntriesByName('appCreation'), true), react_native_performance_1.default.getEntriesByName('appCreationEnd_To_contentAppeared'), true), react_native_performance_1.default.getEntriesByName('contentAppeared_To_screenTTI'), true), react_native_performance_1.default.getEntriesByName('runJsBundle'), true), react_native_performance_1.default.getEntriesByName('jsBundleDownload'), true), react_native_performance_1.default.getEntriesByName('TTI'), true), react_native_performance_1.default.getEntriesByName('regularAppStart'), true), react_native_performance_1.default.getEntriesByName('appStartedToReady'), true).filter(function (entry) { return entry.duration > 0; });
}
function getPerformanceMeasures() {
    return react_native_performance_1.default.getEntriesByType('measure');
}
/**
 * Outputs performance stats. We alert these so that they are easy to access in release builds.
 */
function printPerformanceMetrics() {
    var stats = getPerformanceMetrics();
    var statsAsText = stats.map(function (entry) { return "\u2022 ".concat(entry.name, ": ").concat(entry.duration.toFixed(1), "ms"); }).join('\n');
    if (stats.length > 0) {
        react_native_1.Alert.alert('Performance', statsAsText);
    }
}
function subscribeToMeasurements(callback) {
    var observer = new react_native_performance_1.PerformanceObserver(function (list) {
        list.getEntriesByType('measure').forEach(callback);
    });
    observer.observe({ type: 'measure', buffered: true });
    return function () { return observer.disconnect(); };
}
/**
 * Add a start mark to the performance entries
 */
function markStart(name, detail) {
    return react_native_performance_1.default.mark("".concat(name, "_start"), { detail: detail });
}
/**
 * Add an end mark to the performance entries
 * A measure between start and end is captured automatically
 */
function markEnd(name, detail) {
    return react_native_performance_1.default.mark("".concat(name, "_end"), { detail: detail });
}
/**
 * Put data emitted by Profiler components on the timeline
 * @param id the "id" prop of the Profiler tree that has just committed
 * @param phase either "mount" (if the tree just mounted) or "update" (if it re-rendered)
 * @param actualDuration time spent rendering the committed update
 * @param baseDuration estimated time to render the entire subtree without memoization
 * @param startTime when React began rendering this update
 * @param commitTime when React committed this update
 */
function traceRender(id, phase, actualDuration, baseDuration, startTime, commitTime) {
    return react_native_performance_1.default.measure(id, {
        start: startTime,
        duration: actualDuration,
        detail: {
            phase: phase,
            baseDuration: baseDuration,
            commitTime: commitTime,
        },
    });
}
/**
 * A HOC that captures render timings of the Wrapped component
 */
function withRenderTrace(_a) {
    var id = _a.id;
    if (!(0, Metrics_1.default)()) {
        return function (WrappedComponent) { return WrappedComponent; };
    }
    return function (WrappedComponent) {
        var WithRenderTrace = (0, react_1.forwardRef)(function (props, ref) { return (<react_1.Profiler id={id} onRender={traceRender}>
                <WrappedComponent 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props} ref={ref}/>
            </react_1.Profiler>); });
        WithRenderTrace.displayName = "withRenderTrace(".concat((0, getComponentDisplayName_1.default)(WrappedComponent), ")");
        return WithRenderTrace;
    };
}
function enableMonitoring() {
    (0, react_native_performance_1.setResourceLoggingEnabled)(true);
    setNativeMarksObserverEnabled(true);
    setCustomMarksObserverEnabled(true);
}
function disableMonitoring() {
    (0, react_native_performance_1.setResourceLoggingEnabled)(false);
    setNativeMarksObserverEnabled(false);
    setCustomMarksObserverEnabled(false);
}
exports.default = {
    diffObject: diffObject,
    measureFailSafe: measureFailSafe,
    measureTTI: measureTTI,
    enableMonitoring: enableMonitoring,
    disableMonitoring: disableMonitoring,
    getPerformanceMetrics: getPerformanceMetrics,
    getPerformanceMeasures: getPerformanceMeasures,
    printPerformanceMetrics: printPerformanceMetrics,
    subscribeToMeasurements: subscribeToMeasurements,
    markStart: markStart,
    markEnd: markEnd,
    withRenderTrace: withRenderTrace,
};
