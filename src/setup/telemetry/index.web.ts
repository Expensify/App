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
        // Use typeof guard — bare identifier throws ReferenceError if ModuleInitTimingPlugin didn't run (e.g. Storybook, stale cache)
        const initTimes = typeof __moduleInitTimes !== 'undefined' ? (__moduleInitTimes as Record<string, number>) : undefined;

        // Fetch the moduleId → path map emitted at build time as a separate asset.
        // This avoids embedding the map in the runtime chunk (no startup cost).
        fetch('/module-names.json')
            .then((res) => res.json() as Promise<Record<string, string>>)
            .then((moduleNames) => {
                reportModuleInitTimes(initTimes, moduleNames, 1);
            })
            .catch(() => {
                // Map unavailable (e.g. Storybook, local dev without asset) — fall back to numeric IDs.
                reportModuleInitTimes(initTimes, undefined, 1);
            });
    });
}
