/* eslint-disable no-unused-vars */
import perf from '@react-native-firebase/perf';
import lodashGet from 'lodash/get';
import * as Environment from '../Environment/Environment';
import Log from '../Log';

const traceMap = {};

/**
 * @param {String} customEventName
 */
function startTrace(customEventName) {
    const start = global.performance.now();
    if (Environment.isDevelopment()) {
        return;
    }

    if (traceMap[customEventName]) {
        return;
    }

    perf().startTrace(customEventName)
        .then((trace) => {
            traceMap[customEventName] = {
                trace,
                start,
            };
        });
}

/**
 * @param {String} customEventName
 */
function stopTrace(customEventName) {
    const stop = global.performance.now();
    if (Environment.isDevelopment()) {
        return;
    }

    const trace = lodashGet(traceMap, [customEventName, 'trace']);
    if (!trace) {
        return;
    }

    trace.stop();

    // Uncomment to inspect logs on release builds
    // const start = lodashGet(traceMap, [customEventName, 'start']);
    // Log.info(`sidebar_loaded: ${stop - start} ms`, true);

    delete traceMap[customEventName];
}

export default {
    startTrace,
    stopTrace,
};
