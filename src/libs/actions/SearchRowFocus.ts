import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

function setSearchRowFocused(keyForList: string, isFocused: boolean) {
    Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_SEARCH_ROW_FOCUS}${keyForList}`, isFocused ? true : null);
}

export default setSearchRowFocused;
