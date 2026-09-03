import type {BenchmarkMetricResult, BenchmarkSample} from './benchmarkStatistics';
import type {BenchmarkLogEvent, NativeAppBenchmarkAdapter, PlatformName, StartupMode} from './nativeAppBenchmark';

import {benchmarkMetrics, benchmarkResultTable, benchmarkResultsOutputPath, writeBenchmarkResults, writeBenchmarkSamples} from './benchmarkStatistics';
import {createNativeAppBenchmarkAdapter} from './nativeAppBenchmark';

type BenchmarkRunOptions = {
    mode: StartupMode;
    spanNames: string[];
    runs: number;
    waitTimeSeconds: number;
    waitUntilSpan?: string;
};
type BenchmarkStartupsOptions = BenchmarkRunOptions & {
    outputPath: string;
    appPath?: string;
    resultsOutputPath?: string;
};
type BenchmarkAlternatingStartupsOptions = BenchmarkRunOptions & {
    appPathA?: string;
    appPathB?: string;
    outputPathA: string;
    outputPathB: string;
    resultsOutputPathA?: string;
    resultsOutputPathB?: string;
};
type BenchmarkAppStartupsOptions = BenchmarkStartupsOptions & {
    platform: PlatformName;
    rootDirectory: string;
    appID: string;
    deviceIdentifier?: string;
};
type BenchmarkAppStartupsAlternatingOptions = BenchmarkAlternatingStartupsOptions & {
    platform: PlatformName;
    rootDirectory: string;
    appIDA: string;
    appIDB: string;
    deviceIdentifier?: string;
};
type BenchmarkResult = {
    metrics: Record<string, BenchmarkMetricResult>;
    outputPath: string;
    resultsOutputPath: string;
};
type BenchmarkAlternatingResult = {
    binaryA: BenchmarkResult;
    binaryB: BenchmarkResult;
};
type BenchmarkRecorderOptions = {
    spanNames: string[];
    runs: number;
    outputPath: string;
    resultsOutputPath?: string;
};
type BenchmarkRecorder = {
    record: (events: BenchmarkLogEvent[], runNumber: number) => string[];
    complete: (label?: string) => BenchmarkResult;
};

async function benchmarkAppStartups(options: BenchmarkAppStartupsOptions): Promise<BenchmarkResult> {
    const adapter = createNativeAppBenchmarkAdapter(options);
    return benchmarkStartups(adapter, options);
}

async function benchmarkAppStartupsAlternating(options: BenchmarkAppStartupsAlternatingOptions): Promise<BenchmarkAlternatingResult> {
    const {appIDA, appIDB, ...adapterOptions} = options;
    const adapterA = createNativeAppBenchmarkAdapter({...adapterOptions, appID: appIDA});
    const adapterB = createNativeAppBenchmarkAdapter({...adapterOptions, appID: appIDB});
    return benchmarkAlternatingStartups({binaryA: adapterA, binaryB: adapterB}, options);
}

/** Runs one unmeasured warm-up followed by the requested number of measured startups. */
async function benchmarkStartups(adapter: NativeAppBenchmarkAdapter, options: BenchmarkStartupsOptions): Promise<BenchmarkResult> {
    const resultsOutputPath = options.resultsOutputPath ?? benchmarkResultsOutputPath(options.outputPath);
    console.log('=== Native app startup benchmark ===');
    console.table([
        {
            platform: adapter.name,
            device: adapter.deviceIdentifier,
            appID: adapter.appID,
            spans: options.spanNames.join(', '),
            mode: options.mode,
            measuredRuns: options.runs,
            warmUpRuns: 1,
            waitTimeSeconds: options.waitTimeSeconds,
            waitUntilSpan: options.waitUntilSpan ?? 'wait time',
            appPath: options.appPath ?? 'installed app',
            outputPath: options.outputPath,
            resultsOutputPath,
        },
    ]);
    console.log(`Running one unmeasured ${options.mode === 'cold' ? 'true-cold' : 'cold-process'} warm-up startup.`);
    await measureStartup(adapter, options);

    const recorder = createBenchmarkRecorder({...options, resultsOutputPath});
    for (let runNumber = 1; runNumber <= options.runs; runNumber += 1) {
        const events = await measureStartup(adapter, options);
        const runMetrics = recorder.record(events, runNumber);
        console.log(`Run ${runNumber}/${options.runs}: ${runMetrics.join(', ')}`);
    }

    return recorder.complete();
}

