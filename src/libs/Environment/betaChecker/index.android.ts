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
 * Whether something other than the Play Store put this build on the device. Production builds only ever reach a
 * device through the Play Store, so any other installer means the build was sideloaded, i.e. downloaded from a
 * GitHub release. Unlike the version comparison below, the answer does not change once a production release catches
 * up with the build's version — though Android does rewrite the installer if a different one later updates the app.
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
 * Check the GitHub releases to see if the current build is a beta build or production build
 */
function isBetaBuild(): IsBetaBuild {
    return new Promise((resolve) => {
        // A sideloaded build is a beta build: testers install those from GitHub prereleases. Answering here also
        // keeps them off the rate limited GitHub API, whose failures are what flips the environment mid-testing.
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

                // A rate limited or malformed response carries no usable tag. Production is the safe answer when
                // we cannot tell — the missing `return` here used to fall through into semver.gt(version, undefined),
                // which threw and left the verdict to the catch below.
                if (!productionVersion || !semver.valid(productionVersion)) {
                    AppUpdate.setIsAppInBeta(false);
                    resolve(false);
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
