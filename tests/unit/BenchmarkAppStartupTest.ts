import {benchmarkStartups, benchmarkStats, findBenchmarkDuration, iosBenchmarkMarkerPath, parseBenchmarkLogEvents, percentile} from '@scripts/benchmarkAppStartup';

import {mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

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

    it('creates an app-container-safe marker path for an iOS span', () => {
        expect(iosBenchmarkMarkerPath('Manual/App Startup')).toBe('Library/Caches/ExpensifyBenchmark/Manual%2FApp%20Startup.log');
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

    it('measures the configured span through a reusable adapter', async () => {
        const temporaryDirectory = mkdtempSync(join(tmpdir(), 'expensify-benchmark-test-'));
        const outputPath = join(temporaryDirectory, 'samples.csv');
        const prepareStartup = jest.fn(async () => undefined);
        const launchAndWait = jest.fn(async () => 123);
        const consoleTable = jest.spyOn(console, 'table').mockImplementation(() => undefined);

        try {
            const result = await benchmarkStartups(
                {name: 'android', appID: 'org.me.mobiexpensifyg', deviceIdentifier: 'emulator-5554', prepareStartup, launchAndWait},
                {
                    mode: 'process',
                    spanName: 'ManualAppStartupNetworkRequest',
                    runs: 1,
                    timeoutSeconds: 30,
                    outputPath,
                },
            );

            expect(launchAndWait).toHaveBeenNthCalledWith(1, 'ManualAppStartupNetworkRequest', 30);
            expect(launchAndWait).toHaveBeenNthCalledWith(2, 'ManualAppStartupNetworkRequest', 30);
            expect(result.samples).toEqual([123]);
            expect(readFileSync(outputPath, 'utf8')).toBe('run,duration_ms\n1,123\n');
            expect(consoleTable).toHaveBeenNthCalledWith(1, [
                {
                    platform: 'android',
                    device: 'emulator-5554',
                    appID: 'org.me.mobiexpensifyg',
                    span: 'ManualAppStartupNetworkRequest',
                    mode: 'process',
                    measuredRuns: 1,
                    warmUpRuns: 1,
                    timeoutSeconds: 30,
                    appPath: 'installed app',
                    outputPath,
                },
            ]);
        } finally {
            consoleTable.mockRestore();
            rmSync(temporaryDirectory, {recursive: true, force: true});
        }
    });
});
