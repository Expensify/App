import throttle from 'lodash/throttle';
import Onyx from 'react-native-onyx';
import {getBrowser, isChromeIOS} from '@libs/Browser';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {close} from './Modal';

let isTestToolsModalOpen = false;
Onyx.connect({
    key: ONYXKEYS.IS_TEST_TOOLS_MODAL_OPEN,
    callback: (val) => (isTestToolsModalOpen = val ?? false),
});

/**
 * Toggle the test tools modal open or closed.
 * Throttle the toggle to make the modal stay open if you accidentally tap an extra time, which is easy to do.
 */
function toggleTestToolsModal() {
    const toggle = () => {
        const toggleIsTestToolsModalOpen = () => {
            Onyx.set(ONYXKEYS.IS_TEST_TOOLS_MODAL_OPEN, !isTestToolsModalOpen);
        };
        if (!isTestToolsModalOpen) {
            close(toggleIsTestToolsModalOpen);
            return;
        }
        toggleIsTestToolsModalOpen();
    };
    const throttledToggle = throttle(toggle, CONST.TIMING.TEST_TOOLS_MODAL_THROTTLE_TIME);
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

export {shouldShowProfileTool};
export default toggleTestToolsModal;
