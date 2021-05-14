import lodashGet from 'lodash/get';
import Config from 'react-native-config';
import CONST from '../../CONST';
import {version} from '../../../package.json';

let environment = null;

/**
 * Returns a promise that resolves with the current environment string value
 *
 * @returns {Promise}
 */
function getEnvironment() {
    return new Promise((resolve) => {
        // If we've already set the environment, use the current value
        if (environment) {
            return resolve(environment);
        }

        if (lodashGet(Config, 'ENVIRONMENT', CONST.ENVIRONMENT.DEV) === CONST.ENVIRONMENT.DEV) {
            environment = CONST.ENVIRONMENT.DEV;
            return resolve(environment);
        }

        // If we haven't set the environment yet and we aren't on dev, check the play store listing to see if the
        // current version matches production
        fetch(CONST.PLAY_STORE_URL)
            .then(res => res.text())
            .then((text) => {
                const productionVersionMatch = text.match(/<span[^>]+class="htlgb"[^>]*>([-\d.]+)<\/span>/);

                // If we have a match for the production version regex and the current version is not the same
                // as the production version, we are on a beta build
                environment = productionVersionMatch && productionVersionMatch[1].trim() !== version
                    ? CONST.ENVIRONMENT.STAGING
                    : CONST.ENVIRONMENT.PRODUCTION;

                resolve(environment);
            })
            .catch(() => {
                environment = CONST.ENVIRONMENT.PRODUCTION;
                resolve(environment);
            });
    });
}

export default {
    getEnvironment,
};
