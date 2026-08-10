import {setBetaBuildVersion} from '@libs/actions/AppUpdate';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';
import semver from 'semver';

import type {IsBetaBuild} from './types';

import pkg from '../../../../package.json';

type GithubReleaseJSON = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    tag_name?: string | semver.SemVer;
};

/**
 * Reads the version that was last confirmed to be a beta build.
 *
 * We read it through a subscription rather than a snapshot because this runs while the app is starting and would
 * otherwise race Onyx loading from storage, and we disconnect straight away because the value is only needed once.
 */
function getBetaBuildVersion(): Promise<string | undefined> {
    return new Promise((resolve) => {
        // We have opted for `connectWithoutView` here as this is a strictly non-UI data.
        const connection = Onyx.connectWithoutView({
            key: ONYXKEYS.BETA_BUILD_VERSION,
            reuseConnection: false,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });
}

/**
 * Check the GitHub releases to see if the current build is a beta build or production build.
 *
 * A build counts as beta while its version is ahead of the latest production release. That stops being true once the
 * very same version is promoted to production, which would otherwise turn an already installed beta into a production
 * build partway through its life. To prevent that, the answer is stored against the version it was made for, so a build
 * that was ever ahead of production keeps behaving as a beta build until the app updates.
 */
function isBetaBuild(): IsBetaBuild {
    return getBetaBuildVersion().then((betaBuildVersion) => {
        if (betaBuildVersion === pkg.version) {
            return true;
        }

        return fetch(CONST.GITHUB_RELEASE_URL)
            .then((res) => res.json())
            .then((json: GithubReleaseJSON) => {
                const productionVersion = json.tag_name;

                // A rate limited or otherwise unexpected response carries no tag name, and GitHub is not guaranteed to
                // hand us something semver can parse. Bailing out here leaves the stored version untouched so it stays
                // usable on the next launch instead of being overwritten with a guess.
                if (!productionVersion || !semver.valid(productionVersion)) {
                    return false;
                }

                // If the current version we are running is greater than the production version, we are on a beta version of Android
                const isBeta = semver.gt(pkg.version, productionVersion);
                if (isBeta) {
                    setBetaBuildVersion(pkg.version);
                }
                return isBeta;
            })
            .catch(() => {
                // We cannot reach GitHub, e.g. when we are offline. A build already confirmed as beta never reaches
                // this point because the stored version above short circuits first, so production is the safe answer.
                return false;
            });
    });
}

export default {
    isBetaBuild,
};
