#!/usr/bin/env bun

import type {TupleToUnion} from 'type-fest';

import CLI from 'expensify-common/CLI';
import {existsSync, mkdirSync, writeFileSync} from 'node:fs';

import type {BenchmarkStats} from '../lib/benchmarkStatistics';
import type {NativeAppBenchmarkAdapter, PlatformName} from '../lib/nativeAppBenchmark';
import type {BenchmarkKind, PlatformAdapter} from './shared';

import {benchmarkStartups as runBenchmarkStartups} from '../lib/benchmarkAppStartup';
import {benchmarkMetrics, readBenchmarkSamples} from '../lib/benchmarkStatistics';
import {PLATFORM_NAMES, createNativeAppBenchmarkAdapter} from '../lib/nativeAppBenchmark';
import {createAndroidPgoAdapter} from './android';
import createIOSPgoAdapter from './ios';
import {STARTUP_SPAN_NAME, capture, fail, findFiles, parseChoice, parsePositiveInteger, requirePositiveInteger, rootDirectory, run} from './shared';

const DEFAULT_STARTUP_RUNS = 10;
const DEFAULT_STARTUP_WAIT_SECONDS = 30;
const WORKFLOW_COMMANDS = [
    'build-release',
    'build-instrumented',
    'build-optimized',
    'verify-instrumented',
    'install-release',
    'install-instrumented',
    'install-optimized',
    'record-startups',
    'benchmark-release',
    'benchmark-optimized',
    'benchmark',
    'compare-benchmarks',
    'dump',
    'pull',
    'merge',
] as const;

type WorkflowCommand = TupleToUnion<typeof WORKFLOW_COMMANDS>;

async function main(): Promise<void> {
    // The CLI framework requires kebab-case named argument keys, which the naming-convention rule cannot express.
    /* eslint-disable @typescript-eslint/naming-convention */
    const cli = new CLI({
        positionalArgs: [
            {
                name: 'platform',
                description: `Native platform to target (${PLATFORM_NAMES.join(', ')})`,
                parse: (value): PlatformName => parseChoice(value, PLATFORM_NAMES, 'Platform'),
            },
            {
                name: 'workflow',
                description: `PGO workflow to run (${WORKFLOW_COMMANDS.join(', ')})`,
                parse: (value): WorkflowCommand => parseChoice(value, WORKFLOW_COMMANDS, 'Workflow'),
            },
            {
                name: 'runs',
                description: 'Number of measured startup runs',
                default: DEFAULT_STARTUP_RUNS,
                parse: (value) => parsePositiveInteger(value, 'Startup run count'),
            },
            {
                name: 'timeout',
                description: `Seconds to wait for the ${STARTUP_SPAN_NAME} benchmark span`,
                default: DEFAULT_STARTUP_WAIT_SECONDS,
                parse: (value) => parsePositiveInteger(value, 'Startup span timeout'),
            },
        ],
        namedArgs: {
            'app-id': {
                description: 'Application ID or bundle identifier; defaults to the bootstrapped release identifier',
                required: false,
            },
            device: {
                description: 'Device identifier to use (adb serial on Android; CoreDevice identifier, UDID, serial number, or device name on iOS)',
                required: false,
            },
        },
    });
    /* eslint-enable @typescript-eslint/naming-convention */

    const {platform: platformName, workflow, runs, timeout} = cli.positionalArgs;
    await runWorkflow(
        parseChoice(String(platformName), PLATFORM_NAMES, 'Platform'),
        parseChoice(String(workflow), WORKFLOW_COMMANDS, 'Workflow'),
        requirePositiveInteger(Number(runs), 'Startup run count'),
        requirePositiveInteger(Number(timeout), 'Startup span timeout'),
        cli.namedArgs['app-id'],
        cli.namedArgs.device,
    );
}

