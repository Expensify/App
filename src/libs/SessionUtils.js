import lodashGet from 'lodash/get';
import CONST from '../CONST';

/**
 * Determine if the transitioning user is logging in as a new user.
 *
 * @param {String} transitionURL
 * @param {String} sessionEmail
 * @returns {Boolean}
 */
function isLoggingInAsNewUser(transitionURL, sessionEmail) {
    // The OldDot mobile app does not URL encode the parameters, but OldDot web
    // does. We don't want to deploy OldDot mobile again, so as a work around we
    // compare the session email to both the decoded and raw email from the transition link.
    const params = new URLSearchParams(transitionURL);
    const paramsEmail = params.get('email');

    // If the email param matches what is stored in the session then we are
    // definitely not logging in as a new user
    if (paramsEmail === sessionEmail) {
        return false;
    }

    // If they do not match it might be due to encoding, so check the raw value
    // Capture the un-encoded text in the email param
    const emailParamRegex = /[?&]email=([^&]*)/g;
    const matches = emailParamRegex.exec(transitionURL);
    const linkedEmail = lodashGet(matches, 1, null);
    return linkedEmail !== sessionEmail;
}

/**
 * Indicates whether the button should show the loading indicator
 * @param {String} loadingScreen
 * @param {Boolean} requiresTwoFactorAuth
 * @param {Boolean} isLoading
 * @returns {Boolean}
 */
function shouldShowLoadingIndicator(loadingScreen, requiresTwoFactorAuth, isLoading) {
    if (loadingScreen === CONST.LOADING_SCREEN.VALIDATE_SCREEN) {
        return !requiresTwoFactorAuth;
    }

    if (loadingScreen === CONST.LOADING_SCREEN.TWO_FACE_AUTH_SCREEN) {
        return requiresTwoFactorAuth;
    }

    return isLoading;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    isLoggingInAsNewUser,
    shouldShowLoadingIndicator,
};
