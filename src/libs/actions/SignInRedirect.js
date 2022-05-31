import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as MainQueue from '../Network/MainQueue';

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

/**
 * @param {String} errorMessage
 */
function clearStorageAndRedirect(errorMessage) {
    const activeClients = currentActiveClients;
    const preferredLocale = currentPreferredLocale;

    // Clearing storage discards the authToken. This causes a redirect to the SignIn screen
    Onyx.clear()
        .then(() => {
            if (preferredLocale) {
                Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, preferredLocale);
            }
            if (activeClients && activeClients.length > 0) {
                Onyx.set(ONYXKEYS.ACTIVE_CLIENTS, activeClients);
            }

            // `Onyx.clear` reinitialize the Onyx instance with initial values so use `Onyx.merge` instead of `Onyx.set`.
            Onyx.merge(ONYXKEYS.SESSION, {error: errorMessage});
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
