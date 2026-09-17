/**
 * Builds an OldDot URL with the current user's email and optional short-lived token, kept out of
 * actions/Link so callers such as actions/Session skip the deep-link machinery.
 */

import {getCurrentUserEmail} from '@libs/CurrentUserStore';
import {getOldDotEnvironmentURL} from '@libs/Environment/Environment';
import addTrailingForwardSlash from '@libs/UrlUtils';

function buildOldDotURL(url: string, shortLivedAuthToken?: string): Promise<string> {
    const hashIndex = url.lastIndexOf('#');
    const hasHashParams = hashIndex !== -1;
    const hasURLParams = url.indexOf('?') !== -1;
    let originURL = url;
    let hashParams = '';
    if (hasHashParams) {
        originURL = url.substring(0, hashIndex);
        hashParams = url.substring(hashIndex);
    }

    const authTokenParam = shortLivedAuthToken ? `authToken=${shortLivedAuthToken}` : '';
    const emailParam = `email=${encodeURIComponent(getCurrentUserEmail() ?? '')}`;
    const paramsArray = [authTokenParam, emailParam];
    const params = paramsArray.filter(Boolean).join('&');

    return getOldDotEnvironmentURL().then((environmentURL) => {
        const oldDotDomain = addTrailingForwardSlash(environmentURL);

        return `${oldDotDomain}${originURL}${hasURLParams ? '&' : '?'}${params}${hashParams}`;
    });
}

export default buildOldDotURL;
