import lodashGet from 'lodash/get';
import Config from 'react-native-config';
import betaChecker from '../betaChecker';
import CONST from '../../../CONST';

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

        // If we haven't set the environment yet and we aren't on dev, check to see if this is a beta build
        betaChecker.isBetaBuild()
            .then((isBeta) => {
                if (isBeta && CONST.PULL_REQUEST_NUMBER) {
                    environment = CONST.ENVIRONMENT.ADHOC;
                } else if (isBeta) {
                    environment = CONST.ENVIRONMENT.STAGING;
                } else {
                    environment = CONST.ENVIRONMENT.PRODUCTION;
                }
                resolve(environment);
            });
    });
}

export default getEnvironment;
