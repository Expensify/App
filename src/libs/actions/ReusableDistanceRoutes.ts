import {read} from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {getRouteKey, normalizeRouteWaypoints} from '@libs/ReusableDistanceRoutesUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReusableDistanceRoute, Transaction} from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';
import type {WaypointCollection} from '@src/types/onyx/Transaction';

import type {OnyxCollection, OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import {updateWaypoints} from './Transaction';

/**
 * Onyx data saving the route of a newly created distance expense locally, so the just used
 * route shows in "Reuse route" in offline mode before the server list refreshes.
 */
function getLocallyCreatedRouteOnyxData(
    route: ReusableDistanceRoute,
    currentRoutes: ReusableDistanceRoute[],
    transactions?: OnyxCollection<Transaction>,
): {
    optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.REUSABLE_DISTANCE_ROUTES>>;
    failureData: Array<OnyxUpdate<typeof ONYXKEYS.REUSABLE_DISTANCE_ROUTES>>;
} {
    const routeKey = getRouteKey(route);
    const existingRoute = currentRoutes.find((item) => item.transactionID === route.transactionID || (!!routeKey && getRouteKey(item) === routeKey));
    const existingTransactionReceipt = existingRoute ? transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${existingRoute.transactionID}`]?.receipt?.source : undefined;
    const existingReceiptSource = existingRoute?.receiptSource ?? (typeof existingTransactionReceipt === 'string' ? existingTransactionReceipt : undefined);
    const nextRoute: ReusableDistanceRoute = existingReceiptSource && !route.receiptSource ? {...route, receiptSource: existingReceiptSource} : route;
    const updatedRoutes = [nextRoute, ...currentRoutes.filter((item) => item.transactionID !== route.transactionID && (!routeKey || getRouteKey(item) !== routeKey))];
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

export {fetchReusableDistanceRoutes, getLocallyCreatedRouteOnyxData, selectReusableRoute};
