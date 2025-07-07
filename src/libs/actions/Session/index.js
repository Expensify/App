"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.canAnonymousUserAccessRoute = exports.reauthenticatePusher = void 0;
exports.beginSignIn = beginSignIn;
exports.beginAppleSignIn = beginAppleSignIn;
exports.beginGoogleSignIn = beginGoogleSignIn;
exports.setSupportAuthToken = setSupportAuthToken;
exports.callFunctionIfActionIsAllowed = callFunctionIfActionIsAllowed;
exports.signIn = signIn;
exports.signInWithValidateCode = signInWithValidateCode;
exports.handleExitToNavigation = handleExitToNavigation;
exports.signInWithValidateCodeAndNavigate = signInWithValidateCodeAndNavigate;
exports.initAutoAuthState = initAutoAuthState;
exports.signInWithShortLivedAuthToken = signInWithShortLivedAuthToken;
exports.cleanupSession = cleanupSession;
exports.signOut = signOut;
exports.signOutAndRedirectToSignIn = signOutAndRedirectToSignIn;
exports.resendValidateCode = resendValidateCode;
exports.requestUnlinkValidationLink = requestUnlinkValidationLink;
exports.unlinkLogin = unlinkLogin;
exports.clearSignInData = clearSignInData;
exports.clearAccountMessages = clearAccountMessages;
exports.setAccountError = setAccountError;
exports.authenticatePusher = authenticatePusher;
exports.invalidateCredentials = invalidateCredentials;
exports.invalidateAuthToken = invalidateAuthToken;
exports.expireSessionWithDelay = expireSessionWithDelay;
exports.isAnonymousUser = isAnonymousUser;
exports.toggleTwoFactorAuth = toggleTwoFactorAuth;
exports.validateTwoFactorAuth = validateTwoFactorAuth;
exports.waitForUserSignIn = waitForUserSignIn;
exports.hasAuthToken = hasAuthToken;
exports.isExpiredSession = isExpiredSession;
exports.signInWithSupportAuthToken = signInWithSupportAuthToken;
exports.isSupportAuthToken = isSupportAuthToken;
exports.hasStashedSession = hasStashedSession;
exports.signUpUser = signUpUser;
exports.signInAfterTransitionFromOldDot = signInAfterTransitionFromOldDot;
exports.AddWorkEmail = AddWorkEmail;
exports.MergeIntoAccountAndLogin = MergeIntoAccountAndLogin;
exports.resetSMSDeliveryFailureStatus = resetSMSDeliveryFailureStatus;
exports.clearDisableTwoFactorAuthErrors = clearDisableTwoFactorAuthErrors;
var react_native_hybrid_app_1 = require("@expensify/react-native-hybrid-app");
var throttle_1 = require("lodash/throttle");
var react_native_1 = require("react-native");
var react_native_onyx_1 = require("react-native-onyx");
var PersistedRequests = require("@libs/actions/PersistedRequests");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var asyncOpenURL_1 = require("@libs/asyncOpenURL");
var Authentication = require("@libs/Authentication");
var ErrorUtils = require("@libs/ErrorUtils");
var Fullstory_1 = require("@libs/Fullstory");
var HttpUtils_1 = require("@libs/HttpUtils");
var Localize_1 = require("@libs/Localize");
var Log_1 = require("@libs/Log");
var Navigation_1 = require("@libs/Navigation/Navigation");
var navigationRef_1 = require("@libs/Navigation/navigationRef");
var MainQueue = require("@libs/Network/MainQueue");
var NetworkStore = require("@libs/Network/NetworkStore");
var NetworkStore_1 = require("@libs/Network/NetworkStore");
var SequentialQueue = require("@libs/Network/SequentialQueue");
var NetworkConnection_1 = require("@libs/NetworkConnection");
var Pusher_1 = require("@libs/Pusher");
var ReportUtils_1 = require("@libs/ReportUtils");
var SessionUtils = require("@libs/SessionUtils");
var Sound_1 = require("@libs/Sound");
var Timers_1 = require("@libs/Timers");
var ReportActionContextMenu_1 = require("@pages/home/report/ContextMenu/ReportActionContextMenu");
var App_1 = require("@userActions/App");
var Delegate_1 = require("@userActions/Delegate");
var Device = require("@userActions/Device");
var SignInRedirect_1 = require("@userActions/SignInRedirect");
var Timing_1 = require("@userActions/Timing");
var Welcome = require("@userActions/Welcome");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var clearCache_1 = require("./clearCache");
var updateSessionAuthTokens_1 = require("./updateSessionAuthTokens");
var INVALID_TOKEN = 'pizza';
var session = {};
var authPromiseResolver = null;
var hasSwitchedAccountInHybridMode = false;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SESSION,
    callback: function (value) {
        session = value !== null && value !== void 0 ? value : {};
        if (!session.creationDate) {
            session.creationDate = new Date().getTime();
        }
        if (session.authToken && authPromiseResolver) {
            authPromiseResolver(true);
            authPromiseResolver = null;
        }
        if (CONFIG_1.default.IS_HYBRID_APP && session.authToken && session.authToken !== INVALID_TOKEN) {
            react_native_hybrid_app_1.default.sendAuthToken({ authToken: session.authToken });
        }
    },
});
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.USER_METADATA,
    callback: Fullstory_1.default.consentAndIdentify,
});
var stashedSession = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.STASHED_SESSION,
    callback: function (value) { return (stashedSession = value !== null && value !== void 0 ? value : {}); },
});
var credentials = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.CREDENTIALS,
    callback: function (value) { return (credentials = value !== null && value !== void 0 ? value : {}); },
});
var stashedCredentials = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.STASHED_CREDENTIALS,
    callback: function (value) { return (stashedCredentials = value !== null && value !== void 0 ? value : {}); },
});
var preferredLocale = null;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_PREFERRED_LOCALE,
    callback: function (val) { return (preferredLocale = val !== null && val !== void 0 ? val : null); },
});
var activePolicyID;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID,
    callback: function (newActivePolicyID) {
        activePolicyID = newActivePolicyID;
    },
});
function isSupportAuthToken() {
    return session.authTokenType === CONST_1.default.AUTH_TOKEN_TYPES.SUPPORT;
}
/**
 * Sets the SupportToken. This method will only be used on dev.
 */
