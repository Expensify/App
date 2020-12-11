import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import ONYXKEYS from '../../ONYXKEYS';

let currentRedirectTo;
Onyx.connect({
    key: ONYXKEYS.APP_REDIRECT_TO,
    callback: val => currentRedirectTo = val,
});


/**
 * Redirect the app to a new page by updating the state in Onyx
 *
 * @param {*} url
 */
function redirect(url) {
    const formattedURL = Str.normalizeUrl(url);
    Onyx.merge(ONYXKEYS.APP_REDIRECT_TO, formattedURL);
}

/**
 * Keep the current route match stored in Onyx so other libs can access it
 * Also reset the app_redirect_to in Onyx so that if we go back to the current url the state will update
 *
 * @param {Object} match
 * @param {String} match.url
 */
function recordCurrentRoute({match}) {
    Onyx.merge(ONYXKEYS.CURRENT_URL, match.url);
    if (match.url === currentRedirectTo) {
        Onyx.merge(ONYXKEYS.APP_REDIRECT_TO, null);
    }
}

/**
 * When a report is being viewed, keep track of the report ID. This way when the user comes back to the app they will
 * be returned to the last report they were viewing.
 *
 * @param {Object} match
 * @param {Object} match.params
 * @param {String} match.params.reportID
 */
function recordCurrentlyViewedReportID({match}) {
    Onyx.merge(ONYXKEYS.CURRENTLY_VIEWED_REPORTID, match.params.reportID);
}

export {
    recordCurrentRoute,
    recordCurrentlyViewedReportID,
    redirect,
};
