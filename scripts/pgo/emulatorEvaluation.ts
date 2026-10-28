#!/usr/bin/env bun
// cspell:ignore cooldown profdata
/** Train and benchmark the real app on disposable emulators with the release-candidate evaluation plan. */
import {createHash} from 'node:crypto';
import {appendFileSync, copyFileSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {basename, join, relative} from 'node:path';

import type {PlatformName} from '../lib/nativeAppBenchmark';
import type {EvaluationCohort, EvaluationPlan, EvaluationResult} from './evaluationSchema';
import type {BenchmarkOrder} from './journeyBenchmark';
import type {PlatformAdapter} from './shared';

import {PLATFORM_NAMES} from '../lib/nativeAppBenchmark';
import {capture, environmentString, fail, findFiles, parseChoice, rootDirectory, run, runAllowFailure} from '../lib/scriptUtils';
import createAndroidPgoAdapter from './android';
import {androidEmulatorIdentifier} from './emulator';
import {signInEmulator} from './emulatorAccount';
import {evaluationReport} from './evaluationReport';
import {benchmarkStagePlan, directoryNames, newBatch, readCohort} from './evaluationRun';
import {isGitID, isRecord} from './evaluationSchema';
import createIOSPgoAdapter from './ios';
import {bootIOSVerificationSimulator} from './iosSimulator';
import {validateTraining} from './localProof';
import {fileHash, sourceIdentity, toolchainIdentity} from './proof';

const BENCHMARK_ORDERS = ['release-first', 'optimized-first'] as const;
const APPS_ARCHIVE = 'apps.tar';

type TrainingResult = {
    schema: 1;
    platform: PlatformName;
    target: string;
    status: 'passed' | 'failed';
    failureStage?: string;
    appSha: string;
    mobileSha: string;
    artifactSha256: EvaluationResult['artifactSha256'];
    profileSha256: string;
    sourceIdentity: string;
    toolchain: Record<string, string>;
    profile?: {functions: number; count: string};
    journeyRunDurationsSeconds: number[];
};
type BenchmarkResult = {
    schema: 1;
    platform: PlatformName;
    order: BenchmarkOrder;
    status: 'passed' | 'failed';
    failureStage?: string;
    artifactSha256: {release: string; optimized: string};
    cohorts: EvaluationCohort[];
};

async function main(): Promise<void> {
    const [command = '', platformName = '', order = '', platformSelection = ''] = process.argv.slice(2);
    configureEmulatorEvaluation();
    if (command === 'report') {
        await report(platformName, order, platformSelection);
        return;
    }
    const platform = parseChoice(platformName, PLATFORM_NAMES, 'Platform');
    switch (command) {
        case 'boot':
            bootSimulator(platform);
            return;
        case 'build':
            buildBaseline(platform);
            return;
        case 'train':
            await train(platform);
            return;
        case 'benchmark':
            await benchmark(platform, parseChoice(order, BENCHMARK_ORDERS, 'Benchmark order'));
            return;
        default:
            fail('Expected boot, build, train, benchmark or report.');
    }
}

/** Build the baseline and instrumented apps before the emulator starts, so they do not compete for CPU. */
function buildBaseline(platform: PlatformName): void {
    const adapter = createAdapter(platform);
    let stage = 'build-release';
    try {
        adapter.build('release');
        stage = 'build-instrumented';
        adapter.build('instrumented');
        stage = 'verify-instrumented';
        adapter.verifyInstrumentation();
    } catch (error) {
        writePublicResult(join(publicDirectory(platform), 'training.json'), {...emptyTrainingResult(platform), failureStage: stage});
        throw error;
    }
}

/** Collect the three training journeys from the evaluation plan, then build the optimized app from their profile. */
async function train(platform: PlatformName): Promise<void> {
    const device = emulatorDevice(platform);
    const adapter = createAdapter(platform, device);
    const output = publicDirectory(platform);
    const result = emptyTrainingResult(platform);
    let stage = 'install-instrumented';
    try {
        result.artifactSha256.release = fileHash(adapter.artifactPaths.release);
        result.artifactSha256.instrumented = fileHash(adapter.artifactPaths.instrumented);
        result.sourceIdentity = sourceIdentity();
        prepareEmulator(platform, device);
        adapter.install('instrumented');
        stage = 'account-preflight';
        const deviceArgs = ['--fixture', await signInEmulator(platform, device, adapter.appID()), '--device', device, '--app-id', adapter.appID()];
        runScript('journey.ts', [platform, ...deviceArgs, '--preflight']);

        stage = 'training';
        process.env.PGO_INSTRUMENTED_BINARY_SHA256 = result.artifactSha256.instrumented;
        const journeys = join(rootDirectory, '.pgo', platform, 'journeys');
        const previousJourneys = directoryNames(journeys);
        runScript('journey.ts', [platform, ...deviceArgs, '--runs', '3', '--collect']);
        const batch = newBatch(journeys, previousJourneys);

        stage = 'validate-training';
        const training = validateTraining(platform, batch);
        const profile = join(output, 'journey.profdata');
        copyFileSync(training.profile, profile);
        if (adapter.profileFormat) {
            copyFileSync(`${training.profile}.format`, `${profile}.format`);
        }
        writeFileSync(join(output, 'profile.txt'), capture(adapter.llvmTool('llvm-profdata'), ['show', '--all-functions', '--counts', profile]));
        result.profileSha256 = fileHash(profile);
        result.profile = training.counts;
        result.journeyRunDurationsSeconds = journeyDurations(batch);

        stage = 'build-optimized';
        adapter.build('optimized', profile);
        if (fileHash(profile) !== result.profileSha256) {
            fail('The training profile changed during the optimized build.');
        }
        result.artifactSha256.optimized = fileHash(adapter.artifactPaths.optimized);
        // The generated fixture holds the secret account email, so its hash is not published.
        result.toolchain = {identitySha256: sha256(toolchainIdentity(adapter))};
        mkdirSync(appsDirectory(platform), {recursive: true});
        run('tar', [
            '-cf',
            join(appsDirectory(platform), APPS_ARCHIVE),
            '-C',
            rootDirectory,
            relative(rootDirectory, adapter.artifactPaths.release),
            relative(rootDirectory, adapter.artifactPaths.optimized),
        ]);
        result.status = 'passed';
    } catch (error) {
        result.failureStage = stage;
        throw error;
    } finally {
        writePublicResult(join(output, 'training.json'), result);
    }
}

/** Run all three benchmark scenarios in one order: 20 measured samples per variant after one discarded warm-up. */
async function benchmark(platform: PlatformName, order: BenchmarkOrder): Promise<void> {
    const device = emulatorDevice(platform);
    const adapter = createAdapter(platform, device);
    const output = publicDirectory(platform);
    const result: BenchmarkResult = {schema: 1, platform, order, status: 'failed', artifactSha256: {release: '', optimized: ''}, cohorts: []};
    let stage = 'candidate-guard';
    try {
        run('tar', ['-xf', join(appsDirectory(platform), APPS_ARCHIVE), '-C', rootDirectory]);
        // iOS reads the bundle identifier from the extracted app.
        const deviceArgs = ['--device', device, '--app-id', adapter.appID()];
        const training = readTraining(JSON.parse(readFileSync(join(output, 'training.json'), 'utf8')));
        result.artifactSha256 = {release: fileHash(adapter.artifactPaths.release), optimized: fileHash(adapter.artifactPaths.optimized)};
        if (training.status !== 'passed' || result.artifactSha256.release !== training.artifactSha256.release || result.artifactSha256.optimized !== training.artifactSha256.optimized) {
            fail('The downloaded apps are not the builds from the training job.');
        }

        stage = 'account-preflight';
        prepareEmulator(platform, device);
        adapter.install('release');
        const fixturePath = await signInEmulator(platform, device, adapter.appID());
        runScript('journey.ts', [platform, '--fixture', fixturePath, ...deviceArgs, '--preflight']);
        for (const {scenario} of benchmarkStagePlan().filter((plan) => plan.order === order)) {
            stage = `${scenario.name}-${order}`;
            const batches = join(adapter.benchmarkDirectory, scenario.name);
            const previousBatches = directoryNames(batches);
            runScript('pgo.ts', [platform, scenario.action, '20', '60', ...deviceArgs, '--fixture', fixturePath, '--benchmark-order', order]);
            result.cohorts.push(readCohort(newBatch(batches, previousBatches), scenario.name, order, [...scenario.spans], device, adapter.appID()));
        }
        result.status = 'passed';
    } catch (error) {
        result.failureStage = stage;
        throw error;
    } finally {
        writePublicResult(join(output, `benchmark-${order}.json`), result);
    }
}

/** Render the downloaded public results with the same report the release-candidate evaluation publishes. */
async function report(resultsDirectory: string, outputDirectory: string, platformSelection: string): Promise<void> {
    if (!resultsDirectory || !outputDirectory) {
        fail('Expected report <results-directory> <output-directory> <both|android|ios>.');
    }
    const selection = parseChoice(platformSelection, ['both', ...PLATFORM_NAMES], 'Platform selection');
    const files = findFiles(resultsDirectory, '.json');
    const read = (path: string): unknown => JSON.parse(readFileSync(path, 'utf8'));
    const trainings = files.filter((path) => basename(path) === 'training.json').map(read);
    const benchmarks = files.filter((path) => /^benchmark-(release|optimized)-first\.json$/.test(basename(path))).map(read);
    const packageManifest: unknown = JSON.parse(readFileSync(join(rootDirectory, 'package.json'), 'utf8'));
    const version = isRecord(packageManifest) && typeof packageManifest.version === 'string' ? packageManifest.version : fail('package.json has no version.');
    const candidate = {
        appSha: capture('git', ['rev-parse', 'HEAD']).trim(),
        // The report job checks out without submodules, so read the Mobile-Expensify commit that App records.
        mobileSha: capture('git', ['rev-parse', 'HEAD:Mobile-Expensify']).trim(),
        version,
        environment: 'preview' as const,
    };
    const {plan, results} = evaluationResults(candidate, selection === 'both' ? [...PLATFORM_NAMES] : [selection], trainings, benchmarks);
    const {summary, markdown} = await evaluationReport(plan, results, () => Promise.reject(new Error('The emulator report has no deploy checklist to read.')));
    const training = trainings.map(readTraining).map((entry) => {
        const durations = entry.journeyRunDurationsSeconds.length > 0 ? entry.journeyRunDurationsSeconds.join(', ') : '—';
        return `| ${entry.platform} | ${entry.target} | ${entry.status}${entry.failureStage ? ` at ${entry.failureStage}` : ''} | ${durations} | ${entry.profile?.functions ?? '—'} |`;
    });
    mkdirSync(outputDirectory, {recursive: true});
    writeFileSync(join(outputDirectory, 'summary.json'), `${JSON.stringify({...summary, training: trainings}, null, 2)}\n`);
    writeFileSync(
        join(outputDirectory, 'summary.md'),
        [
            '## Native PGO emulator evaluation',
            '',
            'These results come from the real app on a hosted x86_64 Android emulator and an arm64 iOS simulator. They exercise the complete training and benchmark flow; they do not measure phone performance, and their profiles must not be used for store builds.',
            '',
            '| Platform | Target | Training | Journey durations (s) | Profiled functions |',
            '| --- | --- | --- | --- | ---: |',
            ...training,
            '',
            markdown,
        ].join('\n'),
    );
}

/** Combine the training job and both benchmark orders into the release evaluation's per-platform result. */
function evaluationResults(
    candidate: EvaluationPlan['candidate'],
    platforms: PlatformName[],
    trainingInputs: unknown[],
    benchmarkInputs: unknown[],
): {plan: EvaluationPlan; results: EvaluationResult[]} {
    const trainings = trainingInputs.map(readTraining);
    if (trainings.some((training) => training.appSha !== candidate.appSha || training.mobileSha !== candidate.mobileSha)) {
        fail('A training result comes from another App or Mobile-Expensify revision.');
    }
    if (trainings.some((training) => !platforms.includes(training.platform)) || new Set(trainings.map((training) => training.platform)).size !== trainings.length) {
        fail('Expected at most one training result for each selected platform.');
    }
    // A selected platform without a training result, for example after a failed emulator boot, is reported as missing.
    const plan: EvaluationPlan = {
        schema: 1,
        repository: 'Expensify/App',
        toolingSha: candidate.appSha,
        candidate,
        producerRunID: null,
        producerRunAttempt: null,
        platforms,
        checklistIssueNumber: null,
    };
    const results = trainings.map((training): EvaluationResult => {
        const orders = BENCHMARK_ORDERS.map((order) => {
            const matches = benchmarkInputs.filter((input) => isRecord(input) && input.platform === training.platform && input.order === order);
            if (matches.length > 1) {
                fail(`Duplicate ${training.platform} ${order} benchmark results.`);
            }
            return readBenchmark(matches.at(0), training.platform, order);
        });
        const failed = [training, ...orders].find((entry) => entry.status !== 'passed');
        const matchesTraining = orders.every(
            (entry) =>
                entry.status !== 'passed' || (entry.artifactSha256.release === training.artifactSha256.release && entry.artifactSha256.optimized === training.artifactSha256.optimized),
        );
        if (!matchesTraining) {
            fail(`The ${training.platform} benchmarks measured different apps than the training job built.`);
        }
        return {
            schema: 1,
            platform: training.platform,
            candidate,
            toolingSha: plan.toolingSha,
            status: failed ? 'failed' : 'passed',
            ...(failed ? {failureStage: failed.failureStage} : {}),
            artifactSha256: training.artifactSha256,
            profileSha256: training.profileSha256,
            sourceIdentity: training.sourceIdentity,
            toolchain: training.toolchain,
            compilerConsumption: 'unverified',
            cohorts: failed ? [] : orders.flatMap((entry) => entry.cohorts),
        };
    });
    return {plan, results};
}

function readTraining(input: unknown): TrainingResult {
    if (
        !isRecord(input) ||
        input.schema !== 1 ||
        !PLATFORM_NAMES.some((platform) => platform === input.platform) ||
        (input.status !== 'passed' && input.status !== 'failed') ||
        !isGitID(input.appSha) ||
        !isGitID(input.mobileSha) ||
        !isRecord(input.artifactSha256) ||
        !Array.isArray(input.journeyRunDurationsSeconds)
    ) {
        fail('Invalid emulator training result.');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The fields read here were checked above; evaluationReport validates the digests it publishes.
    return input as TrainingResult;
}

function readBenchmark(input: unknown, platform: PlatformName, order: BenchmarkOrder): Pick<BenchmarkResult, 'status' | 'failureStage' | 'artifactSha256' | 'cohorts'> {
    if (input === undefined) {
        // The job never uploaded a result, for example after a cancellation. Report the order's first scenario.
        return {status: 'failed', failureStage: `heavy-journey-${order}`, artifactSha256: {release: '', optimized: ''}, cohorts: []};
    }
    if (!isRecord(input) || input.schema !== 1 || input.platform !== platform || input.order !== order || !isRecord(input.artifactSha256) || !Array.isArray(input.cohorts)) {
        fail(`Invalid ${platform} ${order} benchmark result.`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- evaluationReport validates every cohort and sample.
    return input as BenchmarkResult;
}

function prepareEmulator(platform: PlatformName, device: string): void {
    if (platform !== 'android') {
        return;
    }
    // The real app logs enough to rotate the default buffer before a benchmark reads its span.
    runAllowFailure('adb', ['-s', device, 'logcat', '-G', '16M']);
    // A slow hosted emulator can show "isn't responding" over the app, which would block every accessibility snapshot.
    runAllowFailure('adb', ['-s', device, 'shell', 'settings', 'put', 'global', 'hide_error_dialogs', '1']);
}

function bootSimulator(platform: PlatformName): void {
    if (platform !== 'ios') {
        fail('Only the iOS simulator is booted by this tool. The Android emulator runner boots the emulator.');
    }
    const identifier = bootIOSVerificationSimulator();
    if (process.env.GITHUB_ENV) {
        appendFileSync(process.env.GITHUB_ENV, `PGO_IOS_SIMULATOR_ID=${identifier}\n`);
    }
    console.log(`Booted iOS simulator ${identifier}.`);
}

function configureEmulatorEvaluation(): void {
    process.env.PGO_CI_EMULATOR = 'true';
    process.env.PGO_CI_WORKLOAD = 'app';
    process.env.PGO_ANDROID_RELEASE_PIPELINE = 'false';
    // R8 needs more heap than a hosted runner can spare beside the emulator; see androidEmulator.init.gradle.
    process.env.PGO_ANDROID_SHRINK = 'false';
    process.env.PGO_ANDROID_ARCH ??= 'x86_64';
    process.env.PGO_BENCHMARK_COOLDOWN_SECONDS = '5';
}

function createAdapter(platform: PlatformName, device?: string): PlatformAdapter {
    return platform === 'android' ? createAndroidPgoAdapter(undefined, device) : createIOSPgoAdapter();
}

function emulatorDevice(platform: PlatformName): string {
    if (platform === 'android') {
        return androidEmulatorIdentifier(process.env.PGO_ANDROID_ARCH);
    }
    return environmentString('PGO_IOS_SIMULATOR_ID') ?? fail('Boot the simulator first; PGO_IOS_SIMULATOR_ID is missing.');
}

function emptyTrainingResult(platform: PlatformName): TrainingResult {
    return {
        schema: 1,
        platform,
        target: platform === 'android' ? `android-emulator-${process.env.PGO_ANDROID_ARCH}` : `ios-simulator-${process.arch}`,
        status: 'failed',
        appSha: capture('git', ['rev-parse', 'HEAD']).trim(),
        mobileSha: capture('git', ['rev-parse', 'HEAD'], join(rootDirectory, 'Mobile-Expensify')).trim(),
        artifactSha256: {release: '', instrumented: '', optimized: ''},
        profileSha256: '',
        sourceIdentity: '',
        toolchain: {},
        journeyRunDurationsSeconds: [],
    };
}

function journeyDurations(batch: string): number[] {
    const result: unknown = JSON.parse(readFileSync(join(batch, 'result.json'), 'utf8'));
    const durations = isRecord(result) && Array.isArray(result.runDurationsSeconds) ? result.runDurationsSeconds : [];
    return durations.filter((value): value is number => typeof value === 'number');
}

function runScript(file: string, args: string[]): void {
    run(process.execPath, [join(rootDirectory, 'scripts/pgo', file), ...args]);
}

function publicDirectory(platform: PlatformName): string {
    const directory = join(rootDirectory, '.pgo/ci', platform);
    mkdirSync(directory, {recursive: true});
    return directory;
}

function appsDirectory(platform: PlatformName): string {
    return join(rootDirectory, '.pgo/ci', `${platform}-apps`);
}

function writePublicResult(path: string, result: TrainingResult | BenchmarkResult): void {
    writeFileSync(path, `${JSON.stringify(result, null, 2)}\n`);
}

function sha256(input: string | Buffer): string {
    return createHash('sha256').update(input).digest('hex');
}

if (import.meta.main) {
    await main();
}

export {evaluationResults, readBenchmark, readTraining};
export type {BenchmarkResult, TrainingResult};
