import Ion from '../Ion';
import IONKEYS from '../../IONKEYS';
import ROUTES from '../../ROUTES';

let currentURL;
Ion.connect({
    key: IONKEYS.CURRENT_URL,
    callback: val => currentURL = val,
});

/**
 * Redirects to the sign in page and handles adding any exitTo params to the URL.
 * Normally this method would live in Session.js, but that would cause a circular dependency with Network.js.
 */
function redirectToSignIn() {
    if (!currentURL) {
        return;
    }

    // If there is already an exitTo, or has the URL of signin, don't redirect
    if (currentURL.indexOf('exitTo') !== -1 || currentURL.indexOf('signin') !== -1) {
        return;
    }

    // When the URL is at the root of the site, go to sign-in, otherwise add the exitTo
    const urlWithExitTo = currentURL === '/'
        ? ROUTES.SIGNIN
        : `${ROUTES.SIGNIN}/exitTo${currentURL}`;
    Ion.merge(IONKEYS.APP_REDIRECT_TO, urlWithExitTo);
}

export default redirectToSignIn;
