// cspell:ignore cooldown Cooldown

/** Runs separate read-only signed-in navigation and heavy-report benchmarks. */

// cspell:ignore gfxinfo

import {isRecord} from '@libs/ObjectUtils';

import {createHash} from 'node:crypto';
import {createReadStream, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, readlinkSync, writeFileSync} from 'node:fs';
import {join, relative} from 'node:path';

import type {BenchmarkLogEvent} from '../lib/nativeAppBenchmark';
import type {JourneyFixture} from './journeyConfig';
import type {PlatformAdapter, BenchmarkKind} from './shared';

import {createBenchmarkRecorder} from '../lib/benchmarkAppStartup';
import {benchmarkMetrics, readBenchmarkSamples} from '../lib/benchmarkStatistics';
import {capture, fail} from '../lib/scriptUtils';
import createAndroidJourneyBenchmarkReader from './journeyBenchmarkAndroid';
import createIOSJourneyBenchmarkReader from './journeyBenchmarkIOS';
import {createJourneyDevice} from './journeyDevice';
import {openReport, scrollFastBothWays, selectSpendSection, showTab, verifyJourneyAccount, waitForTab} from './journeyWorkload';
import {benchmarkCooldownSeconds, cooldownBeforeBenchmark, HEAVY_JOURNEY_SPAN_NAMES, JOURNEY_SPAN_NAMES} from './shared';

type JourneyBenchmarkReader = {
    begin: (spanNames: readonly string[]) => void;
    collect: (spanNames: readonly string[], timeoutSeconds: number) => Promise<BenchmarkLogEvent[]>;
};

type FrameHealth = {totalFrames: number; droppedFrames: number; droppedPercent: number; sampleWindowMs: number};
type FrameHealthResult = {status: 'available'; metrics: FrameHealth; raw: unknown} | {status: 'unavailable'; reason: string; raw: unknown};
type JourneyMeasurement = {events: BenchmarkLogEvent[]; frameTelemetry?: FrameHealthResult};
type BenchmarkOrder = 'release-first' | 'optimized-first';

type JourneyScenario = {
    directory: 'journey' | 'heavy-journey';
    spanNames: readonly string[];
    measure: (device: ReturnType<typeof createJourneyDevice>, reader: JourneyBenchmarkReader, fixture: JourneyFixture, timeoutSeconds: number) => Promise<JourneyMeasurement>;
};

const SHORT_JOURNEY: JourneyScenario = {directory: 'journey', spanNames: JOURNEY_SPAN_NAMES, measure: measureJourney};
const HEAVY_JOURNEY: JourneyScenario = {directory: 'heavy-journey', spanNames: HEAVY_JOURNEY_SPAN_NAMES, measure: measureHeavyJourney};

function journeyBenchmarkPaths(
    adapter: Pick<PlatformAdapter, 'benchmarkDirectory'>,
    batchID: string,
    scenarioDirectory: JourneyScenario['directory'] = 'journey',
): Record<BenchmarkKind, string> {
    const directory = join(adapter.benchmarkDirectory, scenarioDirectory, batchID);
    return {release: join(directory, 'release.csv'), optimized: join(directory, 'pgo-optimized.csv')};
}

