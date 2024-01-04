/* eslint-disable rulesdir/prefer-onyx-connect-in-libs */
import Onyx from 'react-native-onyx';
import E2EClient from '@libs/E2E/client';
import * as Session from '@userActions/Session';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Command for e2e test to automatically sign in a user.
 * If the user is already logged in the function will simply
 * resolve.
 *
 * @return Resolved true when the user was actually signed in. Returns false if the user was already logged in.
 */
export default function (email = 'expensify.testuser@trashmail.de'): Promise<boolean> {
    const waitForBeginSignInToFinish = (): Promise<void> =>
        new Promise((resolve) => {
            const id = Onyx.connect({
                key: ONYXKEYS.CREDENTIALS,
                callback: (credentials) => {
                    // beginSignUp writes to credentials.login once the API call is complete
                    if (!credentials?.login) {
                        return;
                    }

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
                if (session?.authToken == null || session.authToken.length === 0) {
                    neededLogin = true;

                    // authenticate with a predefined user
                    console.debug('[E2E] Signing in…');
                    Session.beginSignIn(email);
                    console.debug('[E2E] Waiting for sign in to finish…');
                    waitForBeginSignInToFinish().then(() => {
                        // Get OTP code
                        console.debug('[E2E] Waiting for OTP…');
                        E2EClient.getOTPCode().then((otp) => {
                            // Complete sign in
                            console.debug('[E2E] Completing sign in with otp code', otp);
                            Session.signIn(otp);
                        });
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
