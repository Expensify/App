import HybridAppModule from '@expensify/react-native-hybrid-app';
import throttle from 'lodash/throttle';
import type {ChannelAuthorizationData} from 'pusher-js/types/src/core/auth/options';
import type {ChannelAuthorizationCallback} from 'pusher-js/with-encryption';
import {InteractionManager} from 'react-native';
import type {OnyxEntry, OnyxKey, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {buildOldDotURL, openExternalLink} from '@libs/actions/Link';
import * as PersistedRequests from '@libs/actions/PersistedRequests';
import * as API from '@libs/API';
import type {
    AuthenticatePusherParams,
    BeginAppleSignInParams,
    BeginGoogleSignInParams,
    BeginSignInParams,
    DisableTwoFactorAuthParams,
    LogOutParams,
    RequestNewValidateCodeParams,
    RequestUnlinkValidationLinkParams,
    ResetSMSDeliveryFailureStatusParams,
    SignInUserWithLinkParams,
    SignUpUserParams,
    UnlinkLoginParams,
    ValidateTwoFactorAuthParams,
} from '@libs/API/parameters';
import type SignInUserParams from '@libs/API/parameters/SignInUserParams';
import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import asyncOpenURL from '@libs/asyncOpenURL';
import * as Authentication from '@libs/Authentication';
import * as ErrorUtils from '@libs/ErrorUtils';
import FraudProtection from '@libs/FraudProtection';
import Fullstory from '@libs/Fullstory';
import HttpUtils from '@libs/HttpUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import * as MainQueue from '@libs/Network/MainQueue';
import * as NetworkStore from '@libs/Network/NetworkStore';
import {getCurrentUserEmail} from '@libs/Network/NetworkStore';
import * as SequentialQueue from '@libs/Network/SequentialQueue';
import NetworkConnection from '@libs/NetworkConnection';
import Pusher from '@libs/Pusher';
import {getReportIDFromLink, parseReportRouteParams as parseReportRouteParamsReportUtils} from '@libs/ReportUtils';
import * as SessionUtils from '@libs/SessionUtils';
import {checkIfShouldUseNewPartnerName, resetDidUserLogInDuringSession} from '@libs/SessionUtils';
import {clearSoundAssetsCache} from '@libs/Sound';
import Timers from '@libs/Timers';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {confirmReadyToOpenApp, KEYS_TO_PRESERVE, openApp} from '@userActions/App';
import {KEYS_TO_PRESERVE_DELEGATE_ACCESS} from '@userActions/Delegate';
import * as Device from '@userActions/Device';
import * as HybridAppActions from '@userActions/HybridApp';
import type HybridAppSettings from '@userActions/HybridApp/types';
import {close} from '@userActions/Modal';
import redirectToSignIn from '@userActions/SignInRedirect';
import Timing from '@userActions/Timing';
import * as Welcome from '@userActions/Welcome';
import CONFIG from '@src/CONFIG';
import CONST, {FRAUD_PROTECTION_EVENT} from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {TryNewDot} from '@src/types/onyx';
import type Credentials from '@src/types/onyx/Credentials';
import type Locale from '@src/types/onyx/Locale';
import type {OnyxData} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';
import type Session from '@src/types/onyx/Session';
import type {AutoAuthState} from '@src/types/onyx/Session';
import clearCache from './clearCache';
import updateSessionAuthTokens from './updateSessionAuthTokens';

const INVALID_TOKEN = 'pizza';

let session: Session = {};
let authPromiseResolver: ((value: boolean) => void) | null = null;

let isHybridAppSetupFinished = false;
let hasSwitchedAccountInHybridMode = false;

Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        session = value ?? {};

        if (!session.creationDate) {
            session.creationDate = new Date().getTime();
        }
        if (session.authToken && authPromiseResolver) {
            authPromiseResolver(true);
            authPromiseResolver = null;
        }
        if (CONFIG.IS_HYBRID_APP && isHybridAppSetupFinished && session.authToken && session.authToken !== INVALID_TOKEN && !isAnonymousUser(value)) {
            HybridAppModule.sendAuthToken({authToken: session.authToken});
        }
    },
});

// Use connectWithoutView because it is only for fullstory initialization
Onyx.connectWithoutView({
    key: ONYXKEYS.USER_METADATA,
    callback: Fullstory.consentAndIdentify,
});

let stashedSession: Session = {};
Onyx.connect({
    key: ONYXKEYS.STASHED_SESSION,
    callback: (value) => (stashedSession = value ?? {}),
});

let credentials: Credentials = {};
Onyx.connect({
    key: ONYXKEYS.CREDENTIALS,
    callback: (value) => (credentials = value ?? {}),
});

let stashedCredentials: Credentials = {};
Onyx.connect({
    key: ONYXKEYS.STASHED_CREDENTIALS,
    callback: (value) => (stashedCredentials = value ?? {}),
});

let activePolicyID: OnyxEntry<string>;
Onyx.connect({
    key: ONYXKEYS.NVP_ACTIVE_POLICY_ID,
    callback: (newActivePolicyID) => {
        activePolicyID = newActivePolicyID;
    },
});

let isUsingImportedState: boolean | undefined;
Onyx.connectWithoutView({
    key: ONYXKEYS.IS_USING_IMPORTED_STATE,
    callback: (value) => {
        isUsingImportedState = value ?? false;
    },
});

function isSupportAuthToken(): boolean {
    return session.authTokenType === CONST.AUTH_TOKEN_TYPES.SUPPORT;
}

/**
 * Sets the SupportToken. This method will only be used on dev.
 */
function setSupportAuthToken(supportAuthToken: string, email: string, accountID: number) {
    Onyx.merge(ONYXKEYS.SESSION, {
        authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT,
        authToken: supportAuthToken,
        email,
        accountID,
        creationDate: new Date().getTime(),
    }).then(() => {
        Log.info('[Supportal] Auth token set');
    });
    Onyx.set(ONYXKEYS.LAST_VISITED_PATH, '');
}

