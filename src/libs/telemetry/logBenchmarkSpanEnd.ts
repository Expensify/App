const BENCHMARK_LOG_TAG = '[EXPENSIFY_BENCHMARK]';
const configuredSpanNames: unknown = process.env.EXPO_PUBLIC_BENCHMARK_SENTRY_SPANS;

type BenchmarkSpanEnd = {
    event: 'span_end';
    span: string;
    durationMs: number;
    timestamp: number;
};

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

function createBenchmarkSpanEndLogger(spanNames: string[], writeLog: (message: string) => void): (spanName: string, durationMs: number) => void {
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
        writeLog(`${BENCHMARK_LOG_TAG} ${JSON.stringify(event)}`);
    };
}

const logBenchmarkSpanEnd = createBenchmarkSpanEndLogger(parseBenchmarkSpanNames(configuredSpanNames), (message) => {
    // Production builds strip console.info/debug/log. Warnings are retained and are not forwarded by the app's Sentry console integration.
    // eslint-disable-next-line no-console
    console.warn(message);
});

export {BENCHMARK_LOG_TAG, createBenchmarkSpanEndLogger, parseBenchmarkSpanNames};
export default logBenchmarkSpanEnd;
