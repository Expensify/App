import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import {Linking} from 'react-native';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import Growl from '../Growl';
import * as Localize from '../Localize';
import CONST from '../../CONST';
import asyncOpenURL from '../asyncOpenURL';
import * as API from '../API';
import * as Environment from '../Environment/Environment';
import * as Url from '../Url';

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
     * @returns {Promise<string>}
     */
    function buildOldDotURL(shortLivedAuthToken) {
        const hasHashParams = url.indexOf('#') !== -1;
        const hasURLParams = url.indexOf('?') !== -1;

        const authTokenParam = shortLivedAuthToken ? `authToken=${shortLivedAuthToken}` : '';
        const emailParam = `email=${encodeURIComponent(currentUserEmail)}`;

        const params = _.compact([authTokenParam, emailParam]).join('&');

        return Environment.getOldDotEnvironmentURL()
            .then((environmentURL) => {
                const oldDotDomain = Url.addTrailingForwardSlash(environmentURL);

                // If the URL contains # or ?, we can assume they don't need to have the `?` token to start listing url parameters.
                return `${oldDotDomain}${url}${hasHashParams || hasURLParams ? '&' : '?'}${params}`;
            });
    }

    if (isNetworkOffline) {
        buildOldDotURL().then(oldDotURL => Linking.openURL(oldDotURL));
        return;
    }

    // If shortLivedAuthToken is not accessible, fallback to opening the link without the token.
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.makeRequestWithSideEffects(
        'OpenOldDotLink', {}, {},
    ).then((response) => {
        buildOldDotURL(response.shortLivedAuthToken).then((oldDotUrl) => {
            Linking.openURL(oldDotUrl);
        });
    }).catch(() => {
        buildOldDotURL().then((oldDotUrl) => {
            Linking.openURL(oldDotUrl);
        });
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
