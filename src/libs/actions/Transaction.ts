import Onyx from 'react-native-onyx';
import lodashHas from 'lodash/has';
import lodashClone from 'lodash/clone';
import {isEqual} from 'lodash';
import ONYXKEYS from '../../ONYXKEYS';
import * as CollectionUtils from '../CollectionUtils';
import * as API from '../API';
import CONST from '../../CONST';
import {RecentWaypoint, Transaction} from '../../types/onyx';
import {WaypointCollection} from '../../types/onyx/Transaction';
import * as TransactionUtils from '../TransactionUtils';

let recentWaypoints: RecentWaypoint[] = [];
Onyx.connect({
    key: ONYXKEYS.NVP_RECENT_WAYPOINTS,
    callback: (val) => (recentWaypoints = val ?? []),
});

const allTransactions: Record<string, Transaction> = {};
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

function createInitialWaypoints(transactionID: string) {
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
 */
function addStop(transactionID: string) {
    const transaction = allTransactions?.[transactionID] ?? {};
    const existingWaypoints = transaction?.comment?.waypoints ?? {};
    const newLastIndex = Object.keys(existingWaypoints).length;

    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        comment: {
            waypoints: {
                [`waypoint${newLastIndex}`]: {},
            },
        },
    });
}

function saveWaypoint(transactionID: string, index: string, waypoint: RecentWaypoint | null, isEditingWaypoint = false) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        pendingFields: {
            comment: isEditingWaypoint ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        },
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

    // You can save offline waypoints without verifying the address (we will geocode it on the backend)
    // We're going to prevent saving those addresses in the recent waypoints though since they could be invalid addresses
    // However, in the backend once we verify the address, we will save the waypoint in the recent waypoints NVP
    if (!lodashHas(waypoint, 'lat') || !lodashHas(waypoint, 'lng')) {
        return;
    }

    // If current location is used, we would want to avoid saving it as a recent waypoint. This prevents the 'Your Location'
    // text from showing up in the address search suggestions
    if (isEqual(waypoint?.address, CONST.YOUR_LOCATION_TEXT)) {
        return;
    }
    const recentWaypointAlreadyExists = recentWaypoints.find((recentWaypoint) => recentWaypoint?.address === waypoint?.address);
    if (!recentWaypointAlreadyExists && waypoint !== null) {
        const clonedWaypoints = lodashClone(recentWaypoints);
        clonedWaypoints.unshift(waypoint);
        Onyx.merge(ONYXKEYS.NVP_RECENT_WAYPOINTS, clonedWaypoints.slice(0, 5));
    }
}

function removeWaypoint(transactionID: string, currentIndex: string) {
    // Index comes from the route params and is a string
    const index = Number(currentIndex);
    const transaction = allTransactions?.[transactionID] ?? {};
    const existingWaypoints = transaction?.comment?.waypoints ?? {};
    const totalWaypoints = Object.keys(existingWaypoints).length;

    const waypointValues = Object.values(existingWaypoints);
    const removed = waypointValues.splice(index, 1);
    const isRemovedWaypointEmpty = removed.length > 0 && !TransactionUtils.waypointHasValidAddress(removed[0] ?? {});

    // When there are only two waypoints we are adding empty waypoint back
    if (totalWaypoints === 2 && (index === 0 || index === totalWaypoints - 1)) {
        waypointValues.splice(index, 0, {});
    }

    const reIndexedWaypoints: WaypointCollection = {};
    waypointValues.forEach((waypoint, idx) => {
        reIndexedWaypoints[`waypoint${idx}`] = waypoint;
    });

    // Onyx.merge won't remove the null nested object values, this is a workaround
    // to remove nested keys while also preserving other object keys
    // Doing a deep clone of the transaction to avoid mutating the original object and running into a cache issue when using Onyx.set
    let newTransaction: Transaction = {
        ...transaction,
        comment: {
            ...transaction.comment,
            waypoints: reIndexedWaypoints,
        },
    };

    if (!isRemovedWaypointEmpty) {
        newTransaction = {
            ...newTransaction,
            // Clear any errors that may be present, which apply to the old route
            errorFields: {
                route: null,
            },
            // Clear the existing route so that we don't show an old route
            routes: {
                route0: {
                    distance: null,
                    geometry: {
                        coordinates: null,
                    },
                },
            },
        };
    }
    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, newTransaction);
}

/**
 * Gets the route for a set of waypoints
 * Used so we can generate a map view of the provided waypoints
 */
function getRoute(transactionID: string, waypoints: WaypointCollection) {
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

/**
 * Updates all waypoints stored in the transaction specified by the provided transactionID.
 *
 * @param transactionID - The ID of the transaction to be updated
 * @param waypoints - An object containing all the waypoints
 *                             which will replace the existing ones.
 */
function updateWaypoints(transactionID: string, waypoints: WaypointCollection): Promise<void> {
    return Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        comment: {
            waypoints,
        },

        // Empty out errors when we're saving new waypoints as this indicates the user is updating their input
        errorFields: {
            route: null,
        },

        // Clear the existing route so that we don't show an old route
        routes: {
            route0: {
                distance: null,
                geometry: {
                    coordinates: null,
                },
            },
        },
    });
}

export {addStop, createInitialWaypoints, saveWaypoint, removeWaypoint, getRoute, updateWaypoints};
