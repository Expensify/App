/** Shared PGO workflow types, paths, subprocess helpers, and argument validation. */

import {spawnSync} from 'node:child_process';
import {existsSync, readdirSync} from 'node:fs';
import {join, resolve} from 'node:path';
import process from 'node:process';

import type {PlatformName} from '../lib/nativeAppBenchmark';

const STARTUP_SPAN_NAME = 'ManualAppStartup';
const BENCHMARK_SPANS_ENVIRONMENT = `EXPO_PUBLIC_BENCHMARK_SENTRY_SPANS=${STARTUP_SPAN_NAME}`;
const rootDirectory = resolve(import.meta.dirname, '../..');

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

function fail(message: string): never {
    throw new Error(message);
}

function run(command: string, args: string[], cwd = rootDirectory): void {
    const result = spawnSync(command, args, {cwd, stdio: 'inherit'});
    if (result.error) {
        fail(`Failed to run ${command}: ${result.error.message}`);
    }
    if (result.status !== 0) {
        fail(`${command} exited with status ${result.status ?? 'unknown'}.`);
    }
}

function capture(command: string, args: string[], cwd = rootDirectory): string {
    const result = spawnSync(command, args, {cwd, encoding: 'utf8', maxBuffer: 100 * 1024 * 1024});
    if (result.error) {
        fail(`Failed to run ${command}: ${result.error.message}`);
    }
    if (result.status !== 0) {
        const stderr = result.stderr.trim();
        fail(stderr.length > 0 ? stderr : `${command} exited with status ${result.status ?? 'unknown'}.`);
    }
    return result.stdout;
}

function captureBinary(command: string, args: string[], cwd = rootDirectory): Buffer {
    const result = spawnSync(command, args, {cwd, encoding: 'buffer', maxBuffer: 100 * 1024 * 1024});
    if (result.error) {
        fail(`Failed to run ${command}: ${result.error.message}`);
    }
    if (result.status !== 0) {
        fail(`${command} exited with status ${result.status ?? 'unknown'}.`);
    }
    return result.stdout;
}

function runAllowFailure(command: string, args: string[], cwd = rootDirectory): boolean {
    const result = spawnSync(command, args, {cwd, stdio: 'ignore'});
    return !result.error && result.status === 0;
}

function sleep(milliseconds: number): Promise<void> {
    return new Promise((resolvePromise) => {
        setTimeout(resolvePromise, milliseconds);
    });
}

function findFiles(directory: string, extension: string): string[] {
    if (!existsSync(directory)) {
        return [];
    }

    return readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) {
            return findFiles(path, extension);
        }
        return entry.isFile() && entry.name.endsWith(extension) ? [path] : [];
    });
}

function requirePositiveInteger(value: number, label: string): number {
    if (!Number.isSafeInteger(value) || value <= 0) {
        fail(`${label} must be a positive integer, received: ${value}`);
    }
    return value;
}

function parsePositiveInteger(rawValue: string, label: string): number {
    return requirePositiveInteger(Number(rawValue), label);
}

function parseChoice<T extends string>(rawValue: string, choices: readonly T[], label: string): T {
    const choice = choices.find((candidate) => candidate === rawValue);
    if (!choice) {
        fail(`${label} must be one of: ${choices.join(', ')}. Received: ${rawValue}`);
    }
    return choice;
}

function environmentString(name: string): string | undefined {
    const value: unknown = process.env[name];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function valueAt<T>(values: T[], index: number): T {
    const value = values.at(index);
    if (value === undefined) {
        fail(`Expected a value at index ${index}.`);
    }
    return value;
}

export {
    BENCHMARK_SPANS_ENVIRONMENT,
    STARTUP_SPAN_NAME,
    capture,
    captureBinary,
    environmentString,
    fail,
    findFiles,
    isRecord,
    parseChoice,
    parsePositiveInteger,
    requirePositiveInteger,
    rootDirectory,
    run,
    runAllowFailure,
    sleep,
    valueAt,
};
export type {BenchmarkKind, BuildArtifactPaths, BuildKind, PgoMode, PlatformAdapter};
