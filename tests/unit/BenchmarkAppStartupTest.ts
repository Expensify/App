import {benchmarkStats, findBenchmarkDuration, parseBenchmarkLogEvents, percentile} from '@scripts/benchmarkAppStartup';

describe('benchmarkAppStartup', () => {
    it('parses structured benchmark logs among platform output', () => {
        const output = [
            'unrelated log',
            `'[EXPENSIFY_BENCHMARK] {"event":"span_end","span":"ManualOpenReport","durationMs":125,"timestamp":1000}'`,
            '[EXPENSIFY_BENCHMARK] {"event":"span_end","span":"ManualAppStartup","durationMs":500,"timestamp":2000}',
        ].join('\n');

        expect(parseBenchmarkLogEvents(output)).toHaveLength(2);
        expect(findBenchmarkDuration(output, 'ManualAppStartup')).toBe(500);
    });

    it('calculates interpolated percentiles and summary statistics', () => {
        expect(percentile([100, 200, 300, 400], 0.75)).toBe(325);
        expect(benchmarkStats([300, 100, 200])).toEqual({
            runs: 3,
            average: 200,
            p50: 200,
            p75: 250,
            p90: 280,
            p95: 290,
            p99: 298,
            min: 100,
            max: 300,
        });
    });
});
