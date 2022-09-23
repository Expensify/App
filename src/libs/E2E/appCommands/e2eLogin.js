/* eslint-disable rulesdir/prefer-onyx-connect-in-libs */
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import * as Session from '../../actions/Session';

/**
 * Command for e2e test to automatically sign in a user
 * @return {Promise<void>} resolves when the user is signed in
 */
export default function () {
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

    // Subscribe to auth token, to check if we are authenticated
    return new Promise((resolve) => {
        const connectionId = Onyx.connect({
            key: ONYXKEYS.SESSION,
            callback: (session) => {
                if (session.authToken == null || session.authToken.length === 0) {
                    // authenticate with a predefined user
                    Session.beginSignIn('applausetester+perf2@applause.expensifail.com');
                    waitForBeginSignInToFinish().then(() => {
                        Session.signIn('Password123');
                    });
                } else {
                    // signal that auth was completed
                    resolve();
                    Onyx.disconnect(connectionId);
                }
            },
        });
    });
}