function getShortLivedLoginParams(isSupportAuthTokenUsed = false, isSAML = false) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT | typeof ONYXKEYS.SESSION | typeof ONYXKEYS.HYBRID_APP>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                ...CONST.DEFAULT_ACCOUNT_DATA,
                isLoading: true,
            },
        },
        // We are making a temporary modification to 'signedInWithShortLivedAuthToken' to ensure that 'App.openApp' will be called at least once
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.SESSION,
            value: {
                signedInWithShortLivedAuthToken: true,
                isAuthenticatingWithShortLivedToken: true,
                isSupportAuthTokenUsed,
            },
        },
    ];

    // Subsequently, we revert it back to the default value of 'signedInWithShortLivedAuthToken' in 'finallyData' to ensure the user is logged out on refresh
    const finallyData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT | typeof ONYXKEYS.SESSION>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.SESSION,
            value: {
                signedInWithShortLivedAuthToken: null,
                isSupportAuthTokenUsed: null,
                isAuthenticatingWithShortLivedToken: false,
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.HYBRID_APP>> = [];

    if (CONFIG.IS_HYBRID_APP && isSAML) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.HYBRID_APP,
            value: {
                signingInWithSAML: true,
            },
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.HYBRID_APP,
            value: {
                signingInWithSAML: null,
            },
        });
    }

    return {optimisticData, failureData, finallyData};
}

/**
 * This method should be used when we are being redirected from oldDot to NewDot on a supportal request
 */
function signInWithSupportAuthToken(authToken: string) {
    const {optimisticData, finallyData} = getShortLivedLoginParams(true);
    API.read(READ_COMMANDS.SIGN_IN_WITH_SUPPORT_AUTH_TOKEN, {authToken}, {optimisticData, finallyData});
}

/**
 * Clears the Onyx store and redirects user to the sign in page
 */
function signOut(): Promise<void | Response> {
    Log.info('Flushing logs before signing out', true, {}, true);
    const shouldUseNewPartnerName = checkIfShouldUseNewPartnerName(credentials?.autoGeneratedLogin);

    const params: LogOutParams = {
        // Send current authToken because we will immediately clear it once triggering this command
        authToken: NetworkStore.getAuthToken() ?? null,
        partnerUserID: credentials?.autoGeneratedLogin ?? '',
        partnerName: shouldUseNewPartnerName ? CONFIG.EXPENSIFY.PARTNER_NAME : CONFIG.EXPENSIFY.LEGACY_PARTNER_NAME,
        partnerPassword: shouldUseNewPartnerName ? CONFIG.EXPENSIFY.PARTNER_PASSWORD : CONFIG.EXPENSIFY.LEGACY_PARTNER_PASSWORD,
        shouldRetry: false,
        skipReauthentication: true,
    };

    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.LOG_OUT, params, {});
}

/**
 * Checks if the account is an anonymous account.
 */
function isAnonymousUser(sessionParam?: OnyxEntry<Session>): boolean {
    return (sessionParam?.authTokenType ?? session.authTokenType) === CONST.AUTH_TOKEN_TYPES.ANONYMOUS;
}

function hasStashedSession(): boolean {
    return !!(stashedSession.authToken && stashedCredentials.autoGeneratedLogin && stashedCredentials.autoGeneratedLogin !== '');
}

/**
 * Checks if the user has authToken
 */
function hasAuthToken(): boolean {
    return !!session.authToken;
}

/**
 * Indicates if the session which creation date is in parameter is expired
 * @param sessionCreationDate the session creation date timestamp
 */
function isExpiredSession(sessionCreationDate: number): boolean {
    return new Date().getTime() - sessionCreationDate >= CONST.SESSION_EXPIRATION_TIME_MS;
}

const KEYS_TO_PRESERVE_SUPPORTAL = [
    ONYXKEYS.NVP_TRY_FOCUS_MODE,
    ONYXKEYS.PREFERRED_THEME,
    ONYXKEYS.NVP_PREFERRED_LOCALE,
    ONYXKEYS.ARE_TRANSLATIONS_LOADING,
    ONYXKEYS.SESSION,
    ONYXKEYS.STASHED_SESSION,
    ONYXKEYS.HAS_LOADED_APP,
    ONYXKEYS.STASHED_CREDENTIALS,
    ONYXKEYS.HYBRID_APP,

    // We need to preserve the sidebar loaded state since we never unmount the sidebar when connecting as a delegate
    // This allows the report screen to load correctly when the delegate token expires and the delegate is returned to their original account.
    ONYXKEYS.IS_SIDEBAR_LOADED,
    ONYXKEYS.NETWORK,
    ONYXKEYS.SHOULD_USE_STAGING_SERVER,
    ONYXKEYS.IS_DEBUG_MODE_ENABLED,

    // Preserve IS_USING_IMPORTED_STATE so that when transitioning to/from supportal,
    // we know if we're in imported state mode and should skip API calls that would cause infinite loading
    ONYXKEYS.IS_USING_IMPORTED_STATE,
];

