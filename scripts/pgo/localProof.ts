#!/usr/bin/env bun

// cspell:ignore profdata profraw fprofile unbuilt

import {existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';

import type {PlatformName} from '../lib/nativeAppBenchmark';

import {capture, fail, findFiles, run, valueAt} from '../lib/scriptUtils';
import createAndroidPgoAdapter from './android';
import createIOSPgoAdapter from './ios';
import {fileHash, hasExecutedSwiftFunctions, isRecord, profileCounts, sourceIdentity, toolchainIdentity, validateJourney} from './proof';

/** Validate the immutable collected profile before optimization. */
function validateTraining(platform: PlatformName, batch: string) {
    const adapter = platform === 'android' ? createAndroidPgoAdapter() : createIOSPgoAdapter();
    const toolchain = toolchainIdentity(adapter);
    const identity = sourceIdentity();
    const result: unknown = JSON.parse(readFileSync(join(batch, 'result.json'), 'utf8'));
    validateJourney(result, platform, identity, toolchain);
    const instrumentedBinarySha256 = fileHash(adapter.artifactPaths.instrumented);
    if (!isRecord(result) || result.instrumentedBinarySha256 !== instrumentedBinarySha256) {
        fail('The collected journey is not bound to the current instrumented artifact.');
    }
    const profile = join(batch, 'journey.profdata');
    const counts = profileCounts(capture(adapter.llvmTool('llvm-profdata'), ['show', profile]));
    if (platform === 'ios' && !hasExecutedSwiftFunctions(capture(adapter.llvmTool('llvm-profdata'), ['show', '--all-functions', '--counts', profile]))) {
        fail('The merged iOS profile has no executed Swift functions. Rebuild with Swift IR instrumentation and collect fresh profiles.');
    }
    const runs = [1, 2, 3].map((runNumber) => {
        const paths = findFiles(join(batch, `run-${runNumber}`, 'raw'), '.profraw').sort();
        if (paths.length === 0) {
            fail(`Journey ${runNumber} has no archived raw profiles.`);
        }
        return paths.map((path) => ({path, sha256: fileHash(path)}));
    });
    const temporary = mkdtempSync(join(tmpdir(), 'pgo-proof-'));
    try {
        const merged = join(temporary, 'merged.profdata');
        run(adapter.llvmTool('llvm-profdata'), ['merge', `--output=${merged}`, ...runs.flatMap((profiles) => profiles.map(({path}) => path))]);
        if (fileHash(merged) !== fileHash(profile)) {
            fail('The selected profile does not match the three archived journeys.');
        }
        for (const profiles of runs) {
            run(adapter.llvmTool('llvm-profdata'), ['merge', `--output=${merged}`, ...profiles.map(({path}) => path)]);
            profileCounts(capture(adapter.llvmTool('llvm-profdata'), ['show', merged]));
        }
    } finally {
        rmSync(temporary, {recursive: true, force: true});
    }
    if (adapter.profileFormat && readFileSync(`${profile}.format`, 'utf8').trim() !== adapter.profileFormat) {
        fail('The profile format does not match the current instrumentation.');
    }
    return {toolchain, identity, counts, runs, profile, instrumentedBinarySha256};
}

function createProof(platform: PlatformName, batch: string, binary: string, commands: string, output: string): void {
    const {toolchain, identity, counts, runs, profile, instrumentedBinarySha256} = validateTraining(platform, batch);
    const compilation: unknown = JSON.parse(readFileSync(commands, 'utf8'));
    const {objects, configuredUnbuilt} = compilerEvidence(compilation, profile);
    writeFileSync(
        output,
        `${JSON.stringify({schema: 1, platform, sourceIdentity: identity, toolchain, instrumentedBinarySha256, counts, runs, profile: {path: profile, sha256: fileHash(profile)}, binary: {path: binary, sha256: fileHash(binary)}, compilation: {status: 'requested-configuration', consumption: 'unverified', path: commands, sha256: fileHash(commands), objects, configuredUnbuilt}}, null, 2)}\n`,
    );
}

/** Commands are evidence of requested flags; existing object hashes bind their outputs separately. */
function compilerObjects(input: unknown, profile: string): Array<{path: string; sha256: string}> {
    return compilerEvidence(input, profile).objects;
}

/** Separate unbuilt configured targets from existing output hashes without claiming execution. */
function compilerEvidence(input: unknown, profile: string): {objects: Array<{path: string; sha256: string}>; configuredUnbuilt: string[]} {
    if (!Array.isArray(input)) {
        fail('Expected a compilation database.');
    }
    const configuredUnbuilt: string[] = [];
    const objects = input.flatMap((entry: unknown) => {
        if (!isRecord(entry) || typeof entry.directory !== 'string') {
            fail('Invalid compilation database entry.');
        }
        const args = Array.isArray(entry.arguments) && entry.arguments.every((arg: unknown) => typeof arg === 'string') ? entry.arguments.join(' ') : entry.command;
        if (typeof args !== 'string' || !/-fprofile-(?:instr-)?use=/.test(args)) {
            return [];
        }
        const selected = /-fprofile-(?:instr-)?use=(?:"([^"]+)"|'([^']+)'|([^\s]+))/.exec(args);
        const selectedPath = selected?.[1] ?? selected?.[2] ?? selected?.[3];
        if (!selectedPath || resolve(entry.directory, selectedPath) !== resolve(profile)) {
            fail('Compiler command consumes a different PGO profile.');
        }
        const outputMatch = /(?:^|\s)-o\s+(?:"([^"]+)"|'([^']+)'|([^\s]+))/.exec(args);
        const objectPath = typeof entry.output === 'string' ? entry.output : (outputMatch?.[1] ?? outputMatch?.[2] ?? outputMatch?.[3]);
        if (!objectPath || !args.includes(' -c ')) {
            fail('PGO evidence must include a compilation command and its output object.');
        }
        const path = resolve(entry.directory, objectPath);
        if (!existsSync(path)) {
            configuredUnbuilt.push(path);
            return [];
        }
        return [{path, sha256: fileHash(path)}];
    });
    if (objects.length === 0) {
        fail('No matching compiler commands have existing object outputs for the selected PGO profile.');
    }
    return {objects, configuredUnbuilt};
}

if (import.meta.main) {
    const [platform, ...args] = process.argv.slice(2);
    if ((platform !== 'android' && platform !== 'ios') || args.length !== 4) {
        fail('Expected <android|ios> <batch-directory> <optimized-binary> <compile-commands.json> <output-json>.');
    }
    createProof(platform, resolve(valueAt(args, 0)), resolve(valueAt(args, 1)), resolve(valueAt(args, 2)), resolve(valueAt(args, 3)));
}

export {compilerEvidence, compilerObjects, createProof, validateTraining};
