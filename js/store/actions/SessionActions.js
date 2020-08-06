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
    partnerName: 'expensify.com',
    partnerPassword: 'MkgLvVAyaTlmw',
    partnerUserID: login,
    partnerUserSecret: password,
  })
    .done((data) => {
      Store.set(STOREKEYS.SESSION, data);
      Store.set(STOREKEYS.APP_REDIRECT_TO, ROUTES.HOME);
    })
    .fail((err) => {
      Store.set(STOREKEYS.SESSION, {error: err});
    });
}

/**
 * Sign out of our application
 */
function signOut() {
  Store.set(STOREKEYS.APP_REDIRECT_TO, ROUTES.SIGNIN);
  PersistentStorage.clear();
}

/**
 * Make sure the authToken we have is OK to use
 */
function verifyAuthToken() {
  request('Get', {returnValueList: 'account'})
    .done((data) => {
      Store.set(STOREKEYS.SESSION, data);
    })
    .fail(() => {
      // If the auth token is bad, we want them to go to the sign in page
      Store.set(STOREKEYS.APP_REDIRECT_TO, ROUTES.SIGNIN);
    });
}

export {signIn, signOut, verifyAuthToken};
