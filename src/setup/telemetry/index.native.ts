import {AppStartTimeNitroModule} from '@expensify/nitro-utils';
import Log from '@libs/Log';
import {startSpan} from '@libs/telemetry/activeSpans';
import CONST from '@src/CONST';
import * as Sentry from '@sentry/react-native';
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
        if (typeof __moduleInitTimes === 'undefined' || typeof __moduleNames === 'undefined') {
            return;
        }
        const topModules = Object.entries(__moduleInitTimes as Record<string, number>)
            .map(([id, ms]) => ({
                name: (__moduleNames as Record<string, string>)[id] ?? id,
                ms: Math.round(ms),
            }))
            .filter(({ms}) => ms >= 100)
            .sort((a, b) => b.ms - a.ms)
            .slice(0, 50);
        console.debug(`[Telemetry] Modules taking ≥100ms to init (all, incl. 3rd party) — count: ${topModules.length}`);
        for (const {name, ms} of topModules) {
            console.debug(`[Module]  ${ms}ms — ${name}`);
        }

        Sentry.addBreadcrumb({
            category: CONST.TELEMETRY.BREADCRUMB_CATEGORY_MODULE_INIT,
            level: 'info',
            data: {modules: topModules},
        });
    });
}
