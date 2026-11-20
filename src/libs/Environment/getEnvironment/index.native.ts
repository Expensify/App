import betaChecker from '@libs/Environment/betaChecker';

import CONST from '@src/CONST';

import Config from 'react-native-config';

import type Environment from './types';

let environment: Environment | null = null;

/**
 * Dev and adhoc builds are known from the config alone, every other build needs the beta check
 */
function getConfigEnvironment(): Environment | undefined {
    const configEnvironment = Config?.ENVIRONMENT ?? CONST.ENVIRONMENT.DEV;
    if (configEnvironment === CONST.ENVIRONMENT.DEV || configEnvironment === CONST.ENVIRONMENT.ADHOC) {
        return configEnvironment;
    }
    return undefined;
}

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

        const configEnvironment = getConfigEnvironment();
        if (configEnvironment) {
            environment = configEnvironment;
            resolve(environment);
            return;
        }

        // If we haven't set the environment yet and we aren't on dev/adhoc, check to see if this is a beta build
        betaChecker
            .isBetaBuild()
            .then((isBeta) => {
                environment = isBeta ? CONST.ENVIRONMENT.STAGING : CONST.ENVIRONMENT.PRODUCTION;
                resolve(environment);
            })
            .catch(() => {
                // Everything that waits on the environment (the API root, the network reachability URL) would hang
                // forever if this promise never settled, so an unexpected failure has to land on a usable answer.
                environment = CONST.ENVIRONMENT.PRODUCTION;
                resolve(environment);
            });
    });
}

/**
 * Returns the environment synchronously, for code that builds links while rendering
 */
function getCachedEnvironment(): Environment {
    // Falls back to production until the beta check settles. On a TestFlight cold start a report restored from Onyx renders before any API call, and EnvironmentProvider only starts the check in useEffect, so that first render can still get the production URL
    return environment ?? getConfigEnvironment() ?? CONST.ENVIRONMENT.PRODUCTION;
}

export default getEnvironment;
export {getCachedEnvironment};
