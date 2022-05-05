import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import * as MainQueue from '../Network/MainQueue';
import Log from '../Log';

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

let testClearValue;
Onyx.connect({
    key: ONYXKEYS.DEFAULT_CLEAR_KEY,
    callback: val => testClearValue = val,
});

/**
 * @param {String} errorMessage
 */
function clearStorageAndRedirect(errorMessage) {
    const activeClients = currentActiveClients;
    const preferredLocale = currentPreferredLocale;

    const mergedValue = {value: 42};

    // Clearing storage discards the authToken. This causes a redirect to the SignIn screen
    Log.info('Clearing Onyx');
    const afterClear = Onyx.clear()
        .then(() => Log.info('Done clearing Onyx'));

    // Merge immediately after clear
    Log.info('Calling Onyx.merge');
    const afterMerge = Onyx.merge(ONYXKEYS.DEFAULT_CLEAR_KEY, mergedValue)
        .then(() => Log.info('Value stored from merge'));

    Promise.all([afterClear, afterMerge])
        .then(() => {
            console.assert(_.isEqual(testClearValue, mergedValue), {
                testClearValue,
                mergedValue,
                errorMessage: "[Onyx test] Onyx value doesn't match the value merged after clearing.",
            });
            const cachedValue = Onyx.getValueFromCache(ONYXKEYS.DEFAULT_CLEAR_KEY);
            Onyx.getValueFromStorage(ONYXKEYS.DEFAULT_CLEAR_KEY)
                .then((storedValue) => {
                    console.assert(_.isEqual(cachedValue, storedValue), {
                        cachedValue,
                        storedValue,
                        errorMessage: "[Onyx test] The cached value doesn't match the stored value when merging after clearing.",
                    });
                });
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
