import CONST from '../../../CONST';

/**
 * Determines if the deeplink prompt should be shown on the current screen
 * @param {String} screenName
 * @param {Boolean} isAuthenticated
 * @returns {Boolean}
 */
export default function shouldPreventDeeplinkPrompt(screenName) {
    // We don't want to show the deeplink prompt on screens where a user is in the
    // authentication process, so we are blocking the prompt on the following screens (Denylist)
    return CONST.DEEPLINK_PROMPT_DENYLIST.includes(screenName);
}
