import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Sets the selected tab for a given tab ID
 *
 * @param {String} id
 * @param {String} index
 */
function setSelectedTab(id, index) {
    Onyx.merge(`${ONYXKEYS.SELECTED_TAB}_${id}`, index);
}

export default {
    setSelectedTab,
};
