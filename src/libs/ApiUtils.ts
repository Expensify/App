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
let activeServer: ValueOf<typeof CONST.SERVER> = CONST.SERVER.PRODUCTION;

function resolveActiveServer(value: ValueOf<typeof CONST.SERVER> | undefined, envName: ValueOf<typeof CONST.ENVIRONMENT>): ValueOf<typeof CONST.SERVER> {
    // Selecting QA with no QA root leaves getApiRoot returning an empty string, and getCommandURL turns
    // that into a relative `api/Command?` the browser resolves against the app's own origin
    const isQAConfigured = !!CONFIG.EXPENSIFY.QA_API_ROOT;

    // The environment is baked into the bundle, and there is no meaningful way
    // to point qa.new.exops.io at production
    if (envName === CONST.ENVIRONMENT.QA && isQAConfigured) {
        return CONST.SERVER.QA;
    }

    if (envName === CONST.ENVIRONMENT.PRODUCTION) {
        return CONST.SERVER.PRODUCTION;
    }

    // A stored 'qa' outlives the config that produced it: clearing QA_EXPENSIFY_URL hides the switch and
    // turns the QA gate off, but leaves the old Onyx value behind
    const storedServer = value === CONST.SERVER.QA && !isQAConfigured ? undefined : value;

    if (CONFIG.IS_USING_LOCAL_WEB && storedServer !== CONST.SERVER.QA) {
        return CONST.SERVER.PRODUCTION;
    }

    const defaultServer = envName === CONST.ENVIRONMENT.STAGING || envName === CONST.ENVIRONMENT.ADHOC ? CONST.SERVER.STAGING : CONST.SERVER.PRODUCTION;
    return storedServer ?? defaultServer;
}

getEnvironment().then((envName) => {
    // Since this isn't connected to a UI anywhere, it's OK to use connectWithoutView()
    Onyx.connectWithoutView({
        key: ONYXKEYS.ACTIVE_SERVER,
        callback: (value) => {
            activeServer = resolveActiveServer(value, envName);
        },
    });
});

/**
 * Get the currently used API endpoint, unless forceProduction is set to true
 * (Non-production environments allow for dynamically switching the API)
 */
function getApiRoot<TKey extends OnyxKey = never>(request?: Partial<Pick<Request<TKey>, 'shouldUseSecure' | 'shouldSkipWebProxy' | 'command'>>, forceProduction = false): string {
    const shouldUseSecure = request?.shouldUseSecure ?? false;
    const server = forceProduction ? CONST.SERVER.PRODUCTION : activeServer;

    if (server === CONST.SERVER.QA) {
        // No web-proxy branch: Cloudflare Access answers the preflight and matches the bearer against the
        // real origin, so routing QA through a same-origin proxy path would defeat both
        if (!shouldUseSecure) {
            return CONFIG.EXPENSIFY.QA_API_ROOT;
        }

        if (!CONFIG.EXPENSIFY.QA_SECURE_API_ROOT) {
            throw new Error(`The QA server has no secure host, so it cannot serve ${request?.command ?? 'a secure command'}. Set QA_SECURE_EXPENSIFY_URL to reach one.`);
        }

        return CONFIG.EXPENSIFY.QA_SECURE_API_ROOT;
    }
    if (server === CONST.SERVER.STAGING) {
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

function isQAServerActive(): boolean {
    return activeServer === CONST.SERVER.QA;
}

function getActiveServer(): ValueOf<typeof CONST.SERVER> {
    return activeServer;
}

export {getActiveServer, getApiRoot, getCommandURL, isQAServerActive};
