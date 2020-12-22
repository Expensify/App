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
 * Create an account for the user logging in.
 * This will send them a notification with a link to click on to validate the account and set a password
 *
 * @param {String} login
 */
function createAccount(login) {
    Onyx.merge(ONYXKEYS.SESSION, {error: ''});

    API.User_SignUp({
        email: login,
    }).then((response) => {
        if (response.jsonCode !== 200) {
            let errorMessage = response.message || `Unknown API Error: ${response.jsonCode}`;
            if (!response.message && response.jsonCode === 405) {
                errorMessage = 'Cannot create an account that is under a controlled domain';
            }
            Onyx.merge(ONYXKEYS.SESSION, {error: errorMessage});
            Onyx.merge(ONYXKEYS.CREDENTIALS, {login: null});
        }
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
function fetchAccountDetails(login) {
    Onyx.merge(ONYXKEYS.SESSION, {error: ''});

    API.GetAccountStatus({email: login})
        .then((response) => {
            if (response.jsonCode === 200) {
                Onyx.merge(ONYXKEYS.CREDENTIALS, {login});
                Onyx.merge(ONYXKEYS.ACCOUNT, {
                    accountExists: response.accountExists,
                    canAccessExpensifyCash: response.canAccessExpensifyCash,
                    requiresTwoFactorAuth: response.requiresTwoFactorAuth,
                });

                if (!response.accountExists) {
                    createAccount(login);
                }
            }
        });
}

/**
 * Sign the user into the application. This will first authenticate their account
 * then it will create a temporary login for them which is used when re-authenticating
 * after an authToken expires.
 *
 * @param {String} password
 * @param {String} exitTo
 * @param {String} [twoFactorAuthCode]
 */
function signIn(password, exitTo, twoFactorAuthCode) {
    Onyx.merge(ONYXKEYS.SESSION, {error: ''});

    API.Authenticate({
        useExpensifyLogin: true,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: credentials.login,
        partnerUserSecret: password,
        twoFactorAuthCode,
    })
        .then((authenticateResponse) => {
            const login = Str.guid('expensify.cash-');
            const temporaryPassword = Str.guid();

            API.CreateLogin({
                authToken: authenticateResponse.authToken,
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
        })
        .catch((error) => {
            Onyx.merge(ONYXKEYS.SESSION, {error: error.message});
        });
}

/**
 * Puts the github username into Onyx so that it can be used when creating accounts or logins
 *
 * @param {String} username
 */
function setGitHubUsername(username) {
    API.SetGithubUsername({email: credentials.login, githubUsername: username})
        .then((response) => {
            if (response.jsonCode === 200) {
                Onyx.merge(ONYXKEYS.CREDENTIALS, {githubUsername: username});
                Onyx.merge(ONYXKEYS.ACCOUNT, {canAccessExpensifyCash: true});
                return;
            }

            // This request can fail if an invalid GitHub username was entered
            Onyx.merge(ONYXKEYS.SESSION, {error: 'Please enter a valid GitHub username'});
        });
}

/**
 * Resend the validation link to the user that is validating their account
 * this happens in the createAccount() flow
 */
function resendValidationLink() {
    API.ResendValidateCode({email: credentials.login});
}

/**
 * Restart the sign in process by clearing everything from Onyx
 */
function restartSignin() {
    Onyx.clear();
}

/**
 * Set the password for the current account
 *
 * @param {String} password
 * @param {String} validateCode
 */
function setPassword(password, validateCode) {
    API.SetPassword({
        email: credentials.login,
        password,
        validateCode,
    })
        .then((response) => {
            if (response.jsonCode === 200) {
                Onyx.merge(ONYXKEYS.CREDENTIALS, {password});
                setSuccessfulSignInData(response, '/home/');
                return;
            }

            // This request can fail if the password is not complex enough
            Onyx.merge(ONYXKEYS.SESSION, {error: response.message});
        });
}

export {
    fetchAccountDetails,
    setGitHubUsername,
    setPassword,
    signIn,
    signOut,
    resendValidationLink,
    restartSignin,
};
