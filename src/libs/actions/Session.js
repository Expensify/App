import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import redirectToSignIn from './SignInRedirect';
import * as API from '../API';
import CONFIG from '../../CONFIG';
import PushNotification from '../Notification/PushNotification';
import ROUTES from '../../ROUTES';
import {redirect} from './App';

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

    const redirectURL = exitTo ? Str.normalizeUrl(exitTo) : ROUTES.ROOT;
    Onyx.multiSet({
        [ONYXKEYS.SESSION]: _.pick(data, 'authToken', 'accountID', 'email'),
        [ONYXKEYS.APP_REDIRECT_TO]: redirectURL
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

        // After the user authenticates, create a new login for the user so that we can reauthenticate when the
        // authtoken expires
        .then((authenticateResponse) => {
            const login = Str.guid('expensify.cash-');
            const password = Str.guid();

            API.CreateLogin({
                authToken: authenticateResponse.authToken,
                partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
                partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
                partnerUserID: login,
                partnerUserSecret: password,
                doNotRetry: true,
            })
                .then((createLoginResponse) => {
                    if (createLoginResponse.jsonCode !== 200) {
                        throw new Error(createLoginResponse.message);
                    }

                    setSuccessfulSignInData(createLoginResponse, exitTo);

                    if (credentials && credentials.login) {
                        // If we have an old login for some reason, we should delete it before storing the new details
                        API.DeleteLogin({
                            partnerUserID: credentials.login,
                            partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
                            partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
                            doNotRetry: true,
                        })
                            .catch(error => Onyx.merge(ONYXKEYS.SESSION, {error: error.message}));
                    }

                    Onyx.merge(ONYXKEYS.CREDENTIALS, {login, password});
                });
        })
        .catch((error) => {
            console.debug('[SIGNIN] Request error', error);
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
 * Set the password for the current account
 *
 * @param {String} password
 * @param {String} validateCode
 */
function setPassword(password, validateCode) {
    API.SetPassword({
        password,
        validateCode,
    })
        .then(() => {
            // @TODO check for 200 response and log the user in properly (like the sign in flow).
            //  For now we can just redirect to root
            Onyx.merge(ONYXKEYS.CREDENTIALS, {password});
            redirect('/');
        });
}

export {
    signIn,
    signOut,
    setPassword,
};
