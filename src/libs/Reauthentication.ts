import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Account} from '@src/types/onyx';
import type Credentials from '@src/types/onyx/Credentials';
import type Response from '@src/types/onyx/Response';
import type Session from '@src/types/onyx/Session';

import type {OnyxEntry, OnyxKey} from 'react-native-onyx';

import * as Sentry from '@sentry/react-native';
import Onyx from 'react-native-onyx';

import {isConnectedAsDelegate, restoreDelegateSession} from './actions/Delegate';
import clearShortLivedAuthState from './actions/Session/clearShortLivedAuthState';
import updateSessionAuthTokens from './actions/Session/updateSessionAuthTokens';
import redirectToSignIn from './actions/SignInRedirect';
import {AUTHENTICATION_COMMAND} from './API/types';
import HttpsError from './Errors/HttpsError';
import {getAuthenticateErrorMessage, getErrorMessage} from './ErrorUtils';
import Log from './Log';
import {post} from './Network';
import {getCredentials, hasReadRequiredDataFromStorage, setAuthToken, setIsAuthenticating} from './Network/NetworkStore';
import requireParameters from './requireParameters';
import {checkIfShouldUseNewPartnerName, getPartnerCredentials} from './SessionUtils';
import trackAuthenticationError from './telemetry/trackAuthenticationError';

type Parameters = {
    useExpensifyLogin?: boolean;
    partnerName: string;
    partnerPassword: string;
    partnerUserID?: string;
    partnerUserSecret?: string;
    twoFactorAuthCode?: string;
    email?: string;
    authToken?: string;
};

let isAuthenticatingWithShortLivedToken = false;
let isSupportAuthTokenUsed = false;
let isSupportSession = false;

// A SAML-required account cannot silently reauthenticate (there is no stored password), so an expired
// session sends the user back through their IdP. When the token expires, the app fires several requests
// at once (ReconnectApp, OpenApp, AuthenticatePusher, ...) and they all get a 407 in the same tick, so
// each one would call redirectToSignIn on its own and the sign-in page would flash and re-initiate SAML
// several times. This lets the first expired request trigger the redirect and skips the rest until the
// next SAML sign-in begins.
let hasQueuedSAMLReauthRedirect = false;

// These session values are only used to help the user authentication with the API.
// Since they aren't connected to a UI anywhere, it's OK to use connectWithoutView()
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        isSupportAuthTokenUsed = !!value?.isSupportAuthTokenUsed;
        isSupportSession = value?.authTokenType === CONST.AUTH_TOKEN_TYPES.SUPPORT;

        Sentry.setUser({
            id: value?.accountID,
            email: value?.email,
        });
    },
});

// Kept on a RAM-only key so an interrupted SignIn cannot persist a stuck `true` to IndexedDB and block all future reauth attempts.
Onyx.connectWithoutView({
    key: ONYXKEYS.RAM_ONLY_IS_AUTHENTICATING_WITH_SHORT_LIVED_TOKEN,
    callback: (value) => {
        isAuthenticatingWithShortLivedToken = !!value;

        // A new short-lived-token SAML sign-in has begun, so allow the redirect again the next time
        // this session's token expires.
        if (value) {
            hasQueuedSAMLReauthRedirect = false;
        }
    },
});

let account: OnyxEntry<Account>;
// Authentication lib is not connected to any changes on the UI
// So it is okay to use connectWithoutView here.
Onyx.connectWithoutView({
    key: ONYXKEYS.ACCOUNT,
    callback: (value) => {
        account = value;
    },
});

// While connected as a delegate, the original user's credentials and session are stashed under these keys.
// The reauth path reads them synchronously when a delegate token expires, and they aren't connected to any
// UI, so it's okay to use connectWithoutView here.
let stashedCredentials: Credentials | undefined;
Onyx.connectWithoutView({
    key: ONYXKEYS.STASHED_CREDENTIALS,
    callback: (value) => {
        stashedCredentials = value;
    },
});

let stashedSession: Session | undefined;
Onyx.connectWithoutView({
    key: ONYXKEYS.STASHED_SESSION,
    callback: (value) => {
        stashedSession = value;
    },
});

