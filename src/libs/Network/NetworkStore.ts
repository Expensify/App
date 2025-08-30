import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Credentials from '@src/types/onyx/Credentials';

let credentials: Credentials | null | undefined;
let lastShortAuthToken: string | null | undefined;
let authToken: string | null | undefined;
let authTokenType: ValueOf<typeof CONST.AUTH_TOKEN_TYPES> | null;
let currentUserEmail: string | null = null;
let offline = false;
let authenticating = false;
let shouldUseNewPartnerName: boolean | undefined;

// Allow code that is outside of the network listen for when a reconnection happens so that it can execute any side-effects (like flushing the sequential network queue)
let reconnectCallback: () => void;
function triggerReconnectCallback() {
    if (typeof reconnectCallback !== 'function') {
        return;
    }
    return reconnectCallback();
}

function onReconnection(callbackFunction: () => void) {
    reconnectCallback = callbackFunction;
}

let resolveIsReadyPromise: (args?: unknown[]) => void;
let isReadyPromise = new Promise((resolve) => {
    resolveIsReadyPromise = resolve;
});

let resolveShouldUseNewPartnerNamePromise: (args?: unknown[]) => void;
const shouldUseNewPartnerNamePromise = new Promise((resolve) => {
    resolveShouldUseNewPartnerNamePromise = resolve;
    // On non-hybrid app variants we can resolve immediately.
    if (!CONFIG.IS_HYBRID_APP) {
        resolveShouldUseNewPartnerNamePromise();
    }
});

/**
 * This is a hack to workaround the fact that Onyx may not yet have read these values from storage by the time Network starts processing requests.
 * If the values are undefined we haven't read them yet. If they are null or have a value then we have and the network is "ready".
 */
function checkRequiredData() {
    if (authToken === undefined || credentials === undefined) {
        return;
    }

    resolveIsReadyPromise();
}

function resetHasReadRequiredDataFromStorage() {
    // Create a new promise and a new resolve function
    isReadyPromise = new Promise((resolve) => {
        resolveIsReadyPromise = resolve;
    });
}

// Use connectWithoutView since this doesn't affect to any UI
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        authToken = val?.authToken ?? null;
        authTokenType = val?.authTokenType ?? null;
        currentUserEmail = val?.email ?? null;
        checkRequiredData();
    },
});

// Use connectWithoutView since this doesn't affect to any UI
Onyx.connectWithoutView({
    key: ONYXKEYS.CREDENTIALS,
    callback: (val) => {
        credentials = val ?? null;
        checkRequiredData();
    },
});

if (CONFIG.IS_HYBRID_APP) {
    Onyx.connectWithoutView({
        key: ONYXKEYS.HYBRID_APP,
        callback: (val) => {
            // If this value is not set, we can assume that we are using old partner name.
            shouldUseNewPartnerName = val?.shouldUseNewPartnerName ?? false;
            Log.info(`[HybridApp] User requests should use ${val?.shouldUseNewPartnerName ? 'new' : 'old'} partner name`);
            resolveShouldUseNewPartnerNamePromise();
        },
    });
}

// We subscribe to the online/offline status of the network to determine when we should fire off API calls
// vs queueing them for later.
// Use connectWithoutView since this doesn't affect to any UI
Onyx.connectWithoutView({
    key: ONYXKEYS.NETWORK,
    callback: (network) => {
        if (!network) {
            return;
        }

        // Client becomes online emit connectivity resumed event
        if (offline && !network.isOffline) {
            triggerReconnectCallback();
        }

        offline = !!network.shouldForceOffline || !!network.isOffline;
    },
});

function getCredentials(): Credentials | null | undefined {
    return credentials;
}

function isOffline(): boolean {
    return offline;
}

function getAuthToken(): string | null | undefined {
    return authToken;
}

function getLastShortAuthToken(): string | null | undefined {
    return lastShortAuthToken;
}

