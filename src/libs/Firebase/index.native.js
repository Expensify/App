import perf from '@react-native-firebase/perf';
import {isDevelopment} from '../Environment/Environment';

const traceMap = {};

/**
 * @param {String} customEventName
 */
function startTrace(customEventName) {
    if (isDevelopment()) {
        return;
    }

    if (traceMap[customEventName]) {
        console.debug('[Firebase] Trace with this name has already started');
        return;
    }

    perf()
        .then((trace) => {
            traceMap[customEventName] = trace;
            trace.startTrace(customEventName);
        });
}

/**
 * @param {String} customEventName
 */
function stopTrace(customEventName) {
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
