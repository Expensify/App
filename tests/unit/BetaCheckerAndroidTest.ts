import type betaCheckerModule from '@libs/Environment/betaChecker/index.android';

import CONST from '@src/CONST';

import Config from 'react-native-config';
import DeviceInfo from 'react-native-device-info';

const PLAY_STORE_INSTALLER = 'com.android.vending';

// What Mobile-Expensify/Android/build.gradle exposes through BuildConfig in a HybridApp build
jest.mock('react-native-config', () => ({
    __esModule: true,
    default: {VERSION_CODE_PREFIX_MULTIPLIER: 100_000_000, BETA_TRACK_VERSION_CODE_PREFIX: 6},
}));

// Required by path: jest-expo resolves `@libs/Environment/betaChecker` to the iOS file, so this suite is the only
// coverage the Android implementation can ever get.
const betaChecker = require<{default: typeof betaCheckerModule}>('@libs/Environment/betaChecker/index.android').default;

function mockInstaller(installerPackageName: string) {
    jest.spyOn(DeviceInfo, 'getInstallerPackageNameSync').mockReturnValue(installerPackageName);
}

function mockVersionCode(versionCode: string) {
    jest.spyOn(DeviceInfo, 'getBuildNumber').mockReturnValue(versionCode);
}

describe('betaChecker (android)', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
        mockVersionCode('509047702');
    });

    it("reports a beta build for the Play beta-track flavour (versionCode prefix '6') even though the Play Store installed it", async () => {
        mockVersionCode('609047702');
        mockInstaller(PLAY_STORE_INSTALLER);

        await expect(betaChecker.isBetaBuild()).resolves.toBe(true);
    });

    it('falls back to the installer check in a standalone build, which has no versionCode scheme in BuildConfig', async () => {
        jest.replaceProperty(Config, 'VERSION_CODE_PREFIX_MULTIPLIER', undefined);
        jest.replaceProperty(Config, 'BETA_TRACK_VERSION_CODE_PREFIX', undefined);
        mockVersionCode('609047702');
        mockInstaller(PLAY_STORE_INSTALLER);

        await expect(betaChecker.isBetaBuild()).resolves.toBe(false);
    });

    it('falls back to the installer check when the versionCode cannot be read', async () => {
        jest.spyOn(DeviceInfo, 'getBuildNumber').mockImplementation(() => {
            throw new Error('RNDeviceInfo is not available');
        });
        mockInstaller(PLAY_STORE_INSTALLER);

        await expect(betaChecker.isBetaBuild()).resolves.toBe(false);
    });

    describe('sideloaded builds', () => {
        // 'unknown' is what react-native-device-info reports when the installer is null, e.g. a plain `adb install`
        it.each([['com.google.android.packageinstaller'], ['com.android.packageinstaller'], ['com.android.shell'], ['unknown']])(
            'reports a beta build when the installer is %s',
            async (installer) => {
                mockInstaller(installer);

                await expect(betaChecker.isBetaBuild()).resolves.toBe(true);
            },
        );
    });

    describe('Play Store builds', () => {
        it('recognizes the Play Store installer', () => {
            // Pinned here so the test below cannot pass by comparing a typo against itself
            expect(CONST.PLAY_STORE_INSTALLER_PACKAGE_NAME).toBe(PLAY_STORE_INSTALLER);
        });

        it('reports a production build', async () => {
            mockInstaller(PLAY_STORE_INSTALLER);

            await expect(betaChecker.isBetaBuild()).resolves.toBe(false);
        });

        it('reports a production build when the native call throws', async () => {
            jest.spyOn(DeviceInfo, 'getInstallerPackageNameSync').mockImplementation(() => {
                throw new Error('RNDeviceInfo is not available');
            });

            // Anything that awaits getEnvironment() hangs forever if this rejects instead of resolving
            await expect(betaChecker.isBetaBuild()).resolves.toBe(false);
        });
    });
});
