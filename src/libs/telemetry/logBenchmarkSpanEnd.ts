import writeBenchmarkLog from './writeBenchmarkLog';

const BENCHMARK_LOG_TAG = '[EXPENSIFY_BENCHMARK]';
const configuredSpanNames: unknown = process.env.EXPO_PUBLIC_BENCHMARK_SENTRY_SPANS;

type BenchmarkSpanEnd = {
    event: 'span_end';
    span: string;
    durationMs: number;
    timestamp: number;
};

/** Parses the build-time span allowlist, trimming entries and removing duplicates. */
function parseBenchmarkSpanNames(value: unknown): string[] {
    if (typeof value !== 'string') {
        return [];
    }

    return [
        ...new Set(
            value
                .split(',')
                .map((spanName) => spanName.trim())
                .filter(Boolean),
        ),
    ];
}

/** Creates a logger that serializes completed spans only when their names are present in the benchmark allowlist. */
function createBenchmarkSpanEndLogger(spanNames: string[], writeLog: (message: string, spanName: string) => void): (spanName: string, durationMs: number) => void {
    const enabledSpanNames = new Set(spanNames);

    return (spanName, durationMs) => {
        if (!enabledSpanNames.has(spanName)) {
            return;
        }

        const event: BenchmarkSpanEnd = {
            event: 'span_end',
            span: spanName,
            durationMs,
            timestamp: Date.now(),
        };
        writeLog(`${BENCHMARK_LOG_TAG} ${JSON.stringify(event)}`, spanName);
    };
}

const enabledBenchmarkSpanNames = new Set(parseBenchmarkSpanNames(configuredSpanNames));
const logBenchmarkSpanEnd = createBenchmarkSpanEndLogger([...enabledBenchmarkSpanNames], writeBenchmarkLog);

function isBenchmarkSpanEnabled(spanName: string): boolean {
    return enabledBenchmarkSpanNames.has(spanName);
}

export {BENCHMARK_LOG_TAG, createBenchmarkSpanEndLogger, isBenchmarkSpanEnabled, parseBenchmarkSpanNames};
export default logBenchmarkSpanEnd;
