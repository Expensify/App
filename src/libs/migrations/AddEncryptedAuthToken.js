/* eslint-disable rulesdir/no-api-in-views */
import _ from 'underscore';
import Onyx from 'react-native-onyx';
import Log from '../Log';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';

/**
 * This migration adds an encryptedAuthToken to the SESSION key, if it is not present.
 *
 * @returns {Promise}
 */
export default function () {
    return new Promise((resolve) => {
        const connectionID = Onyx.connect({
            key: ONYXKEYS.SESSION,
            callback: (session) => {
                Onyx.disconnect(connectionID);

                if (session && !_.isEmpty(session.encryptedAuthToken)) {
                    Log.info('[Migrate Onyx] Skipped migration AddEncryptedAuthToken');
                    return resolve();
                }

                if (!session || !session.authToken) {
                    Log.info('[Migrate Onyx] Skipped migration AddEncryptedAuthToken');
                    return resolve();
                }

                // If there is an auth token but no encrypted auth token, reauthenticate.
                if (session.authToken && _.isUndefined(session.encryptedAuthToken)) {
                    return API.reauthenticate('Onyx_Migration_AddEncryptedAuthToken')
                        .then(() => {
                            Log.info('[Migrate Onyx] Ran migration AddEncryptedAuthToken');
                            return resolve();
                        });
                }

                return resolve();
            },
        });
    });
}
