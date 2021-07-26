import perf from '@react-native-firebase/perf';

const traceMap = {};

/**
 * @param {String} customEventName
 */
function startTrace(customEventName) {
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
