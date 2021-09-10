import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as Pusher from '../Pusher/pusher';
import UnreadIndicatorUpdater from '../UnreadIndicatorUpdater';
import PushNotification from '../Notification/PushNotification';
import Timers from '../Timers';

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
 * Clears the Onyx store and redirects to the sign in page.
 * Normally this method would live in Session.js, but that would cause a circular dependency with Network.js.
 *
 * @param {String} [errorMessage] error message to be displayed on the sign in page
 */
function redirectToSignIn(errorMessage) {
    UnreadIndicatorUpdater.stopListeningForReportChanges();
    PushNotification.deregister();
    PushNotification.clearNotifications();
    Pusher.disconnect();
    Timers.clearAll();

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
            const session = {
                // We must set the authToken to null so that signOut action is triggered across other clients
                // https://github.com/Expensify/App/issues/4971#issuecomment-916101493
                authToken: null,
            };
            if (errorMessage) {
                session.error = errorMessage;
            }
            Onyx.merge(ONYXKEYS.SESSION, session);
        });
}

export default redirectToSignIn;
