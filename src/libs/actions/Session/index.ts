import throttle from 'lodash/throttle';
import type {ChannelAuthorizationData} from 'pusher-js/types/src/core/auth/options';
import type {ChannelAuthorizationCallback} from 'pusher-js/with-encryption';
import {InteractionManager, Linking, NativeModules} from 'react-native';
import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as PersistedRequests from '@libs/actions/PersistedRequests';
import * as API from '@libs/API';
import type {
    AuthenticatePusherParams,
    BeginAppleSignInParams,
    BeginGoogleSignInParams,
    BeginSignInParams,
    DisableTwoFactorAuthParams,
    RequestAccountValidationLinkParams,
    RequestNewValidateCodeParams,
    RequestUnlinkValidationLinkParams,
    SignInUserWithLinkParams,
    SignUpUserParams,
    UnlinkLoginParams,
    ValidateTwoFactorAuthParams,
} from '@libs/API/parameters';
import type SignInUserParams from '@libs/API/parameters/SignInUserParams';
import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as Authentication from '@libs/Authentication';
import * as ErrorUtils from '@libs/ErrorUtils';
import Fullstory from '@libs/Fullstory';
import HttpUtils from '@libs/HttpUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import * as MainQueue from '@libs/Network/MainQueue';
import * as NetworkStore from '@libs/Network/NetworkStore';
import NetworkConnection from '@libs/NetworkConnection';
import * as Pusher from '@libs/Pusher/pusher';
import * as ReportUtils from '@libs/ReportUtils';
import * as SessionUtils from '@libs/SessionUtils';
import Timers from '@libs/Timers';
import {hideContextMenu} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import {KEYS_TO_PRESERVE, openApp} from '@userActions/App';
import * as App from '@userActions/App';
import * as Device from '@userActions/Device';
import * as PriorityMode from '@userActions/PriorityMode';
import redirectToSignIn from '@userActions/SignInRedirect';
import Timing from '@userActions/Timing';
import * as Welcome from '@userActions/Welcome';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {HybridAppRoute, Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type Credentials from '@src/types/onyx/Credentials';
import type Session from '@src/types/onyx/Session';
import type {AutoAuthState} from '@src/types/onyx/Session';
import clearCache from './clearCache';
import updateSessionAuthTokens from './updateSessionAuthTokens';

let session: Session = {};
let authPromiseResolver: ((value: boolean) => void) | null = null;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        session = value ?? {};
        if (session.authToken && authPromiseResolver) {
            authPromiseResolver(true);
            authPromiseResolver = null;
        }
    },
});

Onyx.connect({
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

let preferredLocale: ValueOf<typeof CONST.LOCALES> | null = null;
Onyx.connect({
    key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    callback: (val) => (preferredLocale = val ?? null),
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
    }).then(() => {
        Log.info('[Supportal] Authtoken set');
    });
    Onyx.set(ONYXKEYS.LAST_VISITED_PATH, '');
}

function getShortLivedLoginParams() {
    const optimisticData: OnyxUpdate[] = [
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
            },
        },
    ];

    // Subsequently, we revert it back to the default value of 'signedInWithShortLivedAuthToken' in 'finallyData' to ensure the user is logged out on refresh
    const finallyData: OnyxUpdate[] = [
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
            },
        },
    ];

    return {optimisticData, finallyData};
}

/**
 * This method should be used when we are being redirected from oldDot to NewDot on a supportal request
 */
function signInWithSupportAuthToken(authToken: string) {
    const {optimisticData, finallyData} = getShortLivedLoginParams();
    API.read(READ_COMMANDS.SIGN_IN_WITH_SUPPORT_AUTH_TOKEN, {authToken}, {optimisticData, finallyData});
}

/**
 * Clears the Onyx store and redirects user to the sign in page
 */
