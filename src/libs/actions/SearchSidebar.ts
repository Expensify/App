import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

/**
 * Set the desktop Search sidebar collapsed state.
 */
function setCollapsed(isCollapsed: boolean) {
    Onyx.merge(ONYXKEYS.NVP_SEARCH_SIDEBAR, {isCollapsed});
}

export default {setCollapsed};
