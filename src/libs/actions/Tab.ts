import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Sets the selected tab for a given tab ID
 */
function setSelectedTab(id: string, index: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${id}`, index);
}

export default {
    setSelectedTab,
};
