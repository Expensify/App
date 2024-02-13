import throttle from 'lodash/throttle';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

let isAppProfiling = false;
Onyx.connect({
    key: ONYXKEYS.IS_APP_PROFILING,
    callback: (val) => (isAppProfiling = val ?? false),
});

/**
 * Toggle the test tools modal open or closed.
 * Throttle the toggle to make the modal stay open if you accidentally tap an extra time, which is easy to do.
 */
function toggleProfileToolsModal() {
    const toggle = () => Onyx.set(ONYXKEYS.IS_APP_PROFILING, !isAppProfiling);
    const throttledToggle = throttle(toggle, CONST.TIMING.TEST_TOOLS_MODAL_THROTTLE_TIME);
    throttledToggle();
}

export default toggleProfileToolsModal;
