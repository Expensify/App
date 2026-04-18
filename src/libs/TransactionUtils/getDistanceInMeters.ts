import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import type {OnyxInputOrEntry, Transaction} from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';

// Get the distance in meters from the transaction.
// This function is placed in a separate file to avoid circular dependencies.
function getDistanceInMeters(transaction: OnyxInputOrEntry<Transaction>, unit: Unit | undefined) {
    // Prefer customUnit.quantity when it exists because it may have been manually updated
    // (e.g. via Expensify Classic) independently of routes.route0.distance.
    if (transaction?.comment?.customUnit?.quantity && unit) {
        return DistanceRequestUtils.convertToDistanceInMeters(transaction.comment.customUnit.quantity, unit);
    }

    // When creating a new distance request, routes.route0.distance is already in meters.
    if (transaction?.routes?.route0?.distance) {
        return transaction.routes.route0.distance;
    }

    return 0;
}

export default getDistanceInMeters;