function signOut() {
    Log.info('Flushing logs before signing out', true, {}, true);
    const params = {
        // Send current authToken because we will immediately clear it once triggering this command
        authToken: NetworkStore.getAuthToken() ?? null,
        partnerUserID: credentials?.autoGeneratedLogin ?? '',
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        shouldRetry: false,
    };

    API.write(WRITE_COMMANDS.LOG_OUT, params);
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

function signOutAndRedirectToSignIn(shouldResetToHome?: boolean, shouldStashSession?: boolean, killHybridApp = true) {
    Log.info('Redirecting to Sign In because signOut() was called');
    hideContextMenu(false);
    if (!isAnonymousUser()) {
        // In the HybridApp, we want the Old Dot to handle the sign out process
        if (NativeModules.HybridAppModule && killHybridApp) {
            NativeModules.HybridAppModule.signOutFromOldDot();
        }
        // We'll only call signOut if we're not stashing the session and this is not a supportal session,
        // otherwise we'll call the API to invalidate the autogenerated credentials used for infinite
        // session.
        const isSupportal = isSupportAuthToken();
        if (!isSupportal && !shouldStashSession) {
            signOut();
        }

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
        // we already have a stashedSession, that means we are supportaled, currently supportaling
        // into another account and we want to keep the stashed data from the original account.
        if (isSupportal && shouldStashSession && hasStashedSession()) {
            onyxSetParams = {
                [ONYXKEYS.STASHED_CREDENTIALS]: stashedCredentials,
                [ONYXKEYS.STASHED_SESSION]: stashedSession,
            };
        }
        // Now if this is a supportal access, we do not want to stash the current session and we have a
        // stashed session, then we need to restore the stashed session instead of completely logging out
        if (isSupportal && !shouldStashSession && hasStashedSession()) {
            onyxSetParams = {
                [ONYXKEYS.CREDENTIALS]: stashedCredentials,
                [ONYXKEYS.SESSION]: stashedSession,
            };
        }
        redirectToSignIn().then(() => {
            Onyx.multiSet(onyxSetParams);
        });
    } else {
        if (Navigation.isActiveRoute(ROUTES.SIGN_IN_MODAL)) {
            return;
        }
        if (shouldResetToHome) {
            Navigation.resetToHome();
        }
        Navigation.navigate(ROUTES.SIGN_IN_MODAL);
        Linking.getInitialURL().then((url) => {
            const reportID = ReportUtils.getReportIDFromLink(url);
            if (reportID) {
                Onyx.merge(ONYXKEYS.LAST_OPENED_PUBLIC_ROOM_ID, reportID);
            }
        });
    }
}

/**
 * @param callback The callback to execute if the action is allowed
 * @param isAnonymousAction The action is allowed for anonymous or not
 * @returns same callback if the action is allowed, otherwise a function that signs out and redirects to sign in
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function checkIfActionIsAllowed<TCallback extends ((...args: any[]) => any) | void>(callback: TCallback, isAnonymousAction = false): TCallback | (() => void) {
    if (isAnonymousUser() && !isAnonymousAction) {
        return () => signOutAndRedirectToSignIn();
    }
    return callback;
}

/**
 * Resend the validation link to the user that is validating their account
 */
function resendValidationLink(login = credentials.login) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: true,
                errors: null,
                message: null,
                loadingForm: CONST.FORMS.RESEND_VALIDATION_FORM,
            },
        },
    ];
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
                message: 'resendValidationForm.linkHasBeenResent',
                loadingForm: null,
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
                message: null,
                loadingForm: null,
            },
        },
    ];

    const params: RequestAccountValidationLinkParams = {email: login};

    API.write(WRITE_COMMANDS.REQUEST_ACCOUNT_VALIDATION_LINK, params, {optimisticData, successData, failureData});
}

/**
 * Request a new validate / magic code for user to sign in via passwordless flow
 */
function resendValidateCode(login = credentials.login) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                errors: null,
                loadingForm: CONST.FORMS.RESEND_VALIDATE_CODE_FORM,
            },
        },
    ];
    const finallyData: OnyxUpdate[] = [
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

type OnyxData = {
    optimisticData: OnyxUpdate[];
    successData: OnyxUpdate[];
    failureData: OnyxUpdate[];
};

/**
 * Constructs the state object for the BeginSignIn && BeginAppleSignIn API calls.
 */
function signInAttemptState(): OnyxData {
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
function buildOnyxDataToCleanUpAnonymousUser() {
    const data: Record<string, null> = {};
    if (session.authTokenType === CONST.AUTH_TOKEN_TYPES.ANONYMOUS && session.accountID) {
        data[session.accountID] = null;
    }
    return {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        value: data,
        onyxMethod: Onyx.METHOD.MERGE,
    };
}

/**
 * Creates an account for the new user and signs them into the application with the newly created account.
 *
 */
function signUpUser() {
    const optimisticData: OnyxUpdate[] = [
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

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
            },
        },
        onyxOperationToCleanUpAnonymousUser,
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
            },
        },
    ];

    const params: SignUpUserParams = {email: credentials.login, preferredLocale};

    API.write(WRITE_COMMANDS.SIGN_UP_USER, params, {optimisticData, successData, failureData});
}

