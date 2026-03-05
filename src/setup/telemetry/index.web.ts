import {startSpan} from '@libs/telemetry/activeSpans';
import CONST from '@src/CONST';
import reportModuleInitTimes from './reportModuleInitTimes';
import setupSentry from './setupSentry';

export default function (): void {
    setupSentry();

    startSpan(CONST.TELEMETRY.SPAN_APP_STARTUP, {
        name: CONST.TELEMETRY.SPAN_APP_STARTUP,
        op: CONST.TELEMETRY.SPAN_APP_STARTUP,
    });

    requestAnimationFrame(() => {
        // webpack module timing path (ModuleInitTimingPlugin injected __moduleInitTimes).
        // In dev mode, keys are relative file paths; in production they are numeric IDs.
        // Use typeof guard — bare identifier throws ReferenceError if ModuleInitTimingPlugin didn't run (e.g. Storybook, stale cache)
        const initTimes = typeof __moduleInitTimes !== 'undefined' ? (__moduleInitTimes as Record<string, number>) : undefined;
        reportModuleInitTimes(initTimes, undefined, 1);
    });
}
