import * as Store from '../Store.js';
import {request} from '../../lib/Network.js';
import ROUTES from '../../ROUTES.js';
import STOREKEYS from '../STOREKEYS.js';
import * as PersistentStorage from '../../lib/PersistentStorage.js';

// TODO: Figure out how to determine prod/dev on mobile, etc.
const IS_IN_PRODUCTION = false;
const partnerName = IS_IN_PRODUCTION ? 'chat-expensify-com' : 'android';
const partnerPassword = IS_IN_PRODUCTION
  ? 'e21965746fd75f82bb66'
  : 'c3a9ac418ea3f152aae2';

/**
 * Sign in with the API
 * @param {string} login
 * @param {string} password
 * @param {boolean} useExpensifyLogin
 */
function signIn(login, password, useExpensifyLogin = false) {
  Store.set(STOREKEYS.CREDENTIALS, {login, password});
  Store.set(STOREKEYS.SESSION, {});

  return request('Authenticate', {
    useExpensifyLogin: useExpensifyLogin,
    partnerName: partnerName,
    partnerPassword: partnerPassword,
    partnerUserID: login,
    partnerUserSecret: password,
  })
    .then((data) => {
      // 404 We need to create a login
      if (data.jsonCode === 404 && !useExpensifyLogin) {
        signIn(login, password, true).then((expensifyLoginData) => {
          createLogin(expensifyLoginData.authToken, login, password);
        });
        return;
      }

      Store.set(STOREKEYS.SESSION, data);
      Store.set(STOREKEYS.APP_REDIRECT_TO, ROUTES.HOME);

      return data;
    })
    .catch((err) => {
      console.warn(err);
      Store.set(STOREKEYS.SESSION, {error: err});
    });
}

/**
 * Create login
 * @param {string} authToken
 * @param {string} login
 * @param {string} password
 */
function createLogin(authToken, login, password) {
  request('CreateLogin', {
    authToken: authToken,
    partnerName,
    partnerPassword,
    partnerUserID: login,
    partnerUserSecret: password,
  }).catch((err) => {
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
  request('Get', {returnValueList: 'account'}).then((data) => {
    if (data.jsonCode === 200) {
      console.debug('We have valid auth token');
      Store.set(STOREKEYS.SESSION, data);
      return;
    } else if (data.jsonCode === 407) {
      console.warn('We need to re-auth');
      return;
    }

    // If the auth token is bad, we want them to go to the sign in page
    Store.set(STOREKEYS.APP_REDIRECT_TO, ROUTES.SIGNIN);
  });
}

export {signIn, signOut, verifyAuthToken};
