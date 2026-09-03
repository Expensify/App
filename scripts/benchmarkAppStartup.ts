#!/usr/bin/env bun

import CLI from 'expensify-common/CLI';
import {join, resolve} from 'node:path';
import process from 'node:process';

import type {PlatformName, StartupMode} from './lib/nativeAppBenchmark';

import {benchmarkAlternatingStartups, benchmarkAppStartups, benchmarkAppStartupsAlternating, benchmarkStartups, createBenchmarkRecorder} from './lib/benchmarkAppStartup';
import {exportBenchmarkResults} from './lib/benchmarkStatistics';
import {PLATFORM_NAMES} from './lib/nativeAppBenchmark';

const DEFAULT_RUNS = 20;
const DEFAULT_WAIT_TIME_SECONDS = 30;
const BENCHMARK_SPANS_ENVIRONMENT_VARIABLE = 'EXPO_PUBLIC_BENCHMARK_SENTRY_SPANS';
const RESULTS_COMMAND = 'results';
const BENCHMARK_COMMANDS = [...PLATFORM_NAMES, RESULTS_COMMAND] as const;

async function main(rootDirectory: string): Promise<void> {
    // The CLI framework requires kebab-case named argument keys, which the naming-convention rule cannot express.
    /* eslint-disable @typescript-eslint/naming-convention */
    const cli = new CLI({
        positionalArgs: [
            {
                name: 'command',
                description: `Native platform to benchmark (${PLATFORM_NAMES.join(', ')}) or ${RESULTS_COMMAND} to summarize sample files`,
                parse: (value) => parseChoice(value, BENCHMARK_COMMANDS, 'Command'),
            },
            {
                name: 'runs',
                description: 'Number of measured startup runs',
                default: DEFAULT_RUNS,
                parse: (value) => parsePositiveInteger(value, 'Run count'),
            },
        ],
        namedArgs: {
            'input-files': {
                description: 'Comma-separated raw sample CSV files for the results command',
                required: false,
            },
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

    const command = parseChoice(String(cli.positionalArgs.command), BENCHMARK_COMMANDS, 'Command');
    const inputFiles = cli.namedArgs['input-files'];
    const resultsOutputPath = cli.namedArgs['results-output'];
    if (command === RESULTS_COMMAND) {
        const inputPaths = inputFiles
            ?.split(',')
            .map((inputPath) => inputPath.trim())
            .filter(Boolean)
            .map((inputPath) => resolve(inputPath));
        if (!inputPaths || inputPaths.length === 0) {
            throw new Error('Supply at least one raw sample CSV file with --input-files.');
        }
        const outputPath = resolve(resultsOutputPath ?? join(rootDirectory, '.benchmarks', 'results.csv'));
        const table = exportBenchmarkResults({inputPaths, outputPath});
        console.table(table);
        console.log(`Recorded benchmark results in ${outputPath}`);
        return;
    }
    if (inputFiles !== undefined) {
        throw new Error('--input-files is only supported by the results command.');
    }

    const platform: PlatformName = command;
    const configuredSpanNames = parseSpanNames(environmentString(BENCHMARK_SPANS_ENVIRONMENT_VARIABLE));
    const spanNames = selectBenchmarkSpanNames(configuredSpanNames, cli.namedArgs.span);
    const waitUntilSpan = cli.namedArgs['wait-until-span'];
    if (waitUntilSpan && !configuredSpanNames.includes(waitUntilSpan)) {
        throw new Error(`--wait-until-span ${waitUntilSpan} is not included in ${BENCHMARK_SPANS_ENVIRONMENT_VARIABLE}.`);
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
            throw new Error('--app-id-a and --app-id-b must be supplied together for alternating comparison mode.');
        }
        if (appIDA === appIDB) {
            throw new Error('--app-id-a and --app-id-b must identify different installed apps.');
        }
        if (cli.namedArgs['app-id'] !== undefined) {
            throw new Error('--app-id cannot be combined with alternating comparison mode; use --app-id-a and --app-id-b.');
        }
        if ((appPathA === undefined) !== (appPathB === undefined)) {
            throw new Error('--app-path-a and --app-path-b must be supplied together.');
        }
        if (mode === 'cold' && (appPathA === undefined || appPathB === undefined)) {
            throw new Error('--app-path-a and --app-path-b are required with --cold comparison mode.');
        }
        if (mode !== 'cold' && (appPathA !== undefined || appPathB !== undefined)) {
            throw new Error('--app-path-a and --app-path-b are only supported with --cold comparison mode.');
        }
        if (cli.namedArgs['app-path'] !== undefined) {
            throw new Error('--app-path cannot be combined with alternating comparison mode; use --app-path-a and --app-path-b with --cold.');
        }
        if (cli.namedArgs.output !== undefined) {
            throw new Error('--output cannot be combined with alternating comparison mode; use --output-a and --output-b.');
        }
        if (resultsOutputPath !== undefined) {
            throw new Error('--results-output cannot be combined with alternating comparison mode; use --results-output-a and --results-output-b.');
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

/** Validates an optional single-span selection against the spans enabled in the benchmark build. */
function selectBenchmarkSpanNames(configuredSpanNames: string[], selectedSpanName?: string): string[] {
    if (selectedSpanName && !configuredSpanNames.includes(selectedSpanName)) {
        throw new Error(`--span ${selectedSpanName} is not included in ${BENCHMARK_SPANS_ENVIRONMENT_VARIABLE}.`);
    }
    const spanNames = selectedSpanName ? [selectedSpanName] : configuredSpanNames;
    if (spanNames.length === 0) {
        throw new Error(`Define at least one span in ${BENCHMARK_SPANS_ENVIRONMENT_VARIABLE} before running the benchmark.`);
    }
    return spanNames;
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

function environmentString(name: string): string | undefined {
    const value: unknown = process.env[name];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function parsePositiveInteger(value: string, label: string): number {
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed) || parsed <= 0) {
        throw new Error(`${label} must be a positive integer. Received: ${value}`);
    }
    return parsed;
}

function parsePositiveNumber(value: string, label: string): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error(`${label} must be a positive number. Received: ${value}`);
    }
    return parsed;
}

function parseChoice<T extends string>(value: string, choices: readonly T[], label: string): T {
    const choice = choices.find((candidate) => candidate === value);
    if (!choice) {
        throw new Error(`${label} must be one of: ${choices.join(', ')}. Received: ${value}`);
    }
    return choice;
}

export {benchmarkAppStartupsAlternating, benchmarkAlternatingStartups, benchmarkAppStartups, benchmarkStartups, createBenchmarkRecorder, main, parseSpanNames, selectBenchmarkSpanNames};
export type {
    BenchmarkAlternatingResult,
    BenchmarkAlternatingStartupsOptions,
    BenchmarkAppStartupsAlternatingOptions,
    BenchmarkAppStartupsOptions,
    BenchmarkRecorder,
    BenchmarkRecorderOptions,
    BenchmarkResult,
    BenchmarkStartupsOptions,
} from './lib/benchmarkAppStartup';
