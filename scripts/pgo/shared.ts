// cspell:ignore cooldown Cooldown

/** Shared PGO workflow types and constants. */

import type {PlatformName} from '../lib/nativeAppBenchmark';

import {fail, sleep} from '../lib/scriptUtils';

const STARTUP_SPAN_NAME = 'ManualAppStartup';
const JOURNEY_SPAN_NAMES = ['ManualNavigateToReportsFirstPaint', 'ManualNavigateToReportsContentLoad', 'ManualNavigateToInboxTab'] as const;
const HEAVY_JOURNEY_SPAN_NAMES = ['/r/*'] as const;
const BENCHMARK_SPANS_ENVIRONMENT = `EXPO_PUBLIC_BENCHMARK_SENTRY_SPANS=${[STARTUP_SPAN_NAME, ...JOURNEY_SPAN_NAMES, ...HEAVY_JOURNEY_SPAN_NAMES].join(',')}`;

type BuildKind = 'release' | 'instrumented' | 'optimized';
type BenchmarkKind = Extract<BuildKind, 'release' | 'optimized'>;
type PgoMode = 'off' | 'generate' | 'use';
type BuildArtifactPaths = Record<BuildKind, string>;

type PlatformAdapter = {
    readonly name: PlatformName;
    readonly profileDirectory: string;
    readonly rawProfileDirectory: string;
    readonly mergedProfilePath: string;
    readonly benchmarkDirectory: string;
    readonly benchmarkPaths: Record<BenchmarkKind, string>;
    readonly artifactPaths: BuildArtifactPaths;
    readonly profileFormat?: string;
    appID: () => string;
    build: (kind: BuildKind, profilePath?: string) => void;
    install: (kind: BuildKind) => void;
    verifyInstrumentation: () => void;
    clearDeviceProfiles: () => Promise<void>;
    dumpProfiles: () => Promise<void>;
    pullProfiles: () => void;
    llvmTool: (name: string) => string;
};

function benchmarkCooldownSeconds(): number {
    const seconds = Number(process.env.PGO_BENCHMARK_COOLDOWN_SECONDS ?? 0);
    if (!Number.isSafeInteger(seconds) || seconds < 0 || seconds > 60) {
        fail('Benchmark cooldown seconds must be an integer between 0 and 60.');
    }
    return seconds;
}

async function cooldownBeforeBenchmark(): Promise<void> {
    const seconds = benchmarkCooldownSeconds();
    console.log(`Waiting ${seconds}s before the discarded warm-up. This delay does not verify thermal state.`);
    await sleep(seconds * 1000);
}

export {benchmarkCooldownSeconds, cooldownBeforeBenchmark, BENCHMARK_SPANS_ENVIRONMENT, HEAVY_JOURNEY_SPAN_NAMES, JOURNEY_SPAN_NAMES, STARTUP_SPAN_NAME};
export type {BenchmarkKind, BuildArtifactPaths, BuildKind, PgoMode, PlatformAdapter};
