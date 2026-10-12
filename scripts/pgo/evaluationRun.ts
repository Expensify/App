// cspell:ignore cooldown PodLock profdata

import {spawnSync} from 'node:child_process';
/** Executes an isolated evaluation; private device evidence never enters the public result. */
import {createHash} from 'node:crypto';
import {appendFileSync, closeSync, cpSync, existsSync, mkdirSync, openSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

import type {BenchmarkSample} from '../lib/benchmarkStatistics';
import type {EvaluationCohort, EvaluationPlan, EvaluationPlatform, EvaluationResult, FrameObservation} from './evaluationSchema';
import type {PlatformAdapter} from './shared';

import {isRecord} from './evaluationSchema';

type ProofModule = {sourceIdentity: () => string; toolchainIdentity: (adapter: PlatformAdapter) => string; fileHash: (path: string) => string};
type AdapterModule = {default: (appID: string, device: string) => PlatformAdapter};
type TrainingModule = {validateTraining: (platform: EvaluationPlatform, batch: string) => {profile: string}};

const OVERLAY_FILES = ['android.ts', 'ios.ts', 'shared.ts', 'pgo.ts', 'journey.ts', 'journeyBenchmark.ts', 'journeyWorkload.ts', 'proof.ts', 'localProof.ts', 'androidRelease.init.gradle'];
const SCENARIOS = [
    {name: 'heavy-journey', action: 'benchmark-heavy-journey', spans: ['/r/*']},
    {name: 'journey', action: 'benchmark-journey', spans: ['ManualNavigateToReportsFirstPaint', 'ManualNavigateToReportsContentLoad', 'ManualNavigateToInboxTab']},
    {name: 'startup', action: 'benchmark', spans: ['ManualAppStartup']},
] as const;

async function executeEvaluation(plan: EvaluationPlan, platform: EvaluationPlatform, publicDirectory: string): Promise<void> {
    const candidate = requiredDirectory('PGO_CANDIDATE_DIRECTORY');
    const tooling = requiredDirectory('PGO_TOOLING_DIRECTORY');
    const privateDirectory = join(candidate, '.pgo', 'evaluation', `${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT}`, platform);
    mkdirSync(privateDirectory, {recursive: true});
    mkdirSync(publicDirectory, {recursive: true});
    const result: EvaluationResult = {
        schema: 1,
        platform,
        candidate: plan.candidate,
        toolingSha: plan.toolingSha,
        status: 'failed',
        artifactSha256: {release: '', instrumented: '', optimized: ''},
        profileSha256: '',
        sourceIdentity: '',
        toolchain: {},
        compilerConsumption: 'unverified',
        cohorts: [],
    };
    let stage = 'candidate-guard';
    const runPrivate = (file: string, args: string[]) => privateCommand(process.execPath, [join(candidate, 'scripts/pgo', file), ...args], candidate, privateDirectory, stage);
    try {
        verifyCandidate(plan, candidate, tooling);
        if (!plan.platforms.includes(platform)) {
            throw new Error('Platform not eligible.');
        }
        const device = requiredValue(`PGO_${platform.toUpperCase()}_DEVICE_ID`);
        const appID = requiredValue(`PGO_${platform.toUpperCase()}_APP_ID`);
        const fixture = requiredValue(`PGO_${platform.toUpperCase()}_FIXTURE_PATH`);
        // The fixture is privately provisioned on the runner; never print or copy its contents.
        const fixtureHash = sha256(readFileSync(fixture));
        process.env.ENVFILE = resolve(candidate, 'Mobile-Expensify', requiredValue(`PGO_${platform.toUpperCase()}_ENVFILE`));
        appendFileSync(join(candidate, '.git/info/exclude'), '\n/evaluation-tooling/\n/pgo-plan/\n/pgo-public/\n');
        const overlay = OVERLAY_FILES.map((file) => {
            const source = join(tooling, 'scripts/pgo', file);
            const hash = sha256(readFileSync(source));
            cpSync(source, join(candidate, 'scripts/pgo', file));
            return {file, sha256: hash};
        });
        result.toolchain.reviewedOverlaySha256 = sha256(Buffer.from(JSON.stringify(overlay)));
        configureSafeEvaluationOptions(candidate);
        const proof: unknown = await import(pathToFileURL(join(candidate, 'scripts/pgo/proof.ts')).href);
        const adapterModule: unknown = await import(pathToFileURL(join(candidate, `scripts/pgo/${platform}.ts`)).href);
        if (!isProofModule(proof) || !isAdapterModule(adapterModule)) {
            throw new Error('Reviewed evaluation module contract is missing.');
        }
        const adapter = adapterModule.default(appID, device);
        result.sourceIdentity = proof.sourceIdentity();
        const toolchain = proof.toolchainIdentity(adapter);
        result.toolchain.identitySha256 = sha256(Buffer.from(toolchain));
        result.toolchain.fixtureSha256 = fixtureHash;
        const environmentFile = process.env.ENVFILE;
        result.toolchain.environmentSha256 = sha256(readFileSync(environmentFile));
        let profilePath: string | undefined;
        const guard = () => {
            verifyCandidate(plan, candidate, tooling);
            if (proof.sourceIdentity() !== result.sourceIdentity || proof.toolchainIdentity(adapter) !== toolchain || sha256(readFileSync(fixture)) !== fixtureHash) {
                throw new Error('Frozen evaluation inputs changed.');
            }
            if (sha256(readFileSync(environmentFile)) !== result.toolchain.environmentSha256) {
                throw new Error('Build environment changed.');
            }
            if (profilePath && proof.fileHash(profilePath) !== result.profileSha256) {
                throw new Error('Frozen training profile changed.');
            }
            for (const kind of ['release', 'instrumented', 'optimized'] as const) {
                if (result.artifactSha256[kind] && proof.fileHash(adapter.artifactPaths[kind]) !== result.artifactSha256[kind]) {
                    throw new Error('Frozen artifact changed.');
                }
            }
        };
        const deviceArgs = ['--device', device, '--app-id', appID];
        const podLockPath = join(candidate, 'Mobile-Expensify/iOS/Podfile.lock');
        const originalPodLock = platform === 'ios' ? readFileSync(podLockPath) : undefined;
        let generatedPodLockHash: string | undefined;
        const build = (kind: 'release' | 'instrumented' | 'optimized', profile?: string) => {
            try {
                runPrivate('pgo.ts', [platform, `build-${kind}`, ...deviceArgs, ...(profile ? ['--profile', profile] : [])]);
                if (originalPodLock) {
                    const generated = readFileSync(podLockPath);
                    const hash = sha256(generated);
                    writeFileSync(join(privateDirectory, `${kind}-Podfile.lock`), generated, {mode: 0o600});
                    result.toolchain[`${kind}PodLockSha256`] = hash;
                    if (generatedPodLockHash && hash !== generatedPodLockHash) {
                        throw new Error('Compiled pod dependency lock changed between build modes.');
                    }
                    generatedPodLockHash = hash;
                }
            } finally {
                if (originalPodLock) {
                    writeFileSync(podLockPath, originalPodLock);
                }
            }
        };
        stage = 'account-preflight';
        runPrivate('journey.ts', [platform, '--fixture', fixture, ...deviceArgs, '--preflight']);
        for (const kind of ['release', 'instrumented'] as const) {
            stage = `build-${kind}`;
            guard();
            build(kind);
            result.artifactSha256[kind] = proof.fileHash(adapter.artifactPaths[kind]);
            guard();
        }
        stage = 'verify-instrumented';
        runPrivate('pgo.ts', [platform, 'verify-instrumented', ...deviceArgs]);
        stage = 'install-instrumented';
        runPrivate('pgo.ts', [platform, 'install-instrumented', ...deviceArgs]);
        process.env.PGO_INSTRUMENTED_BINARY_SHA256 = result.artifactSha256.instrumented;
        stage = 'training';
        const journeyRoot = join(candidate, '.pgo', platform, 'journeys');
        const previousJourneys = directoryNames(journeyRoot);
        runPrivate('journey.ts', [platform, '--fixture', fixture, ...deviceArgs, '--runs', '3', '--collect']);
        guard();
        const trainingBatch = newBatch(journeyRoot, previousJourneys);
        stage = 'validate-training';
        const validation: unknown = await import(pathToFileURL(join(candidate, 'scripts/pgo/localProof.ts')).href);
        if (!isTrainingModule(validation)) {
            throw new Error('Reviewed training validator is missing.');
        }
        const training = validation.validateTraining(platform, trainingBatch);
        profilePath = training.profile;
        result.profileSha256 = proof.fileHash(training.profile);
        stage = 'build-optimized';
        build('optimized', training.profile);
        result.artifactSha256.optimized = proof.fileHash(adapter.artifactPaths.optimized);
        guard();
        for (const {order, scenario} of benchmarkStagePlan()) {
            stage = `${scenario.name}-${order}`;
            const root = join(adapter.benchmarkDirectory, scenario.name);
            const before = directoryNames(root);
            runGuardedStage(guard, () => runPrivate('pgo.ts', [platform, scenario.action, '20', '60', ...deviceArgs, '--fixture', fixture, '--benchmark-order', order]));
            result.cohorts.push(readCohort(newBatch(root, before), scenario.name, order, [...scenario.spans], device, appID));
        }
        result.status = 'passed';
    } catch {
        result.failureStage = stage;
        // The detailed error and raw device output stay private on the runner.
        console.error(`PGO evaluation failed at ${stage}. Private runner evidence retained.`);
    } finally {
        writeFileSync(join(publicDirectory, `evaluation-${platform}.json`), `${JSON.stringify(result, null, 2)}\n`);
    }
    if (result.status !== 'passed') {
        throw new Error('PGO evaluation did not complete.');
    }
}

function readCohort(batch: string, scenario: EvaluationCohort['scenario'], order: EvaluationCohort['order'], spans: string[], device: string, appID: string): EvaluationCohort {
    const metadata: unknown = JSON.parse(readFileSync(join(batch, 'run.json'), 'utf8'));
    if (
        !isRecord(metadata) ||
        metadata.deviceID !== device ||
        metadata.appID !== appID ||
        metadata.order !== order ||
        metadata.runs !== 20 ||
        metadata.warmUpRunsPerBinary !== 1 ||
        metadata.cooldownSecondsPerBinary !== 5
    ) {
        throw new Error('Benchmark context does not match the verified plan.');
    }
    const releasePath = join(batch, 'release.csv');
    const optimizedPath = join(batch, scenario === 'startup' ? 'optimized.csv' : 'pgo-optimized.csv');
    return {
        scenario,
        order,
        spans,
        runs: 20,
        warmUpRunsPerBinary: 1,
        cooldownSecondsPerBinary: 5,
        release: readSamples(releasePath, spans),
        optimized: readSamples(optimizedPath, spans),
        releaseCsvSha256: sha256(readFileSync(releasePath)),
        optimizedCsvSha256: sha256(readFileSync(optimizedPath)),
        ...(scenario === 'heavy-journey' && metadata.platform === 'android'
            ? {
                  frames: {
                      release: readPublicFrames(join(batch, 'release-frames.json')),
                      optimized: readPublicFrames(join(batch, 'pgo-optimized-frames.json')),
                  },
              }
            : {}),
    };
}

function readPublicFrames(path: string): FrameObservation[] {
    if (!existsSync(path)) {
        return Array.from({length: 20}, (_, index) => ({run: index + 1, status: 'unavailable'}));
    }
    const input: unknown = JSON.parse(readFileSync(path, 'utf8'));
    if (!isRecord(input) || input.schema !== 1 || input.requestedRuns !== 20 || !Array.isArray(input.samples) || input.samples.length !== 20) {
        throw new Error('Unexpected optional frame coverage.');
    }
    return input.samples.map((sample: unknown, index) => {
        if (!isRecord(sample) || sample.run !== index + 1) {
            throw new Error('Optional frame run identity changed.');
        }
        if (sample.status === 'unavailable') {
            return {run: sample.run, status: 'unavailable'};
        }
        const metrics = sample.metrics;
        if (
            sample.status !== 'available' ||
            !isRecord(metrics) ||
            typeof metrics.totalFrames !== 'number' ||
            !Number.isSafeInteger(metrics.totalFrames) ||
            metrics.totalFrames <= 0 ||
            typeof metrics.droppedFrames !== 'number' ||
            !Number.isSafeInteger(metrics.droppedFrames) ||
            metrics.droppedFrames < 0 ||
            metrics.droppedFrames > metrics.totalFrames ||
            typeof metrics.droppedPercent !== 'number' ||
            !Number.isFinite(metrics.droppedPercent) ||
            metrics.droppedPercent < 0 ||
            metrics.droppedPercent > 100 ||
            typeof metrics.sampleWindowMs !== 'number' ||
            !Number.isFinite(metrics.sampleWindowMs) ||
            metrics.sampleWindowMs <= 0
        ) {
            throw new Error('Invalid optional frame metrics.');
        }
        return {
            run: sample.run,
            status: 'available',
            totalFrames: metrics.totalFrames,
            jankyFrames: metrics.droppedFrames,
            originalPercent: metrics.droppedPercent,
            sampleWindowMs: metrics.sampleWindowMs,
        };
    });
}

function readSamples(path: string, spans: string[]): BenchmarkSample[] {
    const lines = readFileSync(path, 'utf8').trim().split('\n');
    if (lines.shift() !== 'run,span,duration_ms') {
        throw new Error('Unexpected benchmark CSV format.');
    }
    const samples = lines.map((line) => {
        const [run, span, duration] = line.trim().split(',');
        return {run: Number(run), span, durationMs: Number(duration)};
    });
    if (
        samples.length !== 20 * spans.length ||
        samples.some(
            (sample) => !Number.isInteger(sample.run) || sample.run < 1 || sample.run > 20 || !spans.includes(sample.span) || !Number.isFinite(sample.durationMs) || sample.durationMs < 0,
        ) ||
        new Set(samples.map((sample) => `${sample.run}:${sample.span}`)).size !== samples.length
    ) {
        throw new Error('Expected twenty complete samples for every span.');
    }
    return samples;
}

function verifyCandidate(plan: EvaluationPlan, candidate: string, tooling: string): void {
    const git = (cwd: string, args: string[]) => {
        const result = spawnSync('git', args, {cwd, encoding: 'utf8'});
        if (result.status !== 0) {
            throw new Error('Cannot verify immutable checkout.');
        }
        return result.stdout.trim();
    };
    const packageManifest: unknown = JSON.parse(readFileSync(join(candidate, 'package.json'), 'utf8'));
    if (
        !isRecord(packageManifest) ||
        packageManifest.version !== plan.candidate.version ||
        git(candidate, ['rev-parse', 'HEAD']) !== plan.candidate.appSha ||
        git(join(candidate, 'Mobile-Expensify'), ['rev-parse', 'HEAD']) !== plan.candidate.mobileSha ||
        git(tooling, ['rev-parse', 'HEAD']) !== plan.toolingSha ||
        git(candidate, ['ls-tree', 'HEAD', 'Mobile-Expensify']).split(/\s+/).at(2) !== plan.candidate.mobileSha
    ) {
        throw new Error('Immutable candidate pins do not match.');
    }
}

function privateCommand(command: string, args: string[], cwd: string, directory: string, stage: string): void {
    const descriptor = openSync(join(directory, `${stage}.log`), 'a', 0o600);
    try {
        const result = spawnSync(command, args, {cwd, env: process.env, stdio: ['ignore', descriptor, descriptor]});
        if (result.status !== 0) {
            throw new Error('Private evaluation stage failed.');
        }
    } finally {
        closeSync(descriptor);
    }
}

function requiredDirectory(name: string): string {
    const value = resolve(requiredValue(name));
    if (!existsSync(value)) {
        throw new Error('Missing evaluation checkout.');
    }
    return value;
}
function requiredValue(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error('Missing provisioned evaluation configuration.');
    }
    return value;
}
function directoryNames(path: string): Set<string> {
    return new Set(existsSync(path) ? readdirSync(path) : []);
}
function newBatch(path: string, previous: Set<string>): string {
    const added = readdirSync(path).filter((name) => !previous.has(name));
    if (added.length !== 1) {
        throw new Error('Expected one isolated evidence batch.');
    }
    const name = added.at(0);
    if (!name) {
        throw new Error('Missing isolated evidence batch.');
    }
    return join(path, name);
}
function sha256(bytes: Buffer): string {
    return createHash('sha256').update(bytes).digest('hex');
}

