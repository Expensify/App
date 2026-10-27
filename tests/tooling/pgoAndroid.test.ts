// cspell:ignore profdata

import {afterAll, beforeEach, describe, expect, it, mock} from 'bun:test';

import * as scriptUtils from '@scripts/lib/scriptUtils';

import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import process from 'node:process';

let profileLogs = '';
// Reproduce the CI checkout, which does not initialize the native submodule.
const rootDirectory = mkdtempSync(join(tmpdir(), 'pgo-android-test-'));
const runCommand = mock<typeof scriptUtils.run>(() => undefined);
const captureCommand = mock<typeof scriptUtils.capture>(() => profileLogs);
// Stub the device boundary while keeping the adapter's broadcast, polling and validation real.
mock.module('@scripts/lib/scriptUtils', () => ({...scriptUtils, rootDirectory, run: runCommand, capture: captureCommand}));
const {default: createAndroidPgoAdapter, androidLlvmToolPath} = await import('@scripts/pgo/android');

afterAll(() => rmSync(rootDirectory, {recursive: true, force: true}));

describe('PGO Android profile dumps', () => {
    beforeEach(() => {
        profileLogs = '';
        runCommand.mockClear();
        captureCommand.mockClear();
    });

    it('accepts a dump only when all four native libraries wrote profiles', async () => {
        // Given a complete writer response from the installed instrumented APK.
        profileLogs = 'I/PgoProfileReceiver: Wrote 4 LLVM PGO profile(s).';
        // When the adapter requests a device dump.
        const dump = createAndroidPgoAdapter('com.example.pgo').dumpProfiles();
        // Then profile collection can continue.
        await expect(dump).resolves.toBeUndefined();
        expect(runCommand.mock.calls).toEqual([
            ['adb', ['logcat', '-c']],
            ['adb', ['shell', 'am', 'broadcast', '-a', 'com.expensify.chat.action.WRITE_PGO_PROFILES', '-n', 'com.example.pgo/org.me.mobiexpensifyg.PgoProfileReceiver']],
        ]);
    });

    it.each([1, 2, 3, 5])('rejects a dump reporting %i profiles', async (count) => {
        // Given a partial or unexpected writer response despite successful broadcast delivery.
        profileLogs = `I/PgoProfileReceiver: Wrote ${count} LLVM PGO profile(s).`;
        // When the adapter requests a device dump.
        const dump = createAndroidPgoAdapter('com.example.pgo').dumpProfiles();
        // Then training cannot silently accept an incomplete set of native counters.
        await expect(dump).rejects.toThrow(`wrote ${count} profiles, but expected 4`);
    });

    it('keeps the diagnostic for a dump with no instrumented libraries', async () => {
        // Given a receiver that could not find any profile writers.
        profileLogs = 'I/PgoProfileReceiver: Wrote 0 LLVM PGO profile(s).';
        // When the adapter requests a device dump.
        const dump = createAndroidPgoAdapter('com.example.pgo').dumpProfiles();
        // Then it explains that the instrumented APK must be rebuilt.
        await expect(dump).rejects.toThrow('found no instrumented native libraries');
    });

    it('rejects a non-instrumented APK', async () => {
        // Given a receiver explicitly rejecting profiling in a normal release build.
        profileLogs = 'Ignoring PGO profile request in a non-instrumented build.';
        // When the adapter requests a device dump.
        const dump = createAndroidPgoAdapter('com.example.pgo').dumpProfiles();
        // Then it directs the caller to install the instrumented build.
        await expect(dump).rejects.toThrow('installed APK is not instrumented');
    });
});

describe('PGO Android LLVM tools', () => {
    it.each([
        ['linux', '/home/test/Android/Sdk/ndk/27.1.12297006/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-profdata'],
        ['darwin', '/home/test/Library/Android/sdk/ndk/27.1.12297006/toolchains/llvm/prebuilt/darwin-x86_64/bin/llvm-profdata'],
    ] satisfies Array<[NodeJS.Platform, string]>)('uses the default SDK installation on %s', (hostPlatform, expected) => {
        // Given an unconfigured host with its normal Android Studio SDK location.
        // When LLVM tools are resolved without explicit environment settings.
        const path = androidLlvmToolPath('llvm-profdata', {hostPlatform, homeDirectory: '/home/test', environment: {}});
        // Then the selected path uses that host's SDK directory and toolchain.
        expect(path).toBe(expected);
    });

    it.each(['ANDROID_HOME', 'ANDROID_SDK_ROOT'])('honors %s on Linux', (variable) => {
        // Given a Linux runner with its SDK installed outside the default home directory.
        // When the SDK environment setting is used to resolve LLVM.
        const path = androidLlvmToolPath('llvm-profdata', {hostPlatform: 'linux', environment: {[variable]: '/opt/android/sdk'}});
        // Then the pinned NDK is resolved within the configured SDK.
        expect(path).toBe('/opt/android/sdk/ndk/27.1.12297006/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-profdata');
    });

    it.each(['ANDROID_NDK_HOME', 'ANDROID_NDK_ROOT'])('prefers %s over SDK settings', (variable) => {
        // Given an explicit NDK override and a different SDK location.
        // When the tool path is resolved.
        const path = androidLlvmToolPath('llvm-profdata', {hostPlatform: 'linux', environment: {[variable]: '/opt/custom-ndk', ANDROID_HOME: '/opt/android/sdk'}});
        // Then an explicitly selected build toolchain wins over the pinned SDK fallback.
        expect(path).toBe('/opt/custom-ndk/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-profdata');
    });

    it('prefers ANDROID_HOME over the deprecated SDK root setting and ignores empty NDK overrides', () => {
        // Given both SDK settings and empty NDK settings.
        const environment = {ANDROID_HOME: '/opt/current-sdk', ANDROID_SDK_ROOT: '/opt/old-sdk', ANDROID_NDK_HOME: '', ANDROID_NDK_ROOT: ''};
        // When LLVM tools are resolved on Linux.
        const path = androidLlvmToolPath('llvm-profdata', {hostPlatform: 'linux', environment});
        // Then empty settings do not mask the SDK selected by ANDROID_HOME.
        expect(path).toBe('/opt/current-sdk/ndk/27.1.12297006/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-profdata');
    });

    it('uses the resolved tool path in the adapter', () => {
        // Given an explicit temporary NDK with a real tool file.
        const directory = mkdtempSync(join(tmpdir(), 'pgo-ndk-test-'));
        const previousNdk = process.env.ANDROID_NDK_HOME;
        process.env.ANDROID_NDK_HOME = directory;
        try {
            const expected = androidLlvmToolPath('llvm-profdata');
            mkdirSync(dirname(expected), {recursive: true});
            writeFileSync(expected, '');
            // When the adapter checks tool availability.
            const path = createAndroidPgoAdapter().llvmTool('llvm-profdata');
            // Then it returns the existing file in the selected NDK.
            expect(path).toBe(expected);
        } finally {
            if (previousNdk === undefined) {
                delete process.env.ANDROID_NDK_HOME;
            } else {
                process.env.ANDROID_NDK_HOME = previousNdk;
            }
            rmSync(directory, {recursive: true, force: true});
        }
    });
});
