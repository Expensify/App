import ONYXKEYS from '@src/ONYXKEYS';
import type {SelectedTabRequest} from '@src/types/onyx';

import type {OnyxMergeInput} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * Sets the selected tab for a given tab ID
 */
function setSelectedTab<TTabName extends string = SelectedTabRequest>(id: string, index: TTabName) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${id}`, index as OnyxMergeInput<`${typeof ONYXKEYS.COLLECTION.SELECTED_TAB}${string}`>);
}

export default {
    setSelectedTab,
};
