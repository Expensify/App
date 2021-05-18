import Config from 'react-native-config';
import lodashGet from 'lodash/get';
import {NativeModules} from 'react-native';
import CONST from '../../CONST';

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

        // Since we promote staging builds to production without creating a new build, check w/ the native side to see
        // if this is staging (TestFlight) or production
        NativeModules.EnvironmentChecker.isBeta()
            .then((isBeta) => {
                environment = isBeta ? CONST.ENVIRONMENT.STAGING : CONST.ENVIRONMENT.PRODUCTION;
                resolve(environment);
            });
    });
}

export default {
    getEnvironment,
};
