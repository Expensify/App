import * as AppUpdate from '@libs/actions/AppUpdate';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import DeviceInfo from 'react-native-device-info';
import Onyx from 'react-native-onyx';
import semver from 'semver';

import type {IsBetaBuild} from './types';

import pkg from '../../../../package.json';

type GithubReleaseJSON = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    tag_name: string | semver.SemVer;
};

let isLastSavedBeta = false;
// We have opted for `connectWithoutView` here as this is a strictly non-UI data.
Onyx.connectWithoutView({
    key: ONYXKEYS.IS_BETA,
    callback: (value) => {
        isLastSavedBeta = !!value;
    },
});

/**
 * Whether something other than the Play Store put this build on the device, i.e. a tester installed it from a
 * GitHub release.
 */
function isSideloadedBuild(): boolean {
    try {
        return DeviceInfo.getInstallerPackageNameSync() !== CONST.PLAY_STORE_INSTALLER_PACKAGE_NAME;
    } catch {
        // A throwing native call tells us nothing about the install, so let the version comparison decide.
        return false;
    }
}

/**
 * Whether this build is a beta (staging) build.
 *
 * A sideloaded build is answered straight away, both because testers install those from GitHub prereleases and
 * because it keeps them off the rate limited GitHub API. Anything the Play Store installed can still be on a
 * tester track, which only a comparison against the newest production release recognizes.
 */
function isBetaBuild(): IsBetaBuild {
    return new Promise((resolve) => {
        if (isSideloadedBuild()) {
            AppUpdate.setIsAppInBeta(true);
            resolve(true);
            return;
        }

        // Otherwise compare our version against the latest production release
        fetch(CONST.GITHUB_RELEASE_URL)
            .then((res) => res.json())
            .then((json: GithubReleaseJSON) => {
                const productionVersion = json.tag_name;

                if (!productionVersion || !semver.valid(productionVersion)) {
                    resolve(isLastSavedBeta);
                    return;
                }

                // If the current version we are running is greater than the production version, we are on a beta version of Android
                const isBeta = semver.gt(pkg.version, productionVersion);
                AppUpdate.setIsAppInBeta(isBeta);
                resolve(isBeta);
            })
            .catch(() => {
                // Use isLastSavedBeta in case we fail to fetch the new one, e.g. when we are offline
                resolve(isLastSavedBeta);
            });
    });
}

export default {
    isBetaBuild,
};
