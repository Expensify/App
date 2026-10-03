#!/usr/bin/env bun

// cspell:ignore profdata xcconfig fprofile unprofiled CPLUSPLUSFLAGS

import {createHash} from 'node:crypto';
import {copyFileSync, existsSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {basename, join} from 'node:path';
import process from 'node:process';

import type {PlatformName} from '../lib/nativeAppBenchmark';

import {capture, fail, rootDirectory, valueAt} from '../lib/scriptUtils';
import createAndroidPgoAdapter from './android';
import createIOSPgoAdapter from './ios';

type JourneyResult = {
    platform: PlatformName;
    status: 'passed';
    accountClass: 'heavy';
    sourceRevision: string;
    mobileRevision: string;
    requestedRuns: 3;
    completedRuns: 3;
    collectProfiles: true;
    navigationOnly: false;
};

type PgoProof = {
    schema: 1;
    platform: PlatformName;
    appVersion: string;
    sourceRevision: string;
    mobileRevision: string;
    profileSha256: string;
    binaryName: string;
    binarySha256: string;
};

/** Validate a completed heavy-account batch before a publishable build can consume it. */
function prepare(platform: PlatformName, batchID: string): void {
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(batchID)) {
        fail('Invalid PGO batch ID.');
    }
    const batchDirectory = join(rootDirectory, '.pgo', platform, 'journeys', batchID);
    const result = readJSON(join(batchDirectory, 'result.json'));
    const revisions = currentRevisions();
    if (!isJourneyResult(result, platform, revisions)) {
        fail('PGO journey did not complete three collected runs on a heavy account at the current revisions.');
    }
    const adapter = platform === 'android' ? createAndroidPgoAdapter() : createIOSPgoAdapter();
    const sourceProfile = join(batchDirectory, 'journey.profdata');
    requireNonemptyFile(sourceProfile);
    const summary = capture(adapter.llvmTool('llvm-profdata'), ['show', sourceProfile]);
    const functionCount = /Total functions:\s*([0-9]+)/.exec(summary)?.[1];
    const totalCount = /Total count:\s*([0-9]+)/.exec(summary)?.[1];
    if (!functionCount || Number(functionCount) === 0 || !totalCount || BigInt(totalCount) === 0n) {
        fail('The merged LLVM profile has no executed functions.');
    }
    if (adapter.profileFormat) {
        const formatPath = `${sourceProfile}.format`;
        requireNonemptyFile(formatPath);
        if (readFileSync(formatPath, 'utf8').trim() !== adapter.profileFormat) {
            fail('The iOS profile format does not match the current instrumentation.');
        }
        copyFileSync(formatPath, `${adapter.mergedProfilePath}.format`);
    }
    copyFileSync(sourceProfile, adapter.mergedProfilePath);
    const profileSha256 = sha256(adapter.mergedProfilePath);
    if (platform === 'ios') {
        const profilePath = adapter.mergedProfilePath;
        const flags = `-fprofile-instr-use=${profilePath} -Wno-error=profile-instr-unprofiled`;
        writeFileSync(
            join(adapter.profileDirectory, 'release.xcconfig'),
            `CLANG_USE_OPTIMIZATION_PROFILE = NO\nOTHER_CFLAGS = $(inherited) ${flags}\nOTHER_CPLUSPLUSFLAGS = $(inherited) ${flags}\nOTHER_SWIFT_FLAGS = $(inherited) -ir-profile-use=${profilePath}\n`,
        );
    }
    writeFileSync(join(adapter.profileDirectory, 'ci-profile.json'), `${JSON.stringify({...revisions, profileSha256}, null, 2)}\n`);
    appendOutput('PROFILE_SHA256', profileSha256);
    appendOutput('PROFILE_PATH', adapter.mergedProfilePath);
    console.log(`Verified ${functionCount} profiled functions across three journeys.`);
}

