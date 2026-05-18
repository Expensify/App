import {AppStartTimeNitroModule} from '@expensify/nitro-utils';
import Log from '@libs/Log';
import {startSpan} from '@libs/telemetry/activeSpans';
import CONST from '@src/CONST';
import reportModuleInitTimes from './reportModuleInitTimes';
import setupSentry from './setupSentry';

export default function (): void {
    setupSentry();

    let nativeAppStartTimeMs: number | undefined;
    try {
        const appStartTime = (AppStartTimeNitroModule as {readonly appStartTime: number}).appStartTime;
        nativeAppStartTimeMs = appStartTime > 0 ? appStartTime : undefined;
    } catch (error) {
        Log.warn('[Telemetry] Failed to read native app start time from NitroModule', {error});
        nativeAppStartTimeMs = undefined;
    }

    startSpan(CONST.TELEMETRY.SPAN_APP_STARTUP, {
        name: CONST.TELEMETRY.SPAN_APP_STARTUP,
        op: CONST.TELEMETRY.SPAN_APP_STARTUP,
        startTime: nativeAppStartTimeMs,
    });

    requestAnimationFrame(() => {
        // Use typeof guard — bare identifier throws ReferenceError if moduleInitPolyfill didn't run
        const initTimes = typeof __moduleInitTimes !== 'undefined' ? (__moduleInitTimes as Record<string, number>) : undefined;
        const moduleNames = typeof __moduleNames !== 'undefined' ? (__moduleNames as Record<string, string>) : undefined;
        reportModuleInitTimes(initTimes, moduleNames, 100);
    });
}
