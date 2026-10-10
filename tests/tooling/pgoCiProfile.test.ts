import {describe, expect, test} from 'bun:test';

import {isJourneyResult, isPgoProof} from '../../scripts/pgo/ciProfile';

const hash = 'a'.repeat(64);
const revisions = {sourceRevision: hash, mobileRevision: hash};

describe('PGO release evidence', () => {
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
