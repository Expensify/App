import throttle from 'lodash/throttle';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

let isProfilingInProgress = false;
Onyx.connect({
    key: ONYXKEYS.APP_PROFILING_IN_PROGRESS,
    callback: (val) => (isProfilingInProgress = val ?? false),
});

/**
 * Toggle the test tools modal open or closed.
 * Throttle the toggle to make the modal stay open if you accidentally tap an extra time, which is easy to do.
 */
function toggleProfileTool() {
    const toggle = () => Onyx.set(ONYXKEYS.APP_PROFILING_IN_PROGRESS, !isProfilingInProgress);
    const throttledToggle = throttle(toggle, CONST.TIMING.TEST_TOOLS_MODAL_THROTTLE_TIME);
    throttledToggle();
}

export default toggleProfileTool;