async function runWorkflow(platformName: PlatformName, workflow: WorkflowCommand, runs: number, timeoutSeconds: number, appID?: string, deviceIdentifier?: string): Promise<void> {
    const adapter = getAdapter(platformName, appID, deviceIdentifier);

    switch (workflow) {
        case 'build-release':
            adapter.build('release');
            return;
        case 'build-instrumented':
            adapter.build('instrumented');
            return;
        case 'build-optimized':
            adapter.build('optimized');
            return;
        case 'verify-instrumented':
            adapter.verifyInstrumentation();
            return;
        case 'install-release':
            adapter.install('release');
            return;
        case 'install-instrumented':
            adapter.install('instrumented');
            return;
        case 'install-optimized':
            adapter.install('optimized');
            return;
        case 'record-startups':
            await recordStartups(adapter, await createBenchmarkAdapter(adapter, deviceIdentifier), runs, timeoutSeconds);
            return;
        case 'benchmark-release':
            adapter.install('release');
            await benchmarkBuild(adapter, await createBenchmarkAdapter(adapter, deviceIdentifier), 'release', runs, timeoutSeconds);
            return;
        case 'benchmark-optimized':
            adapter.install('optimized');
            await benchmarkBuild(adapter, await createBenchmarkAdapter(adapter, deviceIdentifier), 'optimized', runs, timeoutSeconds);
            return;
        case 'benchmark':
            await benchmarkAll(adapter, await createBenchmarkAdapter(adapter, deviceIdentifier), runs, timeoutSeconds);
            return;
        case 'compare-benchmarks':
            await compareBenchmarks(adapter);
            return;
        case 'dump':
            await adapter.dumpProfiles();
            return;
        case 'pull':
            adapter.pullProfiles();
            return;
        case 'merge':
            mergeProfiles(adapter);
            return;
        default:
            fail('Unsupported workflow.');
    }
}

function mergeProfiles(adapter: PlatformAdapter): void {
    mkdirSync(adapter.profileDirectory, {recursive: true});
    const profiles = findFiles(adapter.rawProfileDirectory, '.profraw');
    if (profiles.length === 0) {
        fail('No .profraw files found. Run dump and pull first.');
    }

    const llvmProfdata = adapter.llvmTool('llvm-profdata');
    run(llvmProfdata, ['merge', `--output=${adapter.mergedProfilePath}`, ...profiles]);
    if (adapter.profileFormat) {
        writeFileSync(`${adapter.mergedProfilePath}.format`, `${adapter.profileFormat}\n`);
    }
    const profileReport = capture(llvmProfdata, ['show', '--all-functions', adapter.mergedProfilePath]);
    writeFileSync(`${adapter.mergedProfilePath}.txt`, profileReport);
    console.log(`Merged PGO profile: ${adapter.mergedProfilePath}`);
}

async function measureStartup(adapter: NativeAppBenchmarkAdapter, waitTimeSeconds: number): Promise<number> {
    await adapter.prepareStartup('process');
    const events = await adapter.launchAndCollect({spanNames: [STARTUP_SPAN_NAME], waitTimeSeconds, waitUntilSpan: STARTUP_SPAN_NAME});
    const duration = events.find((event) => event.span === STARTUP_SPAN_NAME)?.durationMs;
    if (duration === undefined) {
        fail(`The ${STARTUP_SPAN_NAME} benchmark span did not complete. Rebuild the app through this PGO tool before collecting a profile.`);
    }
    return duration;
}

async function recordStartups(adapter: PlatformAdapter, benchmarkAdapter: NativeAppBenchmarkAdapter, runs: number, waitTimeSeconds: number): Promise<void> {
    if (adapter.name === 'ios') {
        console.log('Launching the instrumented iOS app once so its PGO notification handlers are active.');
        await measureStartup(benchmarkAdapter, waitTimeSeconds);
    } else {
        await benchmarkAdapter.prepareStartup('process');
    }
    await adapter.clearDeviceProfiles();
    for (let runNumber = 1; runNumber <= runs; runNumber += 1) {
        console.log(`Recording cold-process startup ${runNumber}/${runs}.`);
        const duration = await measureStartup(benchmarkAdapter, waitTimeSeconds);
        console.log(`${STARTUP_SPAN_NAME}=${duration}ms`);
        await adapter.dumpProfiles();
    }

    adapter.pullProfiles();
    mergeProfiles(adapter);
}

async function benchmarkBuild(adapter: PlatformAdapter, benchmarkAdapter: NativeAppBenchmarkAdapter, kind: BenchmarkKind, runs: number, waitTimeSeconds: number): Promise<void> {
    mkdirSync(adapter.benchmarkDirectory, {recursive: true});
    await runBenchmarkStartups(benchmarkAdapter, {
        mode: 'process',
        spanNames: [STARTUP_SPAN_NAME],
        runs,
        waitTimeSeconds,
        waitUntilSpan: STARTUP_SPAN_NAME,
        outputPath: adapter.benchmarkPaths[kind],
    });
}

