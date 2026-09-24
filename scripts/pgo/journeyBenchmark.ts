/** Repeats a small, read-only signed-in journey and records app-defined navigation spans. */

import {createHash} from 'node:crypto';
import {createReadStream, existsSync, lstatSync, mkdirSync, readdirSync, readlinkSync, writeFileSync} from 'node:fs';
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
import {selectSpendSection, showTab, verifyJourneyAccount, waitForTab} from './journeyWorkload';
import {JOURNEY_SPAN_NAMES} from './shared';

type JourneyBenchmarkReader = {
    begin: (spanNames: readonly string[]) => void;
    collect: (spanNames: readonly string[], timeoutSeconds: number) => Promise<BenchmarkLogEvent[]>;
};

function journeyBenchmarkPaths(adapter: Pick<PlatformAdapter, 'benchmarkDirectory'>, batchID: string): Record<BenchmarkKind, string> {
    const directory = join(adapter.benchmarkDirectory, 'journey', batchID);
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
): Promise<void> {
    console.log(`Installing ${kind} artifact: ${adapter.artifactPaths[kind]}`);
    adapter.install(kind);

    const device = createJourneyDevice({platform: adapter.name, device: deviceID, appID: adapter.appID(), session: `pgo-journey-benchmark-${adapter.name}-${kind}-${Date.now()}`});
    const reader: JourneyBenchmarkReader =
        adapter.name === 'android' ? createAndroidJourneyBenchmarkReader(deviceID, adapter.appID()) : createIOSJourneyBenchmarkReader(deviceID, adapter.appID());
    try {
        device.open(false);
        await waitForTab(device, 'Account');
        await verifyJourneyAccount(device, fixture);
        console.log(`Running one unmeasured ${kind} journey warm-up.`);
        await measureJourney(device, reader, timeoutSeconds);

        const recorder = createBenchmarkRecorder({spanNames: [...JOURNEY_SPAN_NAMES], runs, outputPath});
        for (let runNumber = 1; runNumber <= runs; runNumber += 1) {
            const events = await measureJourney(device, reader, timeoutSeconds);
            console.log(`${kind} journey ${runNumber}/${runs}: ${recorder.record(events, runNumber).join(', ')}`);
        }
        await verifyJourneyAccount(device, fixture);
        await recorder.complete(`${kind} journey metrics`);
    } finally {
        try {
            device.command('close');
        } catch (error) {
            console.error(`Device cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}

/** Uses a new app process for each sample; automation latency is outside the timed spans. */
async function measureJourney(device: ReturnType<typeof createJourneyDevice>, reader: JourneyBenchmarkReader, timeoutSeconds: number): Promise<BenchmarkLogEvent[]> {
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
    return [...spendEvents, ...inboxEvents];
}

async function benchmarkJourneyAll(adapter: PlatformAdapter, deviceID: string, fixture: JourneyFixture, runs: number, timeoutSeconds: number): Promise<void> {
    const batchID = new Date().toISOString().replaceAll(/[:.]/g, '-');
    const paths = journeyBenchmarkPaths(adapter, batchID);
    const directory = join(adapter.benchmarkDirectory, 'journey', batchID);
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
                spans: JOURNEY_SPAN_NAMES,
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
    console.log(`Journey benchmark batch: ${directory}`);
    console.log('=== Journey benchmark phase 1/2: Release ===');
    await benchmarkJourneyBuild(adapter, 'release', deviceID, fixture, runs, timeoutSeconds, paths.release);
    console.log('=== Journey benchmark phase 2/2: PGO optimized ===');
    await benchmarkJourneyBuild(adapter, 'optimized', deviceID, fixture, runs, timeoutSeconds, paths.optimized);
    await compareJourneyBenchmarks(paths, runs);
}

async function compareJourneyBenchmarks(paths: Record<BenchmarkKind, string>, runs: number): Promise<void> {
    if (!existsSync(paths.release) || !existsSync(paths.optimized)) {
        fail('Missing paired journey samples in this benchmark batch.');
    }
    const [releaseSamples, optimizedSamples] = await Promise.all([readBenchmarkSamples(paths.release), readBenchmarkSamples(paths.optimized)]);
    const release = benchmarkMetrics(releaseSamples, JOURNEY_SPAN_NAMES);
    const optimized = benchmarkMetrics(optimizedSamples, JOURNEY_SPAN_NAMES);

    console.log('=== Journey benchmark comparison (positive percentages are faster) ===');
    for (const span of JOURNEY_SPAN_NAMES) {
        const baseline = release[span]?.stats;
        const pgo = optimized[span]?.stats;
        if (!baseline || !pgo || baseline.runs !== runs || pgo.runs !== runs) {
            fail(`Expected ${runs} paired ${span} samples in this journey benchmark batch.`);
        }
        const improvement = ((baseline.average - pgo.average) / baseline.average) * 100;
        console.log(`${span}: release ${baseline.average.toFixed(2)} ms, PGO ${pgo.average.toFixed(2)} ms, ${improvement.toFixed(2)}% (${baseline.runs}/${pgo.runs} runs)`);
    }
    console.log(`Raw journey samples: ${paths.release} and ${paths.optimized}`);
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

export {benchmarkJourneyAll, journeyBenchmarkPaths, sha256Artifact};