function signOutAndRedirectToSignIn(shouldResetToHome?: boolean, shouldStashSession?: boolean, shouldSignOutFromOldDot = true, shouldForceUseStashedSession?: boolean) {
    Log.info('Redirecting to Sign In because signOut() was called');
    hideContextMenu(false);

    if (isAnonymousUser()) {
        if (!Navigation.isActiveRoute(ROUTES.SIGN_IN_MODAL)) {
            if (shouldResetToHome) {
                Navigation.resetToHome();
            }
            Navigation.navigate(ROUTES.SIGN_IN_MODAL);
        }
        return;
    }

    // When signing out from the HybridApp, we need to sign out from the oldDot app as well
    if (CONFIG.IS_HYBRID_APP && shouldSignOutFromOldDot) {
        HybridAppModule.signOutFromOldDot();
    }

    const isSupportal = isSupportAuthToken();
    const shouldRestoreStashedSession = isSupportal || shouldForceUseStashedSession;

    // We'll only call signOut if we're not stashing the session and not restoring a stashed session,
    // otherwise we'll call the API to invalidate the autogenerated credentials used for infinite
    // session.
    const signOutPromise: Promise<void | Response> = !shouldRestoreStashedSession && !shouldStashSession ? signOut() : Promise.resolve();

    // The function redirectToSignIn will clear the whole storage, so let's create our onyx params
    // updates for the credentials before we call it
    let onyxSetParams = {};

    // If we are not currently using a support token, and we received stashSession as true, we need to
    // store the credentials so the user doesn't need to login again after they finish their supportal
    // action. This needs to computed before we call `redirectToSignIn`
    if (!isSupportal && shouldStashSession) {
        onyxSetParams = {
            [ONYXKEYS.STASHED_CREDENTIALS]: credentials,
            [ONYXKEYS.STASHED_SESSION]: session,
        };
    }

    // If this is a supportal token, and we've received the parameters to stashSession as true, and
    // we already have a stashedSession, that means we are supportal-ed, currently supportal-ing
    // into another account and we want to keep the stashed data from the original account.
    if (isSupportal && shouldStashSession && hasStashedSession()) {
        onyxSetParams = {
            [ONYXKEYS.STASHED_CREDENTIALS]: stashedCredentials,
            [ONYXKEYS.STASHED_SESSION]: stashedSession,
        };
    }

    // If we should restore the stashed session, and we do not want to stash the current session, and we have a
    // stashed session, then switch the account instead of completely logging out.
    if (shouldRestoreStashedSession && !shouldStashSession && hasStashedSession()) {
        if (CONFIG.IS_HYBRID_APP) {
            HybridAppModule.switchAccount({
                newDotCurrentAccountEmail: stashedSession.email ?? '',
                authToken: stashedSession.authToken ?? '',
                // eslint-disable-next-line rulesdir/no-default-id-values
                policyID: activePolicyID ?? '',
                accountID: session.accountID ? String(session.accountID) : '',
            });
            hasSwitchedAccountInHybridMode = true;
        }

        onyxSetParams = {
            [ONYXKEYS.CREDENTIALS]: stashedCredentials,
            [ONYXKEYS.SESSION]: stashedSession,
        };
    }
    if (shouldRestoreStashedSession && !shouldStashSession && !hasStashedSession()) {
        Log.info('No stashed session found, clearing the session');
    }

    const isPerformingSupportalLogout = isSupportal && shouldRestoreStashedSession && !shouldStashSession;

    // Wait for signOut (if called), then redirect and update Onyx.
    return signOutPromise
        .then((response) => {
            if (isSupportal) {
                // Send event to Fraud Protection backend, otherwise it might consider the user as being suspicious
                FraudProtection.sendEvent(FRAUD_PROTECTION_EVENT.STOP_SUPPORT_SESSION);
            }
            if (response?.hasOldDotAuthCookies) {
                Log.info('Redirecting to OldDot sign out');
                asyncOpenURL(
                    redirectToSignIn().then(() => {
                        Onyx.multiSet(onyxSetParams);
                    }),
                    `${CONFIG.EXPENSIFY.EXPENSIFY_URL}${CONST.OLDDOT_URLS.SIGN_OUT}`,
                    true,
                    true,
                );
            } else if (isPerformingSupportalLogout && hasStashedSession()) {
                // We have confirmed here that the supportal agent was logged in, so we can restore the stashed session
                // and then redirect to the oldDot supportal page to restore the stashed session
                // Clear the Onyx DB of stale data that might be present from a previous session
                // of the customer account
                Onyx.clear(KEYS_TO_PRESERVE_SUPPORTAL).then(() => {
                    Onyx.multiSet(onyxSetParams).then(() => {
                        buildOldDotURL(CONST.OLDDOT_URLS.SUPPORTAL_RESTORE_STASHED_LOGIN).then((oldDotURL) => {
                            // Open the oldDot URL to restore the stashed session and go back to OD supportal page
                            openExternalLink(oldDotURL, undefined, true);
                        });
                    });
                });
            } else if (isPerformingSupportalLogout && !hasStashedSession()) {
                // If the supportal agent was not logged in, we call `redirectToSignIn` to clear the Onyx DB
                // and then redirect to supportal and restore the stashed session
                redirectToSignIn().then(() => {
                    Onyx.multiSet(onyxSetParams).then(() => {
                        buildOldDotURL(CONST.OLDDOT_URLS.SUPPORTAL_RESTORE_STASHED_LOGIN).then((oldDotURL) => {
                            // Open the oldDot URL to restore the stashed session and go back to OD supportal page
                            openExternalLink(oldDotURL, undefined, true);
                        });
                    });
                });
            } else {
                redirectToSignIn().then(() => {
                    Onyx.multiSet(onyxSetParams);

                    if (hasSwitchedAccountInHybridMode) {
                        openApp();
                    }
                });
            }
        })
        .catch((error: string) => Log.warn('Error during sign out process:', error));
}

/**
 * @param callback The callback to execute if the action is allowed
 * @param isAnonymousAction The action is allowed for anonymous or not
 * @returns same callback if the action is allowed, otherwise a function that signs out and redirects to sign in
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function callFunctionIfActionIsAllowed<TCallback extends ((...args: any[]) => any) | void>(callback: TCallback, isAnonymousAction = false): TCallback | (() => void) {
    if (isAnonymousUser() && !isAnonymousAction) {
        return () => {
            close(() => {
                signOutAndRedirectToSignIn();
            });
        };
    }
    return callback;
}

/**
 * Request a new validate / magic code for user to sign in via passwordless flow
 */
function resendValidateCode(login = credentials.login) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                errors: null,
                loadingForm: CONST.FORMS.RESEND_VALIDATE_CODE_FORM,
            },
        },
    ];
    const finallyData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                loadingForm: null,
            },
        },
    ];

    const params: RequestNewValidateCodeParams = {email: login};

    API.write(WRITE_COMMANDS.REQUEST_NEW_VALIDATE_CODE, params, {optimisticData, finallyData});
}

