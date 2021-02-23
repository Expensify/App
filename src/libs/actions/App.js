import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import ROUTES from '../../ROUTES';
import Navigation from '../Navigation/Navigation';

let currentlyViewedReportID;
Onyx.connect({
    key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
    callback: val => currentlyViewedReportID = val,
});

/**
 * Redirect the app to a new page by updating the state in Onyx
 *
 * @param {*} url
 */
function redirect(url) {
    Navigation.navigate(url);
}

/**
 * Redirects to the last report that was in view.
 */
function redirectToLastReport() {
    if (!currentlyViewedReportID) {
        redirect(ROUTES.HOME);
        return;
    }

    redirect(ROUTES.getReportRoute(currentlyViewedReportID));
}

export {
    redirectToLastReport,
    redirect,
};
