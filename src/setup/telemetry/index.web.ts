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
        reportModuleInitTimes(__moduleInitTimes as Record<string, number> | undefined, undefined, 1);
    });
}