function setSupportAuthToken(supportAuthToken, email, accountID) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.SESSION, {
        authTokenType: CONST_1.default.AUTH_TOKEN_TYPES.SUPPORT,
        authToken: supportAuthToken,
        email: email,
        accountID: accountID,
        creationDate: new Date().getTime(),
    }).then(function () {
        Log_1.default.info('[Supportal] Auth token set');
    });
    react_native_onyx_1.default.set(ONYXKEYS_1.default.LAST_VISITED_PATH, '');
}
function getShortLivedLoginParams() {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: __assign(__assign({}, CONST_1.default.DEFAULT_ACCOUNT_DATA), { isLoading: true }),
        },
        // We are making a temporary modification to 'signedInWithShortLivedAuthToken' to ensure that 'App.openApp' will be called at least once
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.SESSION,
            value: {
                signedInWithShortLivedAuthToken: true,
                isAuthenticatingWithShortLivedToken: true,
            },
        },
    ];
    // Subsequently, we revert it back to the default value of 'signedInWithShortLivedAuthToken' in 'finallyData' to ensure the user is logged out on refresh
    var finallyData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                isLoading: false,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.SESSION,
            value: {
                signedInWithShortLivedAuthToken: null,
                isAuthenticatingWithShortLivedToken: false,
            },
        },
    ];
    return { optimisticData: optimisticData, finallyData: finallyData };
}
/**
 * This method should be used when we are being redirected from oldDot to NewDot on a supportal request
 */
function signInWithSupportAuthToken(authToken) {
    var _a = getShortLivedLoginParams(), optimisticData = _a.optimisticData, finallyData = _a.finallyData;
    API.read(types_1.READ_COMMANDS.SIGN_IN_WITH_SUPPORT_AUTH_TOKEN, { authToken: authToken }, { optimisticData: optimisticData, finallyData: finallyData });
}
/**
 * Clears the Onyx store and redirects user to the sign in page
 */
function signOut() {
    var _a, _b;
    Log_1.default.info('Flushing logs before signing out', true, {}, true);
    var params = {
        // Send current authToken because we will immediately clear it once triggering this command
        authToken: (_a = NetworkStore.getAuthToken()) !== null && _a !== void 0 ? _a : null,
        partnerUserID: (_b = credentials === null || credentials === void 0 ? void 0 : credentials.autoGeneratedLogin) !== null && _b !== void 0 ? _b : '',
        partnerName: CONFIG_1.default.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG_1.default.EXPENSIFY.PARTNER_PASSWORD,
        shouldRetry: false,
        skipReauthentication: true,
    };
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(types_1.SIDE_EFFECT_REQUEST_COMMANDS.LOG_OUT, params, {});
}
/**
 * Checks if the account is an anonymous account.
 */
function isAnonymousUser(sessionParam) {
    var _a;
    return ((_a = sessionParam === null || sessionParam === void 0 ? void 0 : sessionParam.authTokenType) !== null && _a !== void 0 ? _a : session.authTokenType) === CONST_1.default.AUTH_TOKEN_TYPES.ANONYMOUS;
}
function hasStashedSession() {
    return !!(stashedSession.authToken && stashedCredentials.autoGeneratedLogin && stashedCredentials.autoGeneratedLogin !== '');
}
/**
 * Checks if the user has authToken
 */
function hasAuthToken() {
    return !!session.authToken;
}
/**
 * Indicates if the session which creation date is in parameter is expired
 * @param sessionCreationDate the session creation date timestamp
 */