function Authenticate<TKey extends OnyxKey>(parameters: Parameters): Promise<Response<TKey> | void> {
    const commandName = AUTHENTICATION_COMMAND;

    try {
        requireParameters(['partnerName', 'partnerPassword', 'partnerUserID', 'partnerUserSecret'], parameters, commandName);
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        // Caught values can be non-Error objects, but telemetry expects an Error instance.
        trackAuthenticationError(error instanceof Error ? error : new Error(errorMessage), {
            errorType: 'missing_params',
            functionName: AUTHENTICATION_COMMAND,
            commandName,
            providedParameters: Object.keys(parameters),
        });
        Log.hmmm('[Reauthenticate] Redirecting to Sign In because we failed to reauthenticate', {
            error: errorMessage,
        });
        redirectToSignIn(errorMessage);
        return Promise.resolve();
    }

    return post(commandName, {
        // When authenticating for the first time, we pass useExpensifyLogin as true so we check
        // for credentials for the expensify partnerID to let users Authenticate with their expensify user
        // and password.
        useExpensifyLogin: parameters.useExpensifyLogin,
        partnerName: parameters.partnerName,
        partnerPassword: parameters.partnerPassword,
        partnerUserID: parameters.partnerUserID,
        partnerUserSecret: parameters.partnerUserSecret,
        twoFactorAuthCode: parameters.twoFactorAuthCode,
        authToken: parameters.authToken,
        shouldRetry: false,

        // Force this request to be made because the network queue is paused when re-authentication is happening
        forceNetworkRequest: true,

        // Add email param so the first Authenticate request is logged on the server w/ this email
        email: parameters.email,
    });
}

function shouldRetryAuthenticateError(error: unknown): boolean {
    if (!(error instanceof HttpsError)) {
        return true;
    }

    // Only retry transient connectivity/service issues. Real HTTP auth failures,
    // and auth throttling, should fall through to the normal sign-out path so we
    // do not spin on Authenticate before redirecting to sign in.
    return error.message === CONST.ERROR.FAILED_TO_FETCH || error.message === CONST.ERROR.EXPENSIFY_SERVICE_INTERRUPTED;
}

function getAuthenticationErrorResponse(error: HttpsError): Response<OnyxKey> {
    return {
        jsonCode: Number(error.status),
        message: error.message,
    };
}

/**
 * Reauthenticate using the stored credentials and redirect to the sign in page if unable to do so.
 * @param [command] command name for logging purposes
 * @return returns true if reauthentication was successful, false otherwise.
 */
