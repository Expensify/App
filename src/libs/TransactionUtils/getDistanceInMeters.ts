import DistanceRequestUtils from '@libs/DistanceRequestUtils';

import CONST from '@src/CONST';
import type {OnyxInputOrEntry, Transaction} from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';

import type {ReadonlyDeep} from 'type-fest';

import getSelectedRouteKey from './getSelectedRouteKey';

// Get the distance in meters from the transaction.
// This function is placed in a separate file to avoid circular dependencies.
function getDistanceInMeters(transaction: ReadonlyDeep<OnyxInputOrEntry<Transaction>>, unit: Unit | undefined) {
    // If the request is completed, transaction.routes is cleared and comment.customUnit.quantity holds the new distance in the selected unit.
    // We need to convert it from the selected distance unit to meters.
    // This check takes priority because after a manual distance edit, routes.route0.distance may still
    // hold a stale route-calculated value while quantity reflects the user's intended distance.
    if (transaction?.comment?.customUnit?.quantity && unit) {
        return DistanceRequestUtils.convertToDistanceInMeters(transaction.comment.customUnit.quantity, unit);
    }

    // If we are creating a new distance request, the distance is available in routes.route0.distance and it's already in meters.
    // `getSelectedRouteKey` resolves the route the user picked (falling back to route0), so an alternate route wins here.
    const selectedRouteKey = getSelectedRouteKey(transaction);
    const selectedRouteDistance = transaction?.routes?.[selectedRouteKey]?.distance ?? transaction?.routes?.[CONST.TRANSACTION.DEFAULT_ROUTE_KEY]?.distance;
    if (selectedRouteDistance) {
        return selectedRouteDistance;
    }

    return 0;
}

export default getDistanceInMeters;