function isExpiredSession(sessionCreationDate) {
    return new Date().getTime() - sessionCreationDate >= CONST_1.default.SESSION_EXPIRATION_TIME_MS;
}
function signOutAndRedirectToSignIn(shouldResetToHome, shouldStashSession, shouldKillHybridApp, shouldForceUseStashedSession) {
    var _a, _b, _c;
    var _d, _e;
    if (shouldKillHybridApp === void 0) { shouldKillHybridApp = true; }
    Log_1.default.info('Redirecting to Sign In because signOut() was called');
    (0, ReportActionContextMenu_1.hideContextMenu)(false);
    if (isAnonymousUser()) {
        if (!Navigation_1.default.isActiveRoute(ROUTES_1.default.SIGN_IN_MODAL)) {
            if (shouldResetToHome) {
                Navigation_1.default.resetToHome();
            }
            Navigation_1.default.navigate(ROUTES_1.default.SIGN_IN_MODAL);
            react_native_1.Linking.getInitialURL().then(function (url) {
                var reportID = (0, ReportUtils_1.getReportIDFromLink)(url);
                if (reportID) {
                    react_native_onyx_1.default.merge(ONYXKEYS_1.default.LAST_OPENED_PUBLIC_ROOM_ID, reportID);
                }
            });
        }
        return;
    }
    // In the HybridApp, we want the Old Dot to handle the sign out process
    if (CONFIG_1.default.IS_HYBRID_APP && shouldKillHybridApp) {
        react_native_hybrid_app_1.default.closeReactNativeApp({ shouldSignOut: true, shouldSetNVP: false });
        return;
    }
    var isSupportal = isSupportAuthToken();
    var shouldRestoreStashedSession = isSupportal || shouldForceUseStashedSession;
    // We'll only call signOut if we're not stashing the session and not restoring a stashed session,
    // otherwise we'll call the API to invalidate the autogenerated credentials used for infinite
    // session.
    var signOutPromise = !shouldRestoreStashedSession && !shouldStashSession ? signOut() : Promise.resolve();
    // The function redirectToSignIn will clear the whole storage, so let's create our onyx params
    // updates for the credentials before we call it
    var onyxSetParams = {};
    // If we are not currently using a support token, and we received stashSession as true, we need to
    // store the credentials so the user doesn't need to login again after they finish their supportal
    // action. This needs to computed before we call `redirectToSignIn`
    if (!isSupportal && shouldStashSession) {
        onyxSetParams = (_a = {},
            _a[ONYXKEYS_1.default.STASHED_CREDENTIALS] = credentials,
            _a[ONYXKEYS_1.default.STASHED_SESSION] = session,
            _a);
    }
    // If this is a supportal token, and we've received the parameters to stashSession as true, and
    // we already have a stashedSession, that means we are supportal-ed, currently supportal-ing
    // into another account and we want to keep the stashed data from the original account.
    if (isSupportal && shouldStashSession && hasStashedSession()) {
        onyxSetParams = (_b = {},
            _b[ONYXKEYS_1.default.STASHED_CREDENTIALS] = stashedCredentials,
            _b[ONYXKEYS_1.default.STASHED_SESSION] = stashedSession,
            _b);
    }
    // If we should restore the stashed session, and we do not want to stash the current session, and we have a
    // stashed session, then switch the account instead of completely logging out.
    if (shouldRestoreStashedSession && !shouldStashSession && hasStashedSession()) {
        if (CONFIG_1.default.IS_HYBRID_APP) {
            react_native_hybrid_app_1.default.switchAccount({
                newDotCurrentAccountEmail: (_d = stashedSession.email) !== null && _d !== void 0 ? _d : '',
                authToken: (_e = stashedSession.authToken) !== null && _e !== void 0 ? _e : '',
                // eslint-disable-next-line rulesdir/no-default-id-values
                policyID: activePolicyID !== null && activePolicyID !== void 0 ? activePolicyID : '',
                accountID: session.accountID ? String(session.accountID) : '',
            });
            hasSwitchedAccountInHybridMode = true;
        }
        onyxSetParams = (_c = {},
            _c[ONYXKEYS_1.default.CREDENTIALS] = stashedCredentials,
            _c[ONYXKEYS_1.default.SESSION] = stashedSession,
            _c);
    }
    if (shouldRestoreStashedSession && !shouldStashSession && !hasStashedSession()) {
        Log_1.default.info('No stashed session found, clearing the session');
    }
    // Wait for signOut (if called), then redirect and update Onyx.
    signOutPromise
        .then(function (response) {
        if (response === null || response === void 0 ? void 0 : response.hasOldDotAuthCookies) {
            Log_1.default.info('Redirecting to OldDot sign out');
            (0, asyncOpenURL_1.default)((0, SignInRedirect_1.default)().then(function () {
                react_native_onyx_1.default.multiSet(onyxSetParams);
            }), "".concat(CONFIG_1.default.EXPENSIFY.EXPENSIFY_URL).concat(CONST_1.default.OLDDOT_URLS.SIGN_OUT), true, true);
        }
        else {
            (0, SignInRedirect_1.default)().then(function () {
                react_native_onyx_1.default.multiSet(onyxSetParams);
                if (hasSwitchedAccountInHybridMode) {
                    (0, App_1.openApp)();
                }
            });
        }
    })
        .catch(function (error) { return Log_1.default.warn('Error during sign out process:', error); });
}
/**
 * @param callback The callback to execute if the action is allowed
 * @param isAnonymousAction The action is allowed for anonymous or not
 * @returns same callback if the action is allowed, otherwise a function that signs out and redirects to sign in
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function callFunctionIfActionIsAllowed(callback, isAnonymousAction) {
    if (isAnonymousAction === void 0) { isAnonymousAction = false; }
    if (isAnonymousUser() && !isAnonymousAction) {
        return function () { return signOutAndRedirectToSignIn(); };
    }
    return callback;
}
/**
 * Request a new validate / magic code for user to sign in via passwordless flow
 */
function resendValidateCode(login) {
    if (login === void 0) { login = credentials.login; }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                errors: null,
                loadingForm: CONST_1.default.FORMS.RESEND_VALIDATE_CODE_FORM,
            },
        },
    ];
    var finallyData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                loadingForm: null,
            },
        },
    ];
    var params = { email: login };
    API.write(types_1.WRITE_COMMANDS.REQUEST_NEW_VALIDATE_CODE, params, { optimisticData: optimisticData, finallyData: finallyData });
}
/**
 * Constructs the state object for the BeginSignIn && BeginAppleSignIn API calls.
 */
function signInAttemptState() {
    return {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.ACCOUNT,
                value: __assign(__assign({}, CONST_1.default.DEFAULT_ACCOUNT_DATA), { isLoading: true, message: null, loadingForm: CONST_1.default.FORMS.LOGIN_FORM }),
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.ACCOUNT,
                value: {
                    isLoading: false,
                    loadingForm: null,
                },
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.CREDENTIALS,
                value: {
                    validateCode: null,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.ACCOUNT,
                value: {
                    isLoading: false,
                    loadingForm: null,
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('loginForm.cannotGetAccountDetails'),
                },
            },
        ],
    };
}
/**
 * Checks the API to see if an account exists for the given login.
 */
