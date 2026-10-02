import {read} from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';

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
 * Seeds the draft transaction from a reused route.
 */
function selectReusableRoute(transactionID: string, route: ReusableDistanceRoute, existingWaypoints?: WaypointCollection) {
    return updateWaypoints(transactionID, route.waypoints, CONST.TRANSACTION.STATE.DRAFT, existingWaypoints).then(() =>
        Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {
            iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MAP,
            isReusedRoute: true,
            comment: {customUnit: {quantity: route.distance}},
        }),
    );
}

export {fetchReusableDistanceRoutes, selectReusableRoute};
