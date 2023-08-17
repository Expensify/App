import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import asyncOpenURL from '../asyncOpenURL';
import * as API from '../API';
import * as Environment from '../Environment/Environment';
import * as Url from '../Url';

let isNetworkOffline = false;
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: (val) => (isNetworkOffline = lodashGet(val, 'isOffline', false)),
});

let currentUserEmail;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => (currentUserEmail = lodashGet(val, 'email', '')),
});

/**
 * @param {String} [url] the url path
 * @param {String} [shortLivedAuthToken]
 *
 * @returns {Promise<string>}
 */
function buildOldDotURL(url, shortLivedAuthToken) {
    const hasHashParams = url.indexOf('#') !== -1;
    const hasURLParams = url.indexOf('?') !== -1;

    const authTokenParam = shortLivedAuthToken ? `authToken=${shortLivedAuthToken}` : '';
    const emailParam = `email=${encodeURIComponent(currentUserEmail)}`;

    const params = _.compact([authTokenParam, emailParam]).join('&');

    return Environment.getOldDotEnvironmentURL().then((environmentURL) => {
        const oldDotDomain = Url.addTrailingForwardSlash(environmentURL);

        // If the URL contains # or ?, we can assume they don't need to have the `?` token to start listing url parameters.
        return `${oldDotDomain}${url}${hasHashParams || hasURLParams ? '&' : '?'}${params}`;
    });
}

/**
 * @param {String} url
 * @param {Boolean} shouldSkipCustomSafariLogic When true, we will use `Linking.openURL` even if the browser is Safari.
 */
function openExternalLink(url, shouldSkipCustomSafariLogic = false) {
    asyncOpenURL(Promise.resolve(), url, shouldSkipCustomSafariLogic);
}

/**
 * @param {String} url the url path
 */
function openOldDotLink(url) {
    if (isNetworkOffline) {
        buildOldDotURL(url).then((oldDotURL) => openExternalLink(oldDotURL));
        return;
    }

    // If shortLivedAuthToken is not accessible, fallback to opening the link without the token.
    asyncOpenURL(
        // eslint-disable-next-line rulesdir/no-api-side-effects-method
        API.makeRequestWithSideEffects('OpenOldDotLink', {}, {})
            .then((response) => buildOldDotURL(url, response.shortLivedAuthToken))
            .catch(() => buildOldDotURL(url)),
        (oldDotURL) => oldDotURL,
    );
}
export {buildOldDotURL, openOldDotLink, openExternalLink};