function beginSignIn(email) {
    var _a = signInAttemptState(), optimisticData = _a.optimisticData, successData = _a.successData, failureData = _a.failureData;
    var params = { email: email };
    API.read(types_1.READ_COMMANDS.BEGIN_SIGNIN, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
/**
 * Create Onyx update to clean up anonymous user data
 */
function buildOnyxDataToCleanUpAnonymousUser() {
    var data = {};
    if (session.authTokenType === CONST_1.default.AUTH_TOKEN_TYPES.ANONYMOUS && session.accountID) {
        data[session.accountID] = null;
    }
    return {
        key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
        value: data,
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
    };
}
/**
 * Creates an account for the new user and signs them into the application with the newly created account.
 *
 */
function signUpUser() {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: __assign(__assign({}, CONST_1.default.DEFAULT_ACCOUNT_DATA), { isLoading: true }),
        },
    ];
    var onyxOperationToCleanUpAnonymousUser = buildOnyxDataToCleanUpAnonymousUser();
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                isLoading: false,
            },
        },
        onyxOperationToCleanUpAnonymousUser,
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                isLoading: false,
            },
        },
    ];
    var params = { email: credentials.login, preferredLocale: preferredLocale };
    API.write(types_1.WRITE_COMMANDS.SIGN_UP_USER, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function getLastUpdateIDAppliedToClient() {
    return new Promise(function (resolve) {
        react_native_onyx_1.default.connect({
            key: ONYXKEYS_1.default.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
            callback: function (value) { return resolve(value !== null && value !== void 0 ? value : 0); },
        });
    });
}
function signInAfterTransitionFromOldDot(hybridAppSettings) {
    var _a = JSON.parse(hybridAppSettings), email = _a.email, authToken = _a.authToken, encryptedAuthToken = _a.encryptedAuthToken, accountID = _a.accountID, autoGeneratedLogin = _a.autoGeneratedLogin, autoGeneratedPassword = _a.autoGeneratedPassword, clearOnyxOnStart = _a.clearOnyxOnStart, completedHybridAppOnboarding = _a.completedHybridAppOnboarding, nudgeMigrationTimestamp = _a.nudgeMigrationTimestamp, isSingleNewDotEntry = _a.isSingleNewDotEntry, isStaging = _a.isStaging, primaryLogin = _a.primaryLogin, oldDotOriginalAccountEmail = _a.oldDotOriginalAccountEmail, stashedAuthToken = _a.stashedAuthToken, stashedAccountID = _a.stashedAccountID, requiresTwoFactorAuth = _a.requiresTwoFactorAuth, needsTwoFactorAuthSetup = _a.needsTwoFactorAuthSetup;
    var clearOnyxForNewAccount = function () {
        if (!clearOnyxOnStart) {
            return Promise.resolve();
        }
        // We also need to reset:
        //  - IS_LOADING_APP after sign in to ensure the condition to show ExplanationModal runs once
        //    https://github.com/Expensify/App/issues/57575#issuecomment-2780189425
        return react_native_onyx_1.default.clear(App_1.KEYS_TO_PRESERVE)
            .then(function () { return react_native_onyx_1.default.merge(ONYXKEYS_1.default.ACCOUNT, { delegatedAccess: null }); })
            .then(function () { return react_native_onyx_1.default.merge(ONYXKEYS_1.default.IS_LOADING_APP, null); });
    };
    return clearOnyxForNewAccount()
        .then(function () {
        var _a, _b;
        // This section controls copilot changes
        var currentUserEmail = (0, NetworkStore_1.getCurrentUserEmail)();
        // If OD is in copilot, stash the original account data
        if (oldDotOriginalAccountEmail && oldDotOriginalAccountEmail !== email) {
            return react_native_onyx_1.default.multiSet((_a = {},
                _a[ONYXKEYS_1.default.STASHED_SESSION] = { email: oldDotOriginalAccountEmail, authToken: stashedAuthToken, accountID: Number(stashedAccountID) },
                _a[ONYXKEYS_1.default.STASHED_CREDENTIALS] = { autoGeneratedLogin: autoGeneratedLogin, autoGeneratedPassword: autoGeneratedPassword },
                _a));
        }
        // If OD and ND account are the same - do nothing
        if (email === currentUserEmail) {
            return;
        }
        // If account was changed to original one on OD side - clear onyx
        if (!oldDotOriginalAccountEmail) {
            return react_native_onyx_1.default.clear(Delegate_1.KEYS_TO_PRESERVE_DELEGATE_ACCESS);
        }
        // If we're already logged in - do nothing, data will be set in next step
        if (currentUserEmail) {
            return;
        }
        // If we're not logged in - set stashed data
        return react_native_onyx_1.default.multiSet((_b = {},
            _b[ONYXKEYS_1.default.STASHED_CREDENTIALS] = { autoGeneratedLogin: autoGeneratedLogin, autoGeneratedPassword: autoGeneratedPassword },
            _b));
    })
        .then(function () {
        var _a;
        return react_native_onyx_1.default.multiSet((_a = {},
            _a[ONYXKEYS_1.default.SESSION] = { email: email, authToken: authToken, encryptedAuthToken: decodeURIComponent(encryptedAuthToken), accountID: Number(accountID) },
            _a[ONYXKEYS_1.default.CREDENTIALS] = { autoGeneratedLogin: autoGeneratedLogin, autoGeneratedPassword: autoGeneratedPassword },
            _a[ONYXKEYS_1.default.IS_SINGLE_NEW_DOT_ENTRY] = isSingleNewDotEntry,
            _a[ONYXKEYS_1.default.NVP_TRY_NEW_DOT] = {
                classicRedirect: { completedHybridAppOnboarding: completedHybridAppOnboarding },
                nudgeMigration: nudgeMigrationTimestamp ? { timestamp: new Date(nudgeMigrationTimestamp) } : undefined,
            },
            _a[ONYXKEYS_1.default.ACCOUNT] = { shouldUseStagingServer: isStaging },
            _a)).then(function () { return react_native_onyx_1.default.merge(ONYXKEYS_1.default.ACCOUNT, { primaryLogin: primaryLogin, requiresTwoFactorAuth: requiresTwoFactorAuth, needsTwoFactorAuthSetup: needsTwoFactorAuthSetup }); });
    })
        .then(function () {
        if (clearOnyxOnStart) {
            return (0, App_1.openApp)();
        }
        return getLastUpdateIDAppliedToClient().then(function (lastUpdateId) {
            return (0, App_1.reconnectApp)(lastUpdateId);
        });
    })
        .catch(function (error) {
        Log_1.default.hmmm('[HybridApp] Initialization of HybridApp has failed. Forcing transition', { error: error });
    });
}
/**
 * Given an idToken from Sign in with Apple, checks the API to see if an account
 * exists for that email address and signs the user in if so.
 */
function beginAppleSignIn(idToken) {
    var _a = signInAttemptState(), optimisticData = _a.optimisticData, successData = _a.successData, failureData = _a.failureData;
    var params = { idToken: idToken, preferredLocale: preferredLocale };
    API.write(types_1.WRITE_COMMANDS.SIGN_IN_WITH_APPLE, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
/**
 * Shows Google sign-in process, and if an auth token is successfully obtained,
 * passes the token on to the Expensify API to sign in with
 */
function beginGoogleSignIn(token) {
    var _a = signInAttemptState(), optimisticData = _a.optimisticData, successData = _a.successData, failureData = _a.failureData;
    var params = { token: token, preferredLocale: preferredLocale };
    API.write(types_1.WRITE_COMMANDS.SIGN_IN_WITH_GOOGLE, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
/**
 * Will create a temporary login for the user in the passed authenticate response which is used when
 * re-authenticating after an authToken expires.
 */
function signInWithShortLivedAuthToken(authToken) {
    var _a = getShortLivedLoginParams(), optimisticData = _a.optimisticData, finallyData = _a.finallyData;
    API.read(types_1.READ_COMMANDS.SIGN_IN_WITH_SHORT_LIVED_AUTH_TOKEN, { authToken: authToken, skipReauthentication: true }, { optimisticData: optimisticData, finallyData: finallyData });
}
/**
 * Sign the user into the application. This will first authenticate their account
 * then it will create a temporary login for them which is used when re-authenticating
 * after an authToken expires.
 *
 * @param validateCode - 6 digit code required for login
 */
function signIn(validateCode, twoFactorAuthCode) {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: __assign(__assign({}, CONST_1.default.DEFAULT_ACCOUNT_DATA), { isLoading: true, loadingForm: twoFactorAuthCode ? CONST_1.default.FORMS.VALIDATE_TFA_CODE_FORM : CONST_1.default.FORMS.VALIDATE_CODE_FORM }),
        },
    ];
    var onyxOperationToCleanUpAnonymousUser = buildOnyxDataToCleanUpAnonymousUser();
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                isLoading: false,
                loadingForm: null,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.CREDENTIALS,
            value: {
                validateCode: validateCode,
            },
        },
        onyxOperationToCleanUpAnonymousUser,
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                isLoading: false,
                loadingForm: null,
            },
        },
    ];
    Device.getDeviceInfoWithID().then(function (deviceInfo) {
        var params = {
            twoFactorAuthCode: twoFactorAuthCode,
            email: credentials.login,
            preferredLocale: preferredLocale,
            deviceInfo: deviceInfo,
        };
        // Conditionally pass a password or validateCode to command since we temporarily allow both flows
        if (validateCode || twoFactorAuthCode) {
            params.validateCode = validateCode || credentials.validateCode;
        }
        API.write(types_1.WRITE_COMMANDS.SIGN_IN_USER, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
    });
}
function signInWithValidateCode(accountID, code, twoFactorAuthCode) {
    if (twoFactorAuthCode === void 0) { twoFactorAuthCode = ''; }
    // If this is called from the 2fa step, get the validateCode directly from onyx
    // instead of the one passed from the component state because the state is changing when this method is called.
    var validateCode = twoFactorAuthCode ? credentials.validateCode : code;
    var onyxOperationToCleanUpAnonymousUser = buildOnyxDataToCleanUpAnonymousUser();
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: __assign(__assign({}, CONST_1.default.DEFAULT_ACCOUNT_DATA), { isLoading: true, loadingForm: twoFactorAuthCode ? CONST_1.default.FORMS.VALIDATE_TFA_CODE_FORM : CONST_1.default.FORMS.VALIDATE_CODE_FORM }),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.SESSION,
            value: { autoAuthState: CONST_1.default.AUTO_AUTH_STATE.SIGNING_IN },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                isLoading: false,
                loadingForm: null,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.CREDENTIALS,
            value: {
                accountID: accountID,
                validateCode: validateCode,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.SESSION,
            value: { autoAuthState: CONST_1.default.AUTO_AUTH_STATE.JUST_SIGNED_IN },
        },
        onyxOperationToCleanUpAnonymousUser,
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                isLoading: false,
                loadingForm: null,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.SESSION,
            value: { autoAuthState: CONST_1.default.AUTO_AUTH_STATE.FAILED },
        },
    ];
    Device.getDeviceInfoWithID().then(function (deviceInfo) {
        var params = {
            accountID: accountID,
            validateCode: validateCode,
            twoFactorAuthCode: twoFactorAuthCode,
            preferredLocale: preferredLocale,
            deviceInfo: deviceInfo,
        };
        API.write(types_1.WRITE_COMMANDS.SIGN_IN_USER_WITH_LINK, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
    });
}
/**
 * Initializes the state of the automatic authentication when the user clicks on a magic link.
 *
 * This method is called in componentDidMount event of the lifecycle.
 * When the user gets authenticated, the component is unmounted and then remounted
 * when AppNavigator switches from PublicScreens to AuthScreens.
 * That's the reason why autoAuthState initialization is skipped while the last state is SIGNING_IN.
 */
