import {trace} from '@firebase/performance';
import * as Environment from '@libs/Environment/Environment';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as ReportConnection from '@libs/ReportConnection';
import * as SessionUtils from '@libs/SessionUtils';
import {firebasePerfWeb} from './firebaseWebConfig';
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

    const perfTrace = trace(firebasePerfWeb, customEventName);

    const attributes = getAttributes();

    Object.entries(attributes).forEach(([name, value]) => {
        perfTrace.putAttribute(name, value);
    });

    traceMap[customEventName] = {
        trace: perfTrace,
        start,
    };

    perfTrace.start();
};

const stopTrace: StopTrace = (customEventName) => {
    if (Environment.isDevelopment()) {
        return;
    }

    const perfTrace = traceMap[customEventName]?.trace;

    if (!perfTrace) {
        return;
    }

    perfTrace.stop();

    delete traceMap[customEventName];
};

const log: Log = () => {
    // crashlytics is not supported on WEB
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