function setLastShortAuthToken(newLastAuthToken: string | null) {
    lastShortAuthToken = newLastAuthToken;
}

function isSupportRequest(command: string): boolean {
    return [
        WRITE_COMMANDS.OPEN_APP,
        READ_COMMANDS.SEARCH,
        WRITE_COMMANDS.UPDATE_NEWSLETTER_SUBSCRIPTION,
        WRITE_COMMANDS.OPEN_REPORT,
        SIDE_EFFECT_REQUEST_COMMANDS.RECONNECT_APP,
        READ_COMMANDS.OPEN_CARD_DETAILS_PAGE,
        READ_COMMANDS.GET_POLICY_CATEGORIES,
        READ_COMMANDS.OPEN_POLICY_CATEGORIES_PAGE,
        READ_COMMANDS.OPEN_POLICY_COMPANY_CARDS_PAGE,
        READ_COMMANDS.OPEN_POLICY_COMPANY_CARDS_FEED,
        READ_COMMANDS.OPEN_POLICY_DISTANCE_RATES_PAGE,
        READ_COMMANDS.OPEN_POLICY_ACCOUNTING_PAGE,
        READ_COMMANDS.OPEN_POLICY_EXPENSIFY_CARDS_PAGE,
        READ_COMMANDS.OPEN_POLICY_MORE_FEATURES_PAGE,
        READ_COMMANDS.OPEN_POLICY_PROFILE_PAGE,
        READ_COMMANDS.OPEN_POLICY_REPORT_FIELDS_PAGE,
        READ_COMMANDS.OPEN_POLICY_INITIAL_PAGE,
        READ_COMMANDS.OPEN_INITIAL_SETTINGS_PAGE,
        READ_COMMANDS.OPEN_POLICY_TAGS_PAGE,
        READ_COMMANDS.OPEN_SUBSCRIPTION_PAGE,
        READ_COMMANDS.OPEN_POLICY_TAXES_PAGE,
        READ_COMMANDS.OPEN_POLICY_WORKFLOWS_PAGE,
        READ_COMMANDS.OPEN_WORKSPACE_VIEW,
        READ_COMMANDS.OPEN_PAYMENTS_PAGE,
        READ_COMMANDS.OPEN_WORKSPACE_MEMBERS_PAGE,
        READ_COMMANDS.SEARCH_FOR_REPORTS,
        READ_COMMANDS.OPEN_SEARCH_PAGE,
    ].some((cmd) => cmd === command);
}

function isSupportAuthToken(): boolean {
    return authTokenType === CONST.AUTH_TOKEN_TYPES.SUPPORT;
}

function setAuthToken(newAuthToken: string | null) {
    authToken = newAuthToken;
}

function getCurrentUserEmail(): string | null {
    return currentUserEmail;
}

function hasReadRequiredDataFromStorage(): Promise<unknown> {
    return isReadyPromise;
}

function isAuthenticating(): boolean {
    return authenticating;
}

function setIsAuthenticating(val: boolean) {
    authenticating = val;
}

function getShouldUseNewPartnerName(): boolean | undefined {
    if (!CONFIG.IS_HYBRID_APP) {
        return true;
    }

    return shouldUseNewPartnerName;
}

function hasReadShouldUseNewPartnerNameFromStorage(): Promise<unknown> {
    return shouldUseNewPartnerNamePromise;
}

export {
    getShouldUseNewPartnerName,
    getAuthToken,
    setAuthToken,
    getCurrentUserEmail,
    hasReadRequiredDataFromStorage,
    resetHasReadRequiredDataFromStorage,
    hasReadShouldUseNewPartnerNameFromStorage,
    isOffline,
    onReconnection,
    isAuthenticating,
    setIsAuthenticating,
    getCredentials,
    checkRequiredData,
    isSupportAuthToken,
    isSupportRequest,
    getLastShortAuthToken,
    setLastShortAuthToken,
};