function initAutoAuthState(cachedAutoAuthState) {
    var signedInStates = [CONST_1.default.AUTO_AUTH_STATE.SIGNING_IN, CONST_1.default.AUTO_AUTH_STATE.JUST_SIGNED_IN];
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.SESSION, {
        autoAuthState: signedInStates.includes(cachedAutoAuthState) ? CONST_1.default.AUTO_AUTH_STATE.JUST_SIGNED_IN : CONST_1.default.AUTO_AUTH_STATE.NOT_STARTED,
    });
}
function invalidateCredentials() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.CREDENTIALS, { autoGeneratedLogin: '', autoGeneratedPassword: '' });
}
function invalidateAuthToken() {
    NetworkStore.setAuthToken(INVALID_TOKEN);
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.SESSION, { authToken: INVALID_TOKEN, encryptedAuthToken: INVALID_TOKEN });
}
/**
 * Send an expired session to FE and invalidate the session in the BE perspective. Action is delayed for 15s
 */
function expireSessionWithDelay() {
    // expires the session after 15s
    setTimeout(function () {
        NetworkStore.setAuthToken(INVALID_TOKEN);
        react_native_onyx_1.default.merge(ONYXKEYS_1.default.SESSION, { authToken: INVALID_TOKEN, encryptedAuthToken: INVALID_TOKEN, creationDate: new Date().getTime() - CONST_1.default.SESSION_EXPIRATION_TIME_MS });
    }, 15000);
}
/**
 * Clear the credentials and partial sign in session so the user can taken back to first Login step
 */
