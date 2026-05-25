import * as Sentry from '@sentry/react-native';
import CONST from '@src/CONST';

let hasFlushed = false;

/**
 * Benchmark for https://github.com/Expensify/App/issues/89652.
 *
 * Reads the running `JSON.stringify` totals accumulated by the patched react-native-onyx
 * SQLiteProvider, freezes accumulation by setting `__onyxStringifyActive = false`, and
 * forwards the totals to Sentry as a measurement + context + breadcrumb. Must be called
 * before `endSpan(SPAN_APP_STARTUP)` so the measurement attaches to the still-active span.
 */
function flushOnyxStringifyStats(): void {
    if (hasFlushed) {
        return;
    }
    hasFlushed = true;

    // eslint-disable-next-line no-underscore-dangle
    globalThis.__onyxStringifyActive = false;
    // eslint-disable-next-line no-underscore-dangle
    const stats = globalThis.__onyxStringifyStats;
    if (!stats) {
        return;
    }

    if (__DEV__) {
        const kb = (stats.totalBytes / 1024).toFixed(1);
        // eslint-disable-next-line no-console
        console.log(
            `[Onyx] startup JSON.stringify: ${stats.totalMs.toFixed(1)} ms / ${stats.callCount} calls / ${kb} KB ` + `(slowest call: ${stats.maxMs.toFixed(1)} ms / ${stats.maxBytes} bytes)`,
        );
    }

    Sentry.setContext(CONST.TELEMETRY.CONTEXT_ONYX_STRINGIFY, {
        totalMs: stats.totalMs,
        callCount: stats.callCount,
        totalBytes: stats.totalBytes,
        maxMs: stats.maxMs,
        maxBytes: stats.maxBytes,
    });

    Sentry.setMeasurement(CONST.TELEMETRY.MEASUREMENT_ONYX_STRINGIFY_MS, stats.totalMs, 'millisecond');

    Sentry.addBreadcrumb({
        category: CONST.TELEMETRY.BREADCRUMB_CATEGORY_ONYX_INIT,
        message: `Onyx startup JSON.stringify: ${stats.totalMs.toFixed(1)} ms (${stats.callCount} calls, ${stats.totalBytes} bytes, max ${stats.maxMs.toFixed(1)} ms)`,
        level: 'info',
        data: stats,
    });
}

export default flushOnyxStringifyStats;
