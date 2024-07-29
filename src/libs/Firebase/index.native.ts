/* eslint-disable no-unused-vars */
import crashlytics from '@react-native-firebase/crashlytics';
import perf from '@react-native-firebase/perf';
import * as Environment from '@libs/Environment/Environment';
import * as SessionUtils from '@libs/SessionUtils';
import type {Log, StartTrace, StopTrace, TraceMap} from './types';

const traceMap: TraceMap = {};

const startTrace: StartTrace = (customEventName) => {
    const start = global.performance.now();
    if (Environment.isDevelopment()) {
        return;
    }

    if (traceMap[customEventName]) {
        return;
    }

    const session = SessionUtils.getSession();

    perf()
        .startTrace(customEventName)
        .then((trace) => {
            trace.putAttribute('accountID', session?.accountID?.toString() ?? 'N/A');
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

    const trace = traceMap[customEventName].trace;
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
    crashlytics().log(action);
};

export default {
    startTrace,
    stopTrace,
    log,
};
