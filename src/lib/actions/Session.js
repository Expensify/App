import _ from 'underscore';
import Ion from '../Ion';
import * as API from '../API';
import IONKEYS from '../../IONKEYS';
import redirectToSignIn from './SignInRedirect';

let credentials;
Ion.connect({
    key: IONKEYS.CREDENTIALS,
    callback: val => credentials = val,
});

/**
 * Sign in with the API
 *
 * @param {string} partnerUserID
 * @param {string} partnerUserSecret
 * @param {string} twoFactorAuthCode
 * @param {string} exitTo
 */
function signIn(partnerUserID, partnerUserSecret, twoFactorAuthCode = '', exitTo) {
    API.authenticate({
        partnerUserID,
        partnerUserSecret,
        twoFactorAuthCode,
        exitTo
    });
}

function reauthenticate() {
    API.callAuthenticate(credentials.login, credentials.password)
        .then((response) => {
            // If authentication fails throw so that we hit the catch below and redirect to sign in
            if (response.jsonCode !== 200) {
                throw new Error(response.message);
            }

            // Update authToken in Ion store otherwise subsequent API calls will use the expired one
            Ion.merge(IONKEYS.SESSION, _.pick(response, 'authToken'));
        })
        .catch((error) => {
            redirectToSignIn(error.message);
            return Promise.reject();
        })
        .finally(() => Ion.set(IONKEYS.REAUTHENTICATING, false));
}

/**
 * Clears the Ion store and redirects user to the sign in page
 */
function signOut() {
    redirectToSignIn();
    if (!credentials || !credentials.login) {
        return;
    }
    API.deleteLogin({
        partnerUserID: credentials.login
    });
}

export {
    signIn,
    signOut,
    reauthenticate,
};
