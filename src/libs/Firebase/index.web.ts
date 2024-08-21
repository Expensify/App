/* eslint-disable no-unused-vars */
import {trace} from 'firebase/performance';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as ReportConnection from '@libs/ReportConnection';
import * as SessionUtils from '@libs/SessionUtils';
import {firebasePerfWeb} from './firebaseWebConfig';
import type {FirebaseAttributes, StartTrace, StopTrace, TraceMap} from './types';

const traceMap: TraceMap = {};

const startTrace: StartTrace = (customEventName) => {
    const start = global.performance.now();
    // TODO uncomment before merging
    // if (Environment.isDevelopment()) {
    //     return;
    // }

    if (traceMap[customEventName]) {
        return;
    }

    const newTrace = trace(firebasePerfWeb, customEventName);

    const attributes = getAttributes();

    Object.entries(attributes).forEach(([name, value]) => {
        newTrace.putAttribute(name, value);
    });

    traceMap[customEventName] = {
        trace: newTrace,
        start,
    };

    newTrace.start();
};

const stopTrace: StopTrace = (customEventName) => {
    // TODO uncomment before merging
    // if (Environment.isDevelopment()) {
    //     return;
    // }

    const perfTrace = traceMap[customEventName].trace;

    if (!perfTrace) {
        return;
    }

    perfTrace.stop();

    delete traceMap[customEventName];
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
};
