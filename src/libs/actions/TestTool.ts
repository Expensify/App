import throttle from 'lodash/throttle';
import Onyx from 'react-native-onyx';
import {getBrowser, isChromeIOS} from '@libs/Browser';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

/**
 * Toggle the test tools modal open or closed.
 * Throttle the toggle to make the modal stay open if you accidentally tap an extra time, which is easy to do.
 */
function toggleTestToolsModal() {
    const throttledToggle = throttle(() => {
        let currentRoute = Navigation.getActiveRoute();
        currentRoute = currentRoute.startsWith('/') ? currentRoute.slice(1) : currentRoute;
        if (currentRoute === ROUTES.TEST_TOOLS_MODAL) {
            Navigation.goBack();
        } else {
            Navigation.navigate(ROUTES.TEST_TOOLS_MODAL);
        }
    }, CONST.TIMING.TEST_TOOLS_MODAL_THROTTLE_TIME);

    throttledToggle();
}

function shouldShowProfileTool() {
    const browser = getBrowser();
    const isSafariOrFirefox = browser === CONST.BROWSER.SAFARI || browser === CONST.BROWSER.FIREFOX;

    if (isSafariOrFirefox || isChromeIOS()) {
        return false;
    }
    return true;
}

function openTestToolsModal() {
    Onyx.set(ONYXKEYS.IS_TEST_TOOLS_MODAL_OPEN, true);
}

function closeTestToolsModal() {
    Onyx.set(ONYXKEYS.IS_TEST_TOOLS_MODAL_OPEN, false);
}

export {shouldShowProfileTool, openTestToolsModal, closeTestToolsModal};
export default toggleTestToolsModal;
