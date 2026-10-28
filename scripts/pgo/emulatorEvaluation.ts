#!/usr/bin/env bun
// cspell:ignore cooldown profdata sdcard simctl
/** Train and benchmark the real app on disposable emulators with the release-candidate evaluation plan. */
import {createHash} from 'node:crypto';
import {appendFileSync, copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {basename, join, relative} from 'node:path';

import type {PlatformName} from '../lib/nativeAppBenchmark';
import type {EvaluationCohort, EvaluationPlan, EvaluationResult} from './evaluationSchema';
import type {BenchmarkOrder} from './journeyBenchmark';
import type {JourneyFixture} from './journeyConfig';
import type {JourneyDevice} from './journeyDevice';
import type {PlatformAdapter} from './shared';

import {PLATFORM_NAMES} from '../lib/nativeAppBenchmark';
import {capture, environmentString, fail, findFiles, parseChoice, rootDirectory, run, runAllowFailure, sleep} from '../lib/scriptUtils';
import createAndroidPgoAdapter from './android';
import {androidEmulatorIdentifier} from './emulator';
import {EMULATOR_SIGN_IN_FILE, parseEmulatorSignIn} from './emulatorSignIn';
import {evaluationReport} from './evaluationReport';
import {benchmarkStagePlan, directoryNames, newBatch, readCohort} from './evaluationRun';
import {isGitID, isRecord} from './evaluationSchema';
import createIOSPgoAdapter from './ios';
import {bootIOSVerificationSimulator} from './iosSimulator';
import {parseJourneyFixture} from './journeyConfig';
import {createJourneyDevice} from './journeyDevice';
import {waitForTab} from './journeyWorkload';
import {validateTraining} from './localProof';
import {fileHash, sourceIdentity, toolchainIdentity} from './proof';

const BENCHMARK_ORDERS = ['release-first', 'optimized-first'] as const;
const APPS_ARCHIVE = 'apps.tar';
const SIGN_IN_TIMEOUT_MS = 180_000;

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
    const {path: fixturePath, fixture} = readFixture();
    const output = publicDirectory(platform);
    const result = emptyTrainingResult(platform);
    const deviceArgs = ['--fixture', fixturePath, '--device', device, '--app-id', adapter.appID()];
    let stage = 'install-instrumented';
    try {
        result.artifactSha256.release = fileHash(adapter.artifactPaths.release);
        result.artifactSha256.instrumented = fileHash(adapter.artifactPaths.instrumented);
        result.sourceIdentity = sourceIdentity();
        prepareEmulator(platform, device);
        adapter.install('instrumented');
        stage = 'account-preflight';
        await signInEmulator(platform, device, adapter, fixture);
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
        result.toolchain = {identitySha256: sha256(toolchainIdentity(adapter)), fixtureSha256: sha256(readFileSync(fixturePath))};
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
    const {path: fixturePath, fixture} = readFixture();
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
        await signInEmulator(platform, device, adapter, fixture);
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

/** Place the CI account's partner login on the device, then wait until the CI entry has signed the app in. */
async function signInEmulator(platform: PlatformName, device: string, adapter: PlatformAdapter, fixture: JourneyFixture): Promise<void> {
    const signIn = parseEmulatorSignIn({
        email: process.env.PGO_EMULATOR_ACCOUNT_EMAIL,
        partnerUserID: process.env.PGO_EMULATOR_PARTNER_USER_ID,
        partnerUserSecret: process.env.PGO_EMULATOR_PARTNER_USER_SECRET,
        partnerName: process.env.PGO_EMULATOR_PARTNER_NAME,
        partnerPassword: process.env.PGO_EMULATOR_PARTNER_PASSWORD,
    });
    if (signIn.email.toLowerCase() !== fixture.accountEmail.toLowerCase()) {
        fail('The journey fixture must describe the CI test account.');
    }
    const appID = adapter.appID();
    if (platform === 'ios') {
        // Build the automation's XCTest runner once, outside the per-command timeout used by every journey step.
        run('agent-device', ['prepare', 'ios-runner', '--platform', 'ios', '--udid', device, '--timeout', '1200000']);
    }
    const session = createJourneyDevice({platform, device, appID, session: `pgo-${platform}-sign-in-${Date.now()}`});
    try {
        if (platform === 'android') {
            // The app creates its files directory on first launch. A directory that adb created first could belong to the shell user instead.
            session.open(true);
            await waitForAndroidFilesDirectory(device, appID);
            pushAndroidSignIn(device, appID, JSON.stringify(signIn));
        } else {
            const documents = join(capture('xcrun', ['simctl', 'get_app_container', device, appID, 'data']).trim(), 'Documents');
            mkdirSync(documents, {recursive: true});
            writeFileSync(join(documents, EMULATOR_SIGN_IN_FILE), JSON.stringify(signIn), {mode: 0o600});
        }
        session.open(true);
        acceptPermissionAlert(session);
        const deadline = Date.now() + SIGN_IN_TIMEOUT_MS;
        for (;;) {
            try {
                await waitForTab(session, 'Inbox');
                break;
            } catch (error) {
                // The sign-in screen stays visible until Authenticate returns and the account's first data load mounts the tabs.
                if (Date.now() > deadline) {
                    throw error;
                }
            }
            await sleep(2000);
        }
        acceptPermissionAlert(session);
    } finally {
        session.command('close');
    }
}

async function waitForAndroidFilesDirectory(device: string, appID: string): Promise<void> {
    const deadline = Date.now() + SIGN_IN_TIMEOUT_MS;
    while (!runAllowFailure('adb', ['-s', device, 'shell', 'test', '-d', androidFilesDirectory(appID)])) {
        if (Date.now() > deadline) {
            fail(`The app did not create ${androidFilesDirectory(appID)} after launching.`);
        }
        await sleep(1000);
    }
}

function pushAndroidSignIn(device: string, appID: string, contents: string): void {
    const temporary = mkdtempSync(join(tmpdir(), 'pgo-sign-in-'));
    try {
        const path = join(temporary, EMULATOR_SIGN_IN_FILE);
        writeFileSync(path, contents, {mode: 0o600});
        run('adb', ['-s', device, 'push', path, `${androidFilesDirectory(appID)}/${EMULATOR_SIGN_IN_FILE}`]);
    } finally {
        rmSync(temporary, {recursive: true, force: true});
    }
}

function androidFilesDirectory(appID: string): string {
    return `/sdcard/Android/data/${appID}/files`;
}

/** The iOS simulator cannot pre-grant notifications, so accept the one prompt a fresh install shows. */
function acceptPermissionAlert(session: JourneyDevice): void {
    if (session.platform !== 'ios') {
        return;
    }
    try {
        session.command('alert', 'wait', '10000');
        session.command('alert', 'accept');
    } catch {
        // No prompt appeared, or it was already answered.
    }
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

function readFixture(): {path: string; fixture: JourneyFixture} {
    const path = environmentString('PGO_EMULATOR_FIXTURE_PATH') ?? fail('PGO_EMULATOR_FIXTURE_PATH must point to the CI account journey fixture.');
    return {path, fixture: parseJourneyFixture(JSON.parse(readFileSync(path, 'utf8')))};
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
