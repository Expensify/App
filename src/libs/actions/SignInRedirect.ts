import HybridAppModule from '@expensify/react-native-hybrid-app';
import Onyx from 'react-native-onyx';
import {getMicroSecondOnyxErrorWithMessage} from '@libs/ErrorUtils';
import {clearSessionStorage} from '@libs/Navigation/helpers/lastVisitedTabPathUtils';
import CONFIG from '@src/CONFIG';
import type {OnyxKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import {resetSignInFlow} from './HybridApp';
import {clearAllPolicies} from './Policy/Policy';

let currentIsOffline: boolean | undefined;
let currentShouldForceOffline: boolean | undefined;
let currentIsUsingImportedState: boolean | undefined;

// We use connectWithoutView here because we only need to track network state for sign-in redirect logic, which is not connected to any changes on the UI layer
Onyx.connectWithoutView({
    key: ONYXKEYS.NETWORK,
    callback: (network) => {
        currentIsOffline = network?.isOffline;
        currentShouldForceOffline = network?.shouldForceOffline;
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.IS_USING_IMPORTED_STATE,
    callback: (value) => {
        currentIsUsingImportedState = value;
    },
});

function clearStorageAndRedirect(errorMessage?: string): Promise<void> {
    // Under certain conditions, there are key-values we'd like to keep in storage even when a user is logged out.
    // We pass these into the clear() method in order to avoid having to reset them on a delayed tick and getting
    // flashes of unwanted default state.
    const keysToPreserve: OnyxKey[] = [];
    keysToPreserve.push(ONYXKEYS.NVP_PREFERRED_LOCALE);
    keysToPreserve.push(ONYXKEYS.ARE_TRANSLATIONS_LOADING);
    keysToPreserve.push(ONYXKEYS.PREFERRED_THEME);
    keysToPreserve.push(ONYXKEYS.ACTIVE_CLIENTS);
    keysToPreserve.push(ONYXKEYS.DEVICE_ID);
    keysToPreserve.push(ONYXKEYS.SHOULD_USE_STAGING_SERVER);
    keysToPreserve.push(ONYXKEYS.IS_DEBUG_MODE_ENABLED);

    // After signing out, set ourselves as offline if we were offline before logging out and we are not forcing it.
    // If we are forcing offline, ignore it while signed out, otherwise it would require a refresh because there's no way to toggle the switch to go back online while signed out.
    if (currentIsOffline && !currentShouldForceOffline) {
        keysToPreserve.push(ONYXKEYS.NETWORK);
    }

    // When using imported state, preserve both the flag and the network state (which has shouldForceOffline=true).
    // This prevents the app from getting stuck in infinite loading when HybridApp transitions from OldDot to NewDot.
    if (currentIsUsingImportedState) {
        keysToPreserve.push(ONYXKEYS.IS_USING_IMPORTED_STATE);
        keysToPreserve.push(ONYXKEYS.NETWORK);
    }

    return Onyx.clear(keysToPreserve).then(() => {
        if (CONFIG.IS_HYBRID_APP) {
            resetSignInFlow();
            HybridAppModule.signOutFromOldDot();
        }
        clearAllPolicies();

        // When logging out from imported state, reset shouldForceOffline to false and clear the imported state flag
        // so the user can log back in
        if (currentIsUsingImportedState) {
            Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: false});
            Onyx.merge(ONYXKEYS.IS_USING_IMPORTED_STATE, false);
        }

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
 * @param [errorMessage] error message to be displayed on the sign in page
 */
function redirectToSignIn(errorMessage?: string): Promise<void> {
    return clearStorageAndRedirect(errorMessage).then(() => {
        clearSessionStorage();
    });
}

export default redirectToSignIn;
