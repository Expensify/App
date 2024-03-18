import {NativeModules} from 'react-native';
import Config from 'react-native-config';
import betaChecker from '@libs/Environment/betaChecker';
import CONST from '@src/CONST';
import type Environment from './types';

let environment: Environment | null = null;

/**
 * Returns a promise that resolves with the current environment string value
 */
function getEnvironment(): Promise<Environment> {
    return new Promise((resolve) => {
        // If we've already set the environment, use the current value
        if (environment) {
            resolve(environment);
            return;
        }

        if ((Config?.ENVIRONMENT ?? CONST.ENVIRONMENT.DEV) === CONST.ENVIRONMENT.DEV) {
            environment = CONST.ENVIRONMENT.DEV;
            resolve(environment);
            return;
        }

        if ((Config?.ENVIRONMENT ?? CONST.ENVIRONMENT.DEV) === CONST.ENVIRONMENT.ADHOC) {
            environment = CONST.ENVIRONMENT.ADHOC;
            resolve(environment);
            return;
        }

        // If we don't use Development, and we're in the HybridApp, we should use Production
        if (NativeModules.HybridAppModule) {
            environment = CONST.ENVIRONMENT.PRODUCTION;
            return;
        }

        // If we haven't set the environment yet and we aren't on dev/adhoc, check to see if this is a beta build
        betaChecker.isBetaBuild().then((isBeta) => {
            environment = isBeta ? CONST.ENVIRONMENT.STAGING : CONST.ENVIRONMENT.PRODUCTION;
            resolve(environment);
        });
    });
}

export default getEnvironment;
