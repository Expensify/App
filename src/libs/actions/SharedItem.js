import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Saves shared item to storage.
 *
 * @param {Object} sharedItem
 */
function set(sharedItem) {
    Onyx.set(ONYXKEYS.SHARED_ITEM, sharedItem);
}

/**
 * Clears shared item from storage.
 */
function clear() {
    Onyx.set(ONYXKEYS.SHARED_ITEM, null);
}

export {
    set,
    clear,
};
