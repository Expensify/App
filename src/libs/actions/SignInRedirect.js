import Onyx from 'react-native-onyx';
import SignoutManager from '../../components/SignoutManager';
import ONYXKEYS from '../../ONYXKEYS';

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
 * @returns {Promise}
 */
function clearStorageAndRedirect(errorMessage) {
    const activeClients = currentActiveClients;
    const preferredLocale = currentPreferredLocale;

    // Clearing storage discards the authToken. This causes a redirect to the SignIn screen
    return Onyx.clear()
        .then(() => {
            const promises = [];

            if (preferredLocale) {
                promises.push(Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, preferredLocale));
            }
            if (activeClients && activeClients.length > 0) {
                promises.push(Onyx.set(ONYXKEYS.ACTIVE_CLIENTS, activeClients));
            }

            // `Onyx.clear` reinitialize the Onyx instance with initial values so use `Onyx.merge` instead of `Onyx.set`.
            promises.push(Onyx.merge(ONYXKEYS.SESSION, {error: errorMessage}));
            return Promise.all(promises);
        });
}

SignoutManager.registerSignoutCallback(clearStorageAndRedirect);

/**
 * Clears the Onyx store and redirects to the sign in page.
 * Normally this method would live in Session.js, but that would cause a circular dependency with Network.js.
 *
 * @param {String} [errorMessage] error message to be displayed on the sign in page
 */
function redirectToSignIn(errorMessage) {
    SignoutManager.signOut(errorMessage);
}

export default redirectToSignIn;
