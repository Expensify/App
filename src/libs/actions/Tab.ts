import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Sets the selected tab for a given tab ID
 */
function setSelectedTab(id: string, index: ValueOf<typeof CONST.TAB_REQUEST>) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${id}`, index);
}

export default {
    setSelectedTab,
};
