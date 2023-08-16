import _ from 'underscore';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import lodashGet from 'lodash/get';
import * as CollectionUtils from '../CollectionUtils';

const allTransactions = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION,
    callback: (transactions, key) => {
        if (!key || !transactions) {
            return;
        }
        const transactionID = CollectionUtils.extractCollectionItemID(key);
        allTransactions[transactionID] = transactions;
    },
});

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
function addStop(transactionID) {
    const transaction = lodashGet(allTransactions, transactionID, {});
    const existingWaypoints = lodashGet(transaction, 'comment.waypoints', {});
    const totalWaypoints = _.size(existingWaypoints);
    const newLastIndex = totalWaypoints;
    
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

function removeWaypoint(transactionID, currentIndex) {
    // Index comes from the route params and is a string
    const index = Number(currentIndex);
    const transaction = lodashGet(allTransactions, transactionID, {});
    const existingWaypoints = lodashGet(transaction, 'comment.waypoints', {});
    const totalWaypoints = _.size(existingWaypoints);

    // Prevents removing the starting or ending waypoint but clear the stored address
    if (index === 0 || index === totalWaypoints - 1) {
        saveWaypoint(transactionID, index, null);
        return;
    }

    const waypointValues = _.values(existingWaypoints);
    waypointValues.splice(index, 1);

    const reIndexedWaypoints = {};
    waypointValues.forEach((waypoint, idx) => {
        reIndexedWaypoints[`waypoint${idx}`] = waypoint;
    });

    // Onyx.merge won't remove the null nested object values, this is a workaround
    // to remove nested keys while also preserving other object keys
    transaction.comment.waypoints = reIndexedWaypoints;
    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
}

export {addStop, createInitialWaypoints, saveWaypoint, removeWaypoint};
