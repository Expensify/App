import Onyx from 'react-native-onyx';
import _ from 'underscore';
import {Linking} from 'react-native';
import ONYXKEYS from '../../ONYXKEYS';
import Growl from '../Growl';
import {translateLocal} from '../translate';
import CONST from '../../CONST';
import * as API from '../API';
import CONFIG from '../../CONFIG';
import asyncOpenURL from '../asyncOpenURL';

let isNetworkOffline = false;
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: val => isNetworkOffline = _.get(val, 'isOffline', false),
});

let currentUserEmail;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: val => currentUserEmail = _.get(val, 'email', ''),
});

/**
 * @returns {Boolean}
 */
function showGrowlIfOffline() {
    if (isNetworkOffline) {
        Growl.show(translateLocal('session.offlineMessageRetry'), CONST.GROWL.WARNING);
    }
    return isNetworkOffline;
}

/**
 * @param {String} url
 */
function openOldDotLink(url) {
    if (!showGrowlIfOffline()) {
        // eslint-disable-next-line max-len
        const buildOldDotURL = ({shortLivedAuthToken}) => `${CONFIG.EXPENSIFY.URL_EXPENSIFY_COM}${url}${url.indexOf('?') === -1 ? '?' : '&'}authToken=${shortLivedAuthToken}&email=${encodeURIComponent(currentUserEmail)}`;
        asyncOpenURL(API.GetShortLivedAuthToken(), buildOldDotURL);
    }
}

/**
 * @param {String} url
 */
function openExternalLink(url) {
    if (!showGrowlIfOffline()) {
        Linking.openURL(url);
    }
}

export {
    openOldDotLink,
    openExternalLink,
};
