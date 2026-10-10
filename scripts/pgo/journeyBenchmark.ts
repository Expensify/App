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
import {HEAVY_JOURNEY_SPAN_NAMES, JOURNEY_SPAN_NAMES} from './shared';

type JourneyBenchmarkReader = {
    begin: (spanNames: readonly string[]) => void;
    collect: (spanNames: readonly string[], timeoutSeconds: number) => Promise<BenchmarkLogEvent[]>;
};

type FrameHealth = {totalFrames: number; droppedFrames: number; droppedPercent: number; sampleWindowMs: number};
type JourneyMeasurement = {events: BenchmarkLogEvent[]; frameHealth?: FrameHealth};
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
        const frameRows: string[] = [];
        for (let runNumber = 1; runNumber <= runs; runNumber += 1) {
            const measurement = await scenario.measure(device, reader, fixture, timeoutSeconds);
            console.log(`${kind} ${scenario.directory} ${runNumber}/${runs}: ${recorder.record(measurement.events, runNumber).join(', ')}`);
            if (measurement.frameHealth) {
                const {totalFrames, droppedFrames, droppedPercent, sampleWindowMs} = measurement.frameHealth;
                frameRows.push(`${runNumber},${totalFrames},${droppedFrames},${droppedPercent},${sampleWindowMs}`);
                console.log(`Android scroll frames: ${droppedFrames}/${totalFrames} missed deadlines (${droppedPercent.toFixed(1)}%).`);
            }
        }
        await verifyJourneyAccount(device, fixture);
        await recorder.complete(`${kind} ${scenario.directory} metrics`);
        if (frameRows.length > 0) {
            if (frameRows.length !== runs) {
                fail(`Only ${frameRows.length}/${runs} Android scroll frame samples were recorded.`);
            }
            writeFileSync(outputPath.replace(/\.csv$/, '-frames.csv'), `run,totalFrames,droppedFrames,droppedPercent,sampleWindowMs\n${frameRows.join('\n')}\n`);
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
    if (device.platform === 'android') {
        // Android gfxinfo resets after each read. Exclude search and report opening from this frame window.
        readAndroidFrameHealth(device, false);
    }
    scrollFastBothWays(device, Math.min(fixture.scrolls, 4));
    const frameHealth = device.platform === 'android' ? readAndroidFrameHealth(device, true) : undefined;
    await showTab(device, 'Inbox');
    return {events, frameHealth};
}

function readAndroidFrameHealth(device: ReturnType<typeof createJourneyDevice>, requireFrames: boolean): FrameHealth | undefined {
    const result = device.command('perf', 'frames');
    if (!isRecord(result) || !isRecord(result.metrics) || !isRecord(result.metrics.fps) || !isRecord(result.sampling) || !isRecord(result.sampling.fps)) {
        throw new Error('Android frame sampler returned an unexpected result.');
    }
    if (result.sampling.fps.resetsAfterRead !== true || result.metrics.fps.available !== true) {
        throw new Error('Android frame sampler is unavailable or did not reset its counter.');
    }
    const {totalFrameCount, droppedFrameCount, droppedFramePercent, sampleWindowMs} = result.metrics.fps;
    if (
        typeof totalFrameCount !== 'number' ||
        typeof droppedFrameCount !== 'number' ||
        typeof droppedFramePercent !== 'number' ||
        typeof sampleWindowMs !== 'number' ||
        ![totalFrameCount, droppedFrameCount, droppedFramePercent, sampleWindowMs].every(Number.isFinite)
    ) {
        throw new Error('Android frame sampler did not return finite frame counts.');
    }
    if (requireFrames && totalFrameCount === 0) {
        throw new Error('The Android scroll produced no measured frames. Discard this run.');
    }
    return {totalFrames: totalFrameCount, droppedFrames: droppedFrameCount, droppedPercent: droppedFramePercent, sampleWindowMs};
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
                scenario: scenario.directory,
                spans: scenario.spanNames,
                ...(scenario === HEAVY_JOURNEY
                    ? {
                          scrollsPerDirection: Math.min(fixture.scrolls, 4),
                          scrollDurationMs: 120,
                          scrollTimeMeasured: false,
                          androidScrollFrameHealthMeasured: true,
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
        const releaseFrames = readAndroidFrameSamples(paths.release.replace(/\.csv$/, '-frames.csv'), runs);
        const optimizedFrames = readAndroidFrameSamples(paths.optimized.replace(/\.csv$/, '-frames.csv'), runs);
        console.log(`Android scroll missed-frame share: release ${releaseFrames.toFixed(2)}%, PGO ${optimizedFrames.toFixed(2)}% (lower is better; separate from report-open latency).`);
    }
    console.log(`Raw journey samples: ${paths.release} and ${paths.optimized}`);
}

function readAndroidFrameSamples(path: string, runs: number): number {
    if (!existsSync(path)) {
        fail(`Missing Android scroll frame samples: ${path}`);
    }
    const rows = readFileSync(path, 'utf8').trim().split('\n');
    if (rows.shift() !== 'run,totalFrames,droppedFrames,droppedPercent,sampleWindowMs' || rows.length !== runs) {
        fail(`Expected ${runs} Android scroll frame samples in ${path}.`);
    }
    let totalFrames = 0;
    let droppedFrames = 0;
    for (const [index, row] of rows.entries()) {
        const values = row.split(',').map(Number);
        const runNumber = values.at(0) ?? NaN;
        const frames = values.at(1) ?? NaN;
        const dropped = values.at(2) ?? NaN;
        if (values.length !== 5 || values.some((value) => !Number.isFinite(value)) || runNumber !== index + 1 || frames <= 0 || dropped < 0 || dropped > frames) {
            fail(`Invalid Android scroll frame sample ${index + 1} in ${path}.`);
        }
        totalFrames += frames;
        droppedFrames += dropped;
    }
    return (droppedFrames / totalFrames) * 100;
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

export {benchmarkHeavyJourneyAll, benchmarkJourneyAll, journeyBenchmarkPaths, sha256Artifact};
export type {BenchmarkOrder};
