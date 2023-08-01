import CONST from '../../../CONST';
/**
 * Determines if the deeplink prompt should be shown on the current screen
 * @param {String} screenName
 * @param {Boolean} isAuthenticated
 * @returns {Boolean}
 */
export default function shouldShowDeeplink(screenName, isAuthenticated) {
    // We want to show the deep link prompt on authenticated HOME, but not
    // unauthenticated HOME screen. They have the same name and path, so we have
    // to check to see if the user is authenticated.
    // For now we don't want to block any authenticated screens from showing the
    // deep link prompt, so isAuthenticated is a shortcut.
    if (isAuthenticated) {
        return true;
    }
    return !CONST.DEEPLINK_PROMPT_DENYLIST.includes(screenName);
}
