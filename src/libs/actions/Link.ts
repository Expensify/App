import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import asyncOpenURL from '../asyncOpenURL';
import * as API from '../API';
import * as Environment from '../Environment/Environment';
import * as Url from '../Url';

let isNetworkOffline: boolean | undefined = false;
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: (value) => (isNetworkOffline = value?.isOffline ?? false),
});

let currentUserEmail: string | undefined;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => (currentUserEmail = value?.email ?? ''),
});

function buildOldDotURL(url: string, shortLivedAuthToken?: string): Promise<string> {
    const hasHashParams = url.indexOf('#') !== -1;
    const hasURLParams = url.indexOf('?') !== -1;

    const authTokenParam = shortLivedAuthToken ? `authToken=${shortLivedAuthToken}` : '';
    const emailParam = `email=${encodeURIComponent(currentUserEmail ?? '')}`;
    const paramsArray = [authTokenParam, emailParam];
    const params = paramsArray.filter(Boolean).join('&');

    return Environment.getOldDotEnvironmentURL().then((environmentURL) => {
        const oldDotDomain = Url.addTrailingForwardSlash(environmentURL);

        // If the URL contains # or ?, we can assume they don't need to have the `?` token to start listing url parameters.
        return `${oldDotDomain}${url}${hasHashParams || hasURLParams ? '&' : '?'}${params}`;
    });
}

function openExternalLink(url: string, shouldSkipCustomSafariLogic = false) {
    asyncOpenURL(Promise.resolve(), url, shouldSkipCustomSafariLogic);
}

function openOldDotLink(url: string) {
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
