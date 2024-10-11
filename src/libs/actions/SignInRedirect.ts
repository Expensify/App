import Onyx from 'react-native-onyx';
import * as ErrorUtils from '@libs/ErrorUtils';
import type {OnyxKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import * as Policy from './Policy/Policy';

let currentIsOffline: boolean | undefined;
let currentShouldForceOffline: boolean | undefined;
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: (network) => {
        currentIsOffline = network?.isOffline;
        currentShouldForceOffline = network?.shouldForceOffline;
    },
});

function clearStorageAndRedirect(errorMessage?: string): Promise<void> {
    // Under certain conditions, there are key-values we'd like to keep in storage even when a user is logged out.
    // We pass these into the clear() method in order to avoid having to reset them on a delayed tick and getting
    // flashes of unwanted default state.
    const keysToPreserve: OnyxKey[] = [];
    keysToPreserve.push(ONYXKEYS.NVP_PREFERRED_LOCALE);
    keysToPreserve.push(ONYXKEYS.ACTIVE_CLIENTS);
    keysToPreserve.push(ONYXKEYS.DEVICE_ID);

    // After signing out, set ourselves as offline if we were offline before logging out and we are not forcing it.
    // If we are forcing offline, ignore it while signed out, otherwise it would require a refresh because there's no way to toggle the switch to go back online while signed out.
    if (currentIsOffline && !currentShouldForceOffline) {
        keysToPreserve.push(ONYXKEYS.NETWORK);
    }

    return Onyx.clear(keysToPreserve).then(() => {
        Policy.clearAllPolicies();
        if (!errorMessage) {
            return;
        }

        // `Onyx.clear` reinitializes the Onyx instance with initial values so use `Onyx.merge` instead of `Onyx.set`
        Onyx.merge(ONYXKEYS.SESSION, {errors: ErrorUtils.getMicroSecondOnyxErrorWithMessage(errorMessage)});
    });
}

/**
 * Cleanup actions resulting in the user being redirected to the Sign-in page
 * - Clears the Onyx store - removing the authToken redirects the user to the Sign-in page
 *
 * Normally this method would live in Session.js, but that would cause a circular dependency with Network.js.
 *
 * @param [errorMessage] error message to be displayed on the sign in page
 */
function redirectToSignIn(errorMessage?: string): Promise<void> {
    return clearStorageAndRedirect(errorMessage);
}

export default redirectToSignIn;
