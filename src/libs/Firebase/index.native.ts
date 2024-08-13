/* eslint-disable no-unused-vars */
import crashlytics from '@react-native-firebase/crashlytics';
import perf from '@react-native-firebase/perf';
import * as Environment from '@libs/Environment/Environment';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as ReportConnection from '@libs/ReportConnection';
import * as SessionUtils from '@libs/SessionUtils';
import type {FirebaseAttributes, Log, StartTrace, StopTrace, TraceMap} from './types';

const traceMap: TraceMap = {};

const startTrace: StartTrace = (customEventName) => {
    const start = global.performance.now();
    if (Environment.isDevelopment()) {
        return;
    }

    if (traceMap[customEventName]) {
        return;
    }

    const attributes = getAttributes();

    perf()
        .startTrace(customEventName)
        .then((trace) => {
            Object.entries(attributes).forEach(([name, value]) => {
                trace.putAttribute(name, value);
            });
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

function getAttributes(): FirebaseAttributes {
    const session = SessionUtils.getSession();

    const accountId = session?.accountID?.toString() ?? 'N/A';
    const reportsLength = ReportConnection.getAllReportsLength().toString();
    const personalDetailsLength = PersonalDetailsUtils.getPersonalDetailsLength().toString();

    return {
        accountId,
        reportsLength,
        personalDetailsLength,
    };
}

export default {
    startTrace,
    stopTrace,
    log,
};
