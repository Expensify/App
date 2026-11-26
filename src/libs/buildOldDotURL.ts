/**
 * Builds an OldDot URL with the current user's email and optional short-lived token, kept out of
 * actions/Link so callers such as actions/Session skip the deep-link machinery.
 */

import {getCurrentUserEmail} from './CurrentUserStore';
import {getOldDotEnvironmentURL} from './Environment/Environment';
import {isSharedProductHost} from './ExperienceCookie';
import addTrailingForwardSlash from './UrlUtils';

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
        // Expensify Classic's session belongs to the host it was opened on, so Classic opened from the shared product host stays on it
        const oldDotDomain = addTrailingForwardSlash(isSharedProductHost() ? window.location.origin : environmentURL);

        // If the URL contains # or ?, we can assume they don't need to have the `?` token to start listing url parameters.
        return `${oldDotDomain}${originURL}${hasURLParams ? '&' : '?'}${params}${hashParams}`;
    });
}

export default buildOldDotURL;