/** Installs the selected build, discards one complete warm-up, then records every requested run. */
async function benchmarkJourneyBuild(
    adapter: PlatformAdapter,
    kind: BenchmarkKind,
    deviceID: string,
    fixture: JourneyFixture,
    runs: number,
    timeoutSeconds: number,
    outputPath: string,
    scenario: JourneyScenario,
): Promise<void> {
    console.log(`Installing ${kind} artifact: ${adapter.artifactPaths[kind]}`);
    adapter.install(kind);
    await cooldownBeforeBenchmark();

    const device = createJourneyDevice({platform: adapter.name, device: deviceID, appID: adapter.appID(), session: `pgo-${scenario.directory}-${adapter.name}-${kind}-${Date.now()}`});
    const reader: JourneyBenchmarkReader =
        adapter.name === 'android' ? createAndroidJourneyBenchmarkReader(deviceID, adapter.appID()) : createIOSJourneyBenchmarkReader(deviceID, adapter.appID());
    try {
        device.open(false);
        await showTab(device, 'Inbox');
        await verifyJourneyAccount(device, fixture);
        console.log(`Running one unmeasured ${kind} ${scenario.directory} warm-up.`);
        await scenario.measure(device, reader, fixture, timeoutSeconds);

        const recorder = createBenchmarkRecorder({spanNames: [...scenario.spanNames], runs, outputPath});
        const frameSamples: Array<FrameHealthResult & {run: number}> = [];
        for (let runNumber = 1; runNumber <= runs; runNumber += 1) {
            const measurement = await scenario.measure(device, reader, fixture, timeoutSeconds);
            console.log(`${kind} ${scenario.directory} ${runNumber}/${runs}: ${recorder.record(measurement.events, runNumber).join(', ')}`);
            if (measurement.frameTelemetry) {
                frameSamples.push({run: runNumber, ...measurement.frameTelemetry});
                if (measurement.frameTelemetry.status === 'available') {
                    const {totalFrames, droppedFrames, droppedPercent} = measurement.frameTelemetry.metrics;
                    console.log(`Android frame window: ${droppedFrames}/${totalFrames} native janky frames (${droppedPercent.toFixed(1)}%).`);
                } else {
                    console.log(`Android frame telemetry unavailable for run ${runNumber}: ${measurement.frameTelemetry.reason}`);
                }
            }
        }
        await verifyJourneyAccount(device, fixture);
        await recorder.complete(`${kind} ${scenario.directory} metrics`);
        if (frameSamples.length > 0) {
            writeFileSync(
                outputPath.replace(/\.csv$/, '-frames.json'),
                `${JSON.stringify({schema: 1, requestedRuns: runs, samples: frameSamples, resetVerified: false, isolatedScrollWindowVerified: false}, null, 2)}\n`,
            );
            const rows = frameSamples.flatMap((sample) => {
                if (sample.status !== 'available') {
                    return [];
                }
                const {totalFrames, droppedFrames, droppedPercent, sampleWindowMs} = sample.metrics;
                return [`${sample.run},${totalFrames},${droppedFrames},${droppedPercent},${sampleWindowMs}`];
            });
            writeFileSync(outputPath.replace(/\.csv$/, '-frames.csv'), `run,totalFrames,droppedFrames,droppedPercent,sampleWindowMs\n${rows.join('\n')}\n`);
        }
    } finally {
        try {
            device.command('close');
        } catch (error) {
            console.error(`Device cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}

/** Uses a new app process for each sample; automation latency is outside the timed spans. */
async function measureJourney(device: ReturnType<typeof createJourneyDevice>, reader: JourneyBenchmarkReader, _fixture: JourneyFixture, timeoutSeconds: number): Promise<JourneyMeasurement> {
    device.open(true);
    await waitForTab(device, 'Account');
    // Normalize the saved Spend view before timing either tab transition. This makes the measured taps warm navigations from a known Expenses state.
    await showTab(device, 'Spend');
    selectSpendSection(device, 'Expenses');
    device.waitLabel('Filters');
    await showTab(device, 'Inbox');
    device.waitLabel('All');

    const spendSpans = JOURNEY_SPAN_NAMES.slice(0, 2);
    const inboxSpans = [JOURNEY_SPAN_NAMES[2]];
    reader.begin(spendSpans);
    await showTab(device, 'Spend');
    device.waitLabel('Filters');
    const spendEvents = await reader.collect(spendSpans, timeoutSeconds);

    reader.begin(inboxSpans);
    await showTab(device, 'Inbox');
    device.waitLabel('All');
    const inboxEvents = await reader.collect(inboxSpans, timeoutSeconds);
    return {events: [...spendEvents, ...inboxEvents]};
}

/** Opens a populated chat and fast-scrolls its history; device-command time is never a benchmark sample. */
async function measureHeavyJourney(
    device: ReturnType<typeof createJourneyDevice>,
    reader: JourneyBenchmarkReader,
    fixture: JourneyFixture,
    timeoutSeconds: number,
): Promise<JourneyMeasurement> {
    device.open(true);
    await showTab(device, 'Inbox');
    await waitForTab(device, 'Account');
    await openReport(device, fixture.report, false, () => reader.begin(HEAVY_JOURNEY_SPAN_NAMES));
    const events = await reader.collect(HEAVY_JOURNEY_SPAN_NAMES, timeoutSeconds);
    // The sampler requests a reset after reading; actual reset success is not verified.
    const beforeFrames = device.platform === 'android' ? readAndroidFrameHealth(device, false) : undefined;
    scrollFastBothWays(device, Math.min(fixture.scrolls, 4));
    const afterFrames = device.platform === 'android' ? readAndroidFrameHealth(device, true) : undefined;
    const frameTelemetry = beforeFrames && afterFrames ? frameWindowResult(beforeFrames, afterFrames) : undefined;
    await showTab(device, 'Inbox');
    return {events, frameTelemetry};
}

/** Ancillary frame telemetry cannot erase otherwise complete native timing samples. */
function readAndroidFrameHealth(device: ReturnType<typeof createJourneyDevice>, requireFrames: boolean): FrameHealthResult {
    try {
        return parseAndroidFrameHealth(device.command('perf', 'frames'), requireFrames);
    } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        return {status: 'unavailable', reason, raw: {commandError: reason}};
    }
}

function frameWindowResult(before: FrameHealthResult, after: FrameHealthResult): FrameHealthResult {
    const raw = {before: before.raw, after: after.raw};
    if (before.status === 'unavailable') {
        return {status: 'unavailable', reason: `Pre-scroll sampler unavailable; window boundary unverified: ${before.reason}`, raw};
    }
    return {...after, raw};
}

function parseAndroidFrameHealth(result: unknown, requireFrames: boolean): FrameHealthResult {
    const unavailable = (reason: string): FrameHealthResult => ({status: 'unavailable', reason, raw: result});
    if (!isRecord(result) || !isRecord(result.metrics) || !isRecord(result.metrics.fps) || !isRecord(result.sampling) || !isRecord(result.sampling.fps)) {
        return unavailable('Android frame sampler returned an unexpected result.');
    }
    if (result.sampling.fps.resetsAfterRead !== true) {
        return unavailable('Android frame sampler does not declare reset-after-read support; reset success is not verified.');
    }
    if (result.metrics.fps.available !== true) {
        const reason = typeof result.metrics.fps.reason === 'string' ? result.metrics.fps.reason : 'No sampler reason provided.';
        return unavailable(`Android frame sampler unavailable: ${reason}`);
    }
    const {totalFrameCount, droppedFrameCount, droppedFramePercent, sampleWindowMs} = result.metrics.fps;
    if (
        typeof totalFrameCount !== 'number' ||
        typeof droppedFrameCount !== 'number' ||
        typeof droppedFramePercent !== 'number' ||
        typeof sampleWindowMs !== 'number' ||
        ![totalFrameCount, droppedFrameCount, droppedFramePercent, sampleWindowMs].every(Number.isFinite) ||
        !Number.isInteger(totalFrameCount) ||
        !Number.isInteger(droppedFrameCount) ||
        totalFrameCount < 0 ||
        droppedFrameCount < 0 ||
        droppedFrameCount > totalFrameCount ||
        droppedFramePercent < 0 ||
        droppedFramePercent > 100 ||
        sampleWindowMs < 0
    ) {
        return unavailable('Android frame sampler returned invalid frame counts or window.');
    }
    if (requireFrames && (totalFrameCount === 0 || sampleWindowMs === 0)) {
        return unavailable('No frames or positive frame window were available for this scroll sample.');
    }
    return {status: 'available', metrics: {totalFrames: totalFrameCount, droppedFrames: droppedFrameCount, droppedPercent: droppedFramePercent, sampleWindowMs}, raw: result};
}

async function benchmarkJourneyAll(
    adapter: PlatformAdapter,
    deviceID: string,
    fixture: JourneyFixture,
    runs: number,
    timeoutSeconds: number,
    order: BenchmarkOrder = 'release-first',
): Promise<void> {
    await benchmarkJourneyScenario(adapter, deviceID, fixture, runs, timeoutSeconds, SHORT_JOURNEY, order);
}

async function benchmarkHeavyJourneyAll(
    adapter: PlatformAdapter,
    deviceID: string,
    fixture: JourneyFixture,
    runs: number,
    timeoutSeconds: number,
    order: BenchmarkOrder = 'release-first',
): Promise<void> {
    await benchmarkJourneyScenario(adapter, deviceID, fixture, runs, timeoutSeconds, HEAVY_JOURNEY, order);
}

async function benchmarkJourneyScenario(
    adapter: PlatformAdapter,
    deviceID: string,
    fixture: JourneyFixture,
    runs: number,
    timeoutSeconds: number,
    scenario: JourneyScenario,
    order: BenchmarkOrder,
): Promise<void> {
    const batchID = new Date().toISOString().replaceAll(/[:.]/g, '-');
    const paths = journeyBenchmarkPaths(adapter, batchID, scenario.directory);
    const directory = join(adapter.benchmarkDirectory, scenario.directory, batchID);
    if (existsSync(directory)) {
        fail(`Journey benchmark batch already exists: ${directory}`);
    }
    mkdirSync(directory, {recursive: true});
    writeFileSync(
        join(directory, 'run.json'),
        `${JSON.stringify(
            {
                platform: adapter.name,
                deviceID,
                appID: adapter.appID(),
                accountEmail: fixture.accountEmail,
                runs,
                timeoutSeconds,
                order,
                warmUpRunsPerBinary: 1,
                cooldownSecondsPerBinary: benchmarkCooldownSeconds(),
                thermalStateVerified: false,
                scenario: scenario.directory,
                spans: scenario.spanNames,
                ...(scenario === HEAVY_JOURNEY
                    ? {
                          scrollsPerDirection: Math.min(fixture.scrolls, 4),
                          scrollDurationMs: 120,
                          scrollTimeMeasured: false,
                          androidScrollFrameHealthMeasured: false,
                          androidFrameTelemetry: 'optional; per-sample availability recorded; reset and isolated window unverified',
                          iosScrollFrameHealthMeasured: false,
                      }
                    : {}),
                sourceRevision: capture('git', ['rev-parse', 'HEAD']).trim(),
                mobileRevision: capture('git', ['-C', 'Mobile-Expensify', 'rev-parse', 'HEAD']).trim(),
                artifacts: adapter.artifactPaths,
                artifactSHA256: {
                    release: await sha256Artifact(adapter.artifactPaths.release),
                    optimized: await sha256Artifact(adapter.artifactPaths.optimized),
                },
            },
            null,
            2,
        )}\n`,
    );
    console.log(`${scenario.directory} benchmark batch: ${directory}`);
    const phases: BenchmarkKind[] = order === 'release-first' ? ['release', 'optimized'] : ['optimized', 'release'];
    for (const [index, kind] of phases.entries()) {
        console.log(`=== ${scenario.directory} benchmark phase ${index + 1}/2: ${kind} ===`);
        await benchmarkJourneyBuild(adapter, kind, deviceID, fixture, runs, timeoutSeconds, paths[kind], scenario);
    }
    await compareJourneyBenchmarks(paths, runs, scenario, adapter.name);
}

async function compareJourneyBenchmarks(paths: Record<BenchmarkKind, string>, runs: number, scenario: JourneyScenario, platform: PlatformAdapter['name']): Promise<void> {
    if (!existsSync(paths.release) || !existsSync(paths.optimized)) {
        fail('Missing paired journey samples in this benchmark batch.');
    }
    const [releaseSamples, optimizedSamples] = await Promise.all([readBenchmarkSamples(paths.release), readBenchmarkSamples(paths.optimized)]);
    const release = benchmarkMetrics(releaseSamples, scenario.spanNames);
    const optimized = benchmarkMetrics(optimizedSamples, scenario.spanNames);

    console.log(`=== ${scenario.directory} benchmark comparison (positive percentages are faster) ===`);
    for (const span of scenario.spanNames) {
        const baseline = release[span]?.stats;
        const pgo = optimized[span]?.stats;
        if (!baseline || !pgo || baseline.runs !== runs || pgo.runs !== runs) {
            fail(`Expected ${runs} paired ${span} samples in this journey benchmark batch.`);
        }
        const improvement = ((baseline.average - pgo.average) / baseline.average) * 100;
        console.log(`${span}: release ${baseline.average.toFixed(2)} ms, PGO ${pgo.average.toFixed(2)} ms, ${improvement.toFixed(2)}% (${baseline.runs}/${pgo.runs} runs)`);
    }
    if (scenario === HEAVY_JOURNEY && platform === 'android') {
        const releaseFrames = readAndroidFrameSamples(paths.release.replace(/\.csv$/, '-frames.json'), runs);
        const optimizedFrames = readAndroidFrameSamples(paths.optimized.replace(/\.csv$/, '-frames.json'), runs);
        console.log(
            `Android frame telemetry availability: release ${releaseFrames.available}/${runs}, PGO ${optimizedFrames.available}/${runs}. Reset and isolated scroll window are unverified; no scrolling gain is inferred.`,
        );
    }
    console.log(`Raw journey samples: ${paths.release} and ${paths.optimized}`);
}

function readAndroidFrameSamples(path: string, runs: number): {available: number} {
    const evidence: unknown = JSON.parse(readFileSync(path, 'utf8'));
    if (!isRecord(evidence) || !Array.isArray(evidence.samples) || evidence.samples.length !== runs) {
        fail(`Expected ${runs} Android frame telemetry statuses in ${path}.`);
    }
    let available = 0;
    for (const [index, sample] of evidence.samples.entries()) {
        if (!isRecord(sample) || sample.run !== index + 1 || !['available', 'unavailable'].includes(String(sample.status))) {
            fail(`Invalid Android frame telemetry status ${index + 1} in ${path}.`);
        }
        if (sample.status === 'available') {
            available += 1;
        }
    }
    return {available};
}

async function sha256Artifact(path: string): Promise<string> {
    if (lstatSync(path).isDirectory()) {
        return sha256Directory(path);
    }
    const hash = capture('shasum', ['-a', '256', path]).trim().split(/\s+/).at(0);
    if (!hash || !/^[\da-f]{64}$/.test(hash)) {
        fail(`Could not record the benchmark artifact SHA-256 for ${path}.`);
    }
    return hash;
}

/** Include every bundle file, relative path, directory and symlink in a deterministic iOS artifact digest. */
async function sha256Directory(directory: string): Promise<string> {
    const hash = createHash('sha256');
    async function visit(path: string): Promise<void> {
        for (const name of readdirSync(path).toSorted()) {
            const child = join(path, name);
            const details = lstatSync(child);
            hash.update(relative(directory, child)).update('\0');
            if (details.isDirectory()) {
                hash.update('directory\0');
                await visit(child);
            } else if (details.isSymbolicLink()) {
                hash.update('link\0').update(readlinkSync(child)).update('\0');
            } else if (details.isFile()) {
                hash.update('file\0').update(String(details.size)).update('\0');
                for await (const chunk of createReadStream(child)) {
                    const bytes: unknown = chunk;
                    if (!Buffer.isBuffer(bytes)) {
                        fail(`Artifact file did not stream bytes: ${child}`);
                    }
                    hash.update(bytes);
                }
            } else {
                fail(`Unsupported artifact entry in ${directory}: ${child}`);
            }
        }
    }
    await visit(directory);
    return hash.digest('hex');
}

export {benchmarkHeavyJourneyAll, benchmarkJourneyAll, journeyBenchmarkPaths, sha256Artifact, parseAndroidFrameHealth, frameWindowResult};
export type {BenchmarkOrder};
