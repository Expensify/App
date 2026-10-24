// cspell:ignore ARCHS CPLUSPLUSFLAGS fprofile profdata

import {describe, expect, it} from 'bun:test';

import {iosRockBuildArguments} from '@scripts/pgo/ios';

import {parseArgs} from '@rock-js/tools';

describe('PGO iOS Rock build arguments', () => {
    it('selects a local device Release build and preserves exact compiler settings', () => {
        // Given compiler settings containing spaces and inherited Xcode variables.
        const settings = ['build', 'ARCHS=arm64', 'CODE_SIGN_IDENTITY=Apple Development', 'OTHER_CPLUSPLUSFLAGS=$(inherited) -fprofile-use=/tmp/profile directory/journey.profdata'];
        // When the adapter creates a Rock invocation.
        const args = iosRockBuildArguments('/tmp/derived data/optimized', settings);
        // Then the local Release destination and existing pod preparation are explicit.
        expect(args.slice(0, 12)).toEqual([
            'build:ios',
            '--local',
            '--verbose',
            '--configuration',
            'Release',
            '--scheme',
            'Expensify',
            '--destination',
            'generic/platform=iOS',
            '--build-folder',
            '/tmp/derived data/optimized',
            '--no-install-pods',
        ]);
        expect(parseArgs(args.at(13) ?? '')).toEqual(settings);
    });
});