/**
 * Constructs the state object for the BeginSignIn && BeginAppleSignIn API calls.
 */
function signInAttemptState(): OnyxData<typeof ONYXKEYS.ACCOUNT | typeof ONYXKEYS.CREDENTIALS> {
    return {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.ACCOUNT,
                value: {
                    ...CONST.DEFAULT_ACCOUNT_DATA,
                    isLoading: true,
                    message: null,
                    loadingForm: CONST.FORMS.LOGIN_FORM,
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.ACCOUNT,
                value: {
                    isLoading: false,
                    loadingForm: null,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.CREDENTIALS,
                value: {
                    validateCode: null,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.ACCOUNT,
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
function beginSignIn(email: string) {
    const {optimisticData, successData, failureData} = signInAttemptState();

    const params: BeginSignInParams = {email};

    API.read(READ_COMMANDS.BEGIN_SIGNIN, params, {optimisticData, successData, failureData});
}

/**
 * Create Onyx update to clean up anonymous user data
 */
function buildOnyxDataToCleanUpAnonymousUser(): OnyxUpdate<typeof ONYXKEYS.PERSONAL_DETAILS_LIST> {
    const data: Record<string, null> = {};
    if (session.authTokenType === CONST.AUTH_TOKEN_TYPES.ANONYMOUS && session.accountID) {
        data[session.accountID] = null;
    }
    return {
        onyxMethod: Onyx.METHOD.MERGE,
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        value: data,
    };
}

/**
 * Creates an account for the new user and signs them into the application with the newly created account.
 *
 */
function signUpUser(preferredLocale: Locale | undefined) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                ...CONST.DEFAULT_ACCOUNT_DATA,
                isLoading: true,
            },
        },
    ];

    const onyxOperationToCleanUpAnonymousUser = buildOnyxDataToCleanUpAnonymousUser();

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.PERSONAL_DETAILS_LIST | typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
            },
        },
        onyxOperationToCleanUpAnonymousUser,
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
            },
        },
    ];

    const params: SignUpUserParams = {email: credentials.login, preferredLocale: preferredLocale ?? null};

    API.write(WRITE_COMMANDS.SIGN_UP_USER, params, {optimisticData, successData, failureData});
}

function setupNewDotAfterTransitionFromOldDot(hybridAppSettings: HybridAppSettings, tryNewDot?: TryNewDot) {
    const {hybridApp, ...newDotOnyxValues} = hybridAppSettings;

    const clearOnyxIfSigningIn = () => {
        if (!hybridApp.useNewDotSignInPage) {
            return Promise.resolve();
        }

        // Don't clear Onyx when using imported state to preserve imported data (reports, transactions, etc.)
        if (isUsingImportedState) {
            Log.info('[HybridApp] Skipping Onyx clear because using imported state');
            return Promise.resolve();
        }

        Log.info(`[HybridApp] Clearing onyx after transition from OldDot. useNewDotSignInPage set to ${hybridApp.useNewDotSignInPage}`);
        return redirectToSignIn();
    };

    const resetDidUserLoginDuringSessionIfNeeded = () => {
        if (newDotOnyxValues.nvp_tryNewDot === undefined || tryNewDot?.classicRedirect?.dismissed !== true) {
            return Promise.resolve();
        }

        Log.info("[HybridApp] OpenApp hasn't been called yet. Calling `resetDidUserLogInDuringSession`");
        resetDidUserLogInDuringSession();
    };

    return clearOnyxIfSigningIn()
        .then(() => {
            // This section controls copilot changes
            const currentUserEmail = getCurrentUserEmail();

            // If ND and OD account are the same - do nothing
            if (hybridApp?.delegateAccessData?.oldDotCurrentUserEmail === currentUserEmail) {
                Log.info('[HybridApp] User did not switch account on OldDot side');
                return;
            }

            const stashedData = hybridApp?.delegateAccessData?.isDelegateAccess
                ? {
                      [ONYXKEYS.STASHED_CREDENTIALS]: credentials,
                      [ONYXKEYS.STASHED_SESSION]: session,
                  }
                : {
                      [ONYXKEYS.STASHED_CREDENTIALS]: {},
                      [ONYXKEYS.STASHED_SESSION]: {},
                  };

            // Don't clear Onyx when using imported state to preserve imported data (reports, transactions, etc.)
            // Just update the session and credentials without clearing
            if (isUsingImportedState) {
                Log.info('[HybridApp] Skipping Onyx clear because using imported state. Updating session only.');
                return Onyx.multiSet({
                    ...stashedData,
                    [ONYXKEYS.SESSION]: {
                        email: hybridApp?.delegateAccessData?.oldDotCurrentUserEmail,
                        authToken: hybridApp?.delegateAccessData?.oldDotCurrentAuthToken,
                        encryptedAuthToken: decodeURIComponent(hybridApp?.delegateAccessData?.oldDotCurrentEncryptedAuthToken ?? ''),
                        accountID: hybridApp?.delegateAccessData?.oldDotCurrentAccountID,
                    },
                    [ONYXKEYS.CREDENTIALS]: {
                        autoGeneratedLogin: credentials?.autoGeneratedLogin ?? hybridApp.delegateAccessData?.oldDotAutoGeneratedLogin,
                        autoGeneratedPassword: credentials?.autoGeneratedPassword ?? hybridApp.delegateAccessData?.oldDotAutoGeneratedPassword,
                    },
                })
                    .then(() => Onyx.merge(ONYXKEYS.ACCOUNT, {primaryLogin: hybridApp?.delegateAccessData?.oldDotCurrentUserEmail}))
                    .then(() => {
                        confirmReadyToOpenApp();
                        return openApp();
                    });
            }

            Log.info('[HybridApp] User switched account on OldDot side. Clearing onyx and applying delegate data');
            return Onyx.clear(KEYS_TO_PRESERVE_DELEGATE_ACCESS).then(() =>
                Onyx.multiSet({
                    ...stashedData,
                    [ONYXKEYS.SESSION]: {
                        email: hybridApp?.delegateAccessData?.oldDotCurrentUserEmail,
                        authToken: hybridApp?.delegateAccessData?.oldDotCurrentAuthToken,
                        encryptedAuthToken: decodeURIComponent(hybridApp?.delegateAccessData?.oldDotCurrentEncryptedAuthToken ?? ''),
                        accountID: hybridApp?.delegateAccessData?.oldDotCurrentAccountID,
                    },
                    // When a logged-in user opens NewDot for the first time after migrating to the new SignInPage, there will be no credentials on the NewDot side.
                    // After migration, NewDot is responsible for creating credentials, but this only happens during sign-in.
                    // To avoid blocking the transition, we fall back to credentials from OldDot in this scenario.
                    // The `delegateAccessData` key is misleading in this context because, in the past, this code only handled Copilot. We are reusing the same logic here for this scenario.
                    [ONYXKEYS.CREDENTIALS]: {
                        autoGeneratedLogin: credentials?.autoGeneratedLogin ?? hybridApp.delegateAccessData?.oldDotAutoGeneratedLogin,
                        autoGeneratedPassword: credentials?.autoGeneratedPassword ?? hybridApp.delegateAccessData?.oldDotAutoGeneratedPassword,
                    },
                })
                    .then(() => Onyx.merge(ONYXKEYS.ACCOUNT, {primaryLogin: hybridApp?.delegateAccessData?.oldDotCurrentUserEmail}))
                    .then(() => {
                        Log.info('[HybridApp] Calling openApp to get delegate account details');
                        confirmReadyToOpenApp();
                        return openApp();
                    }),
            );
        })
        .then(resetDidUserLoginDuringSessionIfNeeded)
        .then(() =>
            Promise.all([
                HybridAppActions.prepareHybridAppAfterTransitionToNewDot({
                    ...hybridApp,
                    closingReactNativeApp: false,
                }),
                ...Object.entries(newDotOnyxValues).map(([key, value]) => Onyx.merge(key as OnyxKey, value ?? {})),
            ]),
        )
        .then(() => {
            Log.info('[HybridApp] Setup after transition from OldDot finished');
            isHybridAppSetupFinished = true;
            return Promise.resolve();
        })
        .catch((error) => {
            Log.hmmm('[HybridApp] Initialization of HybridApp has failed. Forcing transition', {error});
        });
}

