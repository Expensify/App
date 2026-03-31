import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import type {OnyxInputOrEntry, Transaction} from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';

// Get the distance in meters from the transaction.
// This function is placed in a separate file to avoid circular dependencies.
function getDistanceInMeters(transaction: OnyxInputOrEntry<Transaction>, unit: Unit | undefined) {
    // When quantity is set (manually edited or saved by the server), it is the authoritative distance.
    // It takes priority over routes.route0.distance which may still hold a stale route-calculated
    // value after a manual edit.
    if (transaction?.comment?.customUnit?.quantity && unit) {
        return DistanceRequestUtils.convertToDistanceInMeters(transaction.comment.customUnit.quantity, unit);
    }

    // During the creation flow (before the transaction is saved), quantity is not yet set.
    // The distance comes from the route calculation in routes.route0.distance (already in meters).
    if (transaction?.routes?.route0?.distance) {
        return transaction.routes.route0.distance;
    }

    return 0;
}

export default getDistanceInMeters;
