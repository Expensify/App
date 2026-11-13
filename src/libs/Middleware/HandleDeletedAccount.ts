import {signOutAndRedirectToSignIn} from '@libs/actions/Session';
import type {Middleware} from '@libs/Request';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Session} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

let session: OnyxEntry<Session>;

// Use connectWithoutView since middleware runs outside React and needs the session when the deleted-account response arrives
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        session = value;
    },
});

/**
 * Handles the case when the user's copilot has been deleted.
 * If the response contains jsonCode 408 and a message indicating copilot deletion,
 * the function signs the user out and redirects them to the sign-in page.
 */

const handleDeletedAccount: Middleware = (requestResponse) =>
    requestResponse.then((response) => {
        if (response?.jsonCode !== 408 || !response?.message?.includes('The account you are trying to use is deleted.')) {
            return response;
        }
        signOutAndRedirectToSignIn(session, true, false, true, true, CONST.SIGN_OUT_REASON.ACCOUNT_DELETED);
    });

export default handleDeletedAccount;