/**
 * Given an idToken from Sign in with Apple, checks the API to see if an account
 * exists for that email address and signs the user in if so.
 */
function beginAppleSignIn(idToken: string | undefined | null, preferredLocale: Locale | undefined) {
    const {optimisticData, successData, failureData} = signInAttemptState();

    const params: BeginAppleSignInParams = {idToken, preferredLocale: preferredLocale ?? null};

    API.write(WRITE_COMMANDS.SIGN_IN_WITH_APPLE, params, {optimisticData, successData, failureData});
}

/**
 * Shows Google sign-in process, and if an auth token is successfully obtained,
 * passes the token on to the Expensify API to sign in with
 */
function beginGoogleSignIn(token: string | null, preferredLocale: Locale | undefined) {
    const {optimisticData, successData, failureData} = signInAttemptState();

    const params: BeginGoogleSignInParams = {token, preferredLocale: preferredLocale ?? null};

    API.write(WRITE_COMMANDS.SIGN_IN_WITH_GOOGLE, params, {optimisticData, successData, failureData});
}

/**
 * Will create a temporary login for the user in the passed authenticate response which is used when
 * re-authenticating after an authToken expires.
 */
function signInWithShortLivedAuthToken(authToken: string, isSAML = false) {
    const {optimisticData, failureData, finallyData} = getShortLivedLoginParams(false, isSAML);
    API.read(READ_COMMANDS.SIGN_IN_WITH_SHORT_LIVED_AUTH_TOKEN, {authToken, skipReauthentication: true}, {optimisticData, failureData, finallyData});
    NetworkStore.setLastShortAuthToken(authToken);
}

/**
 * Sign the user into the application. This will first authenticate their account
 * then it will create a temporary login for them which is used when re-authenticating
 * after an authToken expires.
 *
 * @param validateCode - 6 digit code required for login
 */
function signIn(validateCode: string, preferredLocale: Locale | undefined, twoFactorAuthCode?: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                ...CONST.DEFAULT_ACCOUNT_DATA,
                isLoading: true,
                loadingForm: twoFactorAuthCode ? CONST.FORMS.VALIDATE_TFA_CODE_FORM : CONST.FORMS.VALIDATE_CODE_FORM,
            },
        },
    ];

    const onyxOperationToCleanUpAnonymousUser = buildOnyxDataToCleanUpAnonymousUser();

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.PERSONAL_DETAILS_LIST | typeof ONYXKEYS.ACCOUNT | typeof ONYXKEYS.CREDENTIALS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
                loadingForm: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CREDENTIALS,
            value: {
                validateCode,
            },
        },
        onyxOperationToCleanUpAnonymousUser,
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
                loadingForm: null,
            },
        },
    ];

    Device.getDeviceInfoWithID().then((deviceInfo) => {
        const params: SignInUserParams = {
            twoFactorAuthCode,
            email: credentials.login,
            preferredLocale: preferredLocale ?? null,
            deviceInfo,
        };

        // Conditionally pass a password or validateCode to command since we temporarily allow both flows
        if (validateCode || twoFactorAuthCode) {
            params.validateCode = validateCode || credentials.validateCode;
        }

        API.write(WRITE_COMMANDS.SIGN_IN_USER, params, {optimisticData, successData, failureData});
    });
}

