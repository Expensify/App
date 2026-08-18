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
 * Whether the app was installed from somewhere other than the Play Store, i.e. a GitHub release APK a tester
 * sideloaded, or an `adb install`. The installer package name is set by whoever installed the app, so unlike the
 * version comparison below it is stable for the lifetime of the install: it cannot flip to production once the
 * production release catches up with the staging build's version.
 */
function isSideloadedBuild(): boolean {
    return DeviceInfo.getInstallerPackageNameSync() !== CONST.ANDROID_PLAY_STORE_INSTALLER_PACKAGE_NAME;
}

/**
 * Check the GitHub releases to see if the current build is a beta build or production build
 */
function isBetaBuild(): IsBetaBuild {
    // Production builds are only ever delivered by the Play Store, so a sideloaded build is always a beta build.
    // Answering here also keeps these builds off the GitHub API, which is rate limited and can otherwise report
    // the wrong environment when the request fails.
    if (isSideloadedBuild()) {
        AppUpdate.setIsAppInBeta(true);
        return Promise.resolve(true);
    }

    return new Promise((resolve) => {
        fetch(CONST.GITHUB_RELEASE_URL)
            .then((res) => res.json())
            .then((json: GithubReleaseJSON) => {
                const productionVersion = json.tag_name;
                if (!productionVersion) {
                    AppUpdate.setIsAppInBeta(false);
                    resolve(false);
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
