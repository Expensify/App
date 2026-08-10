/* eslint-disable @typescript-eslint/naming-convention -- `tag_name` mirrors the GitHub release API response */
/* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- global.fetch is swapped for a plain jest.fn mock */
/**
 * Covers the Android beta check, which decides whether a native build talks to staging or production.
 *
 * Android is the interesting platform because the answer is derived at runtime from the latest GitHub production
 * release rather than from anything baked into the binary. Jest defaults to the iOS platform, so the Android variant is
 * imported by its explicit path.
 */
import betaChecker from '@libs/Environment/betaChecker/index.android';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';
import semver from 'semver';

import pkg from '../../package.json';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const NEWER_THAN_US = semver.inc(pkg.version, 'patch') ?? '99.99.99';
const OLDER_THAN_US = '0.0.1';

Onyx.init({keys: ONYXKEYS});

function mockGithubResponse(body: unknown) {
    const fetchMock = jest.fn().mockResolvedValue({json: () => Promise.resolve(body)});
    global.fetch = fetchMock as unknown as typeof global.fetch;
    return fetchMock;
}

function mockGithubFailure() {
    const fetchMock = jest.fn().mockRejectedValue(new Error('Network request failed'));
    global.fetch = fetchMock as unknown as typeof global.fetch;
    return fetchMock;
}

async function setStoredBetaBuildVersion(version: string | null) {
    await Onyx.set(ONYXKEYS.BETA_BUILD_VERSION, version);
    await waitForBatchedUpdates();
}

function getStoredBetaBuildVersion(): Promise<string | undefined> {
    return new Promise((resolve) => {
        const connection = Onyx.connectWithoutView({
            key: ONYXKEYS.BETA_BUILD_VERSION,
            reuseConnection: false,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });
}

beforeEach(async () => {
    await Onyx.clear();
    await waitForBatchedUpdates();
});

describe('betaChecker (android)', () => {
    describe('version comparison', () => {
        it('reports a beta build when the running version is ahead of the latest production release', async () => {
            mockGithubResponse({tag_name: OLDER_THAN_US});

            await expect(betaChecker.isBetaBuild()).resolves.toBe(true);
            await waitForBatchedUpdates();
            await expect(getStoredBetaBuildVersion()).resolves.toBe(pkg.version);
        });

        it('reports a production build once the running version has been promoted to production', async () => {
            mockGithubResponse({tag_name: pkg.version});

            await expect(betaChecker.isBetaBuild()).resolves.toBe(false);
            await waitForBatchedUpdates();
            await expect(getStoredBetaBuildVersion()).resolves.toBeUndefined();
        });

        it('reports a production build when the running version is behind the latest production release', async () => {
            mockGithubResponse({tag_name: NEWER_THAN_US});

            await expect(betaChecker.isBetaBuild()).resolves.toBe(false);
        });

        it('asks GitHub for the latest production release', async () => {
            const fetchMock = mockGithubResponse({tag_name: OLDER_THAN_US});

            await betaChecker.isBetaBuild();

            expect(fetchMock).toHaveBeenCalledWith(CONST.GITHUB_RELEASE_URL);
        });
    });

    describe('stored verdict', () => {
        it('stays a beta build after the running version ships to production, without asking GitHub again', async () => {
            // The regression this whole check exists for. A staging build and its production release share a version
            // tag, so once it ships the comparison flips and the build would otherwise become production mid-life.
            await setStoredBetaBuildVersion(pkg.version);
            const fetchMock = mockGithubResponse({tag_name: pkg.version});

            await expect(betaChecker.isBetaBuild()).resolves.toBe(true);
            expect(fetchMock).not.toHaveBeenCalled();
        });

        it('ignores a verdict stored for a different version', async () => {
            await setStoredBetaBuildVersion(OLDER_THAN_US);
            const fetchMock = mockGithubResponse({tag_name: pkg.version});

            await expect(betaChecker.isBetaBuild()).resolves.toBe(false);
            expect(fetchMock).toHaveBeenCalled();
        });

        it('survives being offline once the build has been confirmed as beta', async () => {
            await setStoredBetaBuildVersion(pkg.version);
            mockGithubFailure();

            await expect(betaChecker.isBetaBuild()).resolves.toBe(true);
        });
    });

    describe('unusable responses', () => {
        it('reports a production build when GitHub cannot be reached and nothing was stored', async () => {
            mockGithubFailure();

            await expect(betaChecker.isBetaBuild()).resolves.toBe(false);
        });

        it('leaves the stored version alone when the response carries no tag name', async () => {
            // A rate limited response looks like this. Writing a verdict from it would destroy a good stored version.
            await setStoredBetaBuildVersion(OLDER_THAN_US);
            mockGithubResponse({message: 'API rate limit exceeded'});

            await expect(betaChecker.isBetaBuild()).resolves.toBe(false);
            await waitForBatchedUpdates();
            await expect(getStoredBetaBuildVersion()).resolves.toBe(OLDER_THAN_US);
        });

        it('leaves the stored version alone when the response body cannot be parsed', async () => {
            await setStoredBetaBuildVersion(OLDER_THAN_US);
            global.fetch = jest.fn().mockResolvedValue({json: () => Promise.reject(new Error('Unexpected token'))}) as unknown as typeof global.fetch;

            await expect(betaChecker.isBetaBuild()).resolves.toBe(false);
            await waitForBatchedUpdates();
            await expect(getStoredBetaBuildVersion()).resolves.toBe(OLDER_THAN_US);
        });

        it('resolves rather than throwing when the tag name is not a version', async () => {
            mockGithubResponse({tag_name: 'not-a-version'});

            await expect(betaChecker.isBetaBuild()).resolves.toBe(false);
        });
    });
});
