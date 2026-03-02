import * as Sentry from '@sentry/react-native';
import {startSpan} from '@libs/telemetry/activeSpans';
import CONST from '@src/CONST';
import setupSentry from './setupSentry';

export default function (): void {
    setupSentry();

    startSpan(CONST.TELEMETRY.SPAN_APP_STARTUP, {
        name: CONST.TELEMETRY.SPAN_APP_STARTUP,
        op: CONST.TELEMETRY.SPAN_APP_STARTUP,
    });

    requestAnimationFrame(() => {
        if (typeof __moduleInitTimes === 'undefined' || Object.keys(__moduleInitTimes as Record<string, number>).length === 0) {
            return;
        }

        // webpack module timing path (ModuleInitTimingPlugin injected __moduleInitTimes).
        // In dev mode, keys are relative file paths; in production they are numeric IDs.
        const topModules = Object.entries(__moduleInitTimes as Record<string, number>)
            .map(([id, ms]) => ({name: id, ms: Math.round(ms)}))
            .filter(({ms}) => ms >= 1)
            .sort((a, b) => b.ms - a.ms)
            .slice(0, 50);
        console.debug(`[Telemetry] Module init times (slowest first) — count: ${topModules.length}`);
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