function signInWithValidateCode(accountID: number, code: string, preferredLocale: Locale | undefined, twoFactorAuthCode = '') {
    // If this is called from the 2fa step, get the validateCode directly from onyx
    // instead of the one passed from the component state because the state is changing when this method is called.
    const validateCode = twoFactorAuthCode ? credentials.validateCode : code;
    const onyxOperationToCleanUpAnonymousUser = buildOnyxDataToCleanUpAnonymousUser();

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT | typeof ONYXKEYS.SESSION>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                ...CONST.DEFAULT_ACCOUNT_DATA,
                isLoading: true,
                loadingForm: twoFactorAuthCode ? CONST.FORMS.VALIDATE_TFA_CODE_FORM : CONST.FORMS.VALIDATE_CODE_FORM,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.SESSION,
            value: {autoAuthState: CONST.AUTO_AUTH_STATE.SIGNING_IN},
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.PERSONAL_DETAILS_LIST | typeof ONYXKEYS.ACCOUNT | typeof ONYXKEYS.CREDENTIALS | typeof ONYXKEYS.SESSION>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
                loadingForm: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CREDENTIALS,
            value: {
                accountID,
                validateCode,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.SESSION,
            value: {autoAuthState: CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN},
        },
        onyxOperationToCleanUpAnonymousUser,
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT | typeof ONYXKEYS.SESSION>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
                loadingForm: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.SESSION,
            value: {autoAuthState: CONST.AUTO_AUTH_STATE.FAILED},
        },
    ];
    Device.getDeviceInfoWithID().then((deviceInfo) => {
        const params: SignInUserWithLinkParams = {
            accountID,
            validateCode,
            twoFactorAuthCode,
            preferredLocale: preferredLocale ?? null,
            deviceInfo,
        };

        API.write(WRITE_COMMANDS.SIGN_IN_USER_WITH_LINK, params, {optimisticData, successData, failureData});
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
function initAutoAuthState(cachedAutoAuthState: AutoAuthState) {
    const signedInStates: AutoAuthState[] = [CONST.AUTO_AUTH_STATE.SIGNING_IN, CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN];

    Onyx.merge(ONYXKEYS.SESSION, {
        autoAuthState: signedInStates.includes(cachedAutoAuthState) ? CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN : CONST.AUTO_AUTH_STATE.NOT_STARTED,
    });
}

function invalidateCredentials() {
    Onyx.merge(ONYXKEYS.CREDENTIALS, {autoGeneratedLogin: '', autoGeneratedPassword: ''});
}

function invalidateAuthToken() {
    NetworkStore.setAuthToken(INVALID_TOKEN);
    Onyx.merge(ONYXKEYS.SESSION, {authToken: INVALID_TOKEN, encryptedAuthToken: INVALID_TOKEN});
}

/**
 * Send an expired session to FE and invalidate the session in the BE perspective. Action is delayed for 15s
 */
function expireSessionWithDelay() {
    // expires the session after 15s
    setTimeout(() => {
        NetworkStore.setAuthToken(INVALID_TOKEN);
        Onyx.merge(ONYXKEYS.SESSION, {authToken: INVALID_TOKEN, encryptedAuthToken: INVALID_TOKEN, creationDate: new Date().getTime() - CONST.SESSION_EXPIRATION_TIME_MS});
    }, 15000);
}

/**
 * Clear the credentials and partial sign in session so the user can taken back to first Login step
 */
function clearSignInData() {
    Onyx.multiSet({
        [ONYXKEYS.ACCOUNT]: null,
        [ONYXKEYS.CREDENTIALS]: null,
    });
    Onyx.merge(ONYXKEYS.HYBRID_APP, {signingInWithSAML: null});
}

/**
 * Reset navigation to a brand new state with Home as the initial screen.
 */
function resetNavigationState() {
    Navigation.isNavigationReady().then(() => {
        // Safe handling when navigation is not yet initialized
        if (!navigationRef.isReady()) {
            Log.warn('[src/libs/actions/Session/index.ts] NavigationRef is not ready. Returning undefined.');
            return undefined;
        }
        navigationRef.resetRoot({index: 0, routes: [{name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}]});
    });
}

/**
 * Put any logic that needs to run when we are signed out here. This can be triggered when the current tab or another tab signs out.
 * - Cancels pending network calls - any lingering requests are discarded to prevent unwanted storage writes
 * - Clears all current params of the Home route - the login page URL should not contain any parameter
 */
function cleanupSession() {
    Pusher.disconnect();
    Timers.clearAll();
    Welcome.resetAllChecks();
    MainQueue.clear();
    HttpUtils.cancelPendingRequests();
    PersistedRequests.clear();
    NetworkConnection.clearReconnectionCallbacks();
    SessionUtils.resetDidUserLogInDuringSession();
    resetNavigationState();
    clearCache().then(() => {
        Log.info('Cleared all cache data', true, {}, true);
    });
    clearSoundAssetsCache();
    Timing.clearData();
}

function clearAccountMessages() {
    Onyx.merge(ONYXKEYS.ACCOUNT, {
        success: '',
        errors: null,
        message: null,
        isLoading: false,
    });
}

function setAccountError(error: string) {
    Onyx.merge(ONYXKEYS.ACCOUNT, {errors: ErrorUtils.getMicroSecondOnyxErrorWithMessage(error)});
}

// It's necessary to throttle requests to reauthenticate since calling this multiple times will cause Pusher to
// reconnect each time when we only need to reconnect once. This way, if an authToken is expired and we try to
// subscribe to a bunch of channels at once we will only reauthenticate and force reconnect Pusher once.
const reauthenticatePusher = throttle(
    () => {
        Log.info('[Pusher] Re-authenticating and then reconnecting');
        Authentication.reauthenticate(SIDE_EFFECT_REQUEST_COMMANDS.AUTHENTICATE_PUSHER)
            .then((wasSuccessful) => {
                if (!wasSuccessful) {
                    return;
                }
                Pusher.reconnect();
            })
            .catch(() => {
                console.debug('[PusherConnectionManager]', 'Unable to re-authenticate Pusher because we are offline.');
            });
    },
    5000,
    {trailing: false},
);

function authenticatePusher(socketID: string, channelName: string, callback?: ChannelAuthorizationCallback) {
    Log.info('[PusherAuthorizer] Attempting to authorize Pusher', false, {channelName});

    const params: AuthenticatePusherParams = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        socket_id: socketID,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        channel_name: channelName,
        shouldRetry: false,
        forceNetworkRequest: true,
    };

    // We use makeRequestWithSideEffects here because we need to authorize to Pusher (an external service) each time a user connects to any channel.
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.AUTHENTICATE_PUSHER, params)
        .then((response) => {
            if (response?.jsonCode === CONST.JSON_CODE.NOT_AUTHENTICATED) {
                Log.hmmm('[PusherAuthorizer] Unable to authenticate Pusher because authToken is expired');
                callback?.(new Error('Pusher failed to authenticate because authToken is expired'), {auth: ''});

                // Attempt to refresh the authToken then reconnect to Pusher
                reauthenticatePusher();
                return;
            }

            if (response?.jsonCode !== CONST.JSON_CODE.SUCCESS) {
                Log.hmmm('[PusherAuthorizer] Unable to authenticate Pusher for reason other than expired session');
                callback?.(new Error(`Pusher failed to authenticate because code: ${response?.jsonCode} message: ${response?.message}`), {auth: ''});
                return;
            }

            Log.info('[PusherAuthorizer] Pusher authenticated successfully', false, {channelName});
            if (callback) {
                callback(null, response as ChannelAuthorizationData);
            } else {
                return {
                    auth: response.auth,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    shared_secret: response.shared_secret,
                };
            }
        })
        .catch((error: unknown) => {
            Log.hmmm('[PusherAuthorizer] Unhandled error: ', {channelName, error});
            callback?.(new Error('AuthenticatePusher request failed'), {auth: ''});
        });
}

