import CONST from '../../../CONST';
import {version} from '../../../../package.json';

/**
 * Check the Google Play store listing to see if the current build is a beta build or production build
 *
 * @returns {Promise}
 */
function isBetaBuild() {
    return new Promise((resolve) => {
        fetch(CONST.PLAY_STORE_URL)
            .then(res => res.text())
            .then((text) => {
                const productionVersionMatch = text.match(/<span[^>]+class="htlgb"[^>]*>([-\d.]+)<\/span>/);

                // If we have a match for the production version regex and the current version is not the same
                // as the production version, we are on a beta build
                const isBeta = productionVersionMatch && productionVersionMatch[1].trim() !== version;
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
