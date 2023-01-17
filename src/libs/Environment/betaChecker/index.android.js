import semver from 'semver';
import CONST from '../../../CONST';
import pkg from '../../../../package.json';

/**
 * Check the GitHub releases to see if the current build is a beta build or production build
 *
 * @returns {Promise}
 */
function isBetaBuild() {
    return new Promise((resolve) => {
        fetch(CONST.GITHUB_RELEASE_URL)
            .then(res => res.json())
            .then((json) => {
                const productionVersion = json.tag_name;
                if (!productionVersion) {
                    resolve(false);
                }

                // If the current version we are running is greater than the production version, we are on a beta version of Android
                const isBeta = semver.gt(pkg.version, productionVersion);
                resolve(isBeta);
            })
            .catch(() => {
                resolve(false);
            });
    });
}

export default {
    isBetaBuild,
};
