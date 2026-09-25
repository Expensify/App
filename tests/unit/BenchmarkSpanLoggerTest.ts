import {BENCHMARK_LOG_TAG, createBenchmarkSpanEndLogger, parseBenchmarkSpanNames} from '@libs/telemetry/logBenchmarkSpanEnd';

describe('benchmark span logging', () => {
    it('parses and deduplicates configured span names', () => {
        expect(parseBenchmarkSpanNames(' ManualAppStartup,ManualOpenReport,ManualAppStartup, ')).toEqual(['ManualAppStartup', 'ManualOpenReport']);
        expect(parseBenchmarkSpanNames(undefined)).toEqual([]);
    });

    it('writes a structured event only for enabled spans', () => {
        jest.spyOn(Date, 'now').mockReturnValue(1_234);
        const writeLog = jest.fn();
        const logSpanEnd = createBenchmarkSpanEndLogger(['ManualAppStartup'], writeLog);

        logSpanEnd('ManualOpenReport', 100);
        logSpanEnd('ManualAppStartup', 250);

        expect(writeLog).toHaveBeenCalledTimes(1);
        expect(writeLog).toHaveBeenCalledWith(`${BENCHMARK_LOG_TAG} ${JSON.stringify({event: 'span_end', span: 'ManualAppStartup', durationMs: 250, timestamp: 1_234})}`, 'ManualAppStartup');
    });
});
