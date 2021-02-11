import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import ROUTES from '../../ROUTES';
import Navigator from '../../Navigator';
import * as Pusher from '../Pusher/pusher';
import NetworkConnection from '../NetworkConnection';
import UnreadIndicatorUpdater from '../UnreadIndicatorUpdater';
import PushNotification from '../Notification/PushNotification';

let currentRoute;
Onyx.connect({
    key: ONYXKEYS.CURRENT_ROUTE,
    callback: val => currentRoute = val,
});
let currentlyViewedReportID;
Onyx.connect({
    key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
    callback: val => currentlyViewedReportID = val,
});

/**
 * Clears the Onyx store, redirects to the sign in page and handles adding any exitTo params to the URL.
 * Normally this method would live in Session.js, but that would cause a circular dependency with Network.js.
 *
 * @param {String} [errorMessage] error message to be displayed on the sign in page
 */
function redirectToSignIn(errorMessage) {
    NetworkConnection.stopListeningForReconnect();
    UnreadIndicatorUpdater.stopListeningForReportChanges();
    PushNotification.deregister();
    Pusher.disconnect();

    if (!currentRoute) {
        return;
    }

    // Save the reportID before calling redirect or otherwise when clear
    // is finished the value saved here will already be null
    const reportID = currentlyViewedReportID;

    // When the URL is at the root of the site, go to sign-in, otherwise add the exitTo
    Navigator.navigate(ROUTES.HOME);
    Onyx.clear().then(() => {
        if (errorMessage) {
            Onyx.set(ONYXKEYS.SESSION, {error: errorMessage});
        }
        if (reportID) {
            Onyx.set(ONYXKEYS.CURRENTLY_VIEWED_REPORTID, reportID);
        }
    });
}

export default redirectToSignIn;
