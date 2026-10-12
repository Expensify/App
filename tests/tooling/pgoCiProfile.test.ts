// cspell:ignore probey

import {describe, expect, test} from 'bun:test';

import {hasExecutedFunctions, hasExecutedSwiftFunctions, isJourneyResult, isPgoProof} from '../../scripts/pgo/ciProfile';

const hash = 'a'.repeat(64);
const revisions = {sourceRevision: 'a'.repeat(40), mobileRevision: 'b'.repeat(40)};

describe('PGO release evidence', () => {
    test('accepts executed profiles from both LLVM summary formats and rejects empty counters', () => {
        // Given frontend and IR summaries from the installed Apple and Android LLVM tools.
        const frontend = 'Total functions: 77590\nMaximum function count: 4113807848\nTotal count: 159963759615';
        const ir = 'Total functions: 23821\nMaximum function count: 556976383';
        // When the CI gate reads either format or a zero/malformed summary.
        expect(hasExecutedFunctions(frontend)).toBe(true);
        expect(hasExecutedFunctions(ir)).toBe(true);
        // Then only executed profiles pass, including explicit zero aggregate counts.
        for (const summary of ['Total functions: 0\nMaximum function count: 1', 'Total functions: 1\nMaximum function count: 0', 'Total functions: 1\nMaximum function count: 1\nTotal count: 0', 'unknown']) {
            expect(hasExecutedFunctions(summary)).toBe(false);
        }
    });

    test('requires executed Swift counters without borrowing counts from another function', () => {
        // Given a Swift counter followed by an executed Clang function.
        const report = 'Counters:\n  $s5Probe5probeyS2iF:\n    Hash: 0x0\n    Counters: 1\n    Function count: 0\n    Block counts: []\n  clangFunction:\n    Function count: 42\n';
        // When Swift instrumentation is missing, zero, or actually executed.
        expect(hasExecutedSwiftFunctions(report)).toBe(false);
        expect(hasExecutedSwiftFunctions(report.replace('Function count: 0', 'Function count: 3'))).toBe(true);
        expect(hasExecutedSwiftFunctions(report.replace('$s5Probe5probeyS2iF', 'anotherClangFunction'))).toBe(false);
        expect(hasExecutedSwiftFunctions('Total count: 42')).toBe(false);
        expect(hasExecutedSwiftFunctions('Counters:\n  $s5Probe5probeyS2iF:\n    Hash: 0x12\n    Counters: 3\n    Block counts: [0, 102, 1]\n')).toBe(true);
        expect(hasExecutedSwiftFunctions('Counters:\n  $s5Probe5probeyS2iF:\n    Block counts: [0, 0, 0]\n')).toBe(false);
        expect(hasExecutedSwiftFunctions(report.replace('$s5Probe5probeyS2iF', '/tmp/Probe.swift:$s5Probe5probeyS2iF').replace('Function count: 0', 'Function count: 3'))).toBe(true);
    });

    test('accepts Git object IDs without weakening profile and binary SHA-256 checks', () => {
        // Given the proof produced by seal with normal SHA-1 Git revisions.
        const proof = {schema: 1, platform: 'ios', appVersion: '1.2.3', ...revisions, profileSha256: hash, binaryName: 'Expensify.ipa', binarySha256: hash};
        // When verification distinguishes Git IDs from artifact hashes.
        expect(isPgoProof(proof, 'ios', '1.2.3')).toBe(true);
        expect(isPgoProof({...proof, sourceRevision: hash, mobileRevision: hash}, 'ios', '1.2.3')).toBe(true);
        // Then shortened/malformed IDs and non-SHA-256 artifacts remain rejected.
        for (const field of ['sourceRevision', 'mobileRevision', 'profileSha256', 'binarySha256']) {
            expect(isPgoProof({...proof, [field]: 'a'.repeat(39)}, 'ios', '1.2.3')).toBe(false);
            expect(isPgoProof({...proof, [field]: 'z'.repeat(64)}, 'ios', '1.2.3')).toBe(false);
        }
        expect(isPgoProof({...proof, profileSha256: revisions.sourceRevision}, 'ios', '1.2.3')).toBe(false);
        expect(isPgoProof({...proof, binarySha256: revisions.sourceRevision}, 'ios', '1.2.3')).toBe(false);
    });

    test('accepts only three completed heavy-account profile runs at the checked-out revisions', () => {
        // Given a successful batch tied to the current source and submodule revisions.
        const result = {
            platform: 'android',
            status: 'passed',
            accountClass: 'heavy',
            ...revisions,
            requestedRuns: 3,
            completedRuns: 3,
            collectProfiles: true,
            navigationOnly: false,
        };
        // When a run is incomplete or the source revision differs.
        const incomplete = {...result, completedRuns: 2};
        const stale = {...result, sourceRevision: 'b'.repeat(64)};
        // Then only the fully matched batch may feed a publishable build.
        expect(isJourneyResult(result, 'android', revisions)).toBe(true);
        expect(isJourneyResult(incomplete, 'android', revisions)).toBe(false);
        expect(isJourneyResult(stale, 'android', revisions)).toBe(false);
    });

    test('rejects production proof for another platform or version', () => {
        // Given a proof emitted for an iOS staging IPA.
        const proof = {schema: 1, platform: 'ios', appVersion: '1.2.3', ...revisions, profileSha256: hash, binaryName: 'Expensify.ipa', binarySha256: hash};
        // When a production promotion checks the proof against its platform and version.
        const wrongVersion = isPgoProof(proof, 'ios', '1.2.4');
        const wrongPlatform = isPgoProof(proof, 'android', '1.2.3');
        // Then a stale or cross-platform asset cannot satisfy the gate.
        expect(isPgoProof(proof, 'ios', '1.2.3')).toBe(true);
        expect(wrongVersion).toBe(false);
        expect(wrongPlatform).toBe(false);
    });
});
