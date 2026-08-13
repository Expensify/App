import Log from '@libs/Log';
import {startSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';

import {AppStartTimeNitroModule} from '@expensify/nitro-utils';

import reportModuleInitTimes from './reportModuleInitTimes';
import setupSentry from './setupSentry';

// On a prewarmed process the app can be created long before the user actually opens it, leaving a stale start time that
// would inflate the startup span to minutes/hours. Discard any start time older than this threshold as a prewarm/stale value.
const MAX_PREWARMING_APP_START_AGE_MS = 60 * 1000;

export default function (): void {
    setupSentry();

    let nativeAppStartTimeMs: number | undefined;
    try {
        const appStartTime = (AppStartTimeNitroModule as {readonly appStartTime: number}).appStartTime;
        const appStartAgeMs = Date.now() - appStartTime;
        if (appStartTime > 0 && appStartAgeMs >= 0 && appStartAgeMs < MAX_PREWARMING_APP_START_AGE_MS) {
            nativeAppStartTimeMs = appStartTime;
        } else {
            if (appStartTime > 0) {
                Log.warn('[Telemetry] Discarding native app start time (stale/prewarm)', {appStartTime, appStartAgeMs});
            }
            nativeAppStartTimeMs = undefined;
        }
    } catch (error) {
        Log.warn('[Telemetry] Failed to read native app start time from NitroModule', {error});
        nativeAppStartTimeMs = undefined;
    }

    startSpan(CONST.TELEMETRY.SPAN_APP_STARTUP, {
        name: CONST.TELEMETRY.SPAN_APP_STARTUP,
        op: CONST.TELEMETRY.SPAN_APP_STARTUP,
        startTime: nativeAppStartTimeMs,
    });

    startSpan(CONST.TELEMETRY.SPAN_APP_STARTUP_NETWORK_REQUEST, {
        name: CONST.TELEMETRY.SPAN_APP_STARTUP_NETWORK_REQUEST,
        op: CONST.TELEMETRY.SPAN_APP_STARTUP_NETWORK_REQUEST,
        startTime: nativeAppStartTimeMs,
    });

    requestAnimationFrame(() => {
        // Use typeof guard — bare identifier throws ReferenceError if moduleInitPolyfill didn't run
        const initTimes = typeof __moduleInitTimes !== 'undefined' ? (__moduleInitTimes as Record<string, number>) : undefined;
        const moduleNames = typeof __moduleNames !== 'undefined' ? (__moduleNames as Record<string, string>) : undefined;
        reportModuleInitTimes(initTimes, moduleNames, 100);
    });
}
