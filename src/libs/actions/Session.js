import Onyx from 'react-native-onyx';
import Str from 'js-libs/lib/str';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import redirectToSignIn from './SignInRedirect';
import expensifyAPI from '../expensifyAPI';
import CONFIG from '../../CONFIG';
import PushNotification from '../Notification/PushNotification/index.native';
import ROUTES from '../../ROUTES';

let credentials;
Onyx.connect({
    key: ONYXKEYS.CREDENTIALS,
    callback: val => credentials = val,
});

/**
 * Sets API data in the store when we make a successful "Authenticate"/"CreateLogin" request
 *
 * @param {object} data
 * @param {string} exitTo
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
 * @param {string} partnerUserID
 * @param {string} partnerUserSecret
 * @param {string} [twoFactorAuthCode]
 * @param {string} [exitTo]
 */
function signIn(partnerUserID, partnerUserSecret, twoFactorAuthCode = '', exitTo) {
    Onyx.merge(ONYXKEYS.SESSION, {loading: true, error: ''});
    expensifyAPI.authenticate({
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID,
        partnerUserSecret,
        twoFactorAuthCode,
    })

        // After the user authenticates, create a new login for the user so that we can reauthenticate when the
        // authtoken expires
        .then((response) => {
            Onyx.merge(ONYXKEYS.SESSION, {authToken: response.authToken})
                .then(() => {
                    expensifyAPI.createLogin(Str.guid('react-native-chat-'), Str.guid())
                        .then(() => setSuccessfulSignInData(response, exitTo));
                });
        })
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

    expensifyAPI.deleteLogin({
        partnerUserID: credentials.login,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        doNotRetry: true,
    })
        .catch(error => Onyx.merge(ONYXKEYS.SESSION, {error: error.message}));
}

export {
    signIn,
    signOut,
};
