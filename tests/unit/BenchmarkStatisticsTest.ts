import {benchmarkStats, percentile} from '@scripts/lib/benchmarkStatistics';

describe('benchmarkStatistics', () => {
    it('calculates interpolated percentiles and summary statistics without changing the samples', () => {
        const samples = [300, 100, 200];

        expect(percentile([400, 100, 300, 200], 0.75)).toBe(325);
        expect(benchmarkStats(samples)).toEqual({
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
        expect(samples).toEqual([300, 100, 200]);
    });

    it('rejects empty samples and percentile fractions outside the inclusive unit interval', () => {
        expect(() => benchmarkStats([])).toThrow('No benchmark samples were recorded.');
        expect(() => percentile([], 0.5)).toThrow('Cannot calculate a percentile without benchmark samples.');
        expect(() => percentile([100], -0.1)).toThrow('Percentile fraction must be between 0 and 1.');
        expect(() => percentile([100], 1.1)).toThrow('Percentile fraction must be between 0 and 1.');
    });
});