/**
 * Request a new validation link / magic code to unlink an unvalidated secondary login from a primary login
 */
function requestUnlinkValidationLink() {
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: true,
                errors: null,
                message: null,
                loadingForm: CONST.FORMS.UNLINK_LOGIN_FORM,
            },
        },
    ];
    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
                message: 'unlinkLoginForm.linkSent',
                loadingForm: null,
            },
        },
    ];
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
                loadingForm: null,
            },
        },
    ];

    const params: RequestUnlinkValidationLinkParams = {email: credentials.login};

    API.write(WRITE_COMMANDS.REQUEST_UNLINK_VALIDATION_LINK, params, {optimisticData, successData, failureData});
}

function unlinkLogin(accountID: number, validateCode: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                ...CONST.DEFAULT_ACCOUNT_DATA,
                isLoading: true,
            },
        },
    ];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT | typeof ONYXKEYS.CREDENTIALS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
                message: 'unlinkLoginForm.successfullyUnlinkedLogin',
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CREDENTIALS,
            value: {
                login: '',
            },
        },
    ];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
            },
        },
    ];

    const params: UnlinkLoginParams = {
        accountID,
        validateCode,
    };

    API.write(WRITE_COMMANDS.UNLINK_LOGIN, params, {
        optimisticData,
        successData,
        failureData,
    });
}

/**
 * Toggles two-factor authentication based on the `enable` parameter
 */
function toggleTwoFactorAuth(enable: boolean, twoFactorAuthCode = '') {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: true,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
            },
        },
    ];

    if (enable) {
        API.write(WRITE_COMMANDS.ENABLE_TWO_FACTOR_AUTH, null, {optimisticData, successData, failureData});
        return;
    }

    // A 2FA code is required to disable 2FA
    const params: DisableTwoFactorAuthParams = {twoFactorAuthCode};

    // eslint-disable-next-line rulesdir/no-multiple-api-calls
    API.write(WRITE_COMMANDS.DISABLE_TWO_FACTOR_AUTH, params, {optimisticData, successData, failureData});
}

function clearDisableTwoFactorAuthErrors() {
    Onyx.merge(ONYXKEYS.ACCOUNT, {errorFields: {requiresTwoFactorAuth: null}});
}

function updateAuthTokenAndOpenApp(authToken?: string, encryptedAuthToken?: string) {
    // Update authToken in Onyx and in our local variables so that API requests will use the new authToken
    updateSessionAuthTokens(authToken, encryptedAuthToken);

    // Note: It is important to manually set the authToken that is in the store here since
    // reconnectApp will immediate post and use the local authToken. Onyx updates subscribers lately so it is not
    // enough to do the updateSessionAuthTokens() call above.
    NetworkStore.setAuthToken(authToken ?? null);

    openApp();
}

