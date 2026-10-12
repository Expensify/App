// cspell:ignore profdata profraw fprofile

import {createHash} from 'node:crypto';
import {readFileSync, readdirSync, realpathSync, statSync} from 'node:fs';
import {join, resolve} from 'node:path';

import type {PlatformName} from '../lib/nativeAppBenchmark';
import type {PlatformAdapter} from './shared';

import {capture, captureBinary, fail, rootDirectory} from '../lib/scriptUtils';

function toolchainIdentity(adapter: PlatformAdapter): string {
    return JSON.stringify({
        profileTool: capture(adapter.llvmTool('llvm-profdata'), ['--version']).trim(),
        compiler: capture(adapter.llvmTool('clang'), ['--version']).trim(),
        platform: adapter.name,
        buildTool: adapter.name === 'ios' ? capture('xcodebuild', ['-version']).trim() : capture('java', ['--version']).trim(),
        sdk: adapter.name === 'ios' ? capture('xcrun', ['--sdk', 'iphoneos', '--show-sdk-version']).trim() : adapter.llvmTool('clang'),
        androidReleasePipeline: process.env.PGO_ANDROID_RELEASE_PIPELINE ?? 'false',
        androidShrink: process.env.PGO_ANDROID_SHRINK ?? 'false',
        buildEnvironment: adapter.name === 'android' ? androidBuildEnvironment() : null,
    });
}

/** Resolve ENVFILE exactly relative to the hybrid Android project's parent directory. */
function androidBuildEnvironment(envFile = process.env.ENVFILE): {path: string; sha256: string} | null {
    if (!envFile) {
        return null;
    }
    const path = realpathSync(resolve(rootDirectory, 'Mobile-Expensify', envFile));
    return {path, sha256: createHash('sha256').update(readFileSync(path)).digest('hex')};
}

/** Bind tracked changes and untracked source files without changing either checkout. */
function sourceIdentity(): string {
    const hash = createHash('sha256');
    for (const directory of [rootDirectory, join(rootDirectory, 'Mobile-Expensify')]) {
        hash.update(capture('git', ['rev-parse', 'HEAD'], directory));
        hash.update(captureBinary('git', ['diff', 'HEAD', '--binary'], directory));
        const paths = capture('git', ['ls-files', '--others', '--exclude-standard', '-z'], directory).split('\0').filter(Boolean).sort();
        for (const path of paths) {
            hash.update(path);
            hash.update('\0');
            hash.update(readFileSync(join(directory, path)));
        }
    }
    return hash.digest('hex');
}

/** Reject partial batches and profiles collected from different source contents. */
function validateJourney(input: unknown, platform: PlatformName, identity: string, toolchain: string): void {
    if (
        isRecord(input) &&
        input.platform === platform &&
        input.status === 'passed' &&
        input.accountClass === 'heavy' &&
        input.requestedRuns === 3 &&
        input.completedRuns === 3 &&
        input.collectProfiles === true &&
        input.navigationOnly === false &&
        input.sourceIdentity === identity &&
        input.toolchain === toolchain
    ) {
        return;
    }
    fail('PGO proof requires three complete collected heavy-account journeys from the current source and toolchain.');
}

function profileCounts(summary: string): {functions: number; count: string} {
    const functions = Number(/Total functions:\s*([0-9]+)/.exec(summary)?.[1]);
    const count = /Total count:\s*([0-9]+)/.exec(summary)?.[1] ?? /Maximum function count:\s*([0-9]+)/.exec(summary)?.[1];
    if (!Number.isSafeInteger(functions) || functions <= 0 || !count || BigInt(count) <= 0n) {
        fail('The LLVM profile has no executed functions.');
    }
    return {functions, count};
}

/** Require Swift execution without borrowing counters from a neighboring Clang function. */
function hasExecutedSwiftFunctions(report: string): boolean {
    const functions = report.matchAll(/^ {2}(\S[^\n]*):\r?\n((?: {4}[^\n]*\r?\n)*)/gm);
    return Array.from(functions).some((entry) => /(?:^|:)\$s/.test(entry[1] ?? '') && /(?:Function count:\s*|Block counts:\s*\[[^\]\n]*)[1-9][0-9]*/.test(entry[2] ?? ''));
}

function fileHash(path: string, allowEmpty = false): string {
    const stat = statSync(path);
    if (stat.isDirectory()) {
        const hash = createHash('sha256');
        for (const name of readdirSync(path).sort()) {
            hash.update(name);
            hash.update('\0');
            hash.update(fileHash(join(path, name), true));
        }
        return hash.digest('hex');
    }
    if (stat.size === 0 && !allowEmpty) {
        fail(`Empty PGO evidence file: ${path}`);
    }
    return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export {androidBuildEnvironment, fileHash, hasExecutedSwiftFunctions, isRecord, profileCounts, sourceIdentity, toolchainIdentity, validateJourney};