/** Warms both binaries once, then alternates A and B measurements to reduce time-dependent comparison bias. */
async function benchmarkAlternatingStartups(
    adapters: {binaryA: NativeAppBenchmarkAdapter; binaryB: NativeAppBenchmarkAdapter},
    options: BenchmarkAlternatingStartupsOptions,
): Promise<BenchmarkAlternatingResult> {
    const {binaryA: adapterA, binaryB: adapterB} = adapters;
    if (options.mode === 'cold' && (!options.appPathA || !options.appPathB)) {
        throw new Error('Cold comparison mode requires app paths for both binaries.');
    }
    const resultsOutputPathA = options.resultsOutputPathA ?? benchmarkResultsOutputPath(options.outputPathA);
    const resultsOutputPathB = options.resultsOutputPathB ?? benchmarkResultsOutputPath(options.outputPathB);
    console.log('=== Native app startup comparison ===');
    console.table([
        {
            platform: adapterA.name,
            device: adapterA.deviceIdentifier,
            appIDA: adapterA.appID,
            appIDB: adapterB.appID,
            spans: options.spanNames.join(', '),
            mode: options.mode,
            measuredRunsPerBinary: options.runs,
            warmUpRunsPerBinary: 1,
            waitTimeSeconds: options.waitTimeSeconds,
            waitUntilSpan: options.waitUntilSpan ?? 'wait time',
            binaryA: options.appPathA ?? 'installed app',
            outputA: options.outputPathA,
            resultsOutputA: resultsOutputPathA,
            binaryB: options.appPathB ?? 'installed app',
            outputB: options.outputPathB,
            resultsOutputB: resultsOutputPathB,
        },
    ]);

    const measurementOptions = {
        mode: options.mode,
        spanNames: options.spanNames,
        waitTimeSeconds: options.waitTimeSeconds,
        waitUntilSpan: options.waitUntilSpan,
        installArtifact: options.mode === 'cold',
    } as const;
    console.log(`Running one unmeasured warm-up startup for binary A (${options.appPathA ?? 'installed app'}).`);
    await measureStartup(adapterA, {...measurementOptions, appPath: options.appPathA});
    console.log(`Running one unmeasured warm-up startup for binary B (${options.appPathB ?? 'installed app'}).`);
    await measureStartup(adapterB, {...measurementOptions, appPath: options.appPathB});

    const recorderA = createBenchmarkRecorder({spanNames: options.spanNames, runs: options.runs, outputPath: options.outputPathA, resultsOutputPath: resultsOutputPathA});
    const recorderB = createBenchmarkRecorder({spanNames: options.spanNames, runs: options.runs, outputPath: options.outputPathB, resultsOutputPath: resultsOutputPathB});
    for (let runNumber = 1; runNumber <= options.runs; runNumber += 1) {
        const eventsA = await measureStartup(adapterA, {...measurementOptions, appPath: options.appPathA});
        const runMetricsA = recorderA.record(eventsA, runNumber);
        console.log(`Binary A run ${runNumber}/${options.runs}: ${runMetricsA.join(', ')}`);

        const eventsB = await measureStartup(adapterB, {...measurementOptions, appPath: options.appPathB});
        const runMetricsB = recorderB.record(eventsB, runNumber);
        console.log(`Binary B run ${runNumber}/${options.runs}: ${runMetricsB.join(', ')}`);
    }

    const resultA = recorderA.complete('Binary A metrics');
    const resultB = recorderB.complete('Binary B metrics');
    return {binaryA: resultA, binaryB: resultB};
}

/** Accumulates measured runs and writes both raw samples and summary statistics when recording completes. */
function createBenchmarkRecorder(options: BenchmarkRecorderOptions): BenchmarkRecorder {
    const samples: BenchmarkSample[] = [];
    const resultsOutputPath = options.resultsOutputPath ?? benchmarkResultsOutputPath(options.outputPath);

    return {
        record(events: BenchmarkLogEvent[], runNumber: number): string[] {
            return recordBenchmarkEvents(events, options.spanNames, samples, runNumber);
        },
        complete(label?: string): BenchmarkResult {
            const metrics = benchmarkMetrics(samples, options.spanNames);
            const table = benchmarkResultTable(metrics);
            writeBenchmarkSamples(options.outputPath, samples);
            writeBenchmarkResults(resultsOutputPath, table);
            if (label) {
                console.log(label);
            }
            console.table(table);
            for (const {span, runs} of table) {
                if (runs >= options.runs) {
                    continue;
                }
                console.warn(
                    `WARNING: ${label ? `${label}: ` : ''}${span}: ${runs}/${options.runs} samples collected; ${options.runs - runs} missing. Statistics exclude missing samples and may be biased. Use a longer --wait-time without --wait-until-span to collect later spans.`,
                );
            }
            console.log(`Recorded benchmark samples in ${options.outputPath}`);
            console.log(`Recorded benchmark results in ${resultsOutputPath}`);
            return {metrics, outputPath: options.outputPath, resultsOutputPath};
        },
    };
}

/** Prepares one startup, optionally installs its artifact, then collects the configured span events from the launched process. */
async function measureStartup(
    adapter: NativeAppBenchmarkAdapter,
    options: Omit<BenchmarkStartupsOptions, 'runs' | 'outputPath'> & {installArtifact?: boolean},
): Promise<BenchmarkLogEvent[]> {
    if (options.installArtifact) {
        await adapter.prepareStartup(options.mode, options.appPath, true);
    } else {
        await adapter.prepareStartup(options.mode, options.appPath);
    }
    return adapter.launchAndCollect({spanNames: options.spanNames, waitTimeSeconds: options.waitTimeSeconds, waitUntilSpan: options.waitUntilSpan});
}

/** Appends observed spans to the raw samples while reporting requested spans that did not finish during the run. */
function recordBenchmarkEvents(events: BenchmarkLogEvent[], spanNames: string[], samples: BenchmarkSample[], runNumber: number): string[] {
    const eventsBySpan = new Map(events.map((event) => [event.span, event]));
    return spanNames.map((spanName) => {
        const event = eventsBySpan.get(spanName);
        if (!event) {
            return `${spanName}=not observed`;
        }
        samples.push({run: runNumber, span: spanName, durationMs: event.durationMs});
        return `${spanName}=${event.durationMs}ms`;
    });
}

export {benchmarkAppStartupsAlternating, benchmarkAlternatingStartups, benchmarkAppStartups, benchmarkStartups, createBenchmarkRecorder};
export type {
    BenchmarkAlternatingResult,
    BenchmarkAlternatingStartupsOptions,
    BenchmarkAppStartupsAlternatingOptions,
    BenchmarkAppStartupsOptions,
    BenchmarkRecorder,
    BenchmarkRecorderOptions,
    BenchmarkResult,
    BenchmarkStartupsOptions,
};
