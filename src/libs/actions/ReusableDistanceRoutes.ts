import {read} from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {normalizeRouteWaypoints} from '@libs/ReusableDistanceRoutesUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReusableDistanceRoute} from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';
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
 * Seeds the draft transaction from a reused route.
 */
function selectReusableRoute(transactionID: string, route: ReusableDistanceRoute, existingWaypoints?: WaypointCollection, distanceUnit?: Unit) {
    const waypoints = normalizeRouteWaypoints(route);
    const quantity = route.routeDistanceMeters && distanceUnit ? roundToTwoDecimalPlaces(DistanceRequestUtils.convertDistanceUnit(route.routeDistanceMeters, distanceUnit)) : route.distance;

    return updateWaypoints(transactionID, waypoints, CONST.TRANSACTION.STATE.DRAFT, existingWaypoints).then(() =>
        Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {
            iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MAP,
            isReusedRoute: true,
            comment: {
                customUnit: {
                    quantity,
                    routeDistanceMeters: route.routeDistanceMeters,
                    ...(distanceUnit ? {distanceUnit} : {}),
                },
            },
        }),
    );
}

export {fetchReusableDistanceRoutes, selectReusableRoute};
