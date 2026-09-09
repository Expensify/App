import {describe, expect, it} from 'bun:test';

import {benchmarkResultsOutputPath, benchmarkStats, exportBenchmarkResults, percentile, readBenchmarkSamples, writeBenchmarkSamples} from '@scripts/lib/benchmarkStatistics';

import {file, write} from 'bun';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

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

    it('derives a results table path from the raw sample path', () => {
        expect(benchmarkResultsOutputPath('/tmp/startup.csv')).toBe('/tmp/startup-results.csv');
        expect(benchmarkResultsOutputPath('/tmp/startup')).toBe('/tmp/startup-results.csv');
    });

    it('reads raw sample files and writes their combined statistics as a results CSV', async () => {
        const temporaryDirectory = mkdtempSync(join(tmpdir(), 'expensify-benchmark-statistics-test-'));
        const inputPathA = join(temporaryDirectory, 'samples-a.csv');
        const inputPathB = join(temporaryDirectory, 'samples-b.csv');
        const outputPath = join(temporaryDirectory, 'results.csv');

        try {
            await writeBenchmarkSamples(inputPathA, [
                {run: 1, span: 'ManualAppStartup', durationMs: 100},
                {run: 1, span: 'ManualAppStartupNetworkRequest', durationMs: 20},
            ]);
            await writeBenchmarkSamples(inputPathB, [{run: 1, span: 'ManualAppStartup', durationMs: 300}]);

            await expect(readBenchmarkSamples(inputPathA)).resolves.toEqual([
                {run: 1, span: 'ManualAppStartup', durationMs: 100},
                {run: 1, span: 'ManualAppStartupNetworkRequest', durationMs: 20},
            ]);
            await expect(exportBenchmarkResults({inputPaths: [inputPathA, inputPathB], outputPath})).resolves.toEqual([
                {
                    span: 'ManualAppStartup',
                    runs: 2,
                    average: '200.00',
                    p50: '200.00',
                    p75: '250.00',
                    p90: '280.00',
                    p95: '290.00',
                    p99: '298.00',
                    min: '100.00',
                    max: '300.00',
                },
                {
                    span: 'ManualAppStartupNetworkRequest',
                    runs: 1,
                    average: '20.00',
                    p50: '20.00',
                    p75: '20.00',
                    p90: '20.00',
                    p95: '20.00',
                    p99: '20.00',
                    min: '20.00',
                    max: '20.00',
                },
            ]);
            expect(await file(outputPath).text()).toBe(
                'span,runs,average,p50,p75,p90,p95,p99,min,max\nManualAppStartup,2,200.00,200.00,250.00,280.00,290.00,298.00,100.00,300.00\nManualAppStartupNetworkRequest,1,20.00,20.00,20.00,20.00,20.00,20.00,20.00,20.00\n',
            );
        } finally {
            rmSync(temporaryDirectory, {recursive: true, force: true});
        }
    });

    it('rejects invalid or empty raw sample inputs', async () => {
        const temporaryDirectory = mkdtempSync(join(tmpdir(), 'expensify-benchmark-statistics-invalid-test-'));
        const invalidPath = join(temporaryDirectory, 'invalid.csv');
        const emptyPath = join(temporaryDirectory, 'empty.csv');

        try {
            await write(invalidPath, 'span,duration_ms\nManualAppStartup,100\n');
            await writeBenchmarkSamples(emptyPath, []);

            await expect(readBenchmarkSamples(invalidPath)).rejects.toThrow('Invalid benchmark sample header');
            await expect(exportBenchmarkResults({inputPaths: [], outputPath: join(temporaryDirectory, 'results.csv')})).rejects.toThrow('At least one benchmark sample file is required.');
            await expect(exportBenchmarkResults({inputPaths: [emptyPath], outputPath: join(temporaryDirectory, 'results.csv')})).rejects.toThrow(
                'No benchmark samples were found in the input files.',
            );
        } finally {
            rmSync(temporaryDirectory, {recursive: true, force: true});
        }
    });
});
