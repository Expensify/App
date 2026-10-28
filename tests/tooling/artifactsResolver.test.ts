import type {Mock} from 'bun:test';
import {afterEach, beforeEach, describe, expect, it, jest, mock} from 'bun:test';

import type GithubUtils from '@github/libs/GithubUtils';

import type {getCredentials} from '@scripts/artifacts-utils/lib/githubCLI';

import * as childProcess from 'child_process';
import {fs as memfsFs, vol} from 'memfs';

const mockExecFileSync = jest.fn<(command: string) => string>();
const mockGetCredentials = jest.fn<typeof getCredentials>();
const mockPaginate = jest.fn<() => Promise<Array<{name: string}>>>();
const mockInitGithubClient = jest.fn<typeof GithubUtils.initOctokitWithToken>();

// Bun has no equivalent of `jest.mock(path)`'s automock, so each of these replaces the module explicitly. They must
// run before `artifactsResolver` is imported below: mock.module patches the shared module registry entry, and
// existing import bindings are live, but only if the patch happens before those bindings are first read.
// `bun test --isolate` keeps the replacements from reaching the other files in tests/tooling.
await mock.module('child_process', () => ({...childProcess, execFileSync: mockExecFileSync}));
await mock.module('fs', () => ({...memfsFs, default: memfsFs}));
const realGithubCLI = await import('@scripts/artifacts-utils/lib/githubCLI');
await mock.module('@scripts/artifacts-utils/lib/githubCLI', () => ({...realGithubCLI, getCredentials: mockGetCredentials}));
await mock.module('@github/libs/GithubUtils', () => ({
    default: {
        initOctokitWithToken: mockInitGithubClient,
        paginate: mockPaginate,
        octokit: {packages: {getAllPackageVersionsForPackageOwnedByOrg: jest.fn()}},
    },
}));

// Must be imported after the mock.module() calls above so it picks up the mocks.
const {default: resolveArtifacts, ARTIFACT_IDS} = await import('@scripts/artifacts-utils/lib/artifactsResolver');

const NEW_DOT_ROOT = '/repo';
const LOCAL_HASH = 'abc123hash';
const HERMES_V1_VERSION = '250829098.0.14';
const HERMES_LEGACY_VERSION = '0.17.0';
const HERMES_V1_FILE = `${NEW_DOT_ROOT}/node_modules/react-native/sdks/.hermesv1version`;
const HERMES_LEGACY_FILE = `${NEW_DOT_ROOT}/node_modules/react-native/sdks/.hermesversion`;
const TOKEN = 'tok';
const USERNAME = 'me';

/** A minimal fetch Response stub — only the members the resolver reads. */
function fakeFetchResponse(body: string) {
    return {ok: true, status: 200, text: () => Promise.resolve(body)};
}

/** Replaces global fetch with a queue of POM responses (one per candidate lookup). */
function mockFetchBodies(bodies: string[]) {
    let call = 0;
    // `preconnect` is part of the fetch type but nothing here calls it.
    global.fetch = Object.assign(
        jest.fn().mockImplementation(() => Promise.resolve(fakeFetchResponse(bodies.at(call++) ?? ''))),
        {preconnect: () => {}},
    );
}

/** The `<properties>` block of a published POM. Omit `hermesVersion` to mimic a POM that never recorded one. */
function pomBody(patchesHash: string, hermesVersion?: string) {
    const hermesProperty = hermesVersion === undefined ? '' : `<hermesVersion>${hermesVersion}</hermesVersion>`;
    return `<properties><patchesHash>${patchesHash}</patchesHash>${hermesProperty}</properties>`;
}

/** Makes the package-versions API return the given version names. */
function mockVersions(names: string[]) {
    mockPaginate.mockResolvedValue(names.map((name) => ({name})));
}

/** Mocks the local patches hash, package.json and react-native's Hermes tag files (tagged `hermes-v…`, no trailing newline, like upstream's). */
function mockLocalRepo() {
    mockExecFileSync.mockImplementation((command: string) => (command === 'bash' ? LOCAL_HASH : ''));
    vol.fromJSON({
        [`${NEW_DOT_ROOT}/package.json`]: '{"dependencies":{"react-native":"0.85.3"}}',
        [HERMES_V1_FILE]: `hermes-v${HERMES_V1_VERSION}`,
        [HERMES_LEGACY_FILE]: `hermes-v${HERMES_LEGACY_VERSION}`,
    });
}

