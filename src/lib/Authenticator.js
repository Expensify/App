import _ from 'underscore';
import Ion from './Ion';
import IONKEYS from '../IONKEYS';
import Str from './Str';
import Guid from './Guid';
import * as API from './API';
import redirectToSignIn from './actions/SignInRedirect';
import ROUTES from '../ROUTES';

// When the user authenticates for the first time we create a login and store credentials in Ion.
// When the user's authToken expires we use this login to re-authenticate and get a new authToken
// and use that new authToken in subsequent API calls
let credentials;
Ion.connect({
    key: IONKEYS.CREDENTIALS,
    callback: ionCredentials => credentials = ionCredentials,
});

// Indicates if we're in the process of re-authenticating. When an API call returns jsonCode 407 indicating that the
// authToken expired, we set this to true, pause all API calls, re-authenticate, and then use the authToken from the
// response in the subsequent API calls
let reauthenticating = false;

Ion.connect({
    key: IONKEYS.REAUTHENTICATING,
    callback: (isReauthenticating) => {
        // Nothing has changed so do nothing
        if (reauthenticating === isReauthenticating) {
            return;
        }
        reauthenticating = isReauthenticating;

        // When the app is no longer authenticating restart the network queue
        if (!reauthenticating) {
            return;
        }

        // Otherwise let's refresh the authToken by calling Authenticate
        return API.callAuthenticate(credentials.login, credentials.password)
            .then((response) => {
                // If authentication fails throw so that we hit the catch below and redirect to sign in
                if (response.jsonCode !== 200) {
                    throw new Error(response.message);
                }

                // Update authToken in Ion store otherwise subsequent API calls will use the expired one
                Ion.merge(IONKEYS.SESSION, _.pick(response, 'authToken'));
                return response;
            })
            .catch((error) => {
                redirectToSignIn(error.message);
                return Promise.reject();
            })
            .finally(() => reauthenticating = false);
    }
});

/**
 * @param {string} login
 * @param {string} password
 * @returns {Promise}
 */
function createLogin(login, password) {
    // Using xhr instead of request because request has logic to retry API commands when we get a 407 authToken expired
    // in the response, and we call CreateLogin after getting a successful response to Authenticate so it's unlikely
    // that we'll get a 407.
    return API.createLogin(login, password)
        .then((response) => {
            if (response.jsonCode !== 200) {
                throw new Error(response.message);
            }
            if (credentials && credentials.login) {
                // If we have an old login for some reason, we should delete it before storing the new details
                API.deleteLogin({partnerUserID: credentials.login});
            }
            Ion.merge(IONKEYS.CREDENTIALS, {login, password});

            // Now that we created a login to re-authenticate the user when the authToken expires,
            // we redirect the user and clear the value of redirectTo since we don't need it anymore
            // TODO update
            // Ion.merge(IONKEYS.APP_REDIRECT_TO, redirectTo);
            Ion.merge(IONKEYS.APP_REDIRECT_TO, ROUTES.ROOT);
        });
}

// Used to prevent calling CreateLogin more than once since this callback is triggered when we set authToken, loading,
// error, etc
let creatingLogin = false;
Ion.connect({
    key: IONKEYS.SESSION,
    callback: (session) => {
        // If we have an authToken but no login, it's the users first time signing in and we need to
        // create a login for the user, so when the authToken expires we can get a new one with said login
        const hasLogin = credentials && credentials.login;
        if (session && session.authToken && !hasLogin && !creatingLogin) {
            creatingLogin = true;
            createLogin(Str.generateDeviceLoginID(), Guid())
                .then(() => creatingLogin = false);
        }
    },
});

export default () => {};