function isProofModule(input: unknown): input is ProofModule {
    return isRecord(input) && typeof input.sourceIdentity === 'function' && typeof input.toolchainIdentity === 'function' && typeof input.fileHash === 'function';
}
function isAdapterModule(input: unknown): input is AdapterModule {
    return isRecord(input) && typeof input.default === 'function';
}
function isTrainingModule(input: unknown): input is TrainingModule {
    return isRecord(input) && typeof input.validateTraining === 'function';
}

function benchmarkStagePlan() {
    return (['release-first', 'optimized-first'] as const).flatMap((order) => SCENARIOS.map((scenario) => ({order, scenario})));
}

function configureSafeEvaluationOptions(candidate: string): void {
    process.env.PGO_ANDROID_RELEASE_PIPELINE = 'false';
    process.env.PGO_ANDROID_SHRINK = 'true';
    process.env.PGO_BENCHMARK_COOLDOWN_SECONDS = '5';
    process.env.PATH = `${join(candidate, 'node_modules/.bin')}:${process.env.PATH ?? ''}`;
}

function runGuardedStage<T>(guard: () => void, execute: () => T): T {
    guard();
    const result = execute();
    guard();
    return result;
}

export {benchmarkStagePlan, configureSafeEvaluationOptions, executeEvaluation, readCohort, readPublicFrames, readSamples, runGuardedStage};
