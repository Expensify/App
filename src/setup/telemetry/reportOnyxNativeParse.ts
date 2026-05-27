import * as Sentry from '@sentry/react-native';
import {fastJson} from 'react-native-fast-json';
import CONST from '@src/CONST';

/**
 * Benchmark for https://github.com/Expensify/App/issues/89652 — head-to-head comparison.
 *
 * Installs `globalThis.__benchmarkOnyxNativeParse`, which the patched react-native-onyx
 * SQLiteProvider invokes once with the raw rows from Onyx's initial bulk hydration. We
 * then re-parse each row with `react-native-fast-json` (simdjson via Nitro/JSI) end-to-end
 * — `parseString` is async and returns a `JsonView`, so the timing includes the Promise
 * round-trip cost, which is what we want for an apples-to-apples comparison.
 *
 * Caveat: the library's own README recommends `JSON.parse` for general use. We expect
 * Promise overhead per row to inflate `totalMs` relative to what a sync JSI binding would
 * yield. Treat the resulting number as an upper bound on the native-parser cost, not a
 * lower bound.
 *
 * Must be called before `Onyx.init()` so the hook is in place when getAll resolves.
 */
function installOnyxNativeParseBenchmark(): void {
    // eslint-disable-next-line no-underscore-dangle
    globalThis.__benchmarkOnyxNativeParse = (rawRows) => {
        if (!rawRows || rawRows.length === 0) {
            return;
        }

        const perfNow = (): number => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());

        const runBenchmark = async () => {
            const totalStart = perfNow();
            let parseTotalMs = 0;
            let totalBytes = 0;
            let maxRowMs = 0;
            let maxRowBytes = 0;
            let maxRowKey = '';
            let errorCount = 0;

            for (let i = 0; i < rawRows.length; i++) {
                const row = rawRows[i];
                const json = row?.valueJSON;
                const key = row?.record_key || '';
                if (!json) {
                    continue;
                }
                const bytes = json.length;
                totalBytes += bytes;

                const t0 = perfNow();
                try {
                    // We deliberately discard the result — we only want the timing.
                    // parseString returns Promise<JsonView | null>; awaiting it includes the
                    // microtask scheduling cost in our measurement.
                    await fastJson.parseString(json);
                } catch (e) {
                    errorCount += 1;
                }
                const ms = perfNow() - t0;
                parseTotalMs += ms;
                if (ms > maxRowMs) {
                    maxRowMs = ms;
                    maxRowBytes = bytes;
                    maxRowKey = key;
                }
            }

            const wallClockMs = perfNow() - totalStart;
            const stats = {
                totalMs: parseTotalMs,
                wallClockMs,
                rowCount: rawRows.length,
                totalBytes,
                maxRowMs,
                maxRowBytes,
                maxRowKey,
                errorCount,
            };

            if (__DEV__) {
                const kb = (totalBytes / 1024).toFixed(1);
                // eslint-disable-next-line no-console
                console.log(
                    `[Onyx] native parse (simdjson via react-native-fast-json): ${parseTotalMs.toFixed(1)} ms / ${rawRows.length} rows / ${kb} KB ` +
                        `(slowest: ${maxRowMs.toFixed(1)} ms / ${maxRowBytes} bytes / key="${maxRowKey}", errors: ${errorCount})`,
                );
            }

            Sentry.setContext(CONST.TELEMETRY.CONTEXT_ONYX_INITIAL_PARSE_NATIVE, stats);
            Sentry.setMeasurement(CONST.TELEMETRY.MEASUREMENT_ONYX_INITIAL_PARSE_NATIVE_MS, parseTotalMs, 'millisecond');
            Sentry.addBreadcrumb({
                category: CONST.TELEMETRY.BREADCRUMB_CATEGORY_ONYX_INIT,
                message: `Onyx native parse (simdjson): ${parseTotalMs.toFixed(1)} ms (${rawRows.length} rows, ${totalBytes} bytes, max ${maxRowMs.toFixed(1)} ms on "${maxRowKey}")`,
                level: 'info',
                data: stats,
            });
        };

        // Fire and forget — the benchmark runs in the background. We don't block Onyx's
        // hydration flow, and the result lands on Sentry whenever the loop finishes.
        runBenchmark().catch((e) => {
            if (__DEV__) {
                // eslint-disable-next-line no-console
                console.warn('[Onyx] native parse benchmark failed', e);
            }
        });
    };
}

export default installOnyxNativeParseBenchmark;
