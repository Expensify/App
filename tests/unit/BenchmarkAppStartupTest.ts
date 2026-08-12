import {
    benchmarkStartups,
    benchmarkStats,
    findBenchmarkDuration,
    iosBenchmarkMarkerPath,
    latestBenchmarkEvents,
    parseIosInstalledAppURL,
    parseBenchmarkLogEvents,
    parseIosLaunchProcessIdentifier,
    parseIosRunningAppProcessIdentifier,
    parseSpanNames,
    percentile,
    selectBenchmarkSpanNames,
} from '@scripts/benchmarkAppStartup';

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

    it('keeps the latest event for each requested span in metric order', () => {
        expect(
            latestBenchmarkEvents(
                [
                    {event: 'span_end', span: 'Second', durationMs: 200, timestamp: 2},
                    {event: 'span_end', span: 'First', durationMs: 100, timestamp: 1},
                    {event: 'span_end', span: 'First', durationMs: 150, timestamp: 3},
                ],
                ['First', 'Missing', 'Second'],
            ),
        ).toEqual([
            {event: 'span_end', span: 'First', durationMs: 150, timestamp: 3},
            {event: 'span_end', span: 'Second', durationMs: 200, timestamp: 2},
        ]);
    });

    it('reads the launched iOS process identifier from CoreDevice output', () => {
        expect(parseIosLaunchProcessIdentifier({result: {process: {processIdentifier: 1234}}})).toBe(1234);
        expect(() => parseIosLaunchProcessIdentifier({result: {process: {}}})).toThrow('CoreDevice did not return a valid app process identifier.');
    });

    it('finds an already-running iOS app process from CoreDevice output', () => {
        const appID = 'com.example.app';
        const appURL = parseIosInstalledAppURL({result: {apps: [{bundleIdentifier: appID, url: 'file:///containers/Example.app'}]}}, appID);
        const processIdentifier = parseIosRunningAppProcessIdentifier(
            {
                result: {
                    runningProcesses: [
                        {executable: `${appURL}PlugIns/Notification.appex/Notification`, processIdentifier: 123},
                        {executable: `${appURL}Example`, processIdentifier: 456},
                    ],
                },
            },
            appURL,
        );

        expect(appURL).toBe('file:///containers/Example.app/');
        expect(processIdentifier).toBe(456);
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

    it('selects all configured spans unless --span narrows the benchmark', () => {
        const configuredSpanNames = parseSpanNames('ManualAppStartup, ManualAppStartupNetworkRequest,ManualAppStartup');

        expect(configuredSpanNames).toEqual(['ManualAppStartup', 'ManualAppStartupNetworkRequest']);
        expect(selectBenchmarkSpanNames(configuredSpanNames)).toEqual(configuredSpanNames);
        expect(selectBenchmarkSpanNames(configuredSpanNames, 'ManualAppStartupNetworkRequest')).toEqual(['ManualAppStartupNetworkRequest']);
        expect(() => selectBenchmarkSpanNames(configuredSpanNames, 'MissingSpan')).toThrow('is not included in EXPO_PUBLIC_BENCHMARK_SENTRY_SPANS');
    });

    it('measures each configured span through a reusable adapter', async () => {
        const temporaryDirectory = mkdtempSync(join(tmpdir(), 'expensify-benchmark-test-'));
        const outputPath = join(temporaryDirectory, 'samples.csv');
        const prepareStartup = jest.fn(async () => undefined);
        const launchAndCollect = jest
            .fn()
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([
                {event: 'span_end', span: 'ManualAppStartup', durationMs: 456, timestamp: 1000},
                {event: 'span_end', span: 'ManualAppStartupNetworkRequest', durationMs: 123, timestamp: 900},
            ]);
        const consoleTable = jest.spyOn(console, 'table').mockImplementation(() => undefined);

        try {
            const result = await benchmarkStartups(
                {name: 'android', appID: 'org.me.mobiexpensifyg', deviceIdentifier: 'emulator-5554', prepareStartup, launchAndCollect},
                {
                    mode: 'process',
                    spanNames: ['ManualAppStartup', 'ManualAppStartupNetworkRequest'],
                    runs: 1,
                    waitTimeSeconds: 30,
                    waitUntilSpan: 'ManualAppStartup',
                    outputPath,
                },
            );

            const collectionOptions = {
                spanNames: ['ManualAppStartup', 'ManualAppStartupNetworkRequest'],
                waitTimeSeconds: 30,
                waitUntilSpan: 'ManualAppStartup',
            };
            expect(launchAndCollect).toHaveBeenNthCalledWith(1, collectionOptions);
            expect(launchAndCollect).toHaveBeenNthCalledWith(2, collectionOptions);
            expect(result.metrics.ManualAppStartup?.samples).toEqual([456]);
            expect(result.metrics.ManualAppStartupNetworkRequest?.samples).toEqual([123]);
            expect(readFileSync(outputPath, 'utf8')).toBe('run,span,duration_ms\n1,ManualAppStartup,456\n1,ManualAppStartupNetworkRequest,123\n');
            expect(consoleTable).toHaveBeenNthCalledWith(1, [
                {
                    platform: 'android',
                    device: 'emulator-5554',
                    appID: 'org.me.mobiexpensifyg',
                    spans: 'ManualAppStartup, ManualAppStartupNetworkRequest',
                    mode: 'process',
                    measuredRuns: 1,
                    warmUpRuns: 1,
                    waitTimeSeconds: 30,
                    waitUntilSpan: 'ManualAppStartup',
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
