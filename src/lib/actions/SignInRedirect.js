import Ion from '../Ion';
import IONKEYS from '../../IONKEYS';
import ROUTES from '../../ROUTES';

/**
 * Redirects to the sign in page and handles adding any exitTo params to the URL.
 * Normally this method would live in Session.js, but that would cause a circular dependency with Network.js.
 *
 * @returns {Promise}
 */
function redirectToSignIn() {
    return Ion.get(IONKEYS.CURRENT_URL)
        .then((url) => {
            if (!url) {
                return;
            }

            // If there is already an exitTo, or has the URL of signin, don't redirect
            if (url.indexOf('exitTo') !== -1 || url.indexOf('signin') !== -1) {
                return;
            }

            // When the URL is at the root of the site, go to sign-in, otherwise add the exitTo
            const urlWithExitTo = url === '/'
                ? ROUTES.SIGNIN
                : `${ROUTES.SIGNIN}/exitTo${url}`;
            return Ion.set(IONKEYS.APP_REDIRECT_TO, urlWithExitTo);
        });
}

export default redirectToSignIn;
