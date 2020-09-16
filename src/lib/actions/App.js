import Ion from '../Ion';
import IONKEYS from '../../IONKEYS';

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
    const formattedURL = (typeof url === 'string' && url.startsWith('/')) ? url : `/${url}`;
    Ion.merge(IONKEYS.APP_REDIRECT_TO, formattedURL);
}

/**
 * Keep the current route match stored in Ion so other libs can access it
 * Also reset the app_redirect_to in Ion so that if we go back to the current url the state will update
 *
 * @param {object} match
 */
function recordCurrentRoute({match}) {
    console.log(match);
    Ion.merge(IONKEYS.URL.CURRENT, match.url);
    Ion.merge(IONKEYS.URL.PARAMS, match.params);
    if (match.url === currentRedirectTo) {
        Ion.merge(IONKEYS.APP_REDIRECT_TO, null);
    }
}

export {
    recordCurrentRoute,
    redirect,
};
