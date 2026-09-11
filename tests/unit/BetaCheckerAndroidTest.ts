import type betaCheckerModule from '@libs/Environment/betaChecker/index.android';

import CONST from '@src/CONST';

import DeviceInfo from 'react-native-device-info';

const PLAY_STORE_INSTALLER = 'com.android.vending';

// Required by path: jest-expo resolves `@libs/Environment/betaChecker` to the iOS file, so this suite is the only
// coverage the Android implementation can ever get.
const betaChecker = require<{default: typeof betaCheckerModule}>('@libs/Environment/betaChecker/index.android').default;

function mockInstaller(installerPackageName: string) {
    jest.spyOn(DeviceInfo, 'getInstallerPackageNameSync').mockReturnValue(installerPackageName);
}

describe('betaChecker (android)', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
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