function validateTwoFactorAuth(twoFactorAuthCode: string, shouldClearData: boolean) {
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: true,
            },
        },
    ];

    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
            },
        },
    ];

    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
            },
        },
    ];

    const params: ValidateTwoFactorAuthParams = {twoFactorAuthCode};

    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.TWO_FACTOR_AUTH_VALIDATE, params, {optimisticData, successData, failureData}).then((response) => {
        if (!response?.authToken) {
            return;
        }

        // Clear onyx data if the user has just signed in and is forced to add 2FA
        if (shouldClearData) {
            const keysToPreserveWithPrivatePersonalDetails = [...KEYS_TO_PRESERVE, ONYXKEYS.PRIVATE_PERSONAL_DETAILS];
            Onyx.clear(keysToPreserveWithPrivatePersonalDetails).then(() => updateAuthTokenAndOpenApp(response.authToken, response.encryptedAuthToken));
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
function waitForUserSignIn(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        if (session.authToken) {
            resolve(true);
        } else {
            authPromiseResolver = resolve;
        }
    });
}

function handleExitToNavigation(exitTo: Route) {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    InteractionManager.runAfterInteractions(() => {
        waitForUserSignIn().then(() => {
            Navigation.waitForProtectedRoutes().then(() => {
                Navigation.goBack();
                Navigation.navigate(exitTo);
            });
        });
    });
}

function signInWithValidateCodeAndNavigate(accountID: number, validateCode: string, preferredLocale: Locale | undefined, twoFactorAuthCode = '', exitTo?: Route) {
    signInWithValidateCode(accountID, validateCode, preferredLocale, twoFactorAuthCode);
    if (exitTo) {
        handleExitToNavigation(exitTo);
    } else {
        Navigation.goBack();
    }
}

/**
 * check if the route can be accessed by anonymous user
 *
 * @param {string} route
 */

const canAnonymousUserAccessRoute = (route: string) => {
    const reportID = getReportIDFromLink(route);
    if (reportID) {
        return true;
    }
    const parsedReportRouteParams = parseReportRouteParamsReportUtils(route);
    let routeRemovedReportId = route;
    if ((parsedReportRouteParams as {reportID: string})?.reportID) {
        routeRemovedReportId = route.replace((parsedReportRouteParams as {reportID: string})?.reportID, ':reportID');
    }
    if (route.startsWith('/')) {
        routeRemovedReportId = routeRemovedReportId.slice(1);
    }
    const routesAccessibleByAnonymousUser = [ROUTES.SIGN_IN_MODAL, ROUTES.REPORT_WITH_ID_DETAILS.route, ROUTES.REPORT_WITH_ID_DETAILS_SHARE_CODE.route, ROUTES.CONCIERGE];
    const isMagicLink = CONST.REGEX.ROUTES.VALIDATE_LOGIN.test(`/${route}`);

    if ((routesAccessibleByAnonymousUser as string[]).includes(routeRemovedReportId) || isMagicLink) {
        return true;
    }
    return false;
};

function AddWorkEmail(workEmail: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM,
            value: {
                onboardingWorkEmail: workEmail,
                isLoading: true,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM,
            value: {
                isLoading: false,
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM | typeof ONYXKEYS.NVP_ONBOARDING>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM,
            value: {
                isLoading: false,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_ONBOARDING,
            value: {
                isMergingAccountBlocked: true,
            },
        },
    ];

    API.write(
        WRITE_COMMANDS.ADD_WORK_EMAIL,
        {workEmail},
        {
            optimisticData,
            successData,
            failureData,
        },
    );
}

function MergeIntoAccountAndLogin(workEmail: string | undefined, validateCode: string, accountID: number | undefined) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY | typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: true,
                loadingForm: CONST.FORMS.VALIDATE_CODE_FORM,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY | typeof ONYXKEYS.NVP_ONBOARDING | typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_ONBOARDING,
            value: {
                isMergeAccountStepCompleted: true,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
                loadingForm: null,
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
                loadingForm: null,
            },
        },
    ];

    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.makeRequestWithSideEffects(
        SIDE_EFFECT_REQUEST_COMMANDS.MERGE_INTO_ACCOUNT_AND_LOGIN,
        {workEmail, validateCode, accountID},
        {
            optimisticData,
            successData,
            failureData,
        },
    ).then((response) => {
        if (response?.jsonCode === CONST.JSON_CODE.EXP_ERROR) {
            // If the error other than invalid code, we show a blocking screen
            if (response?.message === CONST.MERGE_ACCOUNT_INVALID_CODE_ERROR || response?.title === CONST.MERGE_ACCOUNT_INVALID_CODE_ERROR) {
                Onyx.merge(ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY, 'contacts.genericFailureMessages.validateSecondaryLogin');
            } else {
                Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {isMergingAccountBlocked: true});
            }
            return;
        }

        // When the action is successful, we need to update the new authToken and encryptedAuthToken
        // This action needs to be synchronous as the user will be logged out due to middleware if old authToken is used
        // For more information see the slack discussion: https://expensify.slack.com/archives/C08CZDJFJ77/p1742838796040369
        return SequentialQueue.waitForIdle().then(() => {
            if (!response?.authToken || !response?.encryptedAuthToken) {
                return;
            }

            updateAuthTokenAndOpenApp(response.authToken, response.encryptedAuthToken);
        });
    });
}

/**
 * To reset SMS delivery failure
 */
function resetSMSDeliveryFailureStatus(login: string) {
    const params: ResetSMSDeliveryFailureStatusParams = {login};

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                errors: null,
                smsDeliveryFailureStatus: {
                    isLoading: true,
                },
            },
        },
    ];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                smsDeliveryFailureStatus: {
                    isLoading: false,
                },
            },
        },
    ];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                smsDeliveryFailureStatus: {
                    isLoading: false,
                },
            },
        },
    ];

    API.write(WRITE_COMMANDS.RESET_SMS_DELIVERY_FAILURE_STATUS, params, {optimisticData, successData, failureData});
}

export {
    KEYS_TO_PRESERVE_SUPPORTAL,
    beginSignIn,
    beginAppleSignIn,
    beginGoogleSignIn,
    setSupportAuthToken,
    callFunctionIfActionIsAllowed,
    signIn,
    signInWithValidateCode,
    handleExitToNavigation,
    signInWithValidateCodeAndNavigate,
    initAutoAuthState,
    signInWithShortLivedAuthToken,
    cleanupSession,
    signOut,
    signOutAndRedirectToSignIn,
    resendValidateCode,
    requestUnlinkValidationLink,
    unlinkLogin,
    clearSignInData,
    clearAccountMessages,
    setAccountError,
    authenticatePusher,
    reauthenticatePusher,
    invalidateCredentials,
    invalidateAuthToken,
    expireSessionWithDelay,
    isAnonymousUser,
    toggleTwoFactorAuth,
    validateTwoFactorAuth,
    waitForUserSignIn,
    hasAuthToken,
    isExpiredSession,
    canAnonymousUserAccessRoute,
    signInWithSupportAuthToken,
    isSupportAuthToken,
    hasStashedSession,
    signUpUser,
    setupNewDotAfterTransitionFromOldDot,
    AddWorkEmail,
    MergeIntoAccountAndLogin,
    resetSMSDeliveryFailureStatus,
    clearDisableTwoFactorAuthErrors,
    getShortLivedLoginParams,
};
