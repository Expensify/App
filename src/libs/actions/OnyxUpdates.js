import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';

// This key needs to be separate from ONYXKEYS.ONYX_UPDATES_FROM_SERVER so that it can be updated without triggering the callback when the server IDs are updated. If that
// callback were triggered it would lead to duplicate processing of server updates.
let lastUpdateIDAppliedToClient = 0;
Onyx.connect({
    key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
    callback: (val) => (lastUpdateIDAppliedToClient = val),
});

/**
 * @param {Object[]} updateParams
 * @param {Number} updateParams.lastUpdateID
 */
function apply({lastUpdateID}) {
    if (!lastUpdateID || lastUpdateID <= lastUpdateIDAppliedToClient) {
        return;
    }
    Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, lastUpdateID);
}

/**
 * This function will receive the previousUpdateID from any request/pusher update that has it, compare to our current app state
 * and return if an update is needed
 * @param {Number} previousUpdateID The previousUpdateID contained in the response object
 * @returns {Boolean}
 */
function doesClientNeedToBeUpdated(previousUpdateID = 0) {
    // If no previousUpdateID is sent, this is not a WRITE request so we don't need to update our current state
    if (!previousUpdateID) {
        return false;
    }

    // If we don't have any value in lastUpdateIDAppliedToClient, this is the first time we're receiving anything, so we need to do a last reconnectApp
    if (!lastUpdateIDAppliedToClient) {
        return true;
    }

    return lastUpdateIDAppliedToClient < previousUpdateID;
}

// eslint-disable-next-line import/prefer-default-export
export {doesClientNeedToBeUpdated, apply};
