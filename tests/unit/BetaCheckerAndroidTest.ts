import type betaCheckerModule from '@libs/Environment/betaChecker/index.android';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockGetInstallerPackageNameSync = jest.fn<string, []>();
const mockSetIsAppInBeta = jest.fn<void, [boolean]>();

jest.mock('react-native-device-info', () => ({
    __esModule: true,
    default: {
        getInstallerPackageNameSync: () => mockGetInstallerPackageNameSync(),
    },
}));

jest.mock('@libs/actions/AppUpdate', () => ({
    __esModule: true,
    setIsAppInBeta: (isBeta: boolean) => {
        mockSetIsAppInBeta(isBeta);
    },
}));

Onyx.init({keys: ONYXKEYS});

// Lazy-require so the mock factories above are in place before the module registers its Onyx connection.
const betaChecker = require<{default: typeof betaCheckerModule}>('@libs/Environment/betaChecker/index.android').default;

// The version this build reports, i.e. the one compared against the latest production release.
const currentVersion = require<{version: string}>('../../package.json').version;

function mockGithubRelease(tagName: string) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    global.fetch = jest.fn().mockResolvedValue({json: () => Promise.resolve({tag_name: tagName})});
}

describe('betaChecker (android)', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    describe('sideloaded builds', () => {
        it.each([['unknown'], ['com.google.android.packageinstaller'], ['com.android.shell']])('reports a beta build when the installer is %s', async (installer) => {
            mockGetInstallerPackageNameSync.mockReturnValue(installer);
            mockGithubRelease('99.9.9-9');

            await expect(betaChecker.isBetaBuild()).resolves.toBe(true);

            // The verdict comes from the install source alone, so the rate limited GitHub API is never asked
            expect(global.fetch).not.toHaveBeenCalled();
            expect(mockSetIsAppInBeta).toHaveBeenCalledWith(true);
        });
    });

    describe('Play Store builds', () => {
        beforeEach(() => {
            mockGetInstallerPackageNameSync.mockReturnValue(CONST.ANDROID_PLAY_STORE_INSTALLER_PACKAGE_NAME);
        });

        it('reports a beta build when the running version is ahead of the latest production release', async () => {
            mockGithubRelease('0.0.1-0');

            await expect(betaChecker.isBetaBuild()).resolves.toBe(true);
            expect(mockSetIsAppInBeta).toHaveBeenCalledWith(true);
        });

        it('reports a production build once the production release catches up', async () => {
            mockGithubRelease(currentVersion);

            await expect(betaChecker.isBetaBuild()).resolves.toBe(false);
            expect(mockSetIsAppInBeta).toHaveBeenCalledWith(false);
        });

        it('falls back to the last saved verdict when the request fails', async () => {
            global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
            await Onyx.set(ONYXKEYS.IS_BETA, true);
            await waitForBatchedUpdates();

            await expect(betaChecker.isBetaBuild()).resolves.toBe(true);
        });
    });
});