async function benchmarkAll(adapter: PlatformAdapter, benchmarkAdapter: NativeAppBenchmarkAdapter, runs: number, waitTimeSeconds: number): Promise<void> {
    console.log('=== Benchmark phase 1/2: Release ===');
    console.log(`Installing release artifact: ${adapter.artifactPaths.release}`);
    adapter.install('release');
    await benchmarkBuild(adapter, benchmarkAdapter, 'release', runs, waitTimeSeconds);

    console.log('=== Benchmark phase 2/2: PGO optimized ===');
    await benchmarkAdapter.prepareStartup('process');
    console.log(`Installing PGO optimized artifact: ${adapter.artifactPaths.optimized}`);
    adapter.install('optimized');
    await benchmarkBuild(adapter, benchmarkAdapter, 'optimized', runs, waitTimeSeconds);

    console.log('=== Benchmark comparison ===');
    await compareBenchmarks(adapter);
}

function percentageImprovement(releaseValue: number, optimizedValue: number): number {
    return ((releaseValue - optimizedValue) / releaseValue) * 100;
}

async function compareBenchmarks(adapter: PlatformAdapter): Promise<void> {
    const releasePath = adapter.benchmarkPaths.release;
    const optimizedPath = adapter.benchmarkPaths.optimized;
    if (!existsSync(releasePath) || !existsSync(optimizedPath)) {
        fail('Missing benchmark data. Run benchmark-release and benchmark-optimized first.');
    }

    const [releaseSamples, optimizedSamples] = await Promise.all([readBenchmarkSamples(releasePath), readBenchmarkSamples(optimizedPath)]);
    const release = benchmarkMetrics(releaseSamples, [STARTUP_SPAN_NAME])[STARTUP_SPAN_NAME]?.stats;
    const optimized = benchmarkMetrics(optimizedSamples, [STARTUP_SPAN_NAME])[STARTUP_SPAN_NAME]?.stats;
    if (!release || !optimized) {
        fail(`No ${STARTUP_SPAN_NAME} benchmark samples were found.`);
    }
    const numericColumns: Array<keyof Omit<BenchmarkStats, 'runs'>> = ['average', 'p50', 'p75', 'p90', 'p95', 'p99', 'min', 'max'];
    const improvements = numericColumns.map((key) => percentageImprovement(release[key], optimized[key]));

    const formatLabel = (value: string) => value.padEnd(18);
    const formatCount = (value: string) => value.padStart(5);
    const formatMetric = (value: string) => value.padStart(10);
    const row = (label: string, count: string, values: string[]) => [formatLabel(label), formatCount(count), ...values.map(formatMetric)].join(' ');
    const statsRow = (label: string, stats: BenchmarkStats) =>
        row(
            label,
            String(stats.runs),
            [stats.average, stats.p50, stats.p75, stats.p90, stats.p95, stats.p99, stats.min, stats.max].map((value) => value.toFixed(2)),
        );

    console.log('Positive percentages are faster; negative percentages are regressions.');
    console.log(row('Build', 'Runs', ['Average', 'P50', 'P75', 'P90', 'P95', 'P99', 'Min', 'Max']));
    console.log(statsRow('Release', release));
    console.log(statsRow('PGO optimized', optimized));
    console.log(
        row(
            'PGO improvement',
            '-',
            improvements.map((improvement) => `${improvement.toFixed(2)}%`),
        ),
    );
}

function getAdapter(platformName: PlatformName, appID?: string, deviceIdentifier?: string): PlatformAdapter {
    return platformName === 'android' ? createAndroidPgoAdapter(appID, deviceIdentifier) : createIOSPgoAdapter(appID, deviceIdentifier);
}

async function createBenchmarkAdapter(adapter: PlatformAdapter, deviceIdentifier?: string): Promise<NativeAppBenchmarkAdapter> {
    return createNativeAppBenchmarkAdapter({platform: adapter.name, rootDirectory, appID: adapter.appID(), deviceIdentifier});
}

if (import.meta.main) {
    main().catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    });
}

export {main, percentageImprovement};
