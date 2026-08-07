import GithubUtils from '@github/libs/GithubUtils';

import resolveArtifacts, {ARTIFACT_IDS} from '@scripts/artifacts-utils/lib/artifactsResolver';
import {getCredentials} from '@scripts/artifacts-utils/lib/githubCLI';

/**
 * @jest-environment node
 */
import {execFileSync} from 'child_process';
import fs from 'fs';

jest.mock('child_process');
jest.mock('@scripts/artifacts-utils/lib/githubCLI');
jest.mock('@github/libs/GithubUtils', () => ({
    __esModule: true,
    default: {
        initOctokitWithToken: jest.fn(),
        paginate: jest.fn(),
        octokit: {packages: {getAllPackageVersionsForPackageOwnedByOrg: jest.fn()}},
    },
}));

const mockExecFileSync = jest.mocked(execFileSync);
const mockGetCredentials = jest.mocked(getCredentials);
const mockPaginate = jest.mocked(GithubUtils.paginate);
// eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mocks don't rely on `this` binding
const mockInitGithubClient = jest.mocked(GithubUtils.initOctokitWithToken);

const NEW_DOT_ROOT = '/repo';
const LOCAL_HASH = 'abc123hash';
const TOKEN = 'tok';
const USERNAME = 'me';

/** A minimal fetch Response stub — only the members the resolver reads. */
function fakeFetchResponse(body: string) {
    return {ok: true, status: 200, text: () => Promise.resolve(body)};
}

/** Replaces global fetch with a queue of POM responses (one per candidate lookup). */
function mockFetchBodies(bodies: string[]) {
    let call = 0;
    global.fetch = jest.fn().mockImplementation(() => Promise.resolve(fakeFetchResponse(bodies.at(call++) ?? '')));
}

/** Makes the package-versions API return the given version names. */
function mockVersions(names: string[]) {
    // Faking the paginate() surface in a unit test.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    (mockPaginate as unknown as jest.Mock).mockResolvedValue(names.map((name) => ({name})));
}

/** Mocks the local patches hash and the react-native version read from package.json. */
function mockLocalRepo() {
    mockExecFileSync.mockImplementation((cmd: string) => (cmd === 'bash' ? LOCAL_HASH : ''));
    jest.spyOn(fs, 'readFileSync').mockReturnValue('{"dependencies":{"react-native":"0.85.3"}}');
}

describe('artifactsResolver', () => {
    const ORIGINAL_CI = typeof process.env.CI === 'string' ? process.env.CI : undefined;

    beforeEach(() => {
        jest.clearAllMocks();
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

            const result = await resolveArtifacts({platform: 'ios', packageName: 'react-hybrid', newDotRoot: NEW_DOT_ROOT, isHybrid: true});

            expect(result).toStrictEqual({buildFromSource: true, version: null, packageName: 'react-hybrid', artifactId: 'react-native-artifacts'});
            expect(mockInitGithubClient).not.toHaveBeenCalled();
        });

        it('resolves a matching version and does not build from source', async () => {
            mockLocalRepo();
            mockVersions(['0.85.3-nomatch', '0.85.3-match']);
            mockFetchBodies(['<properties><patchesHash>differentHash</patchesHash></properties>', `<properties><patchesHash>${LOCAL_HASH}</patchesHash></properties>`]);

            const result = await resolveArtifacts({platform: 'ios', packageName: 'react-hybrid', newDotRoot: NEW_DOT_ROOT, isHybrid: true});

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
            mockFetchBodies([`<properties><patchesHash>${LOCAL_HASH}</patchesHash></properties>`]);

            const result = await resolveArtifacts({platform: 'android', packageName: 'react-standalone', newDotRoot: NEW_DOT_ROOT, isHybrid: false});

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
            mockFetchBodies(['<properties><patchesHash>nomatch</patchesHash></properties>']);

            const result = await resolveArtifacts({platform: 'android', packageName: 'react-standalone', newDotRoot: NEW_DOT_ROOT, isHybrid: false});

            expect(result.buildFromSource).toBe(true);
            expect(result.version).toBeNull();
        });

        it('falls back to source build when the packages API fails', async () => {
            mockLocalRepo();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            (mockPaginate as unknown as jest.Mock).mockRejectedValue(new Error('403 Forbidden'));

            const result = await resolveArtifacts({platform: 'ios', packageName: 'react-hybrid', newDotRoot: NEW_DOT_ROOT, isHybrid: true});

            expect(result.buildFromSource).toBe(true);
        });

        it('reads credentials from the environment in CI, without touching the gh CLI', async () => {
            process.env.CI = 'true';
            process.env.GITHUB_TOKEN = 'ciToken';
            process.env.GITHUB_ACTOR = 'ciActor';
            mockLocalRepo();
            mockVersions(['0.85.3-match']);
            mockFetchBodies([`<properties><patchesHash>${LOCAL_HASH}</patchesHash></properties>`]);

            const result = await resolveArtifacts({platform: 'android', packageName: 'react-standalone', newDotRoot: NEW_DOT_ROOT, isHybrid: false});

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
