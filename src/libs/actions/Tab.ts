import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SelectedTabRequest} from '@src/types/onyx';

/**
 * Sets the selected tab for a given tab ID
 */
function setSelectedTab(id: string, index: SelectedTabRequest) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${id}`, index);
}

export default {
    setSelectedTab,
};
