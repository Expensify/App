import betaChecker from '@libs/Environment/betaChecker';

import CONST from '@src/CONST';

import Config from 'react-native-config';

import type Environment from './types';

// We cache the promise rather than the resolved value because several modules call this while the app is starting.
// Caching only the value would let all of them start their own beta check, and on Android that means one request to
// the GitHub API each, which is enough to hit the unauthenticated rate limit on a single cold start.
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
