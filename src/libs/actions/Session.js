import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import redirectToSignIn from './SignInRedirect';
import * as API from '../API';
import CONFIG from '../../CONFIG';
import PushNotification from '../Notification/PushNotification';
import ROUTES from '../../ROUTES';
import Timing from './Timing';

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
    Timing.clearData();
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
 * Checks the API to see if an account exists for the given login
 *
 * @param {String} login
 */
function hasAccount(login) {
    Onyx.merge(ONYXKEYS.SESSION, {loading: true});

    API.GetAccountStatus({email: login})
        .then((response) => {
            if (response.jsonCode === 200) {
                Onyx.merge(ONYXKEYS.CREDENTIALS, {
                    login,
                    accountExists: response.accountExists,
                    hasGithubUsername: response.hasGithubUsername,
                });
                Onyx.merge(ONYXKEYS.SESSION, {loading: false});
                return;
            }

            Onyx.merge(ONYXKEYS.SESSION, {error: response.message});
            Onyx.merge(ONYXKEYS.SESSION, {loading: false});
        });
}

function createAccount(login, password, twoFactorAuthCode) {
    // Call CreateAccount()
}

function createLogin(login, password, twoFactorAuthCode) {
    // Call Authenticate()
    // Call CreateLogin()
}

/**
 * Puts the github username into Onyx so that it can be used when creating accounts or logins
 *
 * @param {String} username
 */
function setGitHubUsername(username) {
    Onyx.merge(ONYXKEYS.SESSION, {loading: true});
    API.SetGithubUsername({username})
        .then((response) => {
            if (response.jsonCode === 200) {
                Onyx.merge(ONYXKEYS.CREDENTIALS, {githubUsername: username});
                Onyx.merge(ONYXKEYS.SESSION, {loading: false});
                return;
            }

            Onyx.merge(ONYXKEYS.SESSION, {error: response.message});
            Onyx.merge(ONYXKEYS.SESSION, {loading: false});
        });
}

export {
    signIn,
    signOut,
    hasAccount,
    createAccount,
    setGitHubUsername,
};
