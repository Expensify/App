import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import type {OnyxInputOrEntry, Transaction} from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';

// Get the distance in meters from the transaction.
// This function is placed in a separate file to avoid circular dependencies.
function getDistanceInMeters(transaction: OnyxInputOrEntry<Transaction>, unit: Unit | undefined) {
    // If the request is completed, transaction.routes is cleared and comment.customUnit.quantity holds the new distance in the selected unit.
    // We need to convert it from the selected distance unit to meters.
    // This check takes priority because after a manual distance edit, routes.route0.distance may still
    // hold a stale route-calculated value while quantity reflects the user's intended distance.
    if (transaction?.comment?.customUnit?.quantity && unit) {
        return DistanceRequestUtils.convertToDistanceInMeters(transaction.comment.customUnit.quantity, unit);
    }

    // If we are creating a new distance request, the distance is available in routes.route0.distance and it's already in meters.
    if (transaction?.routes?.route0?.distance) {
        return transaction.routes.route0.distance;
    }

    return 0;
}

export default getDistanceInMeters;
