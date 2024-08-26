/* eslint-disable rulesdir/prefer-actions-set-data */

/* eslint-disable rulesdir/prefer-onyx-connect-in-libs */
import Onyx from 'react-native-onyx';
import {Authenticate} from '@libs/Authentication';
import getConfigValueOrThrow from '@libs/E2E/utils/getConfigValueOrThrow';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';

const e2eUserCredentials = {
    email: getConfigValueOrThrow('EXPENSIFY_PARTNER_PASSWORD_EMAIL'),
    partnerUserID: getConfigValueOrThrow('EXPENSIFY_PARTNER_USER_ID'),
    partnerUserSecret: getConfigValueOrThrow('EXPENSIFY_PARTNER_USER_SECRET'),
    partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
    partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
};

/**
 * Command for e2e test to automatically sign in a user.
 * If the user is already logged in the function will simply
 * resolve.
 *
 * @return Resolved true when the user was actually signed in. Returns false if the user was already logged in.
 */
export default function (): Promise<boolean> {
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
    return new Promise((resolve, reject) => {
        const connection = Onyx.connect({
            key: ONYXKEYS.SESSION,
            callback: (session) => {
                if (session?.authToken == null || session.authToken.length === 0) {
                    neededLogin = true;

                    // authenticate with a predefined user
                    console.debug('[E2E] Signing in…');
                    Authenticate(e2eUserCredentials)
                        .then((response) => {
                            Onyx.merge(ONYXKEYS.SESSION, {
                                authToken: response.authToken,
                                email: e2eUserCredentials.email,
                            });
                            console.debug('[E2E] Signed in finished!');
                            return waitForBeginSignInToFinish();
                        })
                        .catch((error) => {
                            console.error('[E2E] Error while signing in', error);
                            reject(error);
                        });
                }
                // signal that auth was completed
                resolve(neededLogin);
                Onyx.disconnect(connection);
            },
        });
    });
}