function clearSignInData() {
    var _a;
    react_native_onyx_1.default.multiSet((_a = {},
        _a[ONYXKEYS_1.default.ACCOUNT] = null,
        _a[ONYXKEYS_1.default.CREDENTIALS] = null,
        _a));
}
/**
 * Reset all current params of the Home route
 */
function resetHomeRouteParams() {
    Navigation_1.default.isNavigationReady().then(function () {
        var _a, _b, _c, _d;
        var routes = (_b = (_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.getState()) === null || _b === void 0 ? void 0 : _b.routes;
        var homeRoute = routes === null || routes === void 0 ? void 0 : routes.find(function (route) { return route.name === SCREENS_1.default.HOME; });
        var emptyParams = {};
        Object.keys((_c = homeRoute === null || homeRoute === void 0 ? void 0 : homeRoute.params) !== null && _c !== void 0 ? _c : {}).forEach(function (paramKey) {
            emptyParams[paramKey] = undefined;
        });
        Navigation_1.default.setParams(emptyParams, (_d = homeRoute === null || homeRoute === void 0 ? void 0 : homeRoute.key) !== null && _d !== void 0 ? _d : '');
        react_native_onyx_1.default.set(ONYXKEYS_1.default.IS_CHECKING_PUBLIC_ROOM, false);
    });
}
/**
 * Put any logic that needs to run when we are signed out here. This can be triggered when the current tab or another tab signs out.
 * - Cancels pending network calls - any lingering requests are discarded to prevent unwanted storage writes
 * - Clears all current params of the Home route - the login page URL should not contain any parameter
 */
function cleanupSession() {
    Pusher_1.default.disconnect();
    Timers_1.default.clearAll();
    Welcome.resetAllChecks();
    MainQueue.clear();
    HttpUtils_1.default.cancelPendingRequests();
    PersistedRequests.clear();
    NetworkConnection_1.default.clearReconnectionCallbacks();
    SessionUtils.resetDidUserLogInDuringSession();
    resetHomeRouteParams();
    (0, clearCache_1.default)().then(function () {
        Log_1.default.info('Cleared all cache data', true, {}, true);
    });
    (0, Sound_1.clearSoundAssetsCache)();
    Timing_1.default.clearData();
}
function clearAccountMessages() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.ACCOUNT, {
        success: '',
        errors: null,
        message: null,
        isLoading: false,
    });
}
function setAccountError(error) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.ACCOUNT, { errors: ErrorUtils.getMicroSecondOnyxErrorWithMessage(error) });
}
// It's necessary to throttle requests to reauthenticate since calling this multiple times will cause Pusher to
// reconnect each time when we only need to reconnect once. This way, if an authToken is expired and we try to
// subscribe to a bunch of channels at once we will only reauthenticate and force reconnect Pusher once.
var reauthenticatePusher = (0, throttle_1.default)(function () {
    Log_1.default.info('[Pusher] Re-authenticating and then reconnecting');
    Authentication.reauthenticate(types_1.SIDE_EFFECT_REQUEST_COMMANDS.AUTHENTICATE_PUSHER)
        .then(function (wasSuccessful) {
        if (!wasSuccessful) {
            return;
        }
        Pusher_1.default.reconnect();
    })
        .catch(function () {
        console.debug('[PusherConnectionManager]', 'Unable to re-authenticate Pusher because we are offline.');
    });
}, 5000, { trailing: false });
exports.reauthenticatePusher = reauthenticatePusher;
function authenticatePusher(socketID, channelName, callback) {
    Log_1.default.info('[PusherAuthorizer] Attempting to authorize Pusher', false, { channelName: channelName });
    var params = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        socket_id: socketID,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        channel_name: channelName,
        shouldRetry: false,
        forceNetworkRequest: true,
    };
    // We use makeRequestWithSideEffects here because we need to authorize to Pusher (an external service) each time a user connects to any channel.
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(types_1.SIDE_EFFECT_REQUEST_COMMANDS.AUTHENTICATE_PUSHER, params)
        .then(function (response) {
        if ((response === null || response === void 0 ? void 0 : response.jsonCode) === CONST_1.default.JSON_CODE.NOT_AUTHENTICATED) {
            Log_1.default.hmmm('[PusherAuthorizer] Unable to authenticate Pusher because authToken is expired');
            callback === null || callback === void 0 ? void 0 : callback(new Error('Pusher failed to authenticate because authToken is expired'), { auth: '' });
            // Attempt to refresh the authToken then reconnect to Pusher
            reauthenticatePusher();
            return;
        }
        if ((response === null || response === void 0 ? void 0 : response.jsonCode) !== CONST_1.default.JSON_CODE.SUCCESS) {
            Log_1.default.hmmm('[PusherAuthorizer] Unable to authenticate Pusher for reason other than expired session');
            callback === null || callback === void 0 ? void 0 : callback(new Error("Pusher failed to authenticate because code: ".concat(response === null || response === void 0 ? void 0 : response.jsonCode, " message: ").concat(response === null || response === void 0 ? void 0 : response.message)), { auth: '' });
            return;
        }
        Log_1.default.info('[PusherAuthorizer] Pusher authenticated successfully', false, { channelName: channelName });
        if (callback) {
            callback(null, response);
        }
        else {
            return {
                auth: response.auth,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                shared_secret: response.shared_secret,
            };
        }
    })
        .catch(function (error) {
        Log_1.default.hmmm('[PusherAuthorizer] Unhandled error: ', { channelName: channelName, error: error });
        callback === null || callback === void 0 ? void 0 : callback(new Error('AuthenticatePusher request failed'), { auth: '' });
    });
}
/**
 * Request a new validation link / magic code to unlink an unvalidated secondary login from a primary login
 */
