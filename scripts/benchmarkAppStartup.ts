#!/usr/bin/env bun

import CLI from 'expensify-common/CLI';
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import process from 'node:process';

import type {NativeAppBenchmarkAdapter, PlatformName, StartupMode} from './lib/nativeAppBenchmark';

import {PLATFORM_NAMES, createNativeAppBenchmarkAdapter, findBenchmarkDuration, iosBenchmarkMarkerPath, parseBenchmarkLogEvents} from './lib/nativeAppBenchmark';

const DEFAULT_SPAN_NAME = 'ManualAppStartup';
const DEFAULT_RUNS = 20;
const DEFAULT_TIMEOUT_SECONDS = 30;

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
    spanName: string;
    runs: number;
    timeoutSeconds: number;
    outputPath: string;
    appPath?: string;
};
type BenchmarkAppStartupsOptions = BenchmarkStartupsOptions & {
    platform: PlatformName;
    rootDirectory: string;
    appID: string;
    deviceIdentifier?: string;
};
type BenchmarkResult = {
    samples: number[];
    stats: BenchmarkStats;
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

function environmentString(name: string): string | undefined {
    const value: unknown = process.env[name];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
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

async function measureStartup(adapter: NativeAppBenchmarkAdapter, options: Omit<BenchmarkStartupsOptions, 'runs' | 'outputPath'>): Promise<number> {
    await adapter.prepareStartup(options.mode, options.appPath);
    return adapter.launchAndWait(options.spanName, options.timeoutSeconds);
}

async function benchmarkStartups(adapter: NativeAppBenchmarkAdapter, options: BenchmarkStartupsOptions): Promise<BenchmarkResult> {
    console.log('=== Native app startup benchmark ===');
    console.table([
        {
            platform: adapter.name,
            device: adapter.deviceIdentifier,
            appID: adapter.appID,
            span: options.spanName,
            mode: options.mode,
            measuredRuns: options.runs,
            warmUpRuns: 1,
            timeoutSeconds: options.timeoutSeconds,
            appPath: options.appPath ?? 'installed app',
            outputPath: options.outputPath,
        },
    ]);
    console.log(`Running one unmeasured ${options.mode === 'cold' ? 'true-cold' : 'cold-process'} warm-up startup for ${options.spanName}.`);
    await measureStartup(adapter, options);

    const samples: number[] = [];
    for (let runNumber = 1; runNumber <= options.runs; runNumber += 1) {
        const duration = await measureStartup(adapter, options);
        samples.push(duration);
        console.log(`Run ${runNumber}/${options.runs}: ${duration}ms`);
    }

    const stats = benchmarkStats(samples);
    mkdirSync(dirname(options.outputPath), {recursive: true});
    writeFileSync(options.outputPath, ['run,duration_ms', ...samples.map((duration, index) => `${index + 1},${duration}`), ''].join('\n'));
    console.table([Object.fromEntries(Object.entries(stats).map(([key, value]) => [key, value.toFixed(2)]))]);
    console.log(`Recorded ${options.runs} samples in ${options.outputPath}`);
    return {samples, stats, outputPath: options.outputPath};
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
            {
                name: 'timeout',
                description: 'Seconds to wait for the benchmark span',
                default: DEFAULT_TIMEOUT_SECONDS,
                parse: (value) => parsePositiveInteger(value, 'Timeout'),
            },
        ],
        namedArgs: {
            span: {
                description: 'Whitelisted Sentry span name to measure',
                default: DEFAULT_SPAN_NAME,
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
    const spanName = cli.namedArgs.span ?? DEFAULT_SPAN_NAME;
    const runs = Number(cli.positionalArgs.runs);
    const timeoutSeconds = Number(cli.positionalArgs.timeout);
    const mode: StartupMode = cli.flags.cold ? 'cold' : 'process';
    const defaultAppID = platform === 'android' ? 'org.me.mobiexpensifyg' : 'com.expensify.expensifylite';
    const appID = cli.namedArgs['app-id'] ?? defaultAppID;
    const appPath = cli.namedArgs['app-path'] ?? environmentString('IOS_APP_PATH');
    const safeSpanName = spanName.replaceAll(/[^a-zA-Z0-9_-]/g, '-');
    const outputPath = resolve(cli.namedArgs.output ?? join(rootDirectory, '.benchmarks', `${platform}-${safeSpanName}-${mode}.csv`));

    await benchmarkAppStartups({
        platform,
        rootDirectory,
        deviceIdentifier: cli.namedArgs.device,
        appID,
        appPath,
        mode,
        spanName,
        runs,
        timeoutSeconds,
        outputPath,
    });
}

if (isDirectRun) {
    main().catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    });
}

export {benchmarkAppStartups, benchmarkStartups, benchmarkStats, findBenchmarkDuration, iosBenchmarkMarkerPath, parseBenchmarkLogEvents, percentile};
export type {BenchmarkAppStartupsOptions, BenchmarkResult, BenchmarkStartupsOptions, BenchmarkStats};