function signInAfterTransitionFromOldDot(transitionURL: string) {
    const [route, queryParams] = transitionURL.split('?');
    const queryParamsObject = queryParams
        ? Object.fromEntries(
              queryParams.split('&').map((param) => {
                  const [key, value] = param.split('=');
                  return [key, value];
              }),
          )
        : {};

    const {useNewDotSignInPage} = queryParamsObject;

    const setSessionDataAndOpenApp = () => {
        Onyx.multiSet({
            [ONYXKEYS.USE_NEWDOT_SIGN_IN_PAGE]: useNewDotSignInPage === 'true',
            [ONYXKEYS.NVP_TRYNEWDOT]: {classicRedirect: {dismissed: true}},
        }).then(App.openApp);
    };

    if (useNewDotSignInPage === 'true') {
        Onyx.clear().then(setSessionDataAndOpenApp);
    } else {
        setSessionDataAndOpenApp();
    }

    return route as Route;
}

/**
 * Given an idToken from Sign in with Apple, checks the API to see if an account
 * exists for that email address and signs the user in if so.
 */
function beginAppleSignIn(idToken: string | undefined | null) {
    const {optimisticData, successData, failureData} = signInAttemptState();

    const params: BeginAppleSignInParams = {idToken, preferredLocale};

    API.write(WRITE_COMMANDS.SIGN_IN_WITH_APPLE, params, {optimisticData, successData, failureData});
}

/**
 * Shows Google sign-in process, and if an auth token is successfully obtained,
 * passes the token on to the Expensify API to sign in with
 */
function beginGoogleSignIn(token: string | null) {
    const {optimisticData, successData, failureData} = signInAttemptState();

    const params: BeginGoogleSignInParams = {token, preferredLocale};

    API.write(WRITE_COMMANDS.SIGN_IN_WITH_GOOGLE, params, {optimisticData, successData, failureData});
}

/**
 * Will create a temporary login for the user in the passed authenticate response which is used when
 * re-authenticating after an authToken expires.
 */
function signInWithShortLivedAuthToken(email: string, authToken: string) {
    const {optimisticData, finallyData} = getShortLivedLoginParams();

    // If the user is signing in with a different account from the current app, should not pass the auto-generated login as it may be tied to the old account.
    // scene 1: the user is transitioning to newDot from a different account on oldDot.
    // scene 2: the user is transitioning to desktop app from a different account on web app.
    const oldPartnerUserID = credentials.login === email && credentials.autoGeneratedLogin ? credentials.autoGeneratedLogin : '';
    API.read(READ_COMMANDS.SIGN_IN_WITH_SHORT_LIVED_AUTH_TOKEN, {authToken, oldPartnerUserID, skipReauthentication: true}, {optimisticData, finallyData});
}

/**
 * Sign the user into the application. This will first authenticate their account
 * then it will create a temporary login for them which is used when re-authenticating
 * after an authToken expires.
 *
 * @param validateCode - 6 digit code required for login
 */
function signIn(validateCode: string, twoFactorAuthCode?: string) {
    const optimisticData: OnyxUpdate[] = [
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

    const successData: OnyxUpdate[] = [
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

    const failureData: OnyxUpdate[] = [
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
            preferredLocale,
            deviceInfo,
        };

        // Conditionally pass a password or validateCode to command since we temporarily allow both flows
        if (validateCode || twoFactorAuthCode) {
            params.validateCode = validateCode || credentials.validateCode;
        }

        API.write(WRITE_COMMANDS.SIGN_IN_USER, params, {optimisticData, successData, failureData});
    });
}

