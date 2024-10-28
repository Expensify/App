import {trace} from '@firebase/performance';
import * as Environment from '@libs/Environment/Environment';
import {firebasePerfWeb} from './firebaseWebConfig';
import type {Log, StartTrace, StopTrace, TraceMap} from './types';
import utils from './utils';

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

    const attributes = utils.getAttributes();

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

export default {
    startTrace,
    stopTrace,
    log,
};
