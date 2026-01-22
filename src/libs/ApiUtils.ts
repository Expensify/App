import Onyx, {OnyxKey} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Request} from '@src/types/onyx';
import proxyConfig from '../../config/proxyConfig';
import getEnvironment from './Environment/getEnvironment';

// To avoid rebuilding native apps, native apps use production config for both staging and prod
// We use the async environment check because it works on all platforms
let ENV_NAME: ValueOf<typeof CONST.ENVIRONMENT> = CONST.ENVIRONMENT.PRODUCTION;
let shouldUseStagingServer = false;
getEnvironment().then((envName) => {
    ENV_NAME = envName;

    // We connect here, so we have the updated ENV_NAME when Onyx callback runs
    // We only use the value of shouldUseStagingServer to determine which server we should point to.
    // Since they aren't connected to a UI anywhere, it's OK to use connectWithoutView()
    Onyx.connectWithoutView({
        key: ONYXKEYS.SHOULD_USE_STAGING_SERVER,
        callback: (value) => {
            // Toggling between APIs is not allowed on production and internal dev environment
            if (ENV_NAME === CONST.ENVIRONMENT.PRODUCTION || CONFIG.IS_USING_LOCAL_WEB) {
                shouldUseStagingServer = false;
                return;
            }

            const defaultToggleState = ENV_NAME === CONST.ENVIRONMENT.STAGING || ENV_NAME === CONST.ENVIRONMENT.ADHOC;
            shouldUseStagingServer = value ?? defaultToggleState;
        },
    });
});

/**
 * Get the currently used API endpoint, unless forceProduction is set to true
 * (Non-production environments allow for dynamically switching the API)
 */
function getApiRoot<TKey extends OnyxKey>(request?: Request<TKey>, forceProduction = false): string {
    const shouldUseSecure = request?.shouldUseSecure ?? false;

    if (shouldUseStagingServer && forceProduction !== true) {
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
    return shouldUseStagingServer;
}

export {getApiRoot, getCommandURL, isUsingStagingApi};
