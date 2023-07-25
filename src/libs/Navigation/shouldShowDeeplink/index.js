import _ from 'underscore';
import CONST from '../../../CONST';
/**
 * @returns {Boolean}
 */
export default function shouldShowDeeplink() {
    const currentUrl = window.location.pathname;

    // If the current url is the root path, we don't want to show the deeplink prompt
    if (currentUrl === '/') {
        return false;
    }

    // Check if currentUrl pathname exactly matches any of the deny list routes
    const existsOnDenyList = !_.includes(_.keys(CONST.DEEPLINK_PROMPT_DENYLIST), currentUrl);

    return existsOnDenyList;
}
