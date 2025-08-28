import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Credentials from '@src/types/onyx/Credentials';

let credentials: Credentials | null | undefined;
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

function isSupportRequest(command: string): boolean {
    return [
        // WRITE commands (alphabetized)
        WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE,
        WRITE_COMMANDS.CREATE_POLICY_DISTANCE_RATE,
        WRITE_COMMANDS.CREATE_WORKSPACE_APPROVAL,
        WRITE_COMMANDS.DELETE_MEMBERS_FROM_WORKSPACE,
        WRITE_COMMANDS.DELETE_POLICY_DISTANCE_RATES,
        WRITE_COMMANDS.DELETE_POLICY_TAXES,
        WRITE_COMMANDS.ENABLE_POLICY_AUTO_APPROVAL_OPTIONS,
        WRITE_COMMANDS.ENABLE_POLICY_CATEGORIES,
        WRITE_COMMANDS.ENABLE_POLICY_COMPANY_CARDS,
        WRITE_COMMANDS.ENABLE_POLICY_CONNECTIONS,
        WRITE_COMMANDS.ENABLE_POLICY_DISTANCE_RATES,
        WRITE_COMMANDS.ENABLE_POLICY_EXPENSIFY_CARDS,
        WRITE_COMMANDS.ENABLE_POLICY_INVOICING,
        WRITE_COMMANDS.ENABLE_POLICY_TAGS,
        WRITE_COMMANDS.ENABLE_POLICY_TAXES,
        WRITE_COMMANDS.ENABLE_POLICY_WORKFLOWS,
        WRITE_COMMANDS.EXPORT_CATEGORIES_CSV,
        WRITE_COMMANDS.EXPORT_TAGS_CSV,
        WRITE_COMMANDS.IMPORT_CATEGORIES_SPREADSHEET,
        WRITE_COMMANDS.IMPORT_MULTI_LEVEL_TAGS,
        WRITE_COMMANDS.IMPORT_TAGS_SPREADSHEET,
        WRITE_COMMANDS.OPEN_APP,
        WRITE_COMMANDS.OPEN_REPORT,
        WRITE_COMMANDS.REMOVE_WORKSPACE_APPROVAL,
        WRITE_COMMANDS.RENAME_POLICY_TAX,
        WRITE_COMMANDS.SET_CUSTOM_UNIT_DEFAULT_CATEGORY,
        WRITE_COMMANDS.SET_POLICY_ATTENDEE_TRACKING_ENABLED,
        WRITE_COMMANDS.SET_POLICY_AUTOMATIC_APPROVAL_LIMIT,
        WRITE_COMMANDS.SET_POLICY_AUTOMATIC_APPROVAL_RATE,
        WRITE_COMMANDS.SET_POLICY_BILLABLE_MODE,
        WRITE_COMMANDS.SET_POLICY_DEFAULT_REPORT_TITLE,
        WRITE_COMMANDS.SET_POLICY_DISTANCE_RATES_ENABLED,
        WRITE_COMMANDS.SET_POLICY_DISTANCE_RATES_UNIT,
        WRITE_COMMANDS.SET_POLICY_EXPENSE_MAX_AGE,
        WRITE_COMMANDS.SET_POLICY_EXPENSE_MAX_AMOUNT,
        WRITE_COMMANDS.SET_POLICY_EXPENSE_MAX_AMOUNT_NO_RECEIPT,
        WRITE_COMMANDS.SET_POLICY_PREVENT_SELF_APPROVAL,
        WRITE_COMMANDS.SET_POLICY_PROHIBITED_EXPENSES,
        WRITE_COMMANDS.SET_POLICY_RULES_ENABLED,
        WRITE_COMMANDS.SET_POLICY_TAGS_ENABLED,
        WRITE_COMMANDS.SET_POLICY_TAXES_ENABLED,
        WRITE_COMMANDS.SET_WORKSPACE_AUTO_REPORTING_FREQUENCY,
        WRITE_COMMANDS.SET_WORKSPACE_CATEGORIES_ENABLED,
        WRITE_COMMANDS.TOGGLE_PLATFORM_MUTE,
        WRITE_COMMANDS.TOGGLE_POLICY_PER_DIEM,
        WRITE_COMMANDS.UPDATE_CHAT_PRIORITY_MODE,
        WRITE_COMMANDS.UPDATE_DISPLAY_NAME,
        WRITE_COMMANDS.UPDATE_NEWSLETTER_SUBSCRIPTION,
        WRITE_COMMANDS.UPDATE_POLICY_ADDRESS,
        WRITE_COMMANDS.UPDATE_POLICY_DISTANCE_RATE_NAME,
        WRITE_COMMANDS.UPDATE_POLICY_DISTANCE_RATE_VALUE,
        WRITE_COMMANDS.UPDATE_POLICY_TAX_CODE,
        WRITE_COMMANDS.UPDATE_POLICY_TAX_VALUE,
        WRITE_COMMANDS.UPDATE_WORKSPACE_APPROVAL,
        WRITE_COMMANDS.UPDATE_WORKSPACE_DESCRIPTION,
        WRITE_COMMANDS.UPDATE_WORKSPACE_GENERAL_SETTINGS,

        // SIDE-EFFECT commands
        SIDE_EFFECT_REQUEST_COMMANDS.RECONNECT_APP,

        // READ commands (alphabetized)
        READ_COMMANDS.GET_POLICY_CATEGORIES,
        READ_COMMANDS.OPEN_CARD_DETAILS_PAGE,
        READ_COMMANDS.OPEN_INITIAL_SETTINGS_PAGE,
        READ_COMMANDS.OPEN_PAYMENTS_PAGE,
        READ_COMMANDS.OPEN_POLICY_ACCOUNTING_PAGE,
        READ_COMMANDS.OPEN_POLICY_CATEGORIES_PAGE,
        READ_COMMANDS.OPEN_POLICY_COMPANY_CARDS_FEED,
        READ_COMMANDS.OPEN_POLICY_COMPANY_CARDS_PAGE,
        READ_COMMANDS.OPEN_POLICY_DISTANCE_RATES_PAGE,
        READ_COMMANDS.OPEN_POLICY_EXPENSIFY_CARDS_PAGE,
        READ_COMMANDS.OPEN_POLICY_INITIAL_PAGE,
        READ_COMMANDS.OPEN_POLICY_MORE_FEATURES_PAGE,
        READ_COMMANDS.OPEN_POLICY_PROFILE_PAGE,
        READ_COMMANDS.OPEN_POLICY_REPORT_FIELDS_PAGE,
        READ_COMMANDS.OPEN_POLICY_TAGS_PAGE,
        READ_COMMANDS.OPEN_POLICY_TAXES_PAGE,
        READ_COMMANDS.OPEN_POLICY_WORKFLOWS_PAGE,
        READ_COMMANDS.OPEN_SUBSCRIPTION_PAGE,
        READ_COMMANDS.OPEN_WORKSPACE_MEMBERS_PAGE,
        READ_COMMANDS.OPEN_WORKSPACE_VIEW,
        READ_COMMANDS.SEARCH,
        READ_COMMANDS.SEARCH_FOR_REPORTS,
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
    isSupportRequest,
};
