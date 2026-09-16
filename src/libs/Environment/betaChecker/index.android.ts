import CONST from '@src/CONST';

import DeviceInfo from 'react-native-device-info';

import type {IsBetaBuild} from './types';

/**
 * Distinguishes different Play Store deployment tracks based on the prefix added in Gradle.
 */
function isBetaTrackBuild(): boolean {
    const BETA_TRACK_VERSION_CODE_PREFIX = 6;
    const VERSION_CODE_PREFIX_DIVISOR = 100_000_000;

    try {
        return Math.floor(Number(DeviceInfo.getBuildNumber()) / VERSION_CODE_PREFIX_DIVISOR) === BETA_TRACK_VERSION_CODE_PREFIX;
    } catch {
        return false;
    }
}

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
 * Staging and production ship the same binary, install source and version prefix decide whether this is a beta build.
 */
function isBetaBuild(): IsBetaBuild {
    return Promise.resolve(isBetaTrackBuild() || isPlayStoreInstall() === false);
}

export default {
    isBetaBuild,
};
