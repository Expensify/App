import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 *
 * @param {Number} [lastUpdateID]
 * @param {Number} [previousUpdateID]
 */
function saveUpdateIDs(lastUpdateID = 0, previousUpdateID = 0) {
    // Return early if there were no updateIDs
    if (!lastUpdateID) {
        return;
    }

    Onyx.merge(ONYXKEYS.ONYX_UPDATES_FROM_SERVER, {
        lastUpdateIDFromServer: lastUpdateID,
        previousUpdateIDFromServer: previousUpdateID,
    });
}

// eslint-disable-next-line import/prefer-default-export
export {saveUpdateIDs};
