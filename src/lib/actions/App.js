import Ion from '../Ion';
import IONKEYS from '../../IONKEYS';

/**
 * Keep the current route match stored in Ion so other libs can access it
 * Also reset the app_redirect_to in Ion so that if we go back to the current url the state will update
 *
 * @param {object} params.match
 */
function recordCurrentRoute({match}) {
    Ion.set(IONKEYS.CURRENT_URL, match.url);
    if (match.url === this.props.redirectTo) {
        Ion.set(IONKEYS.APP_REDIRECT_TO, '');
    }
}

function redirect(url) {
    const formattedURL = url.charAt(0) === '/' ? url : `/${url}`;
    Ion.set(IONKEYS.APP_REDIRECT_TO, formattedURL);
}

export {
    recordCurrentRoute,
    redirect,
};
