import Ion from '../Ion';
import * as API from '../API';
import IONKEYS from '../../IONKEYS';
import redirectToSignIn from './SignInRedirect';
import PushNotification from '../Notification/PushNotification';

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

/**
 * Clears the Ion store and redirects user to the sign in page
 */
function signOut() {
    PushNotification.deregister();
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
};