/** Bind the exact store artifact to the validated profile without publishing account data. */
function seal(platform: PlatformName, appVersion: string, binaryPath: string, outputPath: string): void {
    const adapter = platform === 'android' ? createAndroidPgoAdapter() : createIOSPgoAdapter();
    const profileMetadata = readJSON(join(adapter.profileDirectory, 'ci-profile.json'));
    const revisions = currentRevisions();
    if (
        !isRecord(profileMetadata) ||
        profileMetadata.sourceRevision !== revisions.sourceRevision ||
        profileMetadata.mobileRevision !== revisions.mobileRevision ||
        profileMetadata.profileSha256 !== sha256(adapter.mergedProfilePath)
    ) {
        fail('The release build does not match the verified PGO profile.');
    }
    requireNonemptyFile(binaryPath);
    const proof: PgoProof = {
        schema: 1,
        platform,
        appVersion,
        ...revisions,
        profileSha256: profileMetadata.profileSha256,
        binaryName: basename(binaryPath),
        binarySha256: sha256(binaryPath),
    };
    writeFileSync(outputPath, `${JSON.stringify(proof, null, 2)}\n`);
}

/** Refuse a production promotion without proof for the exact staging version. */
function verify(platform: PlatformName, appVersion: string, proofPath: string, binaryPath?: string): void {
    const proof = readJSON(proofPath);
    if (!isPgoProof(proof, platform, appVersion)) {
        fail(`Missing or invalid ${platform} PGO proof for ${appVersion}.`);
    }
    if (binaryPath && (proof.binaryName !== basename(binaryPath) || proof.binarySha256 !== sha256(binaryPath))) {
        fail(`The ${platform} binary does not match its PGO proof.`);
    }
    console.log(`Verified ${platform} PGO proof for ${appVersion}.`);
}

function isJourneyResult(input: unknown, platform: PlatformName, revisions: {sourceRevision: string; mobileRevision: string}): input is JourneyResult {
    return (
        isRecord(input) &&
        input.platform === platform &&
        input.status === 'passed' &&
        input.accountClass === 'heavy' &&
        input.sourceRevision === revisions.sourceRevision &&
        input.mobileRevision === revisions.mobileRevision &&
        input.requestedRuns === 3 &&
        input.completedRuns === 3 &&
        input.collectProfiles === true &&
        input.navigationOnly === false
    );
}

function isPgoProof(input: unknown, platform: PlatformName, appVersion: string): input is PgoProof {
    return (
        isRecord(input) &&
        input.schema === 1 &&
        input.platform === platform &&
        input.appVersion === appVersion &&
        isSha256(input.sourceRevision) &&
        isSha256(input.mobileRevision) &&
        isSha256(input.profileSha256) &&
        isSha256(input.binarySha256) &&
        typeof input.binaryName === 'string' &&
        input.binaryName.endsWith(platform === 'android' ? '.aab' : '.ipa')
    );
}

function currentRevisions(): {sourceRevision: string; mobileRevision: string} {
    return {
        sourceRevision: capture('git', ['rev-parse', 'HEAD']).trim(),
        mobileRevision: capture('git', ['-C', 'Mobile-Expensify', 'rev-parse', 'HEAD']).trim(),
    };
}

function readJSON(path: string): unknown {
    requireNonemptyFile(path);
    return JSON.parse(readFileSync(path, 'utf8')) as unknown;
}

function requireNonemptyFile(path: string): void {
    if (existsSync(path) && statSync(path).size > 0) {
        return;
    }
    fail(`Missing or empty PGO file: ${path}`);
}

function sha256(path: string): string {
    requireNonemptyFile(path);
    return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function isSha256(value: unknown): value is string {
    return typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function appendOutput(name: string, value: string): void {
    const outputPath = process.env.GITHUB_OUTPUT;
    if (!outputPath) {
        return;
    }
    writeFileSync(outputPath, `${name}=${value}\n`, {flag: 'a'});
}

if (import.meta.main) {
    const [command, platform, ...args] = process.argv.slice(2);
    if (platform !== 'android' && platform !== 'ios') {
        fail('Expected platform android or ios.');
    }
    switch (command) {
        case 'prepare':
            if (args.length !== 1) {
                fail('Expected prepare <platform> <batch-id>.');
            }
            prepare(platform, valueAt(args, 0));
            break;
        case 'seal':
            if (args.length !== 3) {
                fail('Expected seal <platform> <version> <binary> <output>.');
            }
            seal(platform, valueAt(args, 0), valueAt(args, 1), valueAt(args, 2));
            break;
        case 'verify':
            if (args.length < 2 || args.length > 3) {
                fail('Expected verify <platform> <version> <proof> [binary].');
            }
            verify(platform, valueAt(args, 0), valueAt(args, 1), args.at(2));
            break;
        default:
            fail('Expected prepare, seal, or verify.');
    }
}

export {isJourneyResult, isPgoProof};
