/* eslint-disable rulesdir/prefer-onyx-connect-in-libs */
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import * as Session from '../../actions/Session';

/**
 * Command for e2e test to automatically sign in a user.
 * If the user is already logged in the function will simply
 * resolve.
 *
 * @param {String} email
 * @param {String} password
 * @return {Promise<boolean>} Resolved true when the user was actually signed in. Returns false if the user was already logged in.
 */
export default function (email = 'fake@email.com', password = 'Password123') {
    const waitForBeginSignInToFinish = () => new Promise((resolve) => {
        const id = Onyx.connect({
            key: ONYXKEYS.CREDENTIALS,
            callback: (credentials) => {
                // beginSignUp writes to credentials.login once the API call is complete
                if (!credentials.login) { return; }

                resolve();
                Onyx.disconnect(id);
            },
        });
    });

    let neededLogin = false;

    // Subscribe to auth token, to check if we are authenticated
    return new Promise((resolve) => {
        const connectionId = Onyx.connect({
            key: ONYXKEYS.SESSION,
            callback: (session) => {
                if (session.authToken == null || session.authToken.length === 0) {
                    neededLogin = true;

                    // authenticate with a predefined user
                    Session.beginSignIn(email);
                    waitForBeginSignInToFinish().then(() => {
                        Session.signIn(password);
                    });
                } else {
                    // signal that auth was completed
                    resolve(neededLogin);
                    Onyx.disconnect(connectionId);
                }
            },
        });
    });
}