function reauthenticate(command = ''): Promise<boolean> {
    Log.hmmm('[Reauthenticate] Attempting re-authentication', {
        command,
    });

    // Prevent re-authentication if authentication with shortLiveToken is in progress
    if (isAuthenticatingWithShortLivedToken) {
        // Only treat the short-lived auth state as stale once account loading has
        // explicitly finished. Until then, keep aborting reauth to avoid interrupting
        // a valid short-lived-token login during startup hydration races.
        if (account?.isLoading !== false) {
            Log.hmmm('[Reauthenticate] Authentication with shortLivedToken is in progress. Re-authentication aborted.', {
                command,
                isSupportAuthTokenUsed,
                accountIsLoading: account?.isLoading,
            });
            return Promise.resolve(false);
        }

        Log.alert('[Reauthenticate] Found stale shortLivedToken authentication state. Clearing it before re-authenticating.', {
            command,
            isSupportAuthTokenUsed,
        });
        isAuthenticatingWithShortLivedToken = false;
        isSupportAuthTokenUsed = false;
        clearShortLivedAuthState();
    }

    // Prevent any more requests from being processed while authentication happens
    setIsAuthenticating(true);

    Log.hmmm('[Reauthenticate] Waiting for credentials', {
        command,
    });

    return hasReadRequiredDataFromStorage().then(() => {
        // While connected as a delegate, ONYXKEYS.CREDENTIALS is wiped by clearOnyxForDelegateTransition; the original user's creds live in stashedCredentials.
        const isDelegate = isConnectedAsDelegate({
            delegatedAccess: account?.delegatedAccess,
        });
        const credentials = isDelegate ? stashedCredentials : getCredentials();
        const {partnerName, partnerPassword} = getPartnerCredentials(credentials?.autoGeneratedLogin);

        // Supportal sessions authenticate with a short-lived support auth token and must never be sent through the
        // customer's SAML flow. Skipping the SAML redirect lets a support session fall through to the normal
        // sign-in redirect below instead of bouncing the agent to the customer's IdP (e.g. Okta).
        if (account?.isSAMLRequired && !isSupportSession && !isSupportAuthTokenUsed) {
            setIsAuthenticating(false);

            // Skip the redirect if an earlier expired request in this same burst already queued it, so the
            // sign-in page is not torn down and re-mounted (and SAML re-initiated) once per concurrent 407.
            if (hasQueuedSAMLReauthRedirect) {
                Log.info('[Reauthenticate] SAML sign-in redirect already queued, skipping duplicate redirect');
                return false;
            }

            hasQueuedSAMLReauthRedirect = true;
            Log.info(`[Reauthenticate] Redirecting to Sign In because SAML is required`);
            redirectToSignIn(undefined, true);
            return false;
        }

        // Prevent reauthentication if credentials are missing (e.g. after sign out)
        if (!credentials?.autoGeneratedLogin || !credentials?.autoGeneratedPassword) {
            Log.info('[Reauthenticate] No credentials available, redirecting to sign in');
            setIsAuthenticating(false);
            redirectToSignIn('No credentials available');
            return false;
        }

        Log.info(`[Reauthenticate] Re-authenticating with ${checkIfShouldUseNewPartnerName(credentials?.autoGeneratedLogin) ? 'new' : 'old'} partner name`);

        Log.hmmm('[Reauthenticate] Starting authentication process', {
            command,
        });

        return Authenticate({
            useExpensifyLogin: false,
            partnerName,
            partnerPassword,
            partnerUserID: credentials?.autoGeneratedLogin,
            partnerUserSecret: credentials?.autoGeneratedPassword,
        })
            .then((response) => {
                if (!response) {
                    return false;
                }

                Log.hmmm('[Reauthenticate] Processing authentication result', {
                    command,
                });

                if (response.jsonCode === CONST.JSON_CODE.UNABLE_TO_RETRY) {
                    // When a fetch() fails due to a network issue and an error is thrown we won't log the user out. Most likely they
                    // have a spotty connection and will need to retry reauthenticate when they come back online. Error so it can be handled by the retry mechanism.
                    const error = new Error('Unable to retry Authenticate request');
                    trackAuthenticationError(error, {
                        errorType: 'network_retry',
                        functionName: 'reauthenticate',
                        jsonCode: response.jsonCode,
                        command,
                    });
                    throw error;
                }

                // If authentication fails and we are online then log the user out
                if (response.jsonCode !== 200) {
                    const errorMessage = getAuthenticateErrorMessage(response);

                    trackAuthenticationError(new Error('Authentication failed'), {
                        errorType: 'auth_failure',
                        functionName: 'reauthenticate',
                        jsonCode: response.jsonCode,
                        command,
                        errorMessage,
                    });
                    setIsAuthenticating(false);
                    Log.hmmm('[Reauthenticate] Redirecting to Sign In because we failed to reauthenticate', {
                        command,
                        error: errorMessage,
                    });
                    redirectToSignIn(errorMessage);
                    return false;
                }

                // If we reauthenticate due to an expired delegate token, restore the delegate's original account.
                // This is because the credentials used to reauthenticate were for the delegate's original account, and not for the account they were connected as.
                if (isDelegate) {
                    Log.info('[Reauthenticate] Reauthenticate while connected as a delegate. Restoring original account.');
                    restoreDelegateSession({
                        authToken: response.authToken,
                        encryptedAuthToken: response.encryptedAuthToken,
                        accountID: response.accountID,
                        email: response.email,
                        stashedCredentials,
                        stashedSession,
                    });
                    return false;
                }

                // Update authToken in Onyx and in our local variables so that API requests will use the new authToken
                updateSessionAuthTokens(response.authToken, response.encryptedAuthToken);

                // Note: It is important to manually set the authToken that is in the store here since any requests that are hooked into
                // reauthenticate .then() will immediate post and use the local authToken. Onyx updates subscribers lately so it is not
                // enough to do the updateSessionAuthTokens() call above.
                setAuthToken(response.authToken ?? null);

                // The authentication process is finished so the network can be unpaused to continue processing requests
                setIsAuthenticating(false);

                Log.hmmm('[Reauthenticate] Re-authentication successful', {
                    command,
                });

                return true;
            })
            .catch((error) => {
                if (error instanceof HttpsError && !shouldRetryAuthenticateError(error)) {
                    // Reuse the standard Authenticate response handling so HTTP
                    // failures and body-level failures produce the same UX.
                    const authenticationErrorResponse = getAuthenticationErrorResponse(error);
                    const errorMessage = getAuthenticateErrorMessage(authenticationErrorResponse);

                    trackAuthenticationError(error, {
                        errorType: 'auth_failure',
                        functionName: 'reauthenticate',
                        jsonCode: Number(error.status),
                        command,
                        errorMessage,
                    });
                    setIsAuthenticating(false);
                    Log.hmmm('[Reauthenticate] Redirecting to Sign In because Authenticate returned a non-retryable HTTP error', {
                        command,
                        error: error.message,
                        status: error.status,
                    });
                    redirectToSignIn(errorMessage);
                    return false;
                }

                // Caught values can be non-Error objects, but telemetry expects an Error instance.
                trackAuthenticationError(error instanceof Error ? error : new Error(getErrorMessage(error)), {
                    errorType: 'unexpected_error',
                    functionName: 'reauthenticate',
                    command,
                });

                Log.alert('[Reauthenticate] Unexpected error during authentication', {
                    error: getErrorMessage(error),
                    command,
                });
                throw error;
            });
    });
}

export default reauthenticate;
