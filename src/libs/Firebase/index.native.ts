/* eslint-disable no-unused-vars */
import {log as crashlyticsLog, getCrashlytics} from '@react-native-firebase/crashlytics';
import {getPerformance} from '@react-native-firebase/perf';
import * as Environment from '@libs/Environment/Environment';
import type {FirebaseAttributes, Log, StartTrace, StopTrace, TraceMap} from './types';
import utils from './utils';

const crashlytics = getCrashlytics();
const perf = getPerformance();
const traceMap: TraceMap = {};

const startTrace: StartTrace = (customEventName) => {
    const start = global.performance.now();
    if (Environment.isDevelopment()) {
        return;
    }

    if (traceMap[customEventName]) {
        return;
    }

    const attributes: FirebaseAttributes = utils.getAttributes(['accountId', 'personalDetailsLength', 'reportActionsLength', 'reportsLength', 'policiesLength']);

    perf.startTrace(customEventName).then((trace) => {
        for (const [name, value] of Object.entries(attributes)) {
            trace.putAttribute(name, value);
        }
        traceMap[customEventName] = {
            trace,
            start,
        };
    });
};

const stopTrace: StopTrace = (customEventName) => {
    // Uncomment to inspect logs on release builds
    // const stop = global.performance.now();
    if (Environment.isDevelopment()) {
        return;
    }

    const trace = traceMap[customEventName]?.trace;
    if (!trace) {
        return;
    }

    trace.stop();

    // Uncomment to inspect logs on release builds
    // const start = lodashGet(traceMap, [customEventName, 'start']);
    // Log.info(`sidebar_loaded: ${stop - start} ms`, true);

    delete traceMap[customEventName];
};

const log: Log = (action: string) => {
    crashlyticsLog(crashlytics, action);
};

export default {
    startTrace,
    stopTrace,
    log,
};
