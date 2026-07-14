import resolveArtifacts, {ARTIFACT_IDS} from '@scripts/artifacts-utils/lib/artifactsResolver';

/**
 * @jest-environment node
 */
import {getOctokit} from '@actions/github';
import {execFileSync} from 'child_process';
import fs from 'fs';

jest.mock('child_process');
jest.mock('@actions/github');

const mockExecFileSync = jest.mocked(execFileSync);
const mockGetOctokit = jest.mocked(getOctokit);
const mockPaginate = jest.fn();

const NEW_DOT_ROOT = '/repo';
const LOCAL_HASH = 'abc123hash';

/** A minimal fetch Response stub — only the members the resolver reads. */
function fakeFetchResponse(body: string) {
    return {ok: true, status: 200, text: () => Promise.resolve(body)};
}

/** Replaces global fetch with a queue of POM responses (one per candidate lookup). */
function mockFetchBodies(bodies: string[]) {
    let call = 0;
    global.fetch = jest.fn().mockImplementation(() => Promise.resolve(fakeFetchResponse(bodies.at(call++) ?? '')));
}

/** Makes the Octokit package-versions API return the given version names. */
function mockVersions(names: string[]) {
    mockPaginate.mockResolvedValue(names.map((name) => ({name})));
    // Faking a minimal Octokit surface in a unit test.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    mockGetOctokit.mockReturnValue({
        paginate: mockPaginate,
        rest: {packages: {getAllPackageVersionsForPackageOwnedByOrg: jest.fn()}},
    } as unknown as ReturnType<typeof getOctokit>);
}

/** Mocks the gh CLI calls needed for credentials + the local patches hash. */
function mockResolveExec() {
    mockExecFileSync.mockImplementation((cmd: string, args?: readonly string[]) => {
        if (cmd === 'bash') {
            return LOCAL_HASH;
        }
        if (cmd === 'gh' && args?.includes('status')) {
            return 'Token scopes: read:packages';
        }
        if (cmd === 'gh' && args?.includes('user')) {
            // `gh api user --jq .login` returns the bare login string.
            return 'me';
        }
        if (cmd === 'gh' && args?.includes('token')) {
            return 'tok';
        }
        return '';
    });
    jest.spyOn(fs, 'readFileSync').mockReturnValue('{"dependencies":{"react-native":"0.85.3"}}');
}

describe('artifactsResolver', () => {
    const ORIGINAL_CI = typeof process.env.CI === 'string' ? process.env.CI : undefined;

    beforeEach(() => {
        jest.clearAllMocks();
        // Force the local (gh) credential path deterministically, regardless of the runner.
        delete process.env.CI;
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
        it('falls back to source build when the GitHub CLI is unavailable', async () => {
            mockExecFileSync.mockImplementation((cmd: string) => {
                if (cmd === 'which') {
                    throw new Error('not found');
                }
                return '';
            });

            const result = await resolveArtifacts({platform: 'ios', packageName: 'react-hybrid', newDotRoot: NEW_DOT_ROOT, isHybrid: true});

            expect(result).toStrictEqual({buildFromSource: true, version: null, packageName: 'react-hybrid', artifactId: 'react-native-artifacts'});
        });

        it('resolves a matching version and does not build from source', async () => {
            mockResolveExec();
            mockVersions(['0.85.3-nomatch', '0.85.3-match']);
            mockFetchBodies(['<properties><patchesHash>differenthash</patchesHash></properties>', `<properties><patchesHash>${LOCAL_HASH}</patchesHash></properties>`]);

            const result = await resolveArtifacts({platform: 'ios', packageName: 'react-hybrid', newDotRoot: NEW_DOT_ROOT, isHybrid: true});

            expect(result.buildFromSource).toBe(false);
            expect(result.version).toBe('0.85.3-match');
            if (!result.buildFromSource) {
                expect(result.githubToken).toBe('tok');
                // iOS carries no username — its result type doesn't even include the field.
                expect('githubUsername' in result).toBe(false);
            }
        });

        it('returns the username alongside the token for a matching Android artifact', async () => {
            mockResolveExec();
            mockVersions(['0.85.3-match']);
            mockFetchBodies([`<properties><patchesHash>${LOCAL_HASH}</patchesHash></properties>`]);

            const result = await resolveArtifacts({platform: 'android', packageName: 'react-standalone', newDotRoot: NEW_DOT_ROOT, isHybrid: false});

            expect(result.buildFromSource).toBe(false);
            if (!result.buildFromSource) {
                expect(result.githubToken).toBe('tok');
                expect(result.githubUsername).toBe('me');
            }
        });

        it('falls back to source build when no candidate matches the local patches hash', async () => {
            mockResolveExec();
            mockVersions(['0.85.3-other']);
            mockFetchBodies(['<properties><patchesHash>nomatch</patchesHash></properties>']);

            const result = await resolveArtifacts({platform: 'android', packageName: 'react-standalone', newDotRoot: NEW_DOT_ROOT, isHybrid: false});

            expect(result.buildFromSource).toBe(true);
            expect(result.version).toBeNull();
        });
    });
});
