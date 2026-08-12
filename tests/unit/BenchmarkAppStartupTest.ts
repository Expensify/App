import {
    benchmarkAlternatingStartups,
    benchmarkStartups,
    benchmarkStats,
    assertAndroidAppInstalled,
    findBenchmarkDuration,
    iosBenchmarkMarkerPath,
    latestBenchmarkEvents,
    parseAndroidProcessIdentifier,
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

    it('validates Android installation and process output', () => {
        expect(() => assertAndroidAppInstalled('', 'com.example.app')).toThrow('is not installed');
        expect(() => assertAndroidAppInstalled('package:/data/app/example/base.apk', 'com.example.app')).not.toThrow();
        expect(parseAndroidProcessIdentifier('1234 5678\n', 'com.example.app')).toBe('1234');
        expect(() => parseAndroidProcessIdentifier('', 'com.example.app')).toThrow('Unable to find the running Android process');
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

    it('alternates installed apps and writes independent multi-span results without reinstalling', async () => {
        const temporaryDirectory = mkdtempSync(join(tmpdir(), 'expensify-benchmark-comparison-test-'));
        const outputPathA = join(temporaryDirectory, 'binary-a.csv');
        const outputPathB = join(temporaryDirectory, 'binary-b.csv');
        const prepareStartupA = jest.fn(async () => undefined);
        const prepareStartupB = jest.fn(async () => undefined);
        const launchAndCollect = jest
            .fn()
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([
                {event: 'span_end', span: 'ManualAppStartup', durationMs: 101, timestamp: 1},
                {event: 'span_end', span: 'ManualAppStartupNetworkRequest', durationMs: 11, timestamp: 2},
            ])
            .mockResolvedValueOnce([
                {event: 'span_end', span: 'ManualAppStartup', durationMs: 201, timestamp: 3},
                {event: 'span_end', span: 'ManualAppStartupNetworkRequest', durationMs: 21, timestamp: 4},
            ])
            .mockResolvedValueOnce([
                {event: 'span_end', span: 'ManualAppStartup', durationMs: 102, timestamp: 5},
                {event: 'span_end', span: 'ManualAppStartupNetworkRequest', durationMs: 12, timestamp: 6},
            ])
            .mockResolvedValueOnce([
                {event: 'span_end', span: 'ManualAppStartup', durationMs: 202, timestamp: 7},
                {event: 'span_end', span: 'ManualAppStartupNetworkRequest', durationMs: 22, timestamp: 8},
            ]);
        const consoleTable = jest.spyOn(console, 'table').mockImplementation(() => undefined);

        try {
            const result = await benchmarkAlternatingStartups(
                {
                    binaryA: {name: 'android', appID: 'com.example.app.a', deviceIdentifier: 'emulator-5554', prepareStartup: prepareStartupA, launchAndCollect},
                    binaryB: {name: 'android', appID: 'com.example.app.b', deviceIdentifier: 'emulator-5554', prepareStartup: prepareStartupB, launchAndCollect},
                },
                {
                    mode: 'process',
                    spanNames: ['ManualAppStartup', 'ManualAppStartupNetworkRequest'],
                    runs: 2,
                    waitTimeSeconds: 30,
                    waitUntilSpan: 'ManualAppStartup',
                    outputPathA,
                    outputPathB,
                },
            );

            expect(prepareStartupA).toHaveBeenCalledTimes(3);
            expect(prepareStartupA).toHaveBeenNthCalledWith(1, 'process', undefined);
            expect(prepareStartupB).toHaveBeenCalledTimes(3);
            expect(prepareStartupB).toHaveBeenNthCalledWith(1, 'process', undefined);
            const collectionOptions = {
                spanNames: ['ManualAppStartup', 'ManualAppStartupNetworkRequest'],
                waitTimeSeconds: 30,
                waitUntilSpan: 'ManualAppStartup',
            };
            expect(launchAndCollect).toHaveBeenNthCalledWith(1, collectionOptions);
            expect(launchAndCollect).toHaveBeenNthCalledWith(6, collectionOptions);
            expect(result.binaryA.metrics.ManualAppStartup?.samples).toEqual([101, 102]);
            expect(result.binaryB.metrics.ManualAppStartup?.samples).toEqual([201, 202]);
            expect(result.binaryA.metrics.ManualAppStartupNetworkRequest?.samples).toEqual([11, 12]);
            expect(result.binaryB.metrics.ManualAppStartupNetworkRequest?.samples).toEqual([21, 22]);
            expect(readFileSync(outputPathA, 'utf8')).toBe(
                'run,span,duration_ms\n1,ManualAppStartup,101\n1,ManualAppStartupNetworkRequest,11\n2,ManualAppStartup,102\n2,ManualAppStartupNetworkRequest,12\n',
            );
            expect(readFileSync(outputPathB, 'utf8')).toBe(
                'run,span,duration_ms\n1,ManualAppStartup,201\n1,ManualAppStartupNetworkRequest,21\n2,ManualAppStartup,202\n2,ManualAppStartupNetworkRequest,22\n',
            );
            expect(consoleTable).toHaveBeenCalledTimes(3);
        } finally {
            consoleTable.mockRestore();
            rmSync(temporaryDirectory, {recursive: true, force: true});
        }
    });

    it('passes comparison artifacts to both apps only for cold starts', async () => {
        const temporaryDirectory = mkdtempSync(join(tmpdir(), 'expensify-benchmark-cold-comparison-test-'));
        const prepareStartupA = jest.fn(async () => undefined);
        const prepareStartupB = jest.fn(async () => undefined);
        const launchAndCollect = jest.fn(async () => []);
        const consoleTable = jest.spyOn(console, 'table').mockImplementation(() => undefined);

        try {
            await benchmarkAlternatingStartups(
                {
                    binaryA: {name: 'android', appID: 'com.example.app.a', deviceIdentifier: 'emulator-5554', prepareStartup: prepareStartupA, launchAndCollect},
                    binaryB: {name: 'android', appID: 'com.example.app.b', deviceIdentifier: 'emulator-5554', prepareStartup: prepareStartupB, launchAndCollect},
                },
                {
                    mode: 'cold',
                    spanNames: ['ManualAppStartup'],
                    runs: 1,
                    waitTimeSeconds: 30,
                    appPathA: '/tmp/binary-a.apk',
                    appPathB: '/tmp/binary-b.apk',
                    outputPathA: join(temporaryDirectory, 'binary-a.csv'),
                    outputPathB: join(temporaryDirectory, 'binary-b.csv'),
                },
            );

            expect(prepareStartupA).toHaveBeenCalledWith('cold', '/tmp/binary-a.apk', true);
            expect(prepareStartupB).toHaveBeenCalledWith('cold', '/tmp/binary-b.apk', true);
            expect(prepareStartupA).toHaveBeenCalledTimes(2);
            expect(prepareStartupB).toHaveBeenCalledTimes(2);
        } finally {
            consoleTable.mockRestore();
            rmSync(temporaryDirectory, {recursive: true, force: true});
        }
    });
});
