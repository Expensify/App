import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import {reauthenticate} from './actions/Session';
import {createLogin} from './actions/Credentials';

// When the user authenticates for the first time we create a login and store credentials in Onyx.
// When the user's authToken expires we use this login to re-authenticate and get a new authToken
// and use that new authToken in subsequent API calls
let credentials;

// Indicates if we're in the process of re-authenticating. When an API call returns jsonCode 407 indicating that the
// authToken expired, we set this to true, pause all API calls, re-authenticate, and then use the authToken from the
// response in the subsequent API calls
let reauthenticating = false;

function init() {
    Onyx.connect({
        key: ONYXKEYS.CREDENTIALS,
        callback: ionCredentials => credentials = ionCredentials,
    });

    Onyx.connect({
        key: ONYXKEYS.REAUTHENTICATING,
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

            // Otherwise let's refresh the authToken by calling reauthenticate
            reauthenticate();
        }
    });

    // Used to prevent calling CreateLogin more than once since this callback is triggered when we set
    // authToken, loading, error, etc
    Onyx.connect({
        key: ONYXKEYS.SESSION,
        callback: (session) => {
            // If we have an authToken but no login, it's the users first time signing in and we need to
            // create a login for the user, so when the authToken expires we can get a new one with said login
            const hasLogin = credentials && credentials.login;
            if (!session || !session.authToken || hasLogin) {
                return;
            }

            createLogin();
        },
    });
}

export default {
    init,
};
