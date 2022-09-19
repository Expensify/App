import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import {Linking} from 'react-native';
import ONYXKEYS from '../../ONYXKEYS';
import Growl from '../Growl';
import * as Localize from '../Localize';
import CONST from '../../CONST';
import CONFIG from '../../CONFIG';
import asyncOpenURL from '../asyncOpenURL';
import * as API from '../API';

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

    function buildOldDotURL(shortLivedAuthToken) {
        const hasHashParams = url.indexOf('#') !== -1;
        const hasURLParams = url.indexOf('?') !== -1;

        // If the URL contains # or ?, we can assume they don't need to have the `?` token to start listing url parameters.
        return `${CONFIG.EXPENSIFY.EXPENSIFY_URL}${url}${hasHashParams || hasURLParams ? '&' : '?'}authToken=${shortLivedAuthToken}&email=${encodeURIComponent(currentUserEmail)}`;
    }

    // We use makeRequestWithSideEffects here because we need to block until after we get the shortLivedAuthToken back from the server (link won't work without it!).
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.makeRequestWithSideEffects(
        'OpenOldDotLink', {}, {},
    ).then((response) => {
        if (response.jsonCode === 200) {
            Linking.openURL(buildOldDotURL(response.shortLivedAuthToken));
        } else {
            Growl.show(response.message, CONST.GROWL.WARNING);
        }
    });
}

/**
 * @param {String} url
 * @param {Boolean} skipCheck
 */
function openExternalLink(url, skipCheck = false) {
    if (showGrowlIfOffline()) {
        return;
    }

    asyncOpenURL(Promise.resolve(), url, skipCheck);
}

export {
    openOldDotLink,
    openExternalLink,
};
