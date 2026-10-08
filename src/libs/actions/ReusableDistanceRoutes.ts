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

/**
 * Onyx data saving the route of a newly created distance expense locally, so the just used
 * route shows in "Reuse route" in offline mode before the server list refreshes.
 */
function getLocallyCreatedRouteOnyxData(
    route: ReusableDistanceRoute,
    currentRoutes: ReusableDistanceRoute[],
): {
    optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.REUSABLE_DISTANCE_ROUTES>>;
    failureData: Array<OnyxUpdate<typeof ONYXKEYS.REUSABLE_DISTANCE_ROUTES>>;
} {
    const updatedRoutes = [route, ...currentRoutes.filter((item) => item.transactionID !== route.transactionID)];
    return {
        optimisticData: [{onyxMethod: Onyx.METHOD.SET, key: ONYXKEYS.REUSABLE_DISTANCE_ROUTES, value: updatedRoutes}],
        failureData: [{onyxMethod: Onyx.METHOD.SET, key: ONYXKEYS.REUSABLE_DISTANCE_ROUTES, value: currentRoutes}],
    };
}

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
 * Seeds the draft transaction from a reused route.
 */
function selectReusableRoute(transactionID: string, route: ReusableDistanceRoute, existingWaypoints?: WaypointCollection) {
    const waypoints = normalizeRouteWaypoints(route);
    return updateWaypoints(transactionID, waypoints, CONST.TRANSACTION.STATE.DRAFT, existingWaypoints).then(() =>
        Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {
            iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MAP,
            isReusedRoute: true,
            comment: {customUnit: {quantity: route.distance, routeDistanceMeters: route.routeDistanceMeters}},
        }),
    );
}

export {fetchReusableDistanceRoutes, getLocallyCreatedRouteOnyxData, selectReusableRoute};
