import Config from 'react-native-config';
import betaChecker from '@libs/Environment/betaChecker';
import CONST from '@src/CONST';
import Environment from './types';

let environment: Environment | null = null;

/**
 * Returns a promise that resolves with the current environment string value
 */
function getEnvironment(): Promise<Environment> {
    return new Promise((resolve) => {
        // If we've already set the environment, use the current value
        if (environment) {
            return resolve(environment);
        }

        if ((Config?.ENVIRONMENT ?? CONST.ENVIRONMENT.DEV) === CONST.ENVIRONMENT.DEV) {
            environment = CONST.ENVIRONMENT.DEV;
            return resolve(environment);
        }

        if ((Config?.ENVIRONMENT ?? CONST.ENVIRONMENT.DEV) === CONST.ENVIRONMENT.ADHOC) {
            environment = CONST.ENVIRONMENT.ADHOC;
            return resolve(environment);
        }

        // If we haven't set the environment yet and we aren't on dev/adhoc, check to see if this is a beta build
        betaChecker.isBetaBuild().then((isBeta) => {
            environment = isBeta ? CONST.ENVIRONMENT.STAGING : CONST.ENVIRONMENT.PRODUCTION;
            resolve(environment);
        });
    });
}

export default getEnvironment;
