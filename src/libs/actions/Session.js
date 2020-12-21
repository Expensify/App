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

let credentials = {};
Onyx.connect({
    key: ONYXKEYS.CREDENTIALS,
    callback: val => credentials = val,
});

let account = {};
Onyx.connect({
    key: ONYXKEYS.ACCOUNT,
    callback: val => account = val,
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
 * Create a login for the user that has a random login and a temporary password so that the app
 * can reauthenticate the user when the authToken expires
 *
 * @param {String} authToken
 * @param {String} password
 * @param {String} exitTo
 */
function createLogin(authToken, password, exitTo) {
    const login = Str.guid('expensify.cash-');
    const temporaryPassword = Str.guid();

    API.CreateLogin({
        authToken,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: login,
        partnerUserSecret: temporaryPassword,
        doNotRetry: true,
    })
        .then((createLoginResponse) => {
            if (createLoginResponse.jsonCode !== 200) {
                throw new Error(createLoginResponse.message);
            }

            setSuccessfulSignInData(createLoginResponse, exitTo);

            // If we have an old login for some reason, we should delete it before storing the new details
            if (credentials.login) {
                API.DeleteLogin({
                    partnerUserID: credentials.login,
                    partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
                    partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
                    doNotRetry: true,
                })
                    .catch(console.debug);
            }

            Onyx.merge(ONYXKEYS.CREDENTIALS, {password});
        })
        .catch((error) => {
            Onyx.merge(ONYXKEYS.SESSION, {error: error.message});
        });
}

/**
 * Create an account for the user logging in
 *
 * @param {String} password
 * @param {String} twoFactorAuthCode
 * @param {String} exitTo
 */
function createAccount(password, twoFactorAuthCode, exitTo) {
    // @TODO figure out what is supposed to happen with twoFactorAuthCode in this flow
    Onyx.merge(ONYXKEYS.SESSION, {error: ''});

    API.CreateAccount({
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        email: credentials.login,
        password,
    })
        .then((response) => {
            createLogin(response.authToken, password, exitTo);
        });
}

/**
 * Create a login for the user who is logging in.
 *
 * @param {String} password
 * @param {String} twoFactorAuthCode
 * @param {String} exitTo
 */
function authenticateAndCreateAccount(password, twoFactorAuthCode, exitTo) {
    Onyx.merge(ONYXKEYS.SESSION, {error: ''});

    API.Authenticate({
        useExpensifyLogin: true,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: credentials.login,
        partnerUserSecret: password,
        twoFactorAuthCode,
    })
        .then((response) => {
            createLogin(response.authToken, password, exitTo);
        });
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
    API.GetAccountStatus({email: login})
        .then((response) => {
            if (response.jsonCode === 200) {
                Onyx.merge(ONYXKEYS.CREDENTIALS, {
                    login,
                });
                Onyx.merge(ONYXKEYS.ACCOUNT, {
                    accountExists: response.accountExists,
                    hasGithubUsername: response.hasGithubUsername,
                });
            }
        });
}

/**
 * Create a login or an account depending on if the user's account they are logging in
 * with already had an account associated with it or not.
 *
 * @param {String} password
 * @param {String} twoFactorAuthCode
 * @param {String} exitTo
 */
function signIn(password, twoFactorAuthCode, exitTo) {
    if (account.accountExists) {
        authenticateAndCreateAccount(password, twoFactorAuthCode, exitTo);
        return;
    }

    createAccount(password, twoFactorAuthCode, exitTo);
}

/**
 * Puts the github username into Onyx so that it can be used when creating accounts or logins
 *
 * @param {String} username
 */
function setGitHubUsername(username) {
    API.SetGithubUsername({username})
        .then((response) => {
            if (response.jsonCode === 200) {
                Onyx.merge(ONYXKEYS.CREDENTIALS, {githubUsername: username});
                Onyx.merge(ONYXKEYS.ACCOUNT, {hasGithubUsername: true});
                return;
            }

            Onyx.merge(ONYXKEYS.SESSION, {error: response.message});
        });
}

/**
 * Resend the validation link to the user that is validating their account
 * this happens in the createAccount() flow
 */
function resendValidationLink() {
    API.ResendValidateCode({email: credentials.login});
}

export {
    hasAccount,
    setGitHubUsername,
    signIn,
    signOut,
    resendValidationLink,
};
