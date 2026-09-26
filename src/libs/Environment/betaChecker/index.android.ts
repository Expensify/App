import CONST from '@src/CONST';

import Config from 'react-native-config';
import DeviceInfo from 'react-native-device-info';

import type {IsBetaBuild} from './types';

/**
 * Distinguishes different Play Store deployment tracks based on the versionCode prefix. The scheme lives in
 * Mobile-Expensify/Android/build.gradle, which exposes it through BuildConfig. Standalone builds have no such fields.
 */
function isBetaTrackBuild(): boolean {
    const prefixMultiplier = Number(Config.VERSION_CODE_PREFIX_MULTIPLIER);
    const betaTrackPrefix = Number(Config.BETA_TRACK_VERSION_CODE_PREFIX);
    if (!prefixMultiplier || Number.isNaN(betaTrackPrefix)) {
        return false;
    }

    try {
        return Math.floor(Number(DeviceInfo.getBuildNumber()) / prefixMultiplier) === betaTrackPrefix;
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
