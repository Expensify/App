// cspell:ignore Ppgo profdata

import {describe, expect, it} from 'bun:test';

import {androidReleasePipeline, androidRockBuildArguments} from '@scripts/pgo/android';

import {parseArgs} from '@rock-js/tools';

describe('PGO Android release processing', () => {
    it('builds locally through Rock with the exact optimized profile and FullStory exclusions', () => {
        // Given a shrinking build and an immutable profile in a directory containing spaces.
        const pipeline = androidReleasePipeline(undefined, 'true');
        const parameters = ['-PpgoMode=use', '-PpgoProfile=/tmp/profile batch/journey.profdata', ...pipeline.arguments];
        // When the adapter forwards this build to Rock.
        const args = androidRockBuildArguments(pipeline.task, parameters);
        const forwarded = parseArgs(args.at(-1) ?? '');
        // Then Rock cannot reuse a cached build or lose profile and upload-prevention arguments.
        expect(args.slice(0, 7)).toEqual(['build:android', '--local', '--verbose', '--variant', 'release', '--tasks', 'packageRelease']);
        expect(forwarded).toEqual(parameters);
        expect(forwarded).toContain('-PpgoSkipFullStory=true');
        expect(forwarded).toContain('fullstoryRelease');
    });
    it('keeps the bootstrap build separate from FullStory output', () => {
        // Given no explicit release pipeline request.
        // When the build selects its task and artifact.
        const options = androidReleasePipeline();
        // Then bootstrap processing does not masquerade as the final release pipeline.
        expect(options).toEqual({enabled: false, shrinking: false, artifactDirectory: 'apk', task: ':packageRelease', apkTask: 'packageRelease', arguments: ['-x', 'fullstoryRelease']});
    });

    it('selects the processed APK without overriding local credentials', () => {
        // Given an explicit request to exercise shrinking and FullStory.
        // When the build selects its task and artifact.
        const options = androidReleasePipeline('true');
        // Then it targets the final processed APK and supplies no signing or identity overrides.
        expect(options.task).toBe(':fullstoryRelease');
        expect(options.apkTask).toBe('fullstoryRelease');
        expect(options.arguments.at(0)).toBe('--init-script');
        expect(options.arguments.join(' ')).not.toMatch(/signing|password|applicationId/i);
    });

    it('rejects ambiguous opt-in settings', () => {
        // Given a mistyped environment setting.
        // When the build decides whether release processing is required.
        const select = () => androidReleasePipeline('yes');
        // Then it fails instead of silently substituting the bootstrap build.
        expect(select).toThrow('must be true or false');
    });

    it('shrinks locally while excluding external FullStory processing', () => {
        // Given a request for release shrinking without asset uploads.
        // When the build selects its tasks and output directory.
        const options = androidReleasePipeline(undefined, 'true');
        // Then the APK remains distinct and FullStory is both excluded and disabled.
        expect(options.shrinking).toBe(true);
        expect(options.enabled).toBe(false);
        expect(options.artifactDirectory).toBe('apk-shrunk');
        expect(options.task).toBe(':packageRelease');
        expect(options.arguments).toContain('-PpgoSkipFullStory=true');
        expect(options.arguments).toContain('-x');
    });

    it('rejects simultaneous shrinking and upload pipeline requests', () => {
        // Given conflicting local-only and external processing choices.
        // When the build selects a pipeline.
        const select = () => androidReleasePipeline('true', 'true');
        // Then it cannot silently choose the upload-capable task.
        expect(select).toThrow('not both');
    });
});
