import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as MainQueue from '../Network/MainQueue';
import DateUtils from '../DateUtils';
import * as Localize from '../Localize';

let currentActiveClients;
Onyx.connect({
    key: ONYXKEYS.ACTIVE_CLIENTS,
    callback: (val) => {
        currentActiveClients = !val ? [] : val;
    },
});

let currentPreferredLocale;
Onyx.connect({
    key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    callback: val => currentPreferredLocale = val,
});

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
    const activeClients = currentActiveClients;
    const preferredLocale = currentPreferredLocale;
    const isOffline = currentIsOffline;
    const shouldForceOffline = currentShouldForceOffline;

    // Clearing storage discards the authToken. This causes a redirect to the SignIn screen
    Onyx.clear()
        .then(() => {
            if (preferredLocale) {
                Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, preferredLocale);
            }
            if (activeClients && activeClients.length > 0) {
                Onyx.set(ONYXKEYS.ACTIVE_CLIENTS, activeClients);
            }

            // After signing out, set ourselves as offline if we were offline before logging out and we are not forcing it.
            // If we are forcing offline, ignore it while signed out, otherwise it would require a refresh because there's no way to toggle the switch to go back online while signed out.
            if (isOffline && !shouldForceOffline) {
                Onyx.set(ONYXKEYS.NETWORK, {isOffline});
            }

            // `Onyx.clear` reinitialize the Onyx instance with initial values so use `Onyx.merge` instead of `Onyx.set`
            if (errorMessage) {
                Onyx.merge(ONYXKEYS.SESSION, {errors: {[DateUtils.getMicroseconds()]: Localize.translateLocal(errorMessage)}});
            }
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
    clearStorageAndRedirect(errorMessage);
}

export default redirectToSignIn;
