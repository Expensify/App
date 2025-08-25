import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {signOutAndRedirectToSignIn} from '@libs/actions/Session';
import {isOffline} from '@libs/Network/NetworkStore';
import type {Middleware} from '@libs/Request';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Network} from '@src/types/onyx';

let networkState: OnyxEntry<Network>;
// We use connectWithoutView here because this is middleware-level functionality and is not connected with UI
Onyx.connectWithoutView({
    key: ONYXKEYS.NETWORK,
    callback: (network) => {
        networkState = network;
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
        signOutAndRedirectToSignIn({
            shouldResetToHome: true,
            shouldStashSession: false,
            shouldSignOutFromOldDot: false,
            shouldForceUseStashedSession: true,
            isOffline: isOffline(),
            shouldForceOffline: networkState?.shouldForceOffline,
        });
    });

export default handleDeletedAccount;
