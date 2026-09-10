import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Request} from '@src/types/onyx';

import type {OnyxKey} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

import proxyConfig from '../../config/proxyConfig';
import getEnvironment from './Environment/getEnvironment';

type Server = ValueOf<typeof CONST.SERVER>;

type ActiveServerState = {
    activeServer: Server;

    /** When true, a stored ACTIVE_SERVER is inert. */
    isPinnedByEnvironment: boolean;

    /** When true, a stored staging resolves to another server, so nothing reaches the staging hosts. */
    isStagingIgnored: boolean;

    /** When true, a stored QA is honored. The selector reads it so it cannot offer a server this refuses. */
    isQASelectable: boolean;
};

// To avoid rebuilding native apps, native apps use production config for both staging and prod
// We use the async environment check because it works on all platforms
let envName: ValueOf<typeof CONST.ENVIRONMENT> = CONST.ENVIRONMENT.PRODUCTION;
let storedServer: Server | undefined;
let hasReadStoredServer = false;

// Stored verbatim, so the preference and the environment can arrive in either order. Onyx calls back even for
// an empty key, so the flag means the preference has been read, not that one was set. Since it isn't connected
// to a UI anywhere, it's OK to use connectWithoutView()
Onyx.connectWithoutView({
    key: ONYXKEYS.ACTIVE_SERVER,
    callback: (value) => {
        storedServer = value;
        hasReadStoredServer = true;
    },
});

getEnvironment().then((value) => {
    envName = value;
});

/**
 * The server a stored value and an environment resolve to. Pure, so `useActiveServer` can call it during
 * render with the values its own Onyx and environment subscriptions hand back.
 */
function resolveActiveServer(value: Server | undefined, environment: ValueOf<typeof CONST.ENVIRONMENT>): ActiveServerState {
    // Selecting QA with no QA root leaves getApiRoot returning an empty string, and getCommandURL turns
    // that into a relative `api/Command?` the browser resolves against the app's own origin
    const isQAConfigured = !!CONFIG.EXPENSIFY.QA_API_ROOT;

    // The environment is baked into the bundle, and there is no meaningful way
    // to point qa.new.exops.io at production
    if (environment === CONST.ENVIRONMENT.QA && isQAConfigured) {
        return {activeServer: CONST.SERVER.QA, isPinnedByEnvironment: true, isStagingIgnored: false, isQASelectable: true};
    }

    // A stored 'qa' outlives the config that produced it: clearing QA_EXPENSIFY_URL hides the switch and
    // turns the QA gate off, but leaves the old Onyx value behind. A production bundle is the same case,
    // since it has no QA host to reach whatever is stored
    const isQASelectable = isQAConfigured && environment !== CONST.ENVIRONMENT.PRODUCTION;
    const server = value === CONST.SERVER.QA && !isQASelectable ? undefined : value;

    if (CONFIG.IS_USING_LOCAL_WEB && server !== CONST.SERVER.QA) {
        return {activeServer: CONST.SERVER.PRODUCTION, isPinnedByEnvironment: false, isStagingIgnored: true, isQASelectable};
    }

    const defaultServer = environment === CONST.ENVIRONMENT.STAGING || environment === CONST.ENVIRONMENT.ADHOC ? CONST.SERVER.STAGING : CONST.SERVER.PRODUCTION;
    return {activeServer: server ?? defaultServer, isPinnedByEnvironment: false, isStagingIgnored: false, isQASelectable};
}

/**
 * The state the app itself runs on. Derived on demand rather than cached, so that a preference stored before
 * the environment resolved is still applied once it does.
 */
function currentActiveServerState(): ActiveServerState {
    // An unread preference looks the same as an unset one, and defaulting to staging would ignore an opt-out,
    // so until it is read it stands in as an explicit production
    return resolveActiveServer(hasReadStoredServer ? storedServer : CONST.SERVER.PRODUCTION, envName);
}

/**
 * Get the currently used API endpoint, unless forceProduction is set to true
 * (Non-production environments allow for dynamically switching the API)
 */
function getApiRoot<TKey extends OnyxKey = never>(request?: Partial<Pick<Request<TKey>, 'shouldUseSecure' | 'shouldSkipWebProxy' | 'command'>>, forceProduction = false): string {
    const shouldUseSecure = request?.shouldUseSecure ?? false;
    const server = forceProduction ? CONST.SERVER.PRODUCTION : currentActiveServerState().activeServer;

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
    return currentActiveServerState().activeServer === CONST.SERVER.QA;
}

function getActiveServer(): Server {
    return currentActiveServerState().activeServer;
}

export type {ActiveServerState, Server};
export {getActiveServer, getApiRoot, getCommandURL, isQAServerActive, resolveActiveServer};
