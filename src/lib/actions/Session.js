import Ion from '../Ion';
import * as API from '../API';
import IONKEYS from '../../IONKEYS';
import redirectToSignIn from './SignInRedirect';

function signIn(partnerUserID, partnerUserSecret, twoFactorAuthCode = '', exitTo) {
    return API.authenticate({
        partnerUserID,
        partnerUserSecret,
        twoFactorAuthCode,
        exitTo
    });
}

/**
 * Clears the Ion store and redirects user to the sign in page
 * @returns {Promise}
 */
function signOut() {
    return redirectToSignIn()
        .then(() => Ion.multiGet([IONKEYS.SESSION, IONKEYS.CREDENTIALS]))
        .then(data => API.deleteLogin({
            authToken: data.session.authToken,
            partnerUserID: data.credentials.login
        }))
        .then(Ion.clear)
        .catch(err => Ion.merge(IONKEYS.SESSION, {error: err.message}));
}

export {
    signIn,
    signOut,
};
