import {afterAll, beforeAll, describe, expect, it} from 'bun:test';

import {spawnSync} from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const SCRIPT = path.resolve(import.meta.dir, '../../.github/scripts/verifyPodfileMode.sh');

/** Pods that only appear when react-native builds its dependencies from source. */
const SOURCE_PODS = ['boost (1.84.0)', 'DoubleConversion (1.1.6)', 'fast_float (8.0.0)', 'fmt (12.1.0)', 'glog (0.3.5)', 'RCT-Folly (2024.11.18.00):', 'SocketRocket (0.7.1)'];

/** Pods that only appear when react-native is consumed prebuilt. */
const PREBUILT_PODS = ['React-Core-prebuilt (0.86.0):', 'ReactNativeDependencies (0.86.0)'];

const HERMES_PREBUILT = 'hermes-engine/Pre-built (250829098.0.14)';

let tmpDir: string;

/**
 * Writes a lockfile whose PODS: section lists the given pods, followed by the other sections a real
 * lockfile carries. Those trailing sections must not be searched, so they repeat the pod names.
 */
function writeLockfile(name: string, pods: string[]): string {
    const lines = [
        'PODS:',
        ...pods.map((pod) => `  - ${pod}`),
        '',
        'DEPENDENCIES:',
        ...pods.map((pod) => `  - ${pod.split(' ').at(0)}`),
        '',
        'SPEC CHECKSUMS:',
        '  Yoga: abc123',
        '',
        'PODFILE CHECKSUM: def456',
        '',
        'COCOAPODS: 1.16.2',
        '',
    ];
    const file = path.join(tmpDir, name);
    fs.writeFileSync(file, lines.join('\n'));
    return file;
}

function run(lockfile: string, mode: string) {
    const result = spawnSync(SCRIPT, [lockfile, mode], {encoding: 'utf8'});
    return {status: result.status, output: `${result.stdout}${result.stderr}`};
}

beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-podfile-mode-'));
});

afterAll(() => {
    fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('verifyPodfileMode', () => {
    it('accepts a lockfile resolved in the mode it is checked against', () => {
        expect(run(writeLockfile('source.lock', [...SOURCE_PODS, HERMES_PREBUILT]), 'source').status).toBe(0);
        expect(run(writeLockfile('prebuilt.lock', [...PREBUILT_PODS, HERMES_PREBUILT]), 'prebuilt').status).toBe(0);
    });

    it('rejects a lockfile resolved in the opposite mode', () => {
        expect(run(writeLockfile('source2.lock', [...SOURCE_PODS, HERMES_PREBUILT]), 'prebuilt').status).toBe(1);
        expect(run(writeLockfile('prebuilt2.lock', [...PREBUILT_PODS, HERMES_PREBUILT]), 'source').status).toBe(1);
    });

    it('names both the pods it expected and the pods that gave the mode away', () => {
        const {output} = run(writeLockfile('source3.lock', [...SOURCE_PODS, HERMES_PREBUILT]), 'prebuilt');
        expect(output).toContain('React-Core-prebuilt');
        expect(output).toContain('SocketRocket');
    });

    it('points each mode at the command that regenerates that lockfile', () => {
        // ios/Podfile.lock is only reinstalled by the standalone wrapper, which passes the zeros
        // that keep react-native building from source.
        expect(run(writeLockfile('prebuilt3.lock', [...PREBUILT_PODS, HERMES_PREBUILT]), 'source').output).toContain('npm run pod-install-standalone');
        expect(run(writeLockfile('source4.lock', [...SOURCE_PODS, HERMES_PREBUILT]), 'prebuilt').output).toContain('npm run pod-install');
    });

    it('matches a pod only as a whole top-level entry', () => {
        // `RCT-Folly/Default` is a subspec of a pod that is itself absent from a prebuilt lockfile,
        // and `React-Core` is a different pod from `React-Core-prebuilt`.
        const lockfile = writeLockfile('subspec.lock', [...PREBUILT_PODS, HERMES_PREBUILT, 'RCT-Folly/Default (2024.11.18.00)', 'React-Core (0.86.0)']);
        expect(run(lockfile, 'prebuilt').status).toBe(0);
    });

    it('ignores pods listed outside the PODS: section', () => {
        const file = path.join(tmpDir, 'external.lock');
        fs.writeFileSync(
            file,
            ['PODS:', ...PREBUILT_PODS.map((pod) => `  - ${pod}`), `  - ${HERMES_PREBUILT}`, '', 'EXTERNAL SOURCES:', '  - boost (1.84.0)', '', 'COCOAPODS: 1.16.2', ''].join('\n'),
        );
        expect(run(file, 'prebuilt').status).toBe(0);
    });

    it('reports a source-built Hermes separately from the react-native mode', () => {
        const {status, output} = run(writeLockfile('hermes.lock', PREBUILT_PODS), 'prebuilt');
        expect(status).toBe(1);
        expect(output).toContain('hermes-engine/Pre-built');
        // The react-native side resolved correctly, so none of the artifact-registry advice applies.
        expect(output).not.toContain('read:packages');
    });

    it('rejects an unusable invocation rather than guessing', () => {
        expect(run(writeLockfile('args.lock', SOURCE_PODS), 'hybrid').status).toBe(1);
        expect(spawnSync(SCRIPT, [], {encoding: 'utf8'}).status).toBe(1);
        expect(run(path.join(tmpDir, 'does-not-exist.lock'), 'source').status).toBe(1);
    });
});
