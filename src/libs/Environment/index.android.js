import lodashGet from 'lodash/get';
import Config from 'react-native-config';
import CONST from '../../CONST';
import {version} from '../../../package.json';

let environment = CONST.ENVIRONMENT.PRODUCTION;
let hasSetEnvironment = false;

function getEnvironment() {
    return new Promise((resolve) => {
        // If we've already set the environment, use the current value
        if (hasSetEnvironment) {
            return resolve(environment);
        }

        if (lodashGet(Config, 'ENVIRONMENT', CONST.ENVIRONMENT.DEV) === CONST.ENVIRONMENT.DEV) {
            hasSetEnvironment = true;
            environment = CONST.ENVIRONMENT.DEV;
            return resolve(environment);
        }

        // If we haven't set the environment yet and we aren't on dev, check the play store listing to see if the
        // current version matches production
        try {
            fetch(CONST.PLAY_STORE_URL)
                .then(res => res.text())
                .then((text) => {
                    hasSetEnvironment = true;
                    const productionVersionMatch = text.match(/<span[^>]+class="htlgb"[^>]*>([-\d.]+)<\/span>/);

                    // If we have a match for the production version regex and the current version is not the same
                    // as the production version, we are on a beta build
                    if (productionVersionMatch && productionVersionMatch[1].trim() !== version) {
                        environment = CONST.ENVIRONMENT.STAGING;
                    }

                    resolve(environment);
                })
                .catch(() => {
                    hasSetEnvironment = true;
                    resolve(environment);
                });
        } catch (e) {
            hasSetEnvironment = true;
            resolve(environment);
        }
    });
}

export default {
    getEnvironment,
};
