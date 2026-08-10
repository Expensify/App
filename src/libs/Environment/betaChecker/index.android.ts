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
 * Reads the version last confirmed to be a beta build via a one-shot subscription, so it cannot race Onyx loading
 * from storage during app start.
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
 * Check the GitHub releases to see if the current build is a beta build or production build. A build is beta while
 * its version is ahead of the latest production release; the verdict is stored per version so a confirmed beta keeps
 * behaving as one even after the same version ships to production.
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

                // Rate limited or unexpected responses carry no parsable tag. Bail without touching the stored
                // version so it stays usable on the next launch.
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
                // Offline. A confirmed beta short-circuits above, so production is the safe answer.
                return false;
            });
    });
}

export default {
    isBetaBuild,
};
