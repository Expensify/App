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

/**
 * Refreshes the authToken by calling Authenticate with the stored credentials
 *
 * @param {String} originalCommand
 * @param {Object} [originalParameters]
 * @param {String} [originalType]
 */
function reauthenticate(originalCommand, originalParameters, originalType) {
    // Prevent any more requests from being processed while authentication happens
    Network.pauseRequestQueue();
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
            Network.post(originalCommand, originalParameters, originalType);
        })
        .catch((error) => {
            redirectToSignIn(error.message);
            return Promise.reject();
        })
        .finally(() => {
            Onyx.set(ONYXKEYS.REAUTHENTICATING, {
                inProgress: false,
            });
        });
}

export {
    signIn,
    signOut,
    reauthenticate,
};