function requestUnlinkValidationLink() {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                isLoading: true,
                errors: null,
                message: null,
                loadingForm: CONST_1.default.FORMS.UNLINK_LOGIN_FORM,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                isLoading: false,
                message: 'unlinkLoginForm.linkSent',
                loadingForm: null,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                isLoading: false,
                loadingForm: null,
            },
        },
    ];
    var params = { email: credentials.login };
    API.write(types_1.WRITE_COMMANDS.REQUEST_UNLINK_VALIDATION_LINK, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function unlinkLogin(accountID, validateCode) {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: __assign(__assign({}, CONST_1.default.DEFAULT_ACCOUNT_DATA), { isLoading: true }),
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                isLoading: false,
                message: 'unlinkLoginForm.successfullyUnlinkedLogin',
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.CREDENTIALS,
            value: {
                login: '',
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                isLoading: false,
            },
        },
    ];
    var params = {
        accountID: accountID,
        validateCode: validateCode,
    };
    API.write(types_1.WRITE_COMMANDS.UNLINK_LOGIN, params, {
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    });
}
/**
 * Toggles two-factor authentication based on the `enable` parameter
 */
function toggleTwoFactorAuth(enable, twoFactorAuthCode) {
    if (twoFactorAuthCode === void 0) { twoFactorAuthCode = ''; }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                isLoading: true,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                isLoading: false,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                isLoading: false,
            },
        },
    ];
    if (enable) {
        API.write(types_1.WRITE_COMMANDS.ENABLE_TWO_FACTOR_AUTH, null, { optimisticData: optimisticData, successData: successData, failureData: failureData });
        return;
    }
    // A 2FA code is required to disable 2FA
    var params = { twoFactorAuthCode: twoFactorAuthCode };
    // eslint-disable-next-line rulesdir/no-multiple-api-calls
    API.write(types_1.WRITE_COMMANDS.DISABLE_TWO_FACTOR_AUTH, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function clearDisableTwoFactorAuthErrors() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.ACCOUNT, { errorFields: { requiresTwoFactorAuth: null } });
}
function updateAuthTokenAndOpenApp(authToken, encryptedAuthToken) {
    // Update authToken in Onyx and in our local variables so that API requests will use the new authToken
    (0, updateSessionAuthTokens_1.default)(authToken, encryptedAuthToken);
    // Note: It is important to manually set the authToken that is in the store here since
    // reconnectApp will immediate post and use the local authToken. Onyx updates subscribers lately so it is not
    // enough to do the updateSessionAuthTokens() call above.
    NetworkStore.setAuthToken(authToken !== null && authToken !== void 0 ? authToken : null);
    (0, App_1.openApp)();
}
function validateTwoFactorAuth(twoFactorAuthCode, shouldClearData) {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                isLoading: true,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                isLoading: false,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                isLoading: false,
            },
        },
    ];
    var params = { twoFactorAuthCode: twoFactorAuthCode };
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.makeRequestWithSideEffects(types_1.SIDE_EFFECT_REQUEST_COMMANDS.TWO_FACTOR_AUTH_VALIDATE, params, { optimisticData: optimisticData, successData: successData, failureData: failureData }).then(function (response) {
        if (!(response === null || response === void 0 ? void 0 : response.authToken)) {
            return;
        }
        // Clear onyx data if the user has just signed in and is forced to add 2FA
        if (shouldClearData) {
            var keysToPreserveWithPrivatePersonalDetails = __spreadArray(__spreadArray([], App_1.KEYS_TO_PRESERVE, true), [ONYXKEYS_1.default.PRIVATE_PERSONAL_DETAILS], false);
            react_native_onyx_1.default.clear(keysToPreserveWithPrivatePersonalDetails).then(function () { return updateAuthTokenAndOpenApp(response.authToken, response.encryptedAuthToken); });
            return;
        }
        updateAuthTokenAndOpenApp(response.authToken, response.encryptedAuthToken);
    });
}
/**
 * Waits for a user to sign in.
 *
 * If the user is already signed in (`authToken` is truthy), the promise resolves immediately.
 * Otherwise, the promise will resolve when the `authToken` in `ONYXKEYS.SESSION` becomes truthy via the Onyx callback.
 * The promise will not reject on failed login attempt.
 *
 * @returns A promise that resolves to `true` once the user is signed in.
 * @example
 * waitForUserSignIn().then(() => {
 *   console.log('User is signed in!');
 * });
 */
