import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import Log from '@src/libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import type Credentials from '@src/types/onyx/Credentials';

let credentials: Credentials | null | undefined;
let lastShortAuthToken: string | null | undefined;
let authToken: string | null | undefined;
let authTokenType: ValueOf<typeof CONST.AUTH_TOKEN_TYPES> | null;
let currentUserEmail: string | null = null;
let offline = false;
let authenticating = false;

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
        Log.info('[NetworkStore] Updating credentials', false, val);
        credentials = val ?? null;
        checkRequiredData();
    },
});

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

export {
    getAuthToken,
    setAuthToken,
    getCurrentUserEmail,
    hasReadRequiredDataFromStorage,
    resetHasReadRequiredDataFromStorage,
    isOffline,
    onReconnection,
    isAuthenticating,
    setIsAuthenticating,
    getCredentials,
    checkRequiredData,
    isSupportAuthToken,
    getLastShortAuthToken,
    setLastShortAuthToken,
};
