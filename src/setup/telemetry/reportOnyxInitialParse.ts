import * as Sentry from '@sentry/react-native';
import CONST from '@src/CONST';

/**
 * Benchmark for https://github.com/Expensify/App/issues/89652.
 *
 * Installs a one-shot callback that the patched react-native-onyx SQLiteProvider invokes
 * the first time `getAll()` finishes (i.e. Onyx's initial bulk hydration). Forwards the
 * JSON.parse timing to Sentry as a measurement + context + breadcrumb, and logs it in dev.
 *
 * Must be called before `Onyx.init()` so the callback is in place when getAll() resolves.
 */
function reportOnyxInitialParse(): void {
    // eslint-disable-next-line no-underscore-dangle
    globalThis.__onOnyxInitialParse = (stats) => {
        if (__DEV__) {
            const kb = (stats.totalBytes / 1024).toFixed(1);
            // eslint-disable-next-line no-console
            console.log(`[Onyx] initial JSON.parse: ${stats.totalMs.toFixed(1)} ms / ${stats.rowCount} rows / ${kb} KB`);
        }

        Sentry.setContext(CONST.TELEMETRY.CONTEXT_ONYX_INITIAL_PARSE, {
            totalMs: stats.totalMs,
            rowCount: stats.rowCount,
            totalBytes: stats.totalBytes,
        });

        Sentry.setMeasurement(CONST.TELEMETRY.MEASUREMENT_ONYX_INITIAL_PARSE_MS, stats.totalMs, 'millisecond');

        Sentry.addBreadcrumb({
            category: CONST.TELEMETRY.BREADCRUMB_CATEGORY_ONYX_INIT,
            message: `Onyx initial JSON.parse: ${stats.totalMs.toFixed(1)} ms (${stats.rowCount} rows, ${stats.totalBytes} bytes)`,
            level: 'info',
            data: stats,
        });
    };
}

export default reportOnyxInitialParse;
