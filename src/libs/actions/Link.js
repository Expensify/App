import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../ONYXKEYS';
import Growl from '../Growl';
import * as Localize from '../Localize';
import CONST from '../../CONST';
import * as DeprecatedAPI from '../deprecatedAPI';
import CONFIG from '../../CONFIG';
import asyncOpenURL from '../asyncOpenURL';

let isNetworkOffline = false;
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: val => isNetworkOffline = lodashGet(val, 'isOffline', false),
});

let currentUserEmail;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: val => currentUserEmail = lodashGet(val, 'email', ''),
});

/**
 * @returns {Boolean}
 */
function showGrowlIfOffline() {
    if (isNetworkOffline) {
        Growl.show(Localize.translateLocal('session.offlineMessageRetry'), CONST.GROWL.WARNING);
    }
    return isNetworkOffline;
}

/**
 * @param {String} url
 */
function openOldDotLink(url) {
    if (showGrowlIfOffline()) {
        return;
    }

    function buildOldDotURL({shortLivedAuthToken}) {
        const hasHashParams = url.indexOf('#') !== -1;
        const hasURLParams = url.indexOf('?') !== -1;

        // If the URL contains # or ?, we can assume they don't need to have the `?` token to start listing url parameters.
        return `${CONFIG.EXPENSIFY.EXPENSIFY_URL}${url}${hasHashParams || hasURLParams ? '&' : '?'}authToken=${shortLivedAuthToken}&email=${encodeURIComponent(currentUserEmail)}`;
    }

    asyncOpenURL(DeprecatedAPI.GetShortLivedAuthToken(), buildOldDotURL);
}

/**
 * @param {String} url
 */
function openExternalLink(url) {
    if (showGrowlIfOffline()) {
        return;
    }

    asyncOpenURL(Promise.resolve(), url);
}

export {
    openOldDotLink,
    openExternalLink,
};
