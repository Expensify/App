import Onyx from 'react-native-onyx';
import * as API from '../API';
import ONYXKEYS from '../../ONYXKEYS';
import redirectToSignIn from './SignInRedirect';
import expensifyAPI from '../expensifyAPI';

let credentials;
Onyx.connect({
    key: ONYXKEYS.CREDENTIALS,
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
 * Clears the Onyx store and redirects user to the sign in page
 */
function signOut() {
    redirectToSignIn();
    if (!credentials || !credentials.login) {
        return;
    }
    expensifyAPI.deleteLogin({
        partnerUserID: credentials.login
    })
        .catch(error => Onyx.merge(ONYXKEYS.SESSION, {error: error.message}));
}

export {
    signIn,
    signOut,
};
