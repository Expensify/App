import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as Pusher from '../Pusher/pusher';
import UnreadIndicatorUpdater from '../UnreadIndicatorUpdater';
import PushNotification from '../Notification/PushNotification';
import Timers from '../Timers';

let currentURL;
Onyx.connect({
    key: ONYXKEYS.CURRENT_URL,
    callback: val => currentURL = val,
});

let currentActiveClients;
Onyx.connect({
    key: ONYXKEYS.ACTIVE_CLIENTS,
    callback: (val) => {
        currentActiveClients = !val ? [] : val;
    },
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
    Pusher.disconnect();
    Timers.clearAll();

    if (!currentURL) {
        return;
    }

    const activeClients = currentActiveClients;

    // We must set the authToken to null so we can navigate to "signin" it's not possible to navigate to the route as
    // it only exists when the authToken is null.
    Onyx.set(ONYXKEYS.SESSION, {authToken: null})
        .then(() => {
            Onyx.clear().then(() => {
                if (errorMessage) {
                    Onyx.set(ONYXKEYS.SESSION, {error: errorMessage});
                }
                if (activeClients && activeClients.length > 0) {
                    Onyx.set(ONYXKEYS.ACTIVE_CLIENTS, activeClients);
                }
            });
        });
}

export default redirectToSignIn;
