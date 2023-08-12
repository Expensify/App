import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * @param {String} transactionID
 */
function createInitialWaypoints(transactionID) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        comment: {
            waypoints: {
                waypoint0: {},
                waypoint1: {},
            },
        },
    });
}

/**
 * Add a stop which is a new waypoint at the newLastIndex
 *
 * @param {String} transactionID
 * @param {Number} newLastIndex
 */
function addStop(transactionID, newLastIndex) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        comment: {
            waypoints: {
                [`waypoint${newLastIndex}`]: {},
            },
        },
    });
}

/**
 * Saves the selected waypoint to the transaction
 * @param {String} transactionID
 * @param {String} index
 * @param {Object} waypoint
 */
function saveWaypoint(transactionID, index, waypoint) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        comment: {
            waypoints: {
                [`waypoint${index}`]: waypoint,
            },
        },
    });
}

export {addStop, createInitialWaypoints, saveWaypoint};
