/* eslint-disable no-unused-vars */
import perf from '@react-native-firebase/perf';
import analytics from '@react-native-firebase/analytics';
import * as Environment from '@libs/Environment/Environment';
import {StartTrace, StopTrace, TrackScreen, TraceMap} from './types';

const traceMap: TraceMap = {};

const startTrace: StartTrace = (customEventName) => {
    const start = global.performance.now();
    if (Environment.isDevelopment()) {
        return;
    }

    if (traceMap[customEventName]) {
        return;
    }

    perf()
        .startTrace(customEventName)
        .then((trace) => {
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

const trackScreen: TrackScreen = (screenName: string) => {
    if (Environment.isDevelopment()) {
        return;
    }
    analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenName,
    });
};

export default {
    startTrace,
    stopTrace,
    trackScreen,
};
