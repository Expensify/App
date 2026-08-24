#!/usr/bin/env bun

import CLI from 'expensify-common/CLI';
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, extname, join, resolve} from 'node:path';
import process from 'node:process';

import type {BenchmarkStats} from './lib/benchmarkStatistics';
import type {BenchmarkLogEvent, NativeAppBenchmarkAdapter, PlatformName, StartupMode} from './lib/nativeAppBenchmark';

import {benchmarkStats} from './lib/benchmarkStatistics';
import {PLATFORM_NAMES, createNativeAppBenchmarkAdapter} from './lib/nativeAppBenchmark';

const DEFAULT_RUNS = 20;
const DEFAULT_WAIT_TIME_SECONDS = 30;
const BENCHMARK_SPANS_ENVIRONMENT_VARIABLE = 'EXPO_PUBLIC_BENCHMARK_SENTRY_SPANS';

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
type BenchmarkMetricResult = {
    samples: number[];
    stats?: BenchmarkStats;
};
type BenchmarkResultTableRow = {
    span: string;
    runs: number;
    average: string;
    p50: string;
    p75: string;
    p90: string;
    p95: string;
    p99: string;
    min: string;
    max: string;
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
    outputPath: string;
    resultsOutputPath?: string;
};
type BenchmarkRecorder = {
    record: (events: BenchmarkLogEvent[], runNumber: number) => string[];
    complete: (label?: string) => BenchmarkResult;
};

const scriptPath = process.argv.at(1);
const isDirectRun = scriptPath?.endsWith('benchmarkAppStartup.ts') ?? false;
const rootDirectory = scriptPath && isDirectRun ? resolve(dirname(resolve(scriptPath)), '..') : process.cwd();

function fail(message: string): never {
    throw new Error(message);
}

function parseChoice<T extends string>(value: string, choices: readonly T[], label: string): T {
    const choice = choices.find((candidate) => candidate === value);
    if (!choice) {
        fail(`${label} must be one of: ${choices.join(', ')}. Received: ${value}`);
    }
    return choice;
}

function parsePositiveInteger(value: string, label: string): number {
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed) || parsed <= 0) {
        fail(`${label} must be a positive integer. Received: ${value}`);
    }
    return parsed;
}

function parsePositiveNumber(value: string, label: string): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        fail(`${label} must be a positive number. Received: ${value}`);
    }
    return parsed;
}