function waitForUserSignIn() {
    return new Promise(function (resolve) {
        if (session.authToken) {
            resolve(true);
        }
        else {
            authPromiseResolver = resolve;
        }
    });
}
function handleExitToNavigation(exitTo) {
    react_native_1.InteractionManager.runAfterInteractions(function () {
        waitForUserSignIn().then(function () {
            Navigation_1.default.waitForProtectedRoutes().then(function () {
                var url = CONFIG_1.default.IS_HYBRID_APP ? Navigation_1.default.parseHybridAppUrl(exitTo) : exitTo;
                Navigation_1.default.goBack();
                Navigation_1.default.navigate(url);
            });
        });
    });
}
function signInWithValidateCodeAndNavigate(accountID, validateCode, twoFactorAuthCode, exitTo) {
    if (twoFactorAuthCode === void 0) { twoFactorAuthCode = ''; }
    signInWithValidateCode(accountID, validateCode, twoFactorAuthCode);
    if (exitTo) {
        handleExitToNavigation(exitTo);
    }
    else {
        Navigation_1.default.goBack();
    }
}
/**
 * check if the route can be accessed by anonymous user
 *
 * @param {string} route
 */
var canAnonymousUserAccessRoute = function (route) {
    var reportID = (0, ReportUtils_1.getReportIDFromLink)(route);
    if (reportID) {
        return true;
    }
    var parsedReportRouteParams = (0, ReportUtils_1.parseReportRouteParams)(route);
    var routeRemovedReportId = route;
    if (parsedReportRouteParams === null || parsedReportRouteParams === void 0 ? void 0 : parsedReportRouteParams.reportID) {
        routeRemovedReportId = route.replace(parsedReportRouteParams === null || parsedReportRouteParams === void 0 ? void 0 : parsedReportRouteParams.reportID, ':reportID');
    }
    if (route.startsWith('/')) {
        routeRemovedReportId = routeRemovedReportId.slice(1);
    }
    var routesAccessibleByAnonymousUser = [ROUTES_1.default.SIGN_IN_MODAL, ROUTES_1.default.REPORT_WITH_ID_DETAILS.route, ROUTES_1.default.REPORT_WITH_ID_DETAILS_SHARE_CODE.route, ROUTES_1.default.CONCIERGE];
    var isMagicLink = CONST_1.default.REGEX.ROUTES.VALIDATE_LOGIN.test("/".concat(route));
    if (routesAccessibleByAnonymousUser.includes(routeRemovedReportId) || isMagicLink) {
        return true;
    }
    return false;
};
exports.canAnonymousUserAccessRoute = canAnonymousUserAccessRoute;
function AddWorkEmail(workEmail) {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.FORMS.ONBOARDING_WORK_EMAIL_FORM,
            value: {
                onboardingWorkEmail: workEmail,
                isLoading: true,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.FORMS.ONBOARDING_WORK_EMAIL_FORM,
            value: {
                onboardingWorkEmail: workEmail,
                isLoading: false,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.FORMS.ONBOARDING_WORK_EMAIL_FORM,
            value: {
                onboardingWorkEmail: null,
                isLoading: false,
            },
        },
    ];
    API.write(types_1.WRITE_COMMANDS.ADD_WORK_EMAIL, { workEmail: workEmail }, {
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    });
}
function MergeIntoAccountAndLogin(workEmail, validateCode, accountID) {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ONBOARDING_ERROR_MESSAGE,
            value: '',
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                isLoading: true,
                loadingForm: CONST_1.default.FORMS.VALIDATE_CODE_FORM,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ONBOARDING_ERROR_MESSAGE,
            value: '',
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_ONBOARDING,
            value: {
                isMergeAccountStepCompleted: true,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                isLoading: false,
                loadingForm: null,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                isLoading: false,
                loadingForm: null,
            },
        },
    ];
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.makeRequestWithSideEffects(types_1.SIDE_EFFECT_REQUEST_COMMANDS.MERGE_INTO_ACCOUNT_AND_LOGIN, { workEmail: workEmail, validateCode: validateCode, accountID: accountID }, {
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    }).then(function (response) {
        if ((response === null || response === void 0 ? void 0 : response.jsonCode) === CONST_1.default.JSON_CODE.EXP_ERROR) {
            // If the error other than invalid code, we show a blocking screen
            if ((response === null || response === void 0 ? void 0 : response.message) === CONST_1.default.MERGE_ACCOUNT_INVALID_CODE_ERROR || (response === null || response === void 0 ? void 0 : response.title) === CONST_1.default.MERGE_ACCOUNT_INVALID_CODE_ERROR) {
                react_native_onyx_1.default.merge(ONYXKEYS_1.default.ONBOARDING_ERROR_MESSAGE, (0, Localize_1.translateLocal)('contacts.genericFailureMessages.validateSecondaryLogin'));
            }
            else {
                react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_ONBOARDING, { isMergingAccountBlocked: true });
            }
            return;
        }
        // When the action is successful, we need to update the new authToken and encryptedAuthToken
        // This action needs to be synchronous as the user will be logged out due to middleware if old authToken is used
        // For more information see the slack discussion: https://expensify.slack.com/archives/C08CZDJFJ77/p1742838796040369
        return SequentialQueue.waitForIdle().then(function () {
            if (!(response === null || response === void 0 ? void 0 : response.authToken) || !(response === null || response === void 0 ? void 0 : response.encryptedAuthToken)) {
                return;
            }
            updateAuthTokenAndOpenApp(response.authToken, response.encryptedAuthToken);
        });
    });
}
/**
 * To reset SMS delivery failure
 */
function resetSMSDeliveryFailureStatus(login) {
    var params = { login: login };
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                errors: null,
                smsDeliveryFailureStatus: {
                    isLoading: true,
                },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                smsDeliveryFailureStatus: {
                    isLoading: false,
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                smsDeliveryFailureStatus: {
                    isLoading: false,
                },
            },
        },
    ];
    API.write(types_1.WRITE_COMMANDS.RESET_SMS_DELIVERY_FAILURE_STATUS, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
