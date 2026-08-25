import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Request} from '@src/types/onyx';

import type {OnyxKey} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

import proxyConfig from '../../config/proxyConfig';
import getEnvironment from './Environment/getEnvironment';

// To avoid rebuilding native apps, native apps use production config for both staging and prod
// We use the async environment check because it works on all platforms
let ENV_NAME: ValueOf<typeof CONST.ENVIRONMENT> = CONST.ENVIRONMENT.PRODUCTION;
let storedShouldUseStagingServer: boolean | undefined;
let hasReadStoredShouldUseStagingServer = false;

// Stored verbatim, so the preference and the environment can arrive in either order. Onyx calls back even for
// an empty key, so the flag means the preference has been read, not that one was set. Since it isn't connected
// to a UI anywhere, it's OK to use connectWithoutView()
Onyx.connectWithoutView({
    key: ONYXKEYS.SHOULD_USE_STAGING_SERVER,
    callback: (value) => {
        storedShouldUseStagingServer = value;
        hasReadStoredShouldUseStagingServer = true;
    },
});

getEnvironment().then((envName) => {
    ENV_NAME = envName;
});

/**
 * Whether requests should be sent to the staging API.
 *
 * Derived on demand rather than cached, so that a preference stored before the environment resolved is still
 * applied once it does.
 */
function shouldUseStagingServer(): boolean {
    // Toggling between APIs is not allowed on production and internal dev environment
    if (ENV_NAME === CONST.ENVIRONMENT.PRODUCTION || CONFIG.IS_USING_LOCAL_WEB) {
        return false;
    }

    // An unread preference looks the same as an unset one, and defaulting to staging would ignore an opt-out
    if (!hasReadStoredShouldUseStagingServer) {
        return false;
    }

    const defaultToggleState = ENV_NAME === CONST.ENVIRONMENT.STAGING || ENV_NAME === CONST.ENVIRONMENT.ADHOC;
    return storedShouldUseStagingServer ?? defaultToggleState;
}

/**
 * Get the currently used API endpoint, unless forceProduction is set to true
 * (Non-production environments allow for dynamically switching the API)
 */
function getApiRoot<TKey extends OnyxKey = never>(request?: Partial<Pick<Request<TKey>, 'shouldUseSecure' | 'shouldSkipWebProxy' | 'command'>>, forceProduction = false): string {
    const shouldUseSecure = request?.shouldUseSecure ?? false;

    if (shouldUseStagingServer() && forceProduction !== true) {
        if (CONFIG.IS_USING_WEB_PROXY && !request?.shouldSkipWebProxy) {
            return shouldUseSecure ? proxyConfig.STAGING_SECURE : proxyConfig.STAGING;
        }
        return shouldUseSecure ? CONFIG.EXPENSIFY.STAGING_SECURE_API_ROOT : CONFIG.EXPENSIFY.STAGING_API_ROOT;
    }
    if (request?.shouldSkipWebProxy) {
        return shouldUseSecure ? CONFIG.EXPENSIFY.SECURE_EXPENSIFY_URL : CONFIG.EXPENSIFY.EXPENSIFY_URL;
    }
    return shouldUseSecure ? CONFIG.EXPENSIFY.DEFAULT_SECURE_API_ROOT : CONFIG.EXPENSIFY.DEFAULT_API_ROOT;
}

/**
 * Get the command url for the given request
 * @param - the name of the API command
 */
function getCommandURL<TKey extends OnyxKey>(request: Request<TKey>): string {
    // If request.command already contains ? then we don't need to append it
    return `${getApiRoot(request)}api/${request.command}${request.command.includes('?') ? '' : '?'}`;
}

/**
 * Check if we're currently using the staging API root
 */
function isUsingStagingApi(): boolean {
    return shouldUseStagingServer();
}

export {getApiRoot, getCommandURL, isUsingStagingApi};
