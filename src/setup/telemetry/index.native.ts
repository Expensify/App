import {AppStartTimeNitroModule} from '@expensify/nitro-utils';
import Log from '@libs/Log';
import {startSpan} from '@libs/telemetry/activeSpans';
import CONST from '@src/CONST';
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
}
