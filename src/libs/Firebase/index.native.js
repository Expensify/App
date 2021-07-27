import perf from '@react-native-firebase/perf';
import {isDevelopment} from '../Environment/Environment';

const traceMap = {};

let start;
let end;

/**
 * @param {String} customEventName
 */
function startTrace(customEventName) {
    start = global.performance.now();

    if (isDevelopment()) {
        return;
    }

    if (traceMap[customEventName]) {
        console.debug('[Firebase] Trace with this name has already started');
        return;
    }

    perf().startTrace(customEventName)
        .then(trace => traceMap[customEventName] = trace);
}

/**
 * @param {String} customEventName
 */
function stopTrace(customEventName) {
    end = global.performance.now();
    console.debug('sidebar_loaded in ', end - start, ' ms');

    if (isDevelopment()) {
        return;
    }

    const trace = traceMap[customEventName];
    if (!trace) {
        console.debug('[Firebase] Could not find trace');
    }

    trace.stop();
    delete traceMap[customEventName];
}

export default {
    startTrace,
    stopTrace,
};
