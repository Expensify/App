import * as Store from '../Store.js';
import {request} from '../../lib/Network.js';
import ROUTES from '../../ROUTES.js';
import STOREKEYS from '../STOREKEYS.js';
import * as PersistentStorage from '../../lib/PersistentStorage.js';

/**
 * Sign in with the API
 * @param {string} login
 * @param {string} password
 */
function signIn(login, password) {
  Store.set(STOREKEYS.CREDENTIALS, {login, password});
  Store.set(STOREKEYS.SESSION, {});

  request('Authenticate', {
    useExpensifyLogin: true,
    partnerName: 'expensify.com',
    partnerPassword: 'MkgLvVAyaTlmw',
    partnerUserID: login,
    partnerUserSecret: password,
  })
    .then((data) => {
      Store.set(STOREKEYS.SESSION, data);
      Store.set(STOREKEYS.APP_REDIRECT_TO, ROUTES.HOME);
    })
    .catch((err) => {
      console.warn(err);
      Store.set(STOREKEYS.SESSION, {error: err});
    });
}

/**
 * Sign out of our application
 */
async function signOut() {
  Store.set(STOREKEYS.APP_REDIRECT_TO, ROUTES.SIGNIN);
  await PersistentStorage.clear();
}

/**
 * Make sure the authToken we have is OK to use
 */
function verifyAuthToken() {
  request('Get', {returnValueList: 'account'})
    .then((data) => {
      console.debug(`Have valid auth token`);
      Store.set(STOREKEYS.SESSION, data);
    })
    .catch(() => {
      // If the auth token is bad, we want them to go to the sign in page
      Store.set(STOREKEYS.APP_REDIRECT_TO, ROUTES.SIGNIN);
    });
}

export {signIn, signOut, verifyAuthToken};
