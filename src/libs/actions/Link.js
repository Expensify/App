import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import {Linking} from 'react-native';
import ONYXKEYS from '../../ONYXKEYS';
import Growl from '../Growl';
import * as Localize from '../Localize';
import CONST from '../../CONST';
import * as API from '../API';
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
        return `${CONFIG.EXPENSIFY.EXPENSIFY_URL}${url}${url.indexOf('?') === -1 ? '?' : '&'}authToken=${shortLivedAuthToken}&email=${encodeURIComponent(currentUserEmail)}`;
    }

    asyncOpenURL(API.GetShortLivedAuthToken(), buildOldDotURL);
}

/**
 * @param {String} url
 */
function openExternalLink(url) {
    if (showGrowlIfOffline()) {
        return;
    }

    Linking.openURL(url);
}

export {
    openOldDotLink,
    openExternalLink,
};
