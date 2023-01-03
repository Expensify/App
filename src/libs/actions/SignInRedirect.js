import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as MainQueue from '../Network/MainQueue';
import DateUtils from '../DateUtils';
import * as Localize from '../Localize';
import * as PersistedRequests from './PersistedRequests';
import NetworkConnection from '../NetworkConnection';
import Timing from './Timing';

let currentIsOffline;
let currentShouldForceOffline;
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: (network) => {
        if (!network) {
            return;
        }
        currentIsOffline = network.isOffline;
        currentShouldForceOffline = Boolean(network.shouldForceOffline);
    },
});

/**
 * @param {String} errorMessage
 */
function clearStorageAndRedirect(errorMessage) {
    // Under certain conditions, there are key-values we'd like to keep in storage even when a user is logged out.
    // We pass these into the clear() method in order to avoid having to reset them on a delayed tick and getting
    // flashes of unwanted default state.
    const keysToPreserve = [];
    keysToPreserve.push(ONYXKEYS.NVP_PREFERRED_LOCALE);
    keysToPreserve.push(ONYXKEYS.ACTIVE_CLIENTS);

    // After signing out, set ourselves as offline if we were offline before logging out and we are not forcing it.
    // If we are forcing offline, ignore it while signed out, otherwise it would require a refresh because there's no way to toggle the switch to go back online while signed out.
    if (currentIsOffline && !currentShouldForceOffline) {
        keysToPreserve.push(ONYXKEYS.NETWORK);
    }

    Onyx.clear(keysToPreserve)
        .then(() => {
            if (!errorMessage) {
                return;
            }

            // `Onyx.clear` reinitializes the Onyx instance with initial values so use `Onyx.merge` instead of `Onyx.set`
            Onyx.merge(ONYXKEYS.SESSION, {errors: {[DateUtils.getMicroseconds()]: Localize.translateLocal(errorMessage)}});
        });
}

/**
 * Cleanup actions resulting in the user being redirected to the Sign-in page
 * - Clears the Onyx store - removing the authToken redirects the user to the Sign-in page
 * - Cancels pending network calls - any lingering requests are discarded to prevent unwanted storage writes
 *
 * Normally this method would live in Session.js, but that would cause a circular dependency with Network.js.
 *
 * @param {String} [errorMessage] error message to be displayed on the sign in page
 */
function redirectToSignIn(errorMessage) {
    MainQueue.clear();
    PersistedRequests.clear();
    NetworkConnection.clearReconnectionCallbacks();
    clearStorageAndRedirect(errorMessage);
}

export default redirectToSignIn;
