import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * @param {Object[]} updateParams
 * @param {String} updateParams.type
 * @param {Object} updateParams.data
 * @param {Object} [updateParams.data.request] Exists if updateParams.type === 'https'
 * @param {Object} [updateParams.data.response] Exists if updateParams.type === 'https'
 * @param {Object} [updateParams.data.onyxData] Exists if updateParams.type === 'pusher'
 * @param {Number} [lastUpdateID]
 * @param {Number} [previousUpdateID]
 */
function saveUpdateIDs(updateParams, lastUpdateID = 0, previousUpdateID = 0) {
    // Return early if there were no updateIDs
    if (!lastUpdateID) {
        return;
    }

    Onyx.merge(ONYXKEYS.ONYX_UPDATES_FROM_SERVER, {
        lastUpdateIDFromServer: lastUpdateID,
        previousUpdateIDFromServer: previousUpdateID,
        updateParams,
    });
}

// eslint-disable-next-line import/prefer-default-export
export {saveUpdateIDs};
