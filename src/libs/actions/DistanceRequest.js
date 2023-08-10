import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';


/**
 * Saves the selected waypoint to the transaction
 * @param {String} transactionID 
 * @param {String} index 
 * @param {Object} waypoint 
 */
function saveWaypoint(transactionID, index, waypoint)
{
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        comment: {
            waypoints: {
                [`waypoint${index}`]: waypoint,
            },
        }
    });
}


export default {
    saveWaypoint,
};
