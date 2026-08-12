#!/usr/bin/env bun

import CLI from 'expensify-common/CLI';
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import process from 'node:process';

import type {BenchmarkLogEvent, NativeAppBenchmarkAdapter, PlatformName, StartupMode} from './lib/nativeAppBenchmark';

import {
    PLATFORM_NAMES,
    createNativeAppBenchmarkAdapter,
    findBenchmarkDuration,
    iosBenchmarkMarkerPath,
    latestBenchmarkEvents,
    parseIosInstalledAppURL,
    parseBenchmarkLogEvents,
    parseIosLaunchProcessIdentifier,
    parseIosRunningAppProcessIdentifier,
} from './lib/nativeAppBenchmark';

const DEFAULT_RUNS = 20;
const DEFAULT_WAIT_TIME_SECONDS = 30;
const BENCHMARK_SPANS_ENVIRONMENT_VARIABLE = 'EXPO_PUBLIC_BENCHMARK_SENTRY_SPANS';

type BenchmarkStats = {
    runs: number;
    average: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
};
type BenchmarkStartupsOptions = {
    mode: StartupMode;
    spanNames: string[];
    runs: number;
    waitTimeSeconds: number;
    waitUntilSpan?: string;
    outputPath: string;
    appPath?: string;
};
type BenchmarkAppStartupsOptions = BenchmarkStartupsOptions & {
    platform: PlatformName;
    rootDirectory: string;
    appID: string;
    deviceIdentifier?: string;
};
type BenchmarkMetricResult = {
    samples: number[];
    stats?: BenchmarkStats;
};
type BenchmarkResult = {
    metrics: Record<string, BenchmarkMetricResult>;
    outputPath: string;
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

function percentile(sortedValues: number[], fraction: number): number {
    const position = (sortedValues.length - 1) * fraction;
    const lowerIndex = Math.floor(position);
    const upperIndex = Math.ceil(position);
    const remainder = position - lowerIndex;
    const lowerValue = sortedValues.at(lowerIndex);
    const upperValue = sortedValues.at(upperIndex);
    if (lowerValue === undefined || upperValue === undefined) {
        fail('Cannot calculate a percentile without benchmark samples.');
    }
    return lowerValue + remainder * (upperValue - lowerValue);
}

function benchmarkStats(samples: number[]): BenchmarkStats {
    const sortedValues = samples.toSorted((left, right) => left - right);
    const min = sortedValues.at(0);
    const max = sortedValues.at(-1);
    if (min === undefined || max === undefined) {
        fail('No benchmark samples were recorded.');
    }

    return {
        runs: samples.length,
        average: samples.reduce((sum, value) => sum + value, 0) / samples.length,
        p50: percentile(sortedValues, 0.5),
        p75: percentile(sortedValues, 0.75),
        p90: percentile(sortedValues, 0.9),
        p95: percentile(sortedValues, 0.95),
        p99: percentile(sortedValues, 0.99),
        min,
        max,
    };
}

async function measureStartup(adapter: NativeAppBenchmarkAdapter, options: Omit<BenchmarkStartupsOptions, 'runs' | 'outputPath'>): Promise<BenchmarkLogEvent[]> {
    await adapter.prepareStartup(options.mode, options.appPath);
    return adapter.launchAndCollect({spanNames: options.spanNames, waitTimeSeconds: options.waitTimeSeconds, waitUntilSpan: options.waitUntilSpan});
}

async function benchmarkStartups(adapter: NativeAppBenchmarkAdapter, options: BenchmarkStartupsOptions): Promise<BenchmarkResult> {
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
        },
    ]);
    console.log(`Running one unmeasured ${options.mode === 'cold' ? 'true-cold' : 'cold-process'} warm-up startup.`);
    await measureStartup(adapter, options);

    const samplesBySpan = new Map(options.spanNames.map((spanName) => [spanName, [] as number[]]));
    const csvRows = ['run,span,duration_ms'];
    for (let runNumber = 1; runNumber <= options.runs; runNumber += 1) {
        const events = await measureStartup(adapter, options);
        const eventsBySpan = new Map(events.map((event) => [event.span, event]));
        const runMetrics = options.spanNames.map((spanName) => {
            const event = eventsBySpan.get(spanName);
            if (!event) {
                return `${spanName}=not observed`;
            }
            samplesBySpan.get(spanName)?.push(event.durationMs);
            csvRows.push(`${runNumber},${spanName},${event.durationMs}`);
            return `${spanName}=${event.durationMs}ms`;
        });
        console.log(`Run ${runNumber}/${options.runs}: ${runMetrics.join(', ')}`);
    }

    const metrics = Object.fromEntries(
        options.spanNames.map((spanName) => {
            const samples = samplesBySpan.get(spanName) ?? [];
            return [spanName, {samples, stats: samples.length > 0 ? benchmarkStats(samples) : undefined}];
        }),
    );
    mkdirSync(dirname(options.outputPath), {recursive: true});
    writeFileSync(options.outputPath, [...csvRows, ''].join('\n'));
    console.table(
        Object.entries(metrics).map(([span, metric]) => ({
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
        })),
    );
    console.log(`Recorded benchmark samples in ${options.outputPath}`);
    return {metrics, outputPath: options.outputPath};
}

async function benchmarkAppStartups(options: BenchmarkAppStartupsOptions): Promise<BenchmarkResult> {
    const adapter = createNativeAppBenchmarkAdapter(options);
    return benchmarkStartups(adapter, options);
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
            'app-path': {
                description: 'Path to the signed iOS .app; required with --cold on iOS',
                required: false,
            },
            output: {
                description: 'CSV output path',
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
    const appPath = cli.namedArgs['app-path'] ?? environmentString('IOS_APP_PATH');
    const metricLabel = cli.namedArgs.span?.replaceAll(/[^a-zA-Z0-9_-]/g, '-') ?? 'all-spans';
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
    });
}

if (isDirectRun) {
    main().catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    });
}

export {
    benchmarkAppStartups,
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
};
export type {BenchmarkAppStartupsOptions, BenchmarkMetricResult, BenchmarkResult, BenchmarkStartupsOptions, BenchmarkStats};
