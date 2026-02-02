import * as Sentry from '@sentry/react-native';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Account, Session} from '@src/types/onyx';
import type Response from '@src/types/onyx/Response';
import {isConnectedAsDelegate, restoreDelegateSession} from './actions/Delegate';
import updateSessionAuthTokens from './actions/Session/updateSessionAuthTokens';
import redirectToSignIn from './actions/SignInRedirect';
import {getAuthenticateErrorMessage} from './ErrorUtils';
import Log from './Log';
import {post} from './Network';
import {getCredentials, hasReadRequiredDataFromStorage, setAuthToken, setIsAuthenticating} from './Network/NetworkStore';
import requireParameters from './requireParameters';
import {checkIfShouldUseNewPartnerName} from './SessionUtils';
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

// These session values are only used to help the user authentication with the API.
// Since they aren't connected to a UI anywhere, it's OK to use connectWithoutView()

let session: OnyxEntry<Session>;
let tryNewDotCohort: string | undefined;

function updateSentryUser() {
    if (!session) {
        return;
    }

    // console.log('Sentry SET USER: ', session.email);
    // console.log('tryNewDotCohort: ', tryNewDotCohort);

    Sentry.setUser({
        id: session.accountID,
        email: session.email,
        username: tryNewDotCohort,
    });
}

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_TRY_NEW_DOT,
    callback: (value) => {
        // console.log('NVP_TRY_NEW_DOT callback fired with value:', value);
        tryNewDotCohort = value?.nudgeMigration?.cohort ?? 'testing_cohort';
        updateSentryUser();
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        // console.log('Authentication: SESSION callback fired with value:', value);
        isAuthenticatingWithShortLivedToken = !!value?.isAuthenticatingWithShortLivedToken;
        isSupportAuthTokenUsed = !!value?.isSupportAuthTokenUsed;
        session = value;
        updateSentryUser();
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

function Authenticate(parameters: Parameters): Promise<Response | void> {
    const commandName = 'Authenticate';

    try {
        requireParameters(['partnerName', 'partnerPassword', 'partnerUserID', 'partnerUserSecret'], parameters, commandName);
    } catch (error) {
        const errorMessage = (error as Error).message;
        trackAuthenticationError(error as Error, {
            errorType: 'missing_params',
            functionName: 'Authenticate',
            commandName,
            providedParameters: Object.keys(parameters),
        });
        Log.hmmm('Redirecting to Sign In because we failed to reauthenticate', {
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

/**
 * Reauthenticate using the stored credentials and redirect to the sign in page if unable to do so.
 * @param [command] command name for logging purposes
 * @return returns true if reauthentication was successful, false otherwise.
 */
function reauthenticate(command = ''): Promise<boolean> {
    Log.hmmm('Reauthenticate - Attempting re-authentication', {
        command,
    });

    // Prevent re-authentication if authentication with shortLiveToken is in progress
    if (isAuthenticatingWithShortLivedToken) {
        Log.hmmm('Reauthenticate - Authentication with shortLivedToken is in progress. Re-authentication aborted.', {
            command,
            isSupportAuthTokenUsed,
        });
        return Promise.resolve(false);
    }

    // Prevent any more requests from being processed while authentication happens
    setIsAuthenticating(true);

    Log.hmmm('Reauthenticate - Waiting for credentials', {
        command,
    });

    return hasReadRequiredDataFromStorage().then(() => {
        const credentials = getCredentials();
        const shouldUseNewPartnerName = checkIfShouldUseNewPartnerName(credentials?.autoGeneratedLogin);

        const partnerName = shouldUseNewPartnerName ? CONFIG.EXPENSIFY.PARTNER_NAME : CONFIG.EXPENSIFY.LEGACY_PARTNER_NAME;
        const partnerPassword = shouldUseNewPartnerName ? CONFIG.EXPENSIFY.PARTNER_PASSWORD : CONFIG.EXPENSIFY.LEGACY_PARTNER_PASSWORD;

        // Prevent reauthentication if credentials are missing (e.g. after sign out)
        if (!credentials?.autoGeneratedLogin || !credentials?.autoGeneratedPassword) {
            Log.info('Reauthenticate - No credentials available, redirecting to sign in');
            // The following lines are commented out to test if it's the cause of #fireroom-2026-01-28-user-signout
            // setIsAuthenticating(false);
            // redirectToSignIn('No credentials available');
            // return false;
        }

        Log.info(`Reauthenticate - re-authenticating with ${shouldUseNewPartnerName ? 'new' : 'old'} partner name`);

        Log.hmmm('Reauthenticate - Starting authentication process', {
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

                Log.hmmm('Reauthenticate - Processing authentication result', {
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
                    Log.hmmm('Redirecting to Sign In because we failed to reauthenticate', {
                        command,
                        error: errorMessage,
                    });
                    redirectToSignIn(errorMessage);
                    return false;
                }

                // If we reauthenticate due to an expired delegate token, restore the delegate's original account.
                // This is because the credentials used to reauthenticate were for the delegate's original account, and not for the account they were connected as.
                if (isConnectedAsDelegate({delegatedAccess: account?.delegatedAccess})) {
                    Log.info('Reauthenticate while connected as a delegate. Restoring original account.');
                    restoreDelegateSession(response);
                    return true;
                }

                // Update authToken in Onyx and in our local variables so that API requests will use the new authToken
                updateSessionAuthTokens(response.authToken, response.encryptedAuthToken);

                // Note: It is important to manually set the authToken that is in the store here since any requests that are hooked into
                // reauthenticate .then() will immediate post and use the local authToken. Onyx updates subscribers lately so it is not
                // enough to do the updateSessionAuthTokens() call above.
                setAuthToken(response.authToken ?? null);

                // The authentication process is finished so the network can be unpaused to continue processing requests
                setIsAuthenticating(false);

                Log.hmmm('Reauthenticate - Re-authentication successful', {
                    command,
                });

                return true;
            })
            .catch((error) => {
                trackAuthenticationError(error as Error, {
                    errorType: 'unexpected_error',
                    functionName: 'reauthenticate',
                    command,
                });

                Log.alert('Reauthenticate - Unexpected error during authentication', {
                    error: (error as Error).message,
                    command,
                });
                throw error;
            });
    });
}

export {reauthenticate, Authenticate};
