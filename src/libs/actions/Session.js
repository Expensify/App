import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import redirectToSignIn from './SignInRedirect';
import * as Network from '../Network';
import * as API from '../API';
import CONFIG from '../../CONFIG';
import PushNotification from '../Notification/PushNotification';
import ROUTES from '../../ROUTES';

let credentials;
Onyx.connect({
    key: ONYXKEYS.CREDENTIALS,
    callback: val => credentials = val,
});

/**
 * Refreshes the authToken by calling Authenticate with the stored credentials
 */
function reauthenticate() {
    API.Authenticate({
        useExpensifyLogin: false,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: credentials.login,
        partnerUserSecret: credentials.password,
    })
        .then((response) => {
            // If authentication fails throw so that we hit the catch below and redirect to sign in
            if (response.jsonCode !== 200) {
                throw new Error(response.message);
            }

            // Update authToken in Onyx store otherwise subsequent API calls will use the expired one
            Onyx.merge(ONYXKEYS.SESSION, _.pick(response, 'authToken'));

            // The authentication process is finished so the network can be unpaused to continue
            // processing requests
            Network.unpauseRequestQueue();
        })
        .catch((error) => {
            redirectToSignIn(error.message);
            return Promise.reject();
        })
        .finally(() => Onyx.set(ONYXKEYS.REAUTHENTICATING, false));
}

// Indicates if we're in the process of re-authenticating. When an API call returns jsonCode 407 indicating that the
// authToken expired, we set this to true, pause all API calls, re-authenticate, and then use the authToken from the
// response in the subsequent API calls
let isReauthenticating = false;
Onyx.connect({
    key: ONYXKEYS.REAUTHENTICATING,
    callback: (reauthenticating) => {
        if (!reauthenticating) {
            return;
        }
        if (isReauthenticating === reauthenticating) {
            return;
        }

        isReauthenticating = reauthenticating;

        // When the app is no longer authenticating restart the network queue
        if (!isReauthenticating) {
            return;
        }

        // Otherwise let's refresh the authToken by calling reauthenticate
        reauthenticate();
    }
});


/**
 * Sets API data in the store when we make a successful "Authenticate"/"CreateLogin" request
 *
 * @param {Object} data
 * @param {String} exitTo
 */
function setSuccessfulSignInData(data, exitTo) {
    PushNotification.register(data.accountID);

    const redirectTo = exitTo ? Str.normalizeUrl(exitTo) : ROUTES.ROOT;
    Onyx.multiSet({
        [ONYXKEYS.SESSION]: _.pick(data, 'authToken', 'accountID', 'email'),
        [ONYXKEYS.APP_REDIRECT_TO]: redirectTo
    });
}

/**
 * Sign in with the API
 *
 * @param {String} partnerUserID
 * @param {String} partnerUserSecret
 * @param {String} [twoFactorAuthCode]
 * @param {String} [exitTo]
 */
function signIn(partnerUserID, partnerUserSecret, twoFactorAuthCode = '', exitTo) {
    Onyx.merge(ONYXKEYS.SESSION, {loading: true, error: ''});

    API.Authenticate({
        useExpensifyLogin: true,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID,
        partnerUserSecret,
        twoFactorAuthCode,
    })
        .then(authenticateResponse => setSuccessfulSignInData(authenticateResponse, exitTo))
        .catch((error) => {
            console.error(error);
            console.debug('[SIGNIN] Request error');
            Onyx.merge(ONYXKEYS.SESSION, {error: error.message});
        })
        .finally(() => Onyx.merge(ONYXKEYS.SESSION, {loading: false}));
}

/**
 * Clears the Onyx store and redirects user to the sign in page
 */
function signOut() {
    redirectToSignIn();
    if (!credentials || !credentials.login) {
        return;
    }

    API.DeleteLogin({
        partnerUserID: credentials.login,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        doNotRetry: true,
    })
        .catch(error => Onyx.merge(ONYXKEYS.SESSION, {error: error.message}));
}

// We should only ever be creating a single login at a time
let creatingLogin = false;

/**
 * @param {string} login
 * @param {string} password
 */
function createLogin(login, password) {
    if (creatingLogin) {
        return;
    }

    creatingLogin = true;

    // Using doNotRetry:true here because we call CreateLogin after getting a successful response to Authenticate
    // so it's unlikely that we'll get a 407.
    API.CreateLogin({
        authToken: API.getAuthToken(),
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: login,
        partnerUserSecret: password,
        doNotRetry: true,
    })
        .then((response) => {
            creatingLogin = false;

            if (response.jsonCode !== 200) {
                throw new Error(response.message);
            }
            if (credentials && credentials.login) {
                // If we have an old login for some reason, we should delete it before storing the new details
                API.DeleteLogin({partnerUserID: credentials.login});
            }
            Onyx.merge(ONYXKEYS.CREDENTIALS, {login, password});

            // Now that we created a login to re-authenticate the user when the authToken expires,
            // we redirect the user and clear the value of redirectTo since we don't need it anymore
            // TODO update
            // Onyx.merge(ONYXKEYS.APP_REDIRECT_TO, redirectTo);
            Onyx.merge(ONYXKEYS.APP_REDIRECT_TO, ROUTES.ROOT);
        });
}

// Used to prevent calling CreateLogin more than once since this callback is triggered when we set
// authToken, loading, error, etc
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (session) => {
        // If we have an authToken but no login, it's the users first time signing in and we need to
        // create a login for the user, so when the authToken expires we can get a new one with said login
        const hasLogin = credentials && credentials.login;
        if (!session || !session.authToken || hasLogin) {
            return;
        }
        createLogin(Str.guid('react-native-chat-'), Str.guid());
    },
});

export {
    signIn,
    signOut,
};
