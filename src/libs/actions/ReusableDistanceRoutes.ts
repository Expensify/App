import {read} from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import {normalizeRouteWaypoints} from '@libs/ReusableDistanceRoutesUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReusableDistanceRoute} from '@src/types/onyx';
import type {WaypointCollection} from '@src/types/onyx/Transaction';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import {updateWaypoints} from './Transaction';

function fetchReusableDistanceRoutes() {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.IS_LOADING_REUSABLE_DISTANCE_ROUTES>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.IS_LOADING_REUSABLE_DISTANCE_ROUTES,
            value: true,
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.IS_LOADING_REUSABLE_DISTANCE_ROUTES>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.IS_LOADING_REUSABLE_DISTANCE_ROUTES,
            value: false,
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.IS_LOADING_REUSABLE_DISTANCE_ROUTES>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.IS_LOADING_REUSABLE_DISTANCE_ROUTES,
            value: false,
        },
    ];

    read(READ_COMMANDS.OPEN_REUSE_ROUTE_PAGE, null, {optimisticData, successData, failureData});
}

/**
 * Seeds the draft transaction from a reused route. The waypoints are routed again like any other draft, which
 * returns every route alternative, and the source expense's route distance selects the alternative it took.
 */
function selectReusableRoute(transactionID: string, route: ReusableDistanceRoute, existingWaypoints?: WaypointCollection) {
    const waypointsUpdate = updateWaypoints(transactionID, normalizeRouteWaypoints(route), CONST.TRANSACTION.STATE.DRAFT, existingWaypoints);

    // Merges to the same key in one tick are applied together, so the route distance lands with the waypoints instead
    // of being cleared by them.
    const routeDistanceUpdate = Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {
        comment: {customUnit: {routeDistanceMeters: route.routeDistanceMeters ?? null}},
    });
    return Promise.all([waypointsUpdate, routeDistanceUpdate]);
}

export {fetchReusableDistanceRoutes, selectReusableRoute};
