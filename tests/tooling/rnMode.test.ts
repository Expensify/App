import {describe, expect, it} from 'bun:test';

import {spawnSync} from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * `RNMode` hooks react-native by prepending onto methods it does not own. If react-native renames one,
 * the prepended method is simply never called: no error, `pod install` succeeds, and the guard is
 * gone with nothing to notice. `verify_hook_targets!` warns at install time, but a warning in several
 * thousand lines of pod output is easy to miss, and it cannot check the hermes helpers at all because
 * `hermes-utils.rb` loads after the Podfile.
 *
 * These tests turn that silence into a failing check on the react-native bump PR itself.
 */

const ROOT = path.join(__dirname, '..', '..');
const RN = path.join(ROOT, 'node_modules', 'react-native');

const HOOK_TARGETS = [
    {file: 'scripts/cocoapods/rndependencies.rb', method: 'def self.artifact_exists'},
    {file: 'scripts/cocoapods/rndependencies.rb', method: 'def self.setup_react_native_dependencies'},
    {file: 'scripts/cocoapods/rndependencies.rb', method: 'def self.build_react_native_deps_from_source'},
    {file: 'sdks/hermes-engine/hermes-utils.rb', method: 'def hermes_artifact_exists'},
    {file: 'sdks/hermes-engine/hermes-utils.rb', method: 'def hermes_source_type'},
];

describe('RNMode hook targets', () => {
    it.each(HOOK_TARGETS)('react-native still defines $method in $file', ({file, method}) => {
        const source = fs.readFileSync(path.join(RN, file), 'utf8');
        // Matched up to the parameter list, so a renamed method (`artifact_exists_renamed`) fails
        // rather than passing on a substring.
        expect(source).toContain(`${method}(`);
    });

    it('react-native still resolves the mode from a bare curl with no timeout', () => {
        // The reason the probe is wrapped at all. If upstream fixes this, the wrapper can go.
        const source = fs.readFileSync(path.join(RN, 'scripts/cocoapods/rndependencies.rb'), 'utf8');
        expect(source).toContain('curl -o /dev/null --silent -Iw');
    });
});

describe('RNMode behaviour', () => {
    // The driver makes two real requests to classify a 404 apart from an unreachable host, so it is
    // bounded: without a timeout a stalled network would hang the whole bun:test job, which has no
    // per-test timeout at collection time. Ruby is not guaranteed on the CI image either.
    const result = spawnSync('ruby', [path.join(__dirname, 'fixtures', 'rnMode', 'driver.rb')], {
        cwd: ROOT,
        encoding: 'utf8',
        timeout: 60000,
        killSignal: 'SIGKILL',
    });
    const rubyAvailable = result.error === undefined && result.status !== null;
    const outcomes = new Map<string, string>();
    for (const line of (result.stdout ?? '').trim().split('\n').filter(Boolean)) {
        const [name, verdict] = line.split(' ');
        if (name && verdict) {
            outcomes.set(name, verdict);
        }
    }

    it('the driver ran', () => {
        if (!rubyAvailable) {
            console.warn('ruby is unavailable, skipping the RNMode behaviour cases');
            return;
        }
        expect(result.status).toBe(0);
        expect(outcomes.size).toBeGreaterThan(0);
    });

    it.each([
        'keeps_overrides',
        'records_overrides_as_cause',
        'pins_mode_flags',
        'pins_shared_vars',
        'reports_empty_overrides',
        'degraded_install_continues',
        'prebuilt_in_source_mode_continues',
        'hermes_fallback_continues_prebuilt',
        'hermes_fallback_continues_source',
        'classifies_404_vs_unreachable',
        'empty_url_short_circuits',
    ])('%s', (name) => {
        if (!rubyAvailable) {
            return;
        }
        expect(outcomes.get(name)).toBe('PASS');
    });
});