function signInWithValidateCode(accountID: number, code: string, twoFactorAuthCode = '') {
    // If this is called from the 2fa step, get the validateCode directly from onyx
    // instead of the one passed from the component state because the state is changing when this method is called.
    const validateCode = twoFactorAuthCode ? credentials.validateCode : code;
    const onyxOperationToCleanUpAnonymousUser = buildOnyxDataToCleanUpAnonymousUser();

    const optimisticData: OnyxUpdate[] = [
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

    const successData: OnyxUpdate[] = [
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

    const failureData: OnyxUpdate[] = [
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
            preferredLocale,
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
    NetworkStore.setAuthToken('pizza');
    Onyx.merge(ONYXKEYS.SESSION, {authToken: 'pizza'});
}

/**
 * Clear the credentials and partial sign in session so the user can taken back to first Login step
 */
function clearSignInData() {
    Onyx.multiSet({
        [ONYXKEYS.ACCOUNT]: null,
        [ONYXKEYS.CREDENTIALS]: null,
    });
}

/**
 * Reset all current params of the Home route
 */
function resetHomeRouteParams() {
    Navigation.isNavigationReady().then(() => {
        const routes = navigationRef.current?.getState()?.routes;
        const homeRoute = routes?.find((route) => route.name === SCREENS.HOME);

        const emptyParams: Record<string, undefined> = {};
        Object.keys(homeRoute?.params ?? {}).forEach((paramKey) => {
            emptyParams[paramKey] = undefined;
        });

        Navigation.setParams(emptyParams, homeRoute?.key ?? '');
        Onyx.set(ONYXKEYS.IS_CHECKING_PUBLIC_ROOM, false);
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
    PriorityMode.resetHasReadRequiredDataFromStorage();
    MainQueue.clear();
    HttpUtils.cancelPendingRequests();
    PersistedRequests.clear();
    NetworkConnection.clearReconnectionCallbacks();
    SessionUtils.resetDidUserLogInDuringSession();
    resetHomeRouteParams();
    clearCache().then(() => {
        Log.info('Cleared all cache data', true, {}, true);
    });
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
            .then(Pusher.reconnect)
            .catch(() => {
                console.debug('[PusherConnectionManager]', 'Unable to re-authenticate Pusher because we are offline.');
            });
    },
    5000,
    {trailing: false},
);

function authenticatePusher(socketID: string, channelName: string, callback: ChannelAuthorizationCallback) {
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
    API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.AUTHENTICATE_PUSHER, params)
        .then((response) => {
            if (response?.jsonCode === CONST.JSON_CODE.NOT_AUTHENTICATED) {
                Log.hmmm('[PusherAuthorizer] Unable to authenticate Pusher because authToken is expired');
                callback(new Error('Pusher failed to authenticate because authToken is expired'), {auth: ''});

                // Attempt to refresh the authToken then reconnect to Pusher
                reauthenticatePusher();
                return;
            }

            if (response?.jsonCode !== CONST.JSON_CODE.SUCCESS) {
                Log.hmmm('[PusherAuthorizer] Unable to authenticate Pusher for reason other than expired session');
                callback(new Error(`Pusher failed to authenticate because code: ${response?.jsonCode} message: ${response?.message}`), {auth: ''});
                return;
            }

            Log.info('[PusherAuthorizer] Pusher authenticated successfully', false, {channelName});
            callback(null, response as ChannelAuthorizationData);
        })
        .catch((error: unknown) => {
            Log.hmmm('[PusherAuthorizer] Unhandled error: ', {channelName, error});
            callback(new Error('AuthenticatePusher request failed'), {auth: ''});
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
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                ...CONST.DEFAULT_ACCOUNT_DATA,
                isLoading: true,
            },
        },
    ];
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
                message: 'unlinkLoginForm.succesfullyUnlinkedLogin',
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
    const failureData: OnyxUpdate[] = [
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
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: true,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,

                // When disabling 2FA, the user needs to end up on the step that confirms the setting was disabled
                twoFactorAuthStep: enable ? undefined : CONST.TWO_FACTOR_AUTH_STEPS.DISABLED,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
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

function handleExitToNavigation(exitTo: Route | HybridAppRoute) {
    InteractionManager.runAfterInteractions(() => {
        waitForUserSignIn().then(() => {
            Navigation.waitForProtectedRoutes().then(() => {
                const url = NativeModules.HybridAppModule ? Navigation.parseHybridAppUrl(exitTo) : (exitTo as Route);
                Navigation.goBack();
                Navigation.navigate(url);
            });
        });
    });
}

function signInWithValidateCodeAndNavigate(accountID: number, validateCode: string, twoFactorAuthCode = '', exitTo?: Route | HybridAppRoute) {
    signInWithValidateCode(accountID, validateCode, twoFactorAuthCode);
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
    const reportID = ReportUtils.getReportIDFromLink(route);
    if (reportID) {
        return true;
    }
    const parsedReportRouteParams = ReportUtils.parseReportRouteParams(route);
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

export {
    beginSignIn,
    beginAppleSignIn,
    beginGoogleSignIn,
    setSupportAuthToken,
    checkIfActionIsAllowed,
    signIn,
    signInWithValidateCode,
    handleExitToNavigation,
    signInWithValidateCodeAndNavigate,
    initAutoAuthState,
    signInWithShortLivedAuthToken,
    cleanupSession,
    signOut,
    signOutAndRedirectToSignIn,
    resendValidationLink,
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
    isAnonymousUser,
    toggleTwoFactorAuth,
    validateTwoFactorAuth,
    waitForUserSignIn,
    hasAuthToken,
    canAnonymousUserAccessRoute,
    signInWithSupportAuthToken,
    isSupportAuthToken,
    hasStashedSession,
    signUpUser,
    signInAfterTransitionFromOldDot,
};
