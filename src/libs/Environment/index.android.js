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

        // If we haven't set the environment yet, check it
        try {
            fetch(CONST.PLAY_STORE_URL)
                .then(res => res.text())
                .then((text) => {
                    hasSetEnvironment = true;
                    const match = text.match(/<span[^>]+class="htlgb"[^>]*>([-\d.]+)<\/span>/);

                    // If we couldn't get a match, set the default to production
                    // If the version is the same as the store version from the match, this is production
                    if (!match || match[1].trim() === version) {
                        environment = CONST.ENVIRONMENT.PRODUCTION;
                    } else {
                        // If the version isn't the same as the store version, and we aren't on dev, this is beta
                        environment = CONST.ENVIRONMENT.STAGING;
                    }

                    resolve(environment);
                })
                .catch(() => {
                    hasSetEnvironment = true;
                    environment = CONST.ENVIRONMENT.PRODUCTION;
                    resolve(environment);
                });
        } catch (e) {
            hasSetEnvironment = true;
            environment = CONST.ENVIRONMENT.PRODUCTION;
            resolve(environment);
        }
    });
}

export default {
    getEnvironment,
};
