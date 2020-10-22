import Ion from '../Ion';
import IONKEYS from '../../IONKEYS';
import ROUTES from '../../ROUTES';
import {redirect} from './App';
import * as Pusher from '../Pusher/pusher';
import NetworkConnection from '../NetworkConnection';
import UnreadIndicatorUpdater from '../UnreadIndicatorUpdater';
import PushNotification from '../Notification/PushNotification';

let currentURL;
Ion.connect({
    key: IONKEYS.CURRENT_URL,
    callback: val => currentURL = val,
});
let currentlyViewedReportID;
Ion.connect({
    key: IONKEYS.CURRENTLY_VIEWED_REPORTID,
    callback: val => currentlyViewedReportID = val,
});

/**
 * Clears the Ion store, redirects to the sign in page and handles adding any exitTo params to the URL.
 * Normally this method would live in Session.js, but that would cause a circular dependency with Network.js.
 *
 * @param {String} [errorMessage] error message to be displayed on the sign in page
 */
function redirectToSignIn(errorMessage) {
    NetworkConnection.stopListeningForReconnect();
    UnreadIndicatorUpdater.stopListeningForReportChanges();
    PushNotification.deregister();
    Pusher.disconnect();

    if (!currentURL) {
        return;
    }

    // If there is already an exitTo, or has the URL of signin, don't redirect
    if (currentURL.indexOf('exitTo') !== -1 || currentURL.indexOf('signin') !== -1) {
        return;
    }

    // Save the reportID before calling redirect or otherwise when clear
    // is finished the value saved here will already be null
    const reportID = currentlyViewedReportID;

    // When the URL is at the root of the site, go to sign-in, otherwise add the exitTo
    const urlWithExitTo = currentURL === ROUTES.ROOT
        ? ROUTES.SIGNIN
        : ROUTES.getSigninWithExitToRoute(currentURL);
    redirect(urlWithExitTo);
    Ion.clear().then(() => {
        if (errorMessage) {
            Ion.set(IONKEYS.SESSION, {error: errorMessage});
        }
        if (reportID) {
            Ion.set(IONKEYS.CURRENTLY_VIEWED_REPORTID, reportID);
        }
    });
}

export default redirectToSignIn;
