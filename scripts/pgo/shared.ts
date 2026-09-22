/** Shared PGO workflow types and constants. */

import type {PlatformName} from '../lib/nativeAppBenchmark';

const STARTUP_SPAN_NAME = 'ManualAppStartup';
const BENCHMARK_SPANS_ENVIRONMENT = `EXPO_PUBLIC_BENCHMARK_SENTRY_SPANS=${STARTUP_SPAN_NAME}`;

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
    build: (kind: BuildKind) => void;
    install: (kind: BuildKind) => void;
    verifyInstrumentation: () => void;
    clearDeviceProfiles: () => Promise<void>;
    dumpProfiles: () => Promise<void>;
    pullProfiles: () => void;
    llvmTool: (name: string) => string;
};

export {BENCHMARK_SPANS_ENVIRONMENT, STARTUP_SPAN_NAME};
export type {BenchmarkKind, BuildArtifactPaths, BuildKind, PgoMode, PlatformAdapter};
