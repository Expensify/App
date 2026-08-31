import CONST from '@src/CONST';

import DeviceInfo from 'react-native-device-info';

import type {IsBetaBuild} from './types';

/**
 * Whether the Play Store put this build on the device. Anything else means a tester installed it from a GitHub
 * release. `undefined` when the native call cannot say.
 */
function isPlayStoreInstall(): boolean | undefined {
    try {
        return DeviceInfo.getInstallerPackageNameSync() === CONST.PLAY_STORE_INSTALLER_PACKAGE_NAME;
    } catch {
        return undefined;
    }
}

/**
 * Whether this build is a beta (staging) build.
 *
 * How the build reached the device is the only signal that tells staging and production apart, since both ship
 * the same binary. Testers install from GitHub prereleases, so anything the Play Store did not install is a
 * beta. An unknown installer is treated as production, the safer default.
 */
function isBetaBuild(): IsBetaBuild {
    return Promise.resolve(isPlayStoreInstall() === false);
}

export default {
    isBetaBuild,
};
