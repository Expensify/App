import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxKey} from '@src/ONYXKEYS';
import type {SelectedTabRequest, SplitSelectedTabRequest} from '@src/types/onyx';

type TabCollectionKey = typeof ONYXKEYS.COLLECTION.SELECTED_TAB | typeof ONYXKEYS.COLLECTION.SPLIT_SELECTED_TAB;

/**
 * Sets the selected tab for a given tab ID
 */
function setSelectedTab(id: string, index: SelectedTabRequest | SplitSelectedTabRequest, collectionKey: TabCollectionKey = ONYXKEYS.COLLECTION.SELECTED_TAB) {
    Onyx.merge(`${collectionKey}${id}` as OnyxKey, index);
}

export default {
    setSelectedTab,
};