/** Everything the resolver warned about, as one plain-text log. Logger writes warnings to stderr through console.error. */
function loggedLines(spy: Mock<typeof console.error>): string {
    return spy.mock.calls.map((call) => call.map(String).join(' ')).join('\n');
}

describe('artifactsResolver', () => {
    const ORIGINAL_CI = typeof process.env.CI === 'string' ? process.env.CI : undefined;

    beforeEach(() => {
        jest.clearAllMocks();
        vol.reset();
        // Force the local (gh CLI) credential path deterministically, regardless of the runner.
        delete process.env.CI;
        mockGetCredentials.mockReturnValue({githubToken: TOKEN, githubUsername: USERNAME});
    });

    afterEach(() => {
        jest.restoreAllMocks();
        if (ORIGINAL_CI === undefined) {
            delete process.env.CI;
        } else {
            process.env.CI = ORIGINAL_CI;
        }
    });

    describe('ARTIFACT_IDS', () => {
        it('uses the correct Maven artifactId per platform', () => {
            expect(ARTIFACT_IDS.android).toBe('react-android');
            expect(ARTIFACT_IDS.ios).toBe('react-native-artifacts');
        });
    });

    describe('resolveArtifacts', () => {
        it('falls back to source build when the gh CLI cannot provide credentials', async () => {
            mockGetCredentials.mockImplementation(() => {
                throw new Error('No GitHub CLI found. For setup instructions, refer to: https://example.com');
            });

            const result = await resolveArtifacts({platform: 'ios', packageName: 'react-hybrid', newDotRoot: NEW_DOT_ROOT, isHybrid: true, hermesVersionFile: HERMES_V1_FILE});

            expect(result).toStrictEqual({buildFromSource: true, version: null, packageName: 'react-hybrid', artifactId: 'react-native-artifacts'});
            expect(mockInitGithubClient).not.toHaveBeenCalled();
        });

        it('resolves a matching version and does not build from source', async () => {
            mockLocalRepo();
            mockVersions(['0.85.3-nomatch', '0.85.3-match']);
            mockFetchBodies([pomBody('differentHash', HERMES_V1_VERSION), pomBody(LOCAL_HASH, HERMES_V1_VERSION)]);

            const result = await resolveArtifacts({platform: 'ios', packageName: 'react-hybrid', newDotRoot: NEW_DOT_ROOT, isHybrid: true, hermesVersionFile: HERMES_V1_FILE});

            expect(mockInitGithubClient).toHaveBeenCalledWith(TOKEN);
            expect(result.buildFromSource).toBe(false);
            expect(result.version).toBe('0.85.3-match');
            if (!result.buildFromSource) {
                expect(result.githubToken).toBe(TOKEN);
                // iOS carries no username — its result type doesn't even include the field.
                expect('githubUsername' in result).toBe(false);
                expect(result.artifactUrlPrefix).toBe(
                    'https://maven.pkg.github.com/Expensify/App/com/expensify/react-hybrid/react-native-artifacts/0.85.3-match/react-native-artifacts-0.85.3-match',
                );
            }
        });

        it('returns the username alongside the token for a matching Android artifact', async () => {
            mockLocalRepo();
            mockVersions(['0.85.3-match']);
            mockFetchBodies([pomBody(LOCAL_HASH, HERMES_V1_VERSION)]);

            const result = await resolveArtifacts({platform: 'android', packageName: 'react-standalone', newDotRoot: NEW_DOT_ROOT, isHybrid: false, hermesVersionFile: HERMES_V1_FILE});

            expect(result.buildFromSource).toBe(false);
            if (!result.buildFromSource) {
                expect(result.githubToken).toBe(TOKEN);
                expect(result.githubUsername).toBe(USERNAME);
                expect(result.artifactUrlPrefix).toBe('https://maven.pkg.github.com/Expensify/App/com/expensify/react-standalone/react-android/0.85.3-match/react-android-0.85.3-match');
            }
        });

        it('falls back to source build when no candidate matches the local patches hash', async () => {
            mockLocalRepo();
            mockVersions(['0.85.3-other']);
            mockFetchBodies([pomBody('nomatch', HERMES_V1_VERSION)]);

            const result = await resolveArtifacts({platform: 'android', packageName: 'react-standalone', newDotRoot: NEW_DOT_ROOT, isHybrid: false, hermesVersionFile: HERMES_V1_FILE});

            expect(result.buildFromSource).toBe(true);
            expect(result.version).toBeNull();
        });

        it('skips a candidate built from the same patches but against a different Hermes, and says why', async () => {
            // Given two artifacts built from the local patches, the newer one against another Hermes than this build links.
            // A publish-side Hermes change leaves `patchesHash` untouched, so only the Hermes version can tell them apart.
            mockLocalRepo();
            const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
            mockVersions(['0.85.3-otherHermes', '0.85.3-match']);
            mockFetchBodies([pomBody(LOCAL_HASH, HERMES_LEGACY_VERSION), pomBody(LOCAL_HASH, HERMES_V1_VERSION)]);

            // When resolving for a Hermes V1 build.
            const result = await resolveArtifacts({platform: 'ios', packageName: 'react-standalone', newDotRoot: NEW_DOT_ROOT, isHybrid: false, hermesVersionFile: HERMES_V1_FILE});

            // Then the artifact compiled against this build's Hermes wins, and the skipped one is named with both versions
            // so the reason is visible in the build log instead of hiding behind a generic "no match".
            expect(result.version).toBe('0.85.3-match');
            expect(loggedLines(consoleError)).toContain(
                `Skipping react-standalone:0.85.3-otherHermes: built against Hermes ${HERMES_LEGACY_VERSION}, but this build links Hermes ${HERMES_V1_VERSION}.`,
            );
        });

        it('treats an artifact without a recorded Hermes version as a mismatch', async () => {
            // Given an artifact built from the local patches whose POM carries no Hermes version, so the Hermes it was
            // compiled against is unknown.
            mockLocalRepo();
            const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
            mockVersions(['0.85.3-untagged']);
            mockFetchBodies([pomBody(LOCAL_HASH)]);

            // When resolving.
            const result = await resolveArtifacts({platform: 'android', packageName: 'react-standalone', newDotRoot: NEW_DOT_ROOT, isHybrid: false, hermesVersionFile: HERMES_V1_FILE});

            // Then it is not trusted, because an unknown Hermes is exactly the mismatch the tag exists to catch, and it is
            // logged like any other mismatch rather than through a special case.
            expect(result.buildFromSource).toBe(true);
            expect(loggedLines(consoleError)).toContain(`Skipping react-standalone:0.85.3-untagged: built against Hermes unknown, but this build links Hermes ${HERMES_V1_VERSION}.`);
        });

        it('derives the Hermes version from whichever tag file the native caller picks', async () => {
            // Given one artifact per Hermes flavour, both built from the local patches, and a caller that disabled
            // Hermes V1 (so it hands over `.hermesversion` instead of `.hermesv1version`).
            mockLocalRepo();
            mockVersions(['0.85.3-v1', '0.85.3-legacy']);
            mockFetchBodies([pomBody(LOCAL_HASH, HERMES_V1_VERSION), pomBody(LOCAL_HASH, HERMES_LEGACY_VERSION)]);

            // When resolving.
            const result = await resolveArtifacts({platform: 'ios', packageName: 'react-standalone', newDotRoot: NEW_DOT_ROOT, isHybrid: false, hermesVersionFile: HERMES_LEGACY_FILE});

            // Then the legacy artifact is chosen: the tag file decides, and its `hermes-v` prefix is stripped before comparing.
            expect(result.version).toBe('0.85.3-legacy');
        });

        it('falls back to source build when the packages API fails', async () => {
            mockLocalRepo();
            mockPaginate.mockRejectedValue(new Error('403 Forbidden'));

            const result = await resolveArtifacts({platform: 'ios', packageName: 'react-hybrid', newDotRoot: NEW_DOT_ROOT, isHybrid: true, hermesVersionFile: HERMES_V1_FILE});

            expect(result.buildFromSource).toBe(true);
        });

        it('reads credentials from the environment in CI, without touching the gh CLI', async () => {
            process.env.CI = 'true';
            process.env.GITHUB_TOKEN = 'ciToken';
            process.env.GITHUB_ACTOR = 'ciActor';
            mockLocalRepo();
            mockVersions(['0.85.3-match']);
            mockFetchBodies([pomBody(LOCAL_HASH, HERMES_V1_VERSION)]);

            const result = await resolveArtifacts({platform: 'android', packageName: 'react-standalone', newDotRoot: NEW_DOT_ROOT, isHybrid: false, hermesVersionFile: HERMES_V1_FILE});

            expect(mockGetCredentials).not.toHaveBeenCalled();
            if (!result.buildFromSource) {
                expect(result.githubToken).toBe('ciToken');
                expect(result.githubUsername).toBe('ciActor');
            }
            delete process.env.GITHUB_TOKEN;
            delete process.env.GITHUB_ACTOR;
        });
    });
});
