import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

function saveUpdateIDs(lastUpdateID = 0, previousUpdateID = 0): void {
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
