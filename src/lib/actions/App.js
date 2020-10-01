import Ion from '../Ion';
import IONKEYS from '../../IONKEYS';
import Str from '../Str';

let currentRedirectTo;
Ion.connect({
    key: IONKEYS.APP_REDIRECT_TO,
    callback: val => currentRedirectTo = val,
});


/**
 * Redirect the app to a new page by updating the state in Ion
 *
 * @param {mixed} url
 */
function redirect(url) {
    const formattedURL = Str.normalizeUrl(url);
    Ion.merge(IONKEYS.APP_REDIRECT_TO, formattedURL);
}

/**
 * Keep the current route match stored in Ion so other libs can access it
 * Also reset the app_redirect_to in Ion so that if we go back to the current url the state will update
 *
 * @param {object} match
 */
function recordCurrentRoute({match}) {
    Ion.merge(IONKEYS.CURRENT_URL, match.url);
    if (match.url === currentRedirectTo) {
        Ion.merge(IONKEYS.APP_REDIRECT_TO, null);
    }
}

export {
    recordCurrentRoute,
    redirect,
};
