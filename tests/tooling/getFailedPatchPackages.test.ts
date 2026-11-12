import {describe, expect, it} from 'bun:test';

import getFailedPatchPackages from '../../scripts/applyPatches';

describe('getFailedPatchPackages', () => {
    it('extracts packages from patch-package apply failures', () => {
        // Given patch-package reports a normal apply failure, which is the failure that triggers recovery
        const output = '**ERROR** Failed to apply patch for package @rnmapbox/maps at path';

        // When failed package names are parsed
        const packages = getFailedPatchPackages(output);

        // Then the scoped package is identified so the install recovery can remove and restore it
        expect(packages).toEqual(['@rnmapbox/maps']);
    });

    it('continues to extract packages from changed-patch errors and deduplicates them', () => {
        // Given output containing both supported error formats and a repeated package
        const output = [
            'The patches for @rnmapbox/maps have changed.',
            'Failed to apply patch for package @rnmapbox/maps at path',
            'Failed to apply patch for package react-native at path',
        ].join('\n');

        // When failed package names are parsed
        const packages = getFailedPatchPackages(output);

        // Then each package is returned once, preserving the order of the first error
        expect(packages).toEqual(['@rnmapbox/maps', 'react-native']);
    });
});
