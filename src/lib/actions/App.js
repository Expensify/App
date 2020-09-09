import Ion from '../Ion';
import IONKEYS from '../../IONKEYS';

let currentRedirectTo;
Ion.connect({
    key: IONKEYS.APP_REDIRECT_TO,
    callback: val => currentRedirectTo = val,
});

/**
 * Keep the current route match stored in Ion so other libs can access it
 * Also reset the app_redirect_to in Ion so that if we go back to the current url the state will update
 *
 * @param {object} match
 */
function recordCurrentRoute({match}) {
    Ion.merge(IONKEYS.CURRENT_URL, match.url);
    if (match.url === currentRedirectTo) {
        Ion.merge(IONKEYS.APP_REDIRECT_TO, '');
    }
}


/**
 * Redirect the app to a new page by updating the state in Ion
 *
 * @param {mixed} url
 */
function redirect(url) {
    const formattedURL = (typeof url === 'string' && url.startsWith('/')) ? url : `/${url}`;
    Ion.set(IONKEYS.APP_REDIRECT_TO, formattedURL);
}

export {
    recordCurrentRoute,
    redirect,
};
