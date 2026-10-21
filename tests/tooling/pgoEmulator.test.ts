// cspell:ignore esac simctl profdata
import {afterAll, describe, expect, it} from 'bun:test';

import createAndroidPgoAdapter from '@scripts/pgo/android';
import {parseVerificationMarker, verificationRows, VERIFICATION_ROW_COUNT, VERIFICATION_SCREENS} from '@scripts/pgo/emulatorFixture';
import {selectIOSVerificationRuntime} from '@scripts/pgo/iosSimulator';

import {spawnSync} from 'node:child_process';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';

const directory = mkdtempSync(join(tmpdir(), 'pgo-emulator-tests-'));
afterAll(() => rmSync(directory, {recursive: true, force: true}));

describe('PGO emulator verification', () => {
    it('accepts only a completed synthetic workload with finite timing', () => {
        // Given the synthetic workload's explicit completion marker.
        const marker = {schema: 1, status: 'passed', workload: 'synthetic', screens: VERIFICATION_SCREENS.length, rows: VERIFICATION_ROW_COUNT, durationMs: 1200};
        // When complete, partial and malformed results arrive from the app.
        expect(parseVerificationMarker(marker).durationMs).toBe(1200);
        // Then an incomplete render, an unapproved workload or invalid timing fails verification.
        for (const change of [{screens: 1}, {rows: 0}, {workload: 'live'}, {durationMs: Number.NaN}, {durationMs: Number.POSITIVE_INFINITY}, {durationMs: 0}]) {
            expect(() => parseVerificationMarker({...marker, ...change})).toThrow('did not complete');
        }
        expect(new Set(verificationRows(1).map((row) => row.id)).size).toBe(VERIFICATION_ROW_COUNT);
    });

    it('selects an installed iOS runtime without choosing an unavailable or non-iOS runtime', () => {
        // Given runtime versions that require numeric ordering and an unavailable newer runtime.
        const runtimes = [
            {identifier: 'com.apple.CoreSimulator.SimRuntime.iOS-26-9', version: '26.9', isAvailable: true},
            {identifier: 'com.apple.CoreSimulator.SimRuntime.iOS-26-10', version: '26.10', isAvailable: true},
            {identifier: 'com.apple.CoreSimulator.SimRuntime.iOS-27', version: '27', isAvailable: false},
            {identifier: 'com.apple.CoreSimulator.SimRuntime.watchOS-27', version: '27', isAvailable: true},
        ];
        // When a disposable simulator's runtime is selected.
        const selected = selectIOSVerificationRuntime({runtimes});
        // Then the latest installed iOS runtime is selected and missing runtimes fail clearly.
        expect(selected).toBe('com.apple.CoreSimulator.SimRuntime.iOS-26-10');
        expect(() => selectIOSVerificationRuntime({runtimes: []})).toThrow('no available iOS');
    });

    it('isolates emulator profiles from physical Android profiles', () => {
        // Given the hosted emulator architecture instead of the physical-device default.
        const previous = process.env.PGO_ANDROID_ARCH;
        try {
            process.env.PGO_ANDROID_ARCH = 'x86_64';
            // When its platform adapter chooses profile paths.
            const adapter = createAndroidPgoAdapter('com.example.pgo');
            // Then it cannot overwrite or consume the physical ARM64 profile by default.
            expect(adapter.mergedProfilePath).toEndWith('/android/x86_64/newdot.profdata');
            process.env.PGO_ANDROID_ARCH = '../arm64-v8a';
            expect(() => createAndroidPgoAdapter()).toThrow('must be arm64-v8a or x86_64');
        } finally {
            if (previous === undefined) {
                delete process.env.PGO_ANDROID_ARCH;
            } else {
                process.env.PGO_ANDROID_ARCH = previous;
            }
        }
    });

    it.each([0, 1])('publishes App only after the pinned native push succeeds with status %i', (nativeStatus) => {
        // Given a fake Git transport that records pushes without contacting GitHub.
        const log = join(directory, `copy-${nativeStatus}.log`);
        writeFileSync(
            join(directory, 'git'),
            `#!/usr/bin/env bash
printf '%s\\n' "$*" >> "$PGO_COPY_LOG"
case "$*" in
  *'ls-tree HEAD Mobile-Expensify'*) echo '160000 commit bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb Mobile-Expensify';;
  *'rev-parse FETCH_HEAD'*) echo 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';;
  *'rev-parse HEAD'*) echo 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';;
  *'push git@github.com:Expensify/Mobile-Expensify.git'*) exit "$PGO_COPY_NATIVE_STATUS";;
esac
`,
            {mode: 0o755},
        );
        // When the engineer runs the actual copy helper.
        const result = spawnSync('bash', [resolve('scripts/pgo/copy-ci-preview.sh')], {
            encoding: 'utf8',
            env: {...process.env, PATH: `${directory}:${process.env.PATH}`, PGO_COPY_LOG: log, PGO_COPY_NATIVE_STATUS: String(nativeStatus)},
        });
        const commands = readFileSync(log, 'utf8');
        // Then a failed native upload never starts an App workflow against a missing gitlink.
        expect(result.status).toBe(nativeStatus);
        expect(commands.includes('push git@github.com:Expensify/App.git')).toBe(nativeStatus === 0);
        if (nativeStatus === 0) {
            expect(commands.indexOf('push git@github.com:Expensify/Mobile-Expensify.git')).toBeLessThan(commands.indexOf('push git@github.com:Expensify/App.git'));
        }
    });
});
