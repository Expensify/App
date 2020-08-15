import _ from 'underscore';
import Ion from '../Ion';
import {request} from '../Network';
import signIn from './ActionsSignIn';
import IONKEYS from '../../IONKEYS';
import CONFIG from '../../CONFIG';
import redirectToSignIn from './ActionsSignInRedirect';

/**
 * Make sure the authToken we have is OK to use
 *
 * @returns {Promise}
 */
function verifyAuthToken() {
    return Ion.multiGet([IONKEYS.LAST_AUTHENTICATED, IONKEYS.CREDENTIALS])
        .then(({last_authenticated, credentials}) => {
            const haveCredentials = !_.isNull(credentials);
            const haveExpiredAuthToken = last_authenticated < new Date().getTime() - CONFIG.AUTH_TOKEN_EXPIRATION_TIME;

            if (haveExpiredAuthToken && haveCredentials) {
                console.debug('Invalid auth token: Token has expired.');
                return signIn(credentials.login, credentials.password);
            }

            return request('Get', {returnValueList: 'account'}).then((data) => {
                if (data && data.jsonCode === 200) {
                    return Ion.merge(IONKEYS.SESSION, data);
                }

                // If the auth token is bad and we didn't have credentials saved, we want them to go to the sign in page
                return redirectToSignIn();
            });
        });
}
export default verifyAuthToken;
