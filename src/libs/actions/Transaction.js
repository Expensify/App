import _ from 'underscore';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../ONYXKEYS';
import * as CollectionUtils from '../CollectionUtils';
import * as API from '../API';

let recentWaypoints = [];
Onyx.connect({
    key: ONYXKEYS.NVP_RECENT_WAYPOINTS,
    callback: (val) => (recentWaypoints = val || []),
});

const allTransactions = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION,
    callback: (transaction, key) => {
        if (!key || !transaction) {
            return;
        }
        const transactionID = CollectionUtils.extractCollectionItemID(key);
        allTransactions[transactionID] = transaction;
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
 * Add a stop to the transaction
 *
 * @param {String} transactionID
 * @param {Number} newLastIndex
 */
function addStop(transactionID) {
    const transaction = lodashGet(allTransactions, transactionID, {});
    const existingWaypoints = lodashGet(transaction, 'comment.waypoints', {});
    const newLastIndex = _.size(existingWaypoints);

    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        comment: {
            waypoints: {
                [`waypoint${newLastIndex}`]: {},
            },
        },

        // Clear the existing route so that we don't show an old route
        routes: {
            route0: {
                geometry: {
                    coordinates: null,
                },
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
        // Empty out errors when we're saving a new waypoint as this indicates the user is updating their input
        errorFields: {
            route: null,
        },

        // Clear the existing route so that we don't show an old route
        routes: {
            route0: {
                geometry: {
                    coordinates: null,
                },
            },
        },
    });
    if (!waypoint) return;
    const recentWaypointAlreadyExists = _.find(recentWaypoints, (recentWaypoint) => recentWaypoint.address === waypoint.address);
    if (!recentWaypointAlreadyExists) {
        const clonedWaypoints = _.clone(recentWaypoints);
        clonedWaypoints.unshift(waypoint);
        Onyx.merge(ONYXKEYS.NVP_RECENT_WAYPOINTS, clonedWaypoints.slice(0, 5));
    }
}

function removeWaypoint(transactionID, currentIndex) {
    // Index comes from the route params and is a string
    const index = Number(currentIndex);
    const transaction = lodashGet(allTransactions, transactionID, {});
    const existingWaypoints = lodashGet(transaction, 'comment.waypoints', {});
    const totalWaypoints = _.size(existingWaypoints);

    // Prevents removing the starting or ending waypoint but clear the stored address only if there are only two waypoints
    if (totalWaypoints === 2 && (index === 0 || index === totalWaypoints - 1)) {
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
    // Doing a deep clone of the transaction to avoid mutating the original object and running into a cache issue when using Onyx.set
    const newTransaction = {
        ...transaction,
        comment: {
            ...transaction.comment,
            waypoints: reIndexedWaypoints,
        },
        // Clear the existing route so that we don't show an old route
        routes: {
            route0: {
                geometry: {
                    coordinates: null,
                },
            },
        },
    };
    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, newTransaction);
}

/**
 * Gets the route for a set of waypoints
 * Used so we can generate a map view of the provided waypoints
 * @param {String} transactionID
 * @param {Object} waypoints
 */
function getRoute(transactionID, waypoints) {
    API.read(
        'GetRoute',
        {
            transactionID,
            waypoints: JSON.stringify(waypoints),
        },
        {
            optimisticData: [
                {
                    // Clears any potentially stale error messages from fetching the route
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                    value: {
                        comment: {
                            isLoading: true,
                        },
                        errorFields: {
                            route: null,
                        },
                    },
                },
            ],
            // The route and failure are sent back via pusher in the BE, we are just clearing the loading state here
            successData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                    value: {
                        comment: {
                            isLoading: false,
                        },
                    },
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                    value: {
                        comment: {
                            isLoading: false,
                        },
                    },
                },
            ],
        },
    );
}

export {addStop, createInitialWaypoints, saveWaypoint, removeWaypoint, getRoute};
