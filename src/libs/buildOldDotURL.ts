/**
 * Builds an OldDot URL with the current user's email and optional short-lived token, kept out of
 * actions/Link so callers such as actions/Session skip the deep-link machinery.
 */

import CONST from '@src/CONST';

import {getCurrentUserEmail} from './CurrentUserStore';
import {getOldDotEnvironmentURL} from './Environment/Environment';
import getPlatform from './getPlatform';
import addTrailingForwardSlash from './UrlUtils';

/** Marks OldDot URLs opened from the browser so the installed app doesn't claim them */
const OPEN_IN_BROWSER_PARAM = 'openInBrowser=true';

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
    const openInBrowserParam = getPlatform() === CONST.PLATFORM.WEB ? OPEN_IN_BROWSER_PARAM : '';
    const paramsArray = [authTokenParam, emailParam, openInBrowserParam];
    const params = paramsArray.filter(Boolean).join('&');

    return getOldDotEnvironmentURL().then((environmentURL) => {
        const oldDotDomain = addTrailingForwardSlash(environmentURL);

        // If the URL contains # or ?, we can assume they don't need to have the `?` token to start listing url parameters.
        return `${oldDotDomain}${originURL}${hasURLParams ? '&' : '?'}${params}${hashParams}`;
    });
}

export default buildOldDotURL;
