import throttle from 'lodash/throttle';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';

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
    const toggle = () => Onyx.set(ONYXKEYS.IS_TEST_TOOLS_MODAL_OPEN, !isTestToolsModalOpen);
    const throttledToggle = throttle(toggle, CONST.TIMING.TEST_TOOLS_MODAL_THROTTLE_TIME);
    throttledToggle();
}

export default toggleTestToolsModal;
