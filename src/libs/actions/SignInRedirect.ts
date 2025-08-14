import Onyx from 'react-native-onyx';
import {getMicroSecondOnyxErrorWithMessage} from '@libs/ErrorUtils';
import {clearSessionStorage} from '@libs/Navigation/helpers/lastVisitedTabPathUtils';
import type {OnyxKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import {clearAllPolicies} from './Policy/Policy';

function clearStorageAndRedirect(
    {errorMessage, isOffline, shouldForceOffline}: {errorMessage?: string; isOffline: boolean | undefined; shouldForceOffline: boolean | undefined} = {
        isOffline: undefined,
        shouldForceOffline: undefined,
    },
): Promise<void> {
    // Under certain conditions, there are key-values we'd like to keep in storage even when a user is logged out.
    // We pass these into the clear() method in order to avoid having to reset them on a delayed tick and getting
    // flashes of unwanted default state.
    const keysToPreserve: OnyxKey[] = [];
    keysToPreserve.push(ONYXKEYS.NVP_PREFERRED_LOCALE);
    keysToPreserve.push(ONYXKEYS.ARE_TRANSLATIONS_LOADING);
    keysToPreserve.push(ONYXKEYS.PREFERRED_THEME);
    keysToPreserve.push(ONYXKEYS.ACTIVE_CLIENTS);
    keysToPreserve.push(ONYXKEYS.DEVICE_ID);
    keysToPreserve.push(ONYXKEYS.ACCOUNT);

    // After signing out, set ourselves as offline if we were offline before logging out and we are not forcing it.
    // If we are forcing offline, ignore it while signed out, otherwise it would require a refresh because there's no way to toggle the switch to go back online while signed out.
    if (isOffline && !shouldForceOffline) {
        keysToPreserve.push(ONYXKEYS.NETWORK);
    }

    return Onyx.clear(keysToPreserve).then(() => {
        clearAllPolicies();
        if (!errorMessage) {
            return;
        }

        // `Onyx.clear` reinitializes the Onyx instance with initial values so use `Onyx.merge` instead of `Onyx.set`
        Onyx.merge(ONYXKEYS.SESSION, {errors: getMicroSecondOnyxErrorWithMessage(errorMessage)});
    });
}

/**
 * Cleanup actions resulting in the user being redirected to the Sign-in page
 * - Clears the Onyx store - removing the authToken redirects the user to the Sign-in page
 *
 * Normally this method would live in Session.js, but that would cause a circular dependency with Network.js.
 *
 * @param params - Object containing redirect parameters
 * @param [params.errorMessage] error message to be displayed on the sign in page
 * @param [params.isOffline] current offline status
 * @param [params.shouldForceOffline] whether offline mode is being forced
 */
function redirectToSignIn(
    {errorMessage, isOffline, shouldForceOffline}: {errorMessage?: string; isOffline: boolean | undefined; shouldForceOffline: boolean | undefined} = {
        isOffline: undefined,
        shouldForceOffline: undefined,
    },
): Promise<void> {
    return clearStorageAndRedirect({errorMessage, isOffline, shouldForceOffline}).then(() => {
        clearSessionStorage();
    });
}

export default redirectToSignIn;
