import betaChecker from '@libs/Environment/betaChecker';

import CONST from '@src/CONST';

import Config from 'react-native-config';

import type Environment from './types';

// Cache the promise, not the value: several modules call this during startup, and each would otherwise start its
// own beta check — on Android one GitHub API request each, enough to hit the rate limit on a single cold start.
let environmentPromise: Promise<Environment> | null = null;

function resolveEnvironment(): Promise<Environment> {
    const configuredEnvironment = Config?.ENVIRONMENT ?? CONST.ENVIRONMENT.DEV;

    if (configuredEnvironment === CONST.ENVIRONMENT.DEV) {
        return Promise.resolve(CONST.ENVIRONMENT.DEV);
    }

    if (configuredEnvironment === CONST.ENVIRONMENT.ADHOC) {
        return Promise.resolve(CONST.ENVIRONMENT.ADHOC);
    }

    // If we aren't on dev/adhoc, check to see if this is a beta build
    return betaChecker.isBetaBuild().then((isBeta) => (isBeta ? CONST.ENVIRONMENT.STAGING : CONST.ENVIRONMENT.PRODUCTION));
}

/**
 * Returns a promise that resolves with the current environment string value
 */
function getEnvironment(): Promise<Environment> {
    environmentPromise ??= resolveEnvironment();
    return environmentPromise;
}

export default getEnvironment;
