import type betaCheckerModule from '@libs/Environment/betaChecker/index.android';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import DeviceInfo from 'react-native-device-info';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const PLAY_STORE_INSTALLER = 'com.android.vending';

Onyx.init({keys: ONYXKEYS});

// Required by path: jest-expo resolves `@libs/Environment/betaChecker` to the iOS file, so this suite is the only
// coverage the Android implementation can ever get. Required lazily so Onyx is initialized before the module's
// `connectWithoutView` runs.
const betaChecker = require<{default: typeof betaCheckerModule}>('@libs/Environment/betaChecker/index.android').default;

const originalFetch = global.fetch;

function mockInstaller(installerPackageName: string) {
    jest.spyOn(DeviceInfo, 'getInstallerPackageNameSync').mockReturnValue(installerPackageName);
}

function mockGithubRelease(tagName: string) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    global.fetch = jest.fn().mockResolvedValue({json: () => Promise.resolve({tag_name: tagName})});
}

describe('betaChecker (android)', () => {
    beforeEach(async () => {
        jest.restoreAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    describe('sideloaded builds', () => {
        // 'unknown' is what react-native-device-info reports when the installer is null, e.g. a plain `adb install`
        it.each([['com.google.android.packageinstaller'], ['com.android.packageinstaller'], ['com.android.shell'], ['unknown']])(
            'reports a beta build when the installer is %s',
            async (installer) => {
                mockInstaller(installer);
                // A tag that would resolve to "production" if the version comparison were reached
                mockGithubRelease('99.9.9-9');

                await expect(betaChecker.isBetaBuild()).resolves.toBe(true);

                // The verdict comes from the install source alone, so the rate limited GitHub API is never asked
                expect(global.fetch).not.toHaveBeenCalled();
                await waitForBatchedUpdates();
                await expect(getOnyxValue(ONYXKEYS.IS_BETA)).resolves.toBe(true);
            },
        );
    });

    describe('Play Store builds', () => {
        it('recognizes the Play Store installer', () => {
            // Pinned here so the tests below cannot pass by comparing a typo against itself
            expect(CONST.PLAY_STORE_INSTALLER_PACKAGE_NAME).toBe(PLAY_STORE_INSTALLER);
        });

        it('falls through to the version comparison', async () => {
            mockInstaller(PLAY_STORE_INSTALLER);
            mockGithubRelease('99.9.9-9');

            await expect(betaChecker.isBetaBuild()).resolves.toBe(false);
            expect(global.fetch).toHaveBeenCalledWith(CONST.GITHUB_RELEASE_URL);
        });

        it('falls through to the version comparison when the native call throws', async () => {
            jest.spyOn(DeviceInfo, 'getInstallerPackageNameSync').mockImplementation(() => {
                throw new Error('RNDeviceInfo is not available');
            });
            mockGithubRelease('99.9.9-9');

            // Anything that awaits getEnvironment() hangs forever if this rejects instead of resolving
            await expect(betaChecker.isBetaBuild()).resolves.toBe(false);
            expect(global.fetch).toHaveBeenCalledWith(CONST.GITHUB_RELEASE_URL);
        });
    });

    describe('the version comparison', () => {
        beforeEach(() => {
            mockInstaller(PLAY_STORE_INSTALLER);
        });

        it('reports a beta build when the running version is ahead of the latest production release', async () => {
            mockGithubRelease('0.0.1-0');

            await expect(betaChecker.isBetaBuild()).resolves.toBe(true);
            await waitForBatchedUpdates();
            await expect(getOnyxValue(ONYXKEYS.IS_BETA)).resolves.toBe(true);
        });

        it('reports a production build once the production release catches up', async () => {
            // The module compares against this same file, so the running build is never ahead of itself
            const currentVersion = require<{version: string}>('../../package.json').version;
            mockGithubRelease(currentVersion);

            await expect(betaChecker.isBetaBuild()).resolves.toBe(false);
            await waitForBatchedUpdates();
            await expect(getOnyxValue(ONYXKEYS.IS_BETA)).resolves.toBe(false);
        });

        it.each([[true], [false]])('falls back to the last saved verdict of %s when the request fails', async (lastSavedVerdict) => {
            global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
            await Onyx.set(ONYXKEYS.IS_BETA, lastSavedVerdict);
            await waitForBatchedUpdates();

            await expect(betaChecker.isBetaBuild()).resolves.toBe(lastSavedVerdict);

            // An offline check must not overwrite the verdict it just fell back on
            await waitForBatchedUpdates();
            await expect(getOnyxValue(ONYXKEYS.IS_BETA)).resolves.toBe(lastSavedVerdict);
        });
    });
});
