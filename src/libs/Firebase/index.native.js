import perf from '@react-native-firebase/perf';
import {isDevelopment} from '../Environment/Environment';
import Log from '../Log';

const traceMap = {};

let start, stop;

/**
 * @param {String} customEventName
 */
function startTrace(customEventName) {
    start = global.performance.now();
    if (isDevelopment()) {
        return;
    }

    if (traceMap[customEventName]) {
        return;
    }

    perf().startTrace(customEventName)
        .then(trace => traceMap[customEventName] = trace);
}

/**
 * @param {String} customEventName
 */
function stopTrace(customEventName) {
    stop = global.performance.now();

    if (isDevelopment()) {
        return;
    }

    const trace = traceMap[customEventName];
    if (!trace) {
        return;
    }

    trace.stop();

    Log.info(`@marcaaron sidebar_loaded took: ${stop - start} ms`, true);
    delete traceMap[customEventName];
}

export default {
    startTrace,
    stopTrace,
};
