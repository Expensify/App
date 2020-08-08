import * as Store from '../Store.js';
import {request} from '../../lib/Network.js';
import ROUTES from '../../ROUTES.js';
import STOREKEYS from '../STOREKEYS.js';
import * as PersistentStorage from '../../lib/PersistentStorage.js';
import * as _ from 'lodash';

// TODO: Figure out how to determine prod/dev on mobile, etc.
const IS_IN_PRODUCTION = false;
const partnerName = IS_IN_PRODUCTION ? 'chat-expensify-com' : 'android';
const partnerPassword = IS_IN_PRODUCTION
  ? 'e21965746fd75f82bb66'
  : 'c3a9ac418ea3f152aae2';

/**
 * Amount of time (in ms) after which an authToken is considered expired.
 * Currently set to 90min
 *
 * @private
 * @type {Number}
 */
const AUTH_TOKEN_EXPIRATION_TIME = 1000 * 60;

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

      // If we didn't get a 200 response from authenticate, the user needs to sign in again
      if (data.jsonCode !== 200) {
        console.warn(
          'Did not get a 200 from authenticate, going back to sign in page',
        );
        Store.set(STOREKEYS.APP_REDIRECT_TO, ROUTES.SIGNIN);
        return;
      }

      Store.set(STOREKEYS.SESSION, data);
      Store.set(STOREKEYS.APP_REDIRECT_TO, ROUTES.HOME);
      Store.set(STOREKEYS.LAST_AUTHENTICATED, new Date().getTime());

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
async function verifyAuthToken() {
  const lastAuthenticated = await Store.get(STOREKEYS.LAST_AUTHENTICATED);
  const credentials = await Store.get(STOREKEYS.CREDENTIALS);
  const haveCredentials = !_.isNull(credentials);
  const haveExpiredAuthToken =
    lastAuthenticated < new Date().getTime() - AUTH_TOKEN_EXPIRATION_TIME;

  if (haveExpiredAuthToken && haveCredentials) {
    console.debug('Invalid auth token: Token has expired.');
    signIn(credentials.login, credentials.password);
    return;
  }

  request('Get', {returnValueList: 'account'}).then((data) => {
    if (data.jsonCode === 200) {
      console.debug('We have valid auth token');
      Store.set(STOREKEYS.SESSION, data);
      return;
    }

    // If the auth token is bad and we didn't have credentials saved, we want them to go to the sign in page
    Store.set(STOREKEYS.APP_REDIRECT_TO, ROUTES.SIGNIN);
  });
}

export {signIn, signOut, verifyAuthToken};
