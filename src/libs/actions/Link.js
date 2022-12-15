import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import {Linking} from 'react-native';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import Growl from '../Growl';
import Localize from '../Localize';
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
    /**
     * @param {String} [shortLivedAuthToken]
     * @returns {String}
     */
    function buildOldDotURL(shortLivedAuthToken) {
        const hasHashParams = url.indexOf('#') !== -1;
        const hasURLParams = url.indexOf('?') !== -1;

        const authTokenParam = shortLivedAuthToken ? `authToken=${shortLivedAuthToken}` : '';
        const emailParam = `email=${encodeURIComponent(currentUserEmail)}`;

        const params = _.compact([authTokenParam, emailParam]).join('&');

        // If the URL contains # or ?, we can assume they don't need to have the `?` token to start listing url parameters.
        return `${CONFIG.EXPENSIFY.EXPENSIFY_URL}${url}${hasHashParams || hasURLParams ? '&' : '?'}${params}`;
    }

    if (isNetworkOffline) {
        Linking.openURL(buildOldDotURL());
        return;
    }

    // If shortLivedAuthToken is not accessible, fallback to opening the link without the token.
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.makeRequestWithSideEffects(
        'OpenOldDotLink', {}, {},
    ).then((response) => {
        Linking.openURL(buildOldDotURL(response.shortLivedAuthToken));
    }).catch(() => {
        Linking.openURL(buildOldDotURL());
    });
}

/**
 * @param {String} url
 * @param {Boolean} shouldSkipCustomSafariLogic When true, we will use `Linking.openURL` even if the browser is Safari.
 */
function openExternalLink(url, shouldSkipCustomSafariLogic = false) {
    if (showGrowlIfOffline()) {
        return;
    }

    asyncOpenURL(Promise.resolve(), url, shouldSkipCustomSafariLogic);
}

export {
    openOldDotLink,
    openExternalLink,
};