function environmentString(name: string): string | undefined {
    const value: unknown = process.env[name];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function parseSpanNames(value: string | undefined): string[] {
    if (!value) {
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

function selectBenchmarkSpanNames(configuredSpanNames: string[], selectedSpanName?: string): string[] {
    if (selectedSpanName && !configuredSpanNames.includes(selectedSpanName)) {
        fail(`--span ${selectedSpanName} is not included in ${BENCHMARK_SPANS_ENVIRONMENT_VARIABLE}.`);
    }
    const spanNames = selectedSpanName ? [selectedSpanName] : configuredSpanNames;
    if (spanNames.length === 0) {
        fail(`Define at least one span in ${BENCHMARK_SPANS_ENVIRONMENT_VARIABLE} before running the benchmark.`);
    }
    return spanNames;
}

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

function recordBenchmarkEvents(events: BenchmarkLogEvent[], spanNames: string[], samplesBySpan: Map<string, number[]>, csvRows: string[], runNumber: number): string[] {
    const eventsBySpan = new Map(events.map((event) => [event.span, event]));
    return spanNames.map((spanName) => {
        const event = eventsBySpan.get(spanName);
        if (!event) {
            return `${spanName}=not observed`;
        }
        samplesBySpan.get(spanName)?.push(event.durationMs);
        csvRows.push(`${runNumber},${spanName},${event.durationMs}`);
        return `${spanName}=${event.durationMs}ms`;
    });
}

function createBenchmarkMetrics(spanNames: string[], samplesBySpan: Map<string, number[]>): Record<string, BenchmarkMetricResult> {
    return Object.fromEntries(
        spanNames.map((spanName) => {
            const samples = samplesBySpan.get(spanName) ?? [];
            return [spanName, {samples, stats: samples.length > 0 ? benchmarkStats(samples) : undefined}];
        }),
    );
}

function benchmarkMetricTable(metrics: Record<string, BenchmarkMetricResult>): BenchmarkResultTableRow[] {
    return Object.entries(metrics).map(([span, metric]) => ({
        span,
        runs: metric.samples.length,
        average: metric.stats?.average.toFixed(2) ?? 'N/A',
        p50: metric.stats?.p50.toFixed(2) ?? 'N/A',
        p75: metric.stats?.p75.toFixed(2) ?? 'N/A',
        p90: metric.stats?.p90.toFixed(2) ?? 'N/A',
        p95: metric.stats?.p95.toFixed(2) ?? 'N/A',
        p99: metric.stats?.p99.toFixed(2) ?? 'N/A',
        min: metric.stats?.min.toFixed(2) ?? 'N/A',
        max: metric.stats?.max.toFixed(2) ?? 'N/A',
    }));
}

function benchmarkResultsOutputPath(outputPath: string): string {
    const extension = extname(outputPath);
    const outputPathWithoutExtension = extension ? outputPath.slice(0, -extension.length) : outputPath;
    return `${outputPathWithoutExtension}-results.csv`;
}

function benchmarkMetricTableCsv(table: BenchmarkResultTableRow[]): string[] {
    return [
        'span,runs,average,p50,p75,p90,p95,p99,min,max',
        ...table.map((row) => [row.span, row.runs, row.average, row.p50, row.p75, row.p90, row.p95, row.p99, row.min, row.max].join(',')),
    ];
}

function writeBenchmarkOutput(outputPath: string, csvRows: string[]): void {
    mkdirSync(dirname(outputPath), {recursive: true});
    writeFileSync(outputPath, [...csvRows, ''].join('\n'));
}

function createBenchmarkRecorder(options: BenchmarkRecorderOptions): BenchmarkRecorder {
    const samplesBySpan = new Map(options.spanNames.map((spanName) => [spanName, [] as number[]]));
    const sampleCsvRows = ['run,span,duration_ms'];
    const resultsOutputPath = options.resultsOutputPath ?? benchmarkResultsOutputPath(options.outputPath);

    return {
        record(events: BenchmarkLogEvent[], runNumber: number): string[] {
            return recordBenchmarkEvents(events, options.spanNames, samplesBySpan, sampleCsvRows, runNumber);
        },
        complete(label?: string): BenchmarkResult {
            const metrics = createBenchmarkMetrics(options.spanNames, samplesBySpan);
            const table = benchmarkMetricTable(metrics);
            writeBenchmarkOutput(options.outputPath, sampleCsvRows);
            writeBenchmarkOutput(resultsOutputPath, benchmarkMetricTableCsv(table));
            if (label) {
                console.log(label);
            }
            console.table(table);
            console.log(`Recorded benchmark samples in ${options.outputPath}`);
            console.log(`Recorded benchmark results in ${resultsOutputPath}`);
            return {metrics, outputPath: options.outputPath, resultsOutputPath};
        },
    };
}

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

async function benchmarkAlternatingStartups(
    adapters: {binaryA: NativeAppBenchmarkAdapter; binaryB: NativeAppBenchmarkAdapter},
    options: BenchmarkAlternatingStartupsOptions,
): Promise<BenchmarkAlternatingResult> {
    const {binaryA: adapterA, binaryB: adapterB} = adapters;
    if (options.mode === 'cold' && (!options.appPathA || !options.appPathB)) {
        fail('Cold comparison mode requires app paths for both binaries.');
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

    const recorderA = createBenchmarkRecorder({spanNames: options.spanNames, outputPath: options.outputPathA, resultsOutputPath: resultsOutputPathA});
    const recorderB = createBenchmarkRecorder({spanNames: options.spanNames, outputPath: options.outputPathB, resultsOutputPath: resultsOutputPathB});
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

async function main(): Promise<void> {
    /* eslint-disable @typescript-eslint/naming-convention */
    const cli = new CLI({
        positionalArgs: [
            {
                name: 'platform',
                description: `Native platform to benchmark (${PLATFORM_NAMES.join(', ')})`,
                parse: (value): PlatformName => parseChoice(value, PLATFORM_NAMES, 'Platform'),
            },
            {
                name: 'runs',
                description: 'Number of measured startup runs',
                default: DEFAULT_RUNS,
                parse: (value) => parsePositiveInteger(value, 'Run count'),
            },
        ],
        namedArgs: {
            span: {
                description: 'Only measure this whitelisted Sentry span',
                required: false,
            },
            'wait-until-span': {
                description: 'Stop each run as soon as this whitelisted Sentry span ends',
                required: false,
            },
            'wait-time': {
                description: 'Maximum seconds to collect spans for each startup',
                default: DEFAULT_WAIT_TIME_SECONDS,
                parse: (value) => parsePositiveNumber(value, 'Wait time'),
            },
            device: {
                description: 'adb serial on Android, or CoreDevice identifier, UDID, serial number, or name on iOS',
                required: false,
            },
            'app-id': {
                description: 'Application ID or bundle identifier',
                required: false,
            },
            'app-id-a': {
                description: 'Application ID or bundle identifier for the first comparison app',
                required: false,
            },
            'app-id-b': {
                description: 'Application ID or bundle identifier for the second comparison app',
                required: false,
            },
            'app-path': {
                description: 'Path to the app artifact; required with --cold on iOS',
                required: false,
            },
            'app-path-a': {
                description: 'Path to the first benchmark artifact; required with --cold comparison mode',
                required: false,
            },
            'app-path-b': {
                description: 'Path to the second benchmark artifact; required with --cold comparison mode',
                required: false,
            },
            output: {
                description: 'Raw sample CSV output path',
                required: false,
            },
            'output-a': {
                description: 'Raw sample CSV output path for the first comparison artifact',
                required: false,
            },
            'output-b': {
                description: 'Raw sample CSV output path for the second comparison artifact',
                required: false,
            },
            'results-output': {
                description: 'Summary statistics CSV output path',
                required: false,
            },
            'results-output-a': {
                description: 'Summary statistics CSV output path for the first comparison artifact',
                required: false,
            },
            'results-output-b': {
                description: 'Summary statistics CSV output path for the second comparison artifact',
                required: false,
            },
        },
        flags: {
            cold: {
                description: 'Run true-cold starts by clearing app data; default only terminates and relaunches the process',
            },
        },
    });
    /* eslint-enable @typescript-eslint/naming-convention */

    const platform = parseChoice(String(cli.positionalArgs.platform), PLATFORM_NAMES, 'Platform');
    const configuredSpanNames = parseSpanNames(environmentString(BENCHMARK_SPANS_ENVIRONMENT_VARIABLE));
    const spanNames = selectBenchmarkSpanNames(configuredSpanNames, cli.namedArgs.span);
    const waitUntilSpan = cli.namedArgs['wait-until-span'];
    if (waitUntilSpan && !configuredSpanNames.includes(waitUntilSpan)) {
        fail(`--wait-until-span ${waitUntilSpan} is not included in ${BENCHMARK_SPANS_ENVIRONMENT_VARIABLE}.`);
    }
    const runs = Number(cli.positionalArgs.runs);
    const waitTimeSeconds = Number(cli.namedArgs['wait-time']);
    const mode: StartupMode = cli.flags.cold ? 'cold' : 'process';
    const defaultAppID = platform === 'android' ? 'org.me.mobiexpensifyg' : 'com.expensify.expensifylite';
    const appID = cli.namedArgs['app-id'] ?? defaultAppID;
    const appIDA = cli.namedArgs['app-id-a'];
    const appIDB = cli.namedArgs['app-id-b'];
    const appPath = cli.namedArgs['app-path'] ?? environmentString('IOS_APP_PATH');
    const appPathA = cli.namedArgs['app-path-a'];
    const appPathB = cli.namedArgs['app-path-b'];
    const outputPathA = cli.namedArgs['output-a'];
    const outputPathB = cli.namedArgs['output-b'];
    const resultsOutputPath = cli.namedArgs['results-output'];
    const resultsOutputPathA = cli.namedArgs['results-output-a'];
    const resultsOutputPathB = cli.namedArgs['results-output-b'];
    const metricLabel = cli.namedArgs.span?.replaceAll(/[^a-zA-Z0-9_-]/g, '-') ?? 'all-spans';

    const comparisonRequested =
        appIDA !== undefined ||
        appIDB !== undefined ||
        appPathA !== undefined ||
        appPathB !== undefined ||
        outputPathA !== undefined ||
        outputPathB !== undefined ||
        resultsOutputPathA !== undefined ||
        resultsOutputPathB !== undefined;
    if (comparisonRequested) {
        if (!appIDA || !appIDB) {
            fail('--app-id-a and --app-id-b must be supplied together for alternating comparison mode.');
        }
        if (appIDA === appIDB) {
            fail('--app-id-a and --app-id-b must identify different installed apps.');
        }
        if (cli.namedArgs['app-id'] !== undefined) {
            fail('--app-id cannot be combined with alternating comparison mode; use --app-id-a and --app-id-b.');
        }
        if ((appPathA === undefined) !== (appPathB === undefined)) {
            fail('--app-path-a and --app-path-b must be supplied together.');
        }
        if (mode === 'cold' && (appPathA === undefined || appPathB === undefined)) {
            fail('--app-path-a and --app-path-b are required with --cold comparison mode.');
        }
        if (mode !== 'cold' && (appPathA !== undefined || appPathB !== undefined)) {
            fail('--app-path-a and --app-path-b are only supported with --cold comparison mode.');
        }
        if (cli.namedArgs['app-path'] !== undefined) {
            fail('--app-path cannot be combined with alternating comparison mode; use --app-path-a and --app-path-b with --cold.');
        }
        if (cli.namedArgs.output !== undefined) {
            fail('--output cannot be combined with alternating comparison mode; use --output-a and --output-b.');
        }
        if (resultsOutputPath !== undefined) {
            fail('--results-output cannot be combined with alternating comparison mode; use --results-output-a and --results-output-b.');
        }
        await benchmarkAppStartupsAlternating({
            platform,
            rootDirectory,
            deviceIdentifier: cli.namedArgs.device,
            appIDA,
            appIDB,
            mode,
            spanNames,
            runs,
            waitTimeSeconds,
            waitUntilSpan,
            appPathA: appPathA ? resolve(appPathA) : undefined,
            appPathB: appPathB ? resolve(appPathB) : undefined,
            outputPathA: resolve(outputPathA ?? join(rootDirectory, '.benchmarks', `${platform}-${metricLabel}-${mode}-a.csv`)),
            outputPathB: resolve(outputPathB ?? join(rootDirectory, '.benchmarks', `${platform}-${metricLabel}-${mode}-b.csv`)),
            resultsOutputPathA: resultsOutputPathA ? resolve(resultsOutputPathA) : undefined,
            resultsOutputPathB: resultsOutputPathB ? resolve(resultsOutputPathB) : undefined,
        });
        return;
    }

    const outputPath = resolve(cli.namedArgs.output ?? join(rootDirectory, '.benchmarks', `${platform}-${metricLabel}-${mode}.csv`));

    await benchmarkAppStartups({
        platform,
        rootDirectory,
        deviceIdentifier: cli.namedArgs.device,
        appID,
        appPath,
        mode,
        spanNames,
        runs,
        waitTimeSeconds,
        waitUntilSpan,
        outputPath,
        resultsOutputPath: resultsOutputPath ? resolve(resultsOutputPath) : undefined,
    });
}

if (isDirectRun) {
    main().catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    });
}

export {
    benchmarkAppStartupsAlternating,
    benchmarkAlternatingStartups,
    benchmarkAppStartups,
    benchmarkMetricTable,
    benchmarkMetricTableCsv,
    benchmarkResultsOutputPath,
    benchmarkStartups,
    createBenchmarkRecorder,
    parseSpanNames,
    selectBenchmarkSpanNames,
};
export type {
    BenchmarkAlternatingResult,
    BenchmarkAlternatingStartupsOptions,
    BenchmarkAppStartupsAlternatingOptions,
    BenchmarkAppStartupsOptions,
    BenchmarkMetricResult,
    BenchmarkRecorder,
    BenchmarkRecorderOptions,
    BenchmarkResult,
    BenchmarkResultTableRow,
    BenchmarkStartupsOptions,
};
