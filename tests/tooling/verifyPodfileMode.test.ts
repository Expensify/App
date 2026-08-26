import {describe, expect, it} from 'bun:test';

import {spawnSync} from 'child_process';
import path from 'path';

/**
 * `verifyPodfileMode.sh` is the only thing standing between a degraded `pod install` and a committed
 * lockfile in the wrong react-native mode, so its exit codes are worth pinning. The fixtures also pin
 * the marker pod names: a react-native upgrade that renames one would otherwise turn the check into a
 * silent no-op that still exits 0.
 */

const ROOT = path.join(__dirname, '..', '..');
const SCRIPT = path.join(ROOT, '.github', 'scripts', 'verifyPodfileMode.sh');
const FIXTURES = path.join(__dirname, 'fixtures', 'podfileLock');

function run(fixture: string, mode: string): number {
    const result = spawnSync(SCRIPT, [path.join(FIXTURES, fixture), mode], {cwd: ROOT, encoding: 'utf8'});
    return result.status ?? -1;
}

describe('verifyPodfileMode.sh', () => {
    it('accepts a lockfile that matches the declared mode', () => {
        expect(run('prebuilt.lock', 'prebuilt')).toBe(0);
        expect(run('source.lock', 'source')).toBe(0);
    });

    it('rejects a prebuilt lockfile that degraded to a source build', () => {
        // The original bug. A flip produces exactly a source-mode lockfile, so source.lock is the
        // artifact under test here; only the mode it is checked against differs.
        expect(run('source.lock', 'prebuilt')).toBe(1);
    });

    it('rejects a source lockfile that resolved prebuilt', () => {
        expect(run('prebuilt.lock', 'source')).toBe(1);
    });

    it('rejects a hermes fallback that leaves every marker pod intact', () => {
        // Marker pods alone cannot see this: hermes-engine exists in both graphs. The signal is the
        // Pre-built subspec, which CocoaPods emits only when hermes resolved to a prebuilt binary.
        expect(run('prebuiltHermesFromSource.lock', 'prebuilt')).toBe(1);
    });

    it('fails on an unknown mode or a missing lockfile', () => {
        expect(run('prebuilt.lock', 'nonsense')).toBe(1);
        expect(run('doesNotExist.lock', 'prebuilt')).toBe(1);
    });
});
