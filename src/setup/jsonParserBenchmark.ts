import {JsonParserNitroModule} from '@expensify/nitro-utils';
import Log from '@libs/Log';

type RawRow = {record_key: string; valueJSON: string};

type ParseStats = {
    totalMs: number;
    rowCount: number;
    totalBytes: number;
    maxRowMs: number;
    maxRowBytes: number;
    maxRowKey: string;
    errorCount: number;
};

declare global {
    // eslint-disable-next-line no-var, vars-on-top
    var __benchmarkOnyxNativeParse: ((rawRows: RawRow[]) => void) | undefined;
    // eslint-disable-next-line no-var, vars-on-top
    var __onyxInitialParse: Omit<ParseStats, 'errorCount'> | undefined;
    // eslint-disable-next-line no-var, vars-on-top
    var __onyxInitialParseNitro: ParseStats | undefined;
}

function now(): number {
    if (typeof performance !== 'undefined' && performance.now) {
        return performance.now();
    }
    return Date.now();
}

// Re-parses every row Hermes just parsed during Onyx's initial getAll(), but with
// the Glaze-backed Nitro parser. Records totals on globalThis.__onyxInitialParseNitro
// so a single cold-start gives apples-to-apples timing for both parsers against the
// same in-memory data. The SQLiteProvider patch fires this exactly once.
function runNitroParseBenchmark(rawRows: RawRow[]): void {
    if (!rawRows || rawRows.length === 0) {
        return;
    }

    const start = now();
    let totalBytes = 0;
    let maxRowMs = 0;
    let maxRowBytes = 0;
    let maxRowKey = '';
    let errorCount = 0;

    for (let i = 0; i < rawRows.length; i++) {
        const row = rawRows[i];
        const bytes = row.valueJSON ? row.valueJSON.length : 0;
        totalBytes += bytes;

        const rowStart = now();
        try {
            JsonParserNitroModule.parse(row.valueJSON);
        } catch {
            errorCount += 1;
        }
        const rowMs = now() - rowStart;

        if (rowMs > maxRowMs) {
            maxRowMs = rowMs;
            maxRowBytes = bytes;
            maxRowKey = row.record_key || '';
        }
    }

    const stats: ParseStats = {
        totalMs: now() - start,
        rowCount: rawRows.length,
        totalBytes,
        maxRowMs,
        maxRowBytes,
        maxRowKey,
        errorCount,
    };

    globalThis.__onyxInitialParseNitro = stats;

    const hermes = globalThis.__onyxInitialParse;
    if (hermes) {
        const ratio = stats.totalMs > 0 ? hermes.totalMs / stats.totalMs : 0;
        Log.info(
            `[JsonParser] Onyx initial parse — Hermes: ${hermes.totalMs.toFixed(1)}ms, ` +
                `Nitro/Glaze: ${stats.totalMs.toFixed(1)}ms (${ratio.toFixed(2)}x), ` +
                `${stats.rowCount} rows, ${(stats.totalBytes / (1024 * 1024)).toFixed(2)} MB, ` +
                `slowest row: ${stats.maxRowKey} (${stats.maxRowMs.toFixed(1)}ms / ${(stats.maxRowBytes / (1024 * 1024)).toFixed(2)} MB), ` +
                `errors: ${stats.errorCount}`,
        );
    } else {
        Log.info(`[JsonParser] Nitro/Glaze parse: ${stats.totalMs.toFixed(1)}ms over ${stats.rowCount} rows, errors: ${stats.errorCount}`);
    }
}

// Install the hook the patched SQLiteProvider.js looks for. Must run BEFORE Onyx.init,
// since the hook is consumed on the very first getAll() call during hydration.
export default function installJsonParserBenchmark(): void {
    if (!__DEV__) {
        return;
    }
    globalThis.__benchmarkOnyxNativeParse = runNitroParseBenchmark;
}
